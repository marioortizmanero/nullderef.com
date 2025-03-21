---
title: "Why you shouldn't obsess about Rust \"features\""
description: "Friendly reminder: you might not need conditional compilation"
image: "/blog/rust-features/compiler-explorer.png"
imageAlt: "Preview image, with a screenshot of Godbolt's compiler explorer"
tags: ["tech", "programming", "rust", "beginners"]
keywords: ["tech", "programming", "rust", "rustlang", "guide", "beginners", "cargo", "conditional compilation", "cargo features"]
series: "rspotify"
date: 2021-07-06
GHissueID: 6
---

[[toc]]

Rust makes it very easy to express conditional compilation, especially thanks to Cargo ["features"](https://doc.rust-lang.org/cargo/reference/features.html). They're well integrated into the language and are very easy to use. But one thing I've learned by maintaining [RSpotify](https://github.com/ramsayleung/rspotify) (a library for the Spotify API) is that one shouldn't obsess over them. Conditional compilation should be used when it's _the only way_ to solve the problem, for a number of reasons I'll explain in this article.

This might be obvious, but to me, it wasn't so clear back when I started using Rust. Even if you're already aware, it might be a good reminder --- maybe you forgot about it in your latest project, and you added an unnecessary feature.

Conditional compilation isn't anything new; C and C++ have been doing it for a long time now. So this principle can also be applied in these cases. However, in my experience, it's much easier to work with conditional compilation in Rust, meaning that it's more likely to be misused.

<a name="_the_problem"></a>
## The Problem

I went through this dilemma when deciding how to configure cached tokens in [RSpotify](https://github.com/ramsayleung/rspotify). Said library gives you the possibility of persistently managing the authentication token via a JSON file. That way, when the program is launched again, the token from the previous session can be reused. One doesn't have to follow the full auth process again --- that is, until the token expires.

Originally, this was going to be a compile-time feature named `cached_token`. I didn't give it much thought; why would one need the code to save and read the token file if you just don't need it? The easiest way to do that is using a feature you can just toggle in your `Cargo.toml`.

I later worked on another very similar feature, `refreshing_token`. When optionally enabled, the client would automatically refresh expired tokens. As this pattern appeared more and more in the library, I wanted to make sure its design was optimal. Once I took a deeper look, I began to find the many inconveniences of Cargo features:

1. They're **inflexible**: you can't have a client with cached tokens and another without them in the same program. It's a library-wide thing, so you either enable them or you don't. Obviously, they're not configurable at runtime either; a user might want to choose what kind of behaviour to follow _while_ the program is running.
2. They're **ugly**: writing `#[cfg(feature = "cached_token")]` is much more weird and verbose than a plain `if cached_token`.
3. They're **messy**: features are hard to manage in the codebase. You can find yourself in the Rust equivalent of an [`#ifdef` hell](https://www.cqse.eu/en/news/blog/living-in-the-ifdef-hell/) very easily.
4. They're **hard to document and test**: Rust doesn't provide a way to expose the features of a library. All you can do is list them manually in the main page of the docs. Testing is also harder because you have to figure out what combinations of features to use in order to cover the entire codebase, and apply them whenever you want to run the tests.

All of these are supposedly outweighed by just being guaranteed that the binary won't have code you don't need. But how true is that, really? And how important is it?

<a name="_an_alternative"></a>
## An Alternative

Turns out that one of the simplest optimizations a compiler can implement is the propagation of constants. This, in combination with the removal of dead code, can result in exactly the same effect as features, but in a more natural way. Instead of adding features to configure the behaviour of your program, you can do the same with a `Config` struct. You may not even need a struct if it's just a single option to be configured, but that way it's future-proof. For example:

```rust
#[derive(Default)]
struct Config {
    cached_token: bool,
    refreshing_token: bool,
}
```

You can then modify your client in order to optionally take the `Config` struct:

```rust
struct Client {
    config: Config
}

impl Client {
    /// Uses the default configuration for the initialization
    fn new() -> Client {
        Client {
            config: Config::default(),
        }
    }

    /// Uses a custom configuration for the initialization
    fn with_config(config: Config) -> Client {
        Client {
            config,
        }
    }

    fn do_request(&self) {
        if self.config.cached_token {
            println!("Saving cache token to the file!");
        }
        // The previous block used to be equivalent to:
        //
        // #[cfg(feature = "cached_token")]
        // {
        //     println!("Saving cache token to the file!");
        // }

        if self.config.refreshing_token {
            println!("Refreshing token!");
        }

        println!("Performing request!");
    }
}
```

Finally, the user can customize the client however they want in the code itself in a very natural way:

```rust
fn main() {
    // Option A
    let client = Client::new();

    // Option B
    let config = Config {
        cached_token: true,
        ..Default::default()
    };
    let client = Client::with_config(config);
}
```

<a name="_proving_that_you_end_up_with_the_same_code"></a>
### Proving that you end up with the same code

Thanks to the awesome [Compiler Explorer](https://godbolt.org), we can make sure this compiles as we expect it to with [this snippet](https://godbolt.org/z/Kr9GP6Gqz):

![Assembly comparison](compiler-explorer.png)

It seems that as of Rust 1.53, for values of `opt-level` greater or equal than 2, the code for the deactivated features doesn't even appear in the assembly (it's easy to see by taking a look at the strings at the end). `cargo build --release` configures `opt-level` to 3[^cargo-release], so it shouldn't be a problem for production binaries.

And we aren't even using `const`! I wonder what will happen in that case. With [this slightly modified snippet](https://godbolt.org/z/f1xTaWzdc):

![Assembly comparison](compiler-explorer-const.png)

Hmm. We actually get the same results. The generated assembly is exactly the same, and the optional code is optimized away only starting at `opt-level=2`.

The thing is that `const` just means that its value _may_ (and not must) be inlined[^rust-const][^rust-consteval]. Nothing else. So we still don't have anything guaranteed, and inlining isn't enough to simplify the code _inside the function_.

So for what I've investigated it seems to be best to just not worry about it and use a variable instead of `const`. It looks better and gets the same results.

<a name="_you_can_probably_afford_the_overhead_anyway"></a>
### You can probably afford the overhead anyway

Even if the previous optimization wasn't implemented, would the optional code cause any harm in the final binary, really? Are we overengineering the solution, as always? Truth is, the optional code for cached/refreshing tokens isn't even that much bloat.

It depends, of course, but binary bloat isn't that much of a problem for higher level binaries, in my opinion. Rust already statically embeds its standard library, its runtime, and a ton of debug info in each binary, which sums up to around 3 MB. And the only overhead you may get at runtime is a branch.

<a name="_conclusion"></a>
## Conclusion

Sometimes you just _have_ to use conditional compilation; there's no way around it. You might be dealing with platform-specific code or want to reduce the number of dependencies of your crate, in which cases features are super helpful.

But that wasn't RSpotify's case; conditional compilation was definitely not the way to go. When you're about to introduce a new feature to your crate, think to yourself, "Do I really need conditional compilation for this?".

Neither `cached_token` nor `refreshing_token` follow the usual reasoning as to why a feature might be added. They don't give access to new functions/modules. They don't help get rid of optional dependencies. And they certainly aren't platform-specific features. They just configure the behaviour of the library.

In order to avoid this, perhaps the naming for features could have been different? Enabling support for cached tokens certainly sounds like a "feature", while OS-specific code doesn't really seem like one. I also find it confusing sometimes, and Google agrees with me in this one. Looking for information related to Rust features might return completely unrelated stuff just because the result has the word "feature" but meaning "an attribute or aspect of the program". Kind of like how you have to google "golang X" instead of "go X" because otherwise it doesn't make sense. But whatever, it's too late for my opinion anyway.

Anyhow, I hope you learned something new, or that this was at least a good reminder! If you have any suggestions please leave them in the section below :)

{% render "partials/subscribe.liquid" metadata: metadata %}

[^cargo-release]: https://doc.rust-lang.org/cargo/reference/profiles.html#release
[^rust-const]: https://doc.rust-lang.org/std/keyword.const.html
[^rust-consteval]: https://doc.rust-lang.org/reference/const_eval.html
