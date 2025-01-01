---
title: "Optional parameters in Rust"
description: "Analyzing different approaches for optional parameters in Rust"
image: "/blog/rust-parameters/ferris.jpg"
imageAlt: "Preview image, with Ferris and a question mark"
tags: ["tech", "programming", "rust", "beginners"]
keywords: ["tech", "programming", "rust", "rustlang", "guide", "beginners", "generics", "optional parameters", "default parameters", "api client", "optional params", "default params", "client architecture"]
date: 2020-10-10
GHissueID: 7
---

[[toc]]

Optional or default parameters are a very interesting feature of some languages that Rust specifically doesn't cover (and looks like it won't [anytime soon](https://github.com/rust-lang/rfcs/pull/2964)). Say your library has lots of endpoints like so:

```rust
fn endpoint<T1, T2, T3, ...>(mandatory: T1, opt1: Option<T2>, opt2: Option<T3>, ...);
```

In this case, when you call `endpoint`, you have to use `endpoint(mandatory, None, None, ...)`, or `endpoint(mandatory, Some(val1), Some(val2), ...)`, instead of the more intuitive `endpoint(mandatory)` or `endpoint(mandatory, val1, val2)`. Other languages like Python have named arguments, which make optional parameters natural and easier to read: `endpoint(mandatory, opt1=val1, opt2=val2)`, while also allowing them to be written in any order.

Even without official support, there are lots of different ways to approach them in Rust, which is what this blog post tries to analyze. My goal is not to show which one is the "best" option, but to exhaustively showcase the different ways they can be approached, and the ups and downs of each of them.

## Introducing an example
Let's start with a typical web API wrapper library. These often require a client struct to hold authentication fields and such:

```rust
#[derive(Default, Debug, Clone)]
struct APIClient;
```

This client will have various endpoints which can be used to send requests to the server. We will use a function with the actual implementation and some type aliases so that the following snippets are easier to read:

```rust
use std::error::Error;

/// Some value that the endpoint will return
#[derive(Debug, Default)]
struct Value;
type ReturnedValue = Result<Value, Box<dyn Error>>;

/// The actual code for the endpoint inside the client
impl APIClient {
    fn actual_endpoint(name: &str, opt1: Option<u32>, opt2: Option<i32>) -> ReturnedValue {
        println!("params: {} {:?} {:?}", name, opt1, opt2);

        Ok(Default::default())
    }
}
```

## A) Using `Option<T>`
The simplest way to do this would be to just use the `actual_endpoint` function signature. Sometimes the best solution is the simplest, and your project just might not need more complex approaches. Do consider if anything more elaborate is actually necessary.

For the sake of this example, it would look like this:

```rust
impl APIClient {
    pub fn approach_a(&self, name: &str, opt1: Option<u32>, opt2: Option<i32>) -> ReturnedValue {
        self.actual_endpoint(name, opt1, opt2)
    }
}
```

```rust
let api = APIClient {};
let param2: u32 = 324;

api.approach_a("option", Some(param2), Some(1234))?;
api.approach_a("option", None, None)?;
```

### Upsides
* Simplest to understand and implement.

### Downsides
* Multiple optional parameters require lots of `None` and `Some`.
* Parameter names unknown when reading the code, which is specially annoying with `None` values, since these don't have context to know what they are for.

## B) With `Into<Option<T>>`
A variation of the previous approach consists on using `Into<Option<T>>` as the generic value for the optional parameters (`impl Into<Option<T>>` can be used as well). This way, `Some` isn't needed when the optional parameters are specified:

```rust
impl APIClient {
    pub fn approach_b<T1, T2>(&self, name: &str, opt1: T1, opt2: T2) -> ReturnedValue
    where
        T1: Into<Option<u32>>,
        T2: Into<Option<i32>>,
    {
        self.actual_endpoint(name, opt1.into(), opt2.into())
    }
}
```

```rust
api.approach_b("into_option", param2, 1234)?;
// This still works
api.approach_b("into_option", Some(param2), Some(123))?;
api.approach_b("into_option", None, None)?;
```

### Upsides
* `Some` isn't required, which makes it slightly easier to read.

### Downsides
* Multiple optional parameters still require lots of `None`s.
* No parameter names either.
* More complex function signatures, and might not be too "idiomatic".
* Requires generics, 2^N copies of this function may be generated, where N is the number of optional parameters.

## C) With a custom struct
Another option is to create a struct that holds the parameters and use that instead. The complexity is still relatively simple, and it can work out well if the API has functions with repetitive function signatures. This will serve as a base for the following approaches as well:

```rust
let call1 = params::ApproachC {
    name: "builder".to_string(),
    opt1: Some(param2),
    opt2: Some(123),
};
api.approach_c(&call1)?;
```

We can even use `..Default::default()` to initialize the rest of the parameters with their default values:

```rust
let call2 = params::ApproachC {
    name: "builder".to_string(),
    ..Default::default()
};
api.approach_c(&call2)?;
```

The implementation looks like this:

```rust
mod params {
    /// We derive `Default` to be able to initialize with
    /// `..Default::default()`.
    #[derive(Default)]
    pub struct ApproachC {
        pub name: String,
        pub opt1: Option<u32>,
        pub opt2: Option<i32>,
    }
}

impl APIClient {
    pub fn approach_c(&self, data: &params::ApproachC) -> ReturnedValue {
        self.actual_endpoint(&data.name, data.opt1, data.opt2)
    }
}
```

### Upsides
* Some APIs might feel more natural this way, if the combination of these parameters as a group makes sense.
* The struct can be reused in different calls.

### Downsides
* Multiple optional parameters require lots of `None` and `Some`.
* Way more verbose.
* Can be difficult to scale, since it needs a struct and a function per endpoint.

## D) With the builder pattern
The previous approach can be improved by using the [builder pattern](https://doc.rust-lang.org/1.0.0/style/ownership/builders.html) for the parameters, so that building the parameters is simpler and more pretty to look at:

```rust
let call1 = params::ApproachDBuilder::default()
    .name("builder")
    .opt1(param2)
    .opt2(2134)
    .build()?;
api.approach_d(&call1)?;

let call2 = params::ApproachDBuilder::default()
    .name("builder")
    .build()?;
api.approach_d(&call2)?;
```

In this case, we use the [`derive_builder`](https://crates.io/crates/derive_builder) crate to make the implementation less repetitive:

```rust
mod params {
    #[derive(Default, Builder)]
    pub struct ApproachD {
        #[builder(setter(into))]
        pub name: String,
        #[builder(setter(strip_option), default)]
        pub opt1: Option<u32>,
        #[builder(setter(strip_option), default)]
        pub opt2: Option<i32>,
    }
}

impl APIClient {
    pub fn approach_d(&self, data: &params::ApproachD) -> ReturnedValue {
        self.actual_endpoint(&data.name, data.opt1, data.opt2)
    }
}
```

### Upsides
* It's the most popular pattern in Rust for optional parameters.
* The struct can still be reused in different calls.
* No `None` or `Some` at sight.
* Optional parameters are now associated to their name, which makes it easier to read.

### Downsides
* Somewhat verbose.
* In our example it can be difficult to scale, since it needs a struct and a function per endpoint.
* More overhead, both at runtime and compile-time (specially if macros are used).
* Constructing the values may fail. Thus, the documentation has to specify very clearly which parameters are mandatory and which aren't.

## E) Endpoint-oriented interface
Here's a different take: what if the API was endpoint-oriented instead of client-oriented? Starting from the previous approach, we could make the call *inside the endpoint struct itself* instead of in the API's client by adding it to `ApproachE`, or by overriding the `build` method from `derive_builder` for a slightly less verbose version:

```rust
ApproachEBuilder::default()
    .name("endpoint-oriented")
    .opt1(param2)
    .opt2(1111)
    .call(&api)?;
ApproachEBuilder::default()
    .name("endpoint-oriented")
    .call(&api)?;
```

And its implementation:

```rust
#[derive(Default, Builder)]
#[builder(build_fn(private))]
struct ApproachE {
    #[builder(setter(into))]
    pub name: String,
    #[builder(setter(strip_option), default)]
    pub opt1: Option<u32>,
    #[builder(setter(strip_option), default)]
    pub opt2: Option<i32>,
}

impl ApproachEBuilder {
    pub fn call(&self, client: &APIClient) -> ReturnedValue {
        let data = self.build()?; // This might fail!
        // `actual_endpoint` would have to be at least pub(in crate) in this
        // case.
        client.actual_endpoint(&data.name, data.opt1, data.opt2)
    }
}
```

Note: this is assuming the client contains necessary information to make the requests, like a [`reqwest::Client`](https://docs.rs/reqwest/latest/reqwest/struct.Client.html) or authentication details. But for example, `ureq` can perform calls without a client instance, just by calling [`ureq::get` and similars](https://docs.rs/ureq/latest/ureq/fn.get.html). In that case, the API could just not have a client at all, and the `call` method wouldn't require a reference to the client.

### Upsides
* Fits perfectly for some specific APIs.
* No `None` or `Some` needed.
* Just as readable as the previous case.
* The struct may be reused.
* Simple to use and implement, since it doesn't need declaring both a function in the client and a parameters struct, only the latter.

### Downsides
* Still relatively verbose, might not be compatible with some APIs.
* Slight builder pattern overhead, and can also fail to construct the value.

## F) Hybrid derive pattern

Back to the client-oriented API. We can remove some disadvantages of the builder pattern by using a different approach and possibly a custom implementation instead of just using `derive_builder`.

The client will now have a method that calls `ApproachBuilder::default()` and whatever is necessary to start building the endpoint. Mandatory parameters are added to that function's signature, so that the build can never fail. This also avoids passing the client in `call(&api)`, since we can do that inside the method. This is how it would look like:

```rust
api.approach_f("hybrid-derive-pattern")
    .opt1(param2)
    .opt2(2222)
    .call()?;
```

And an implementation by wrapping `derive_builder`:

```rust
impl APIClient {
    pub fn approach_f(&self, name: &str) -> ApproachFBuilder {
        ApproachFBuilder::default().client(self).name(name)
    }
}

/// Not meant to be used directly, only within `APIClient`.
#[derive(Default, Builder)]
#[builder(build_fn(private), pattern = "owned")]
pub struct ApproachF<'a> {
    #[builder(setter(strip_option), default)]
    client: Option<&'a APIClient>,
    #[builder(setter(into))]
    pub name: String,
    #[builder(setter(strip_option), default)]
    pub opt1: Option<u32>,
    #[builder(setter(strip_option), default)]
    pub opt2: Option<i32>,
}

impl ApproachFBuilder<'_> {
    pub fn call(self) -> ReturnedValue {
        let data = self.build().unwrap(); // This should never fail
        data.client
            .unwrap()
            .actual_endpoint(&data.name, data.opt1, data.opt2)
    }
}
```

`derive_builder` doesn't know that `build()` can never technically fail because the mandatory parameters are provided inside the wrapper, so it's kind of a waste to use this macro. It also forces us to create the wrapper because the builder always has to be initialized with `Builder::default()`. With a custom implementation, we could have this new method integrated in the builder itself instead, like `Builder::new(A, B, C)`.

Thus, it might be better to use other crates like [`typed-builder`](https://crates.io/crates/typed-builder), or just a custom implementation.

### Upsides
* Although mandatory parameters don't have a parameter name now, it's still quite readable. It's also much less verbose.
* No `None` or `Some` needed.
* Can't fail to initialize the endpoint value, so it's "safer".
* A custom implementation would avoid runtime overhead.

### Downsides
* Currently a bit hacky to implement, which makes it much more complex, specially because there's no existing macro that can simplify this specific variation of the builder pattern (that I know of). It requires both a function and a struct as well, so the implementation can be quite lengthy.
* Still some compilation-time overhead.

## G,H) Grouping up endpoints
Another possible approach based on the previous approach of the builder pattern consists on grouping up all or some of the endpoints under a single struct. They will share the optional parameters, which is useful to avoid declaring a struct with optional parameters for each endpoint we have, and makes a lot of sense for some APIs.

The `call` method could be removed in place of `approach_f`, and the optional parameters would go first. This would require a different order for the optional parameters. Here's an example if all the endpoints shared the same optional parameters:

```rust
api.opt1(param2)
    .opt2(2222)
    .approach_f("group-builder-pattern")?;
```

And if we used different groups it would look like this:

```rust
api.group()
    .opt1(param2)
    .opt2(2222)
    .approach_g("group-builder-pattern")?;
api.group().opt2(2222).approach_h("builder-from-scratch")?;
```

Here's an implementation with `derive_builder`:

```rust
impl APIClient
    pub fn group(&self) -> GroupBuilder {
        GroupBuilder::default().client(self)
    }
}

#[derive(Default, Builder)]
#[builder(build_fn(private), pattern = "owned")]
pub struct Group<'a> {
    #[builder(setter(strip_option), default)]
    client: Option<&'a APIClient>,
    #[builder(setter(strip_option), default)]
    pub opt1: Option<u32>,
    #[builder(setter(strip_option), default)]
    pub opt2: Option<i32>,
}

impl GroupBuilder<'_> {
    pub fn approach_g(self, name: &str) -> ReturnedValue {
        let data = self.build().unwrap();
        data.client
            .unwrap()
            .actual_endpoint(name, data.opt1, data.opt2)
    }

    pub fn approach_h(self, name: &str) -> ReturnedValue {
        let data = self.build().unwrap();

        // This endpoint doesn't need `opt1`. It can either be ignored, or
        // be an error. I hate silent errors, though.
        if data.opt1.is_some() {
            panic!("opt1 isn't needed for enpoint_h")
        }

        data.client.unwrap().actual_endpoint(name, None, data.opt2)
    }
}
```

As the `approach_h` endpoint indicates, the shared optional parameters don't actually have to be strictly the same. As long as they are related, they can share the same group, and some extra verifications can be added in the final call to make sure the user is using it properly.

### Upsides
* Basically the same as the hybrid builder pattern, but with an easier implementation, and it might fit perfectly for some APIs that have clearly established groups of endpoints.

### Downsides
* It's a bit odd, specially because the order is inverse to what you'd expect. And as it's based on the hybrid builder pattern, it may still be hacky to implement and require compilation-time overhead.

## I) Macros
Rust macros support variadic arguments, which make it possible to create a macro with named parameters, like `foo!(1, c = 30, b = -2.0)`. Ideally, we want a macro that generates the macros for us, which does sound crazy. I wanted to at least try how existing crates approached this, and only found [`named`](https://crates.io/crates/named) and [`duang`](https://crates.io/crates/duang), which haven't been updated in years, and probably for good. I tried `duang` with Rust 1.47 but got some unexpected errors, so we can assume there are no crates that support this yet. It definitely sounds like a fun challenge, if it's still possible to implement.

## Conclusion
Whew! That took more than I expected. Some of these endpoints might be unnecessarily complicated or straight up weird. But I hope this was as a good showcase of the different ways optional parameters can be approached in Rust, and that reading this served as a learning experience. I look forward to seeing new crates in the future that simplify these approaches.

The code for the different approaches can be found [here](https://github.com/marioortizmanero/rust-optional-params). Bear in mind that there are a lot of different ways to implement the approaches, as I explained in this post. You can discuss it at the [reddit thread](https://www.reddit.com/r/rust/comments/j8p6fx/optional_parameters_in_rust).

*Disclaimer: this post was originally in
https://vidify.org/blog/rust-parameters/. I've moved it to my personal blog.*

{% include "partials/subscribe.liquid" %}
