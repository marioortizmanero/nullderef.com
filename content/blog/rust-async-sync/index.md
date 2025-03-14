---
title: "The bane of my existence: Supporting both async and sync code in Rust"
description: "Sit beside me and hear this crazy old man's tale of when I asked Rust for too much"
image: "/blog/rust-async-sync/preview.jpg"
imageAlt: "Preview image, with Ferris lost in complicated Rust errors"
tags: ["tech", "programming", "rust", "open-source"]
keywords: ["tech", "programming", "rust", "rustlang", "async", "sync", "macros", "procedural macros", "rspotify", "synchronous", "asynchronous", "blocking", "tokio", "abstraction"]
series: "rspotify"
date: 2024-01-14
GHissueID: 4
---

[[toc]]

<a name="_introduction"></a>
## Introduction

Imagine you want to create a new library in Rust. All it does is wrap up a public API that you need for something else, like [the Spotify API](https://developer.spotify.com/documentation/web-api/) or maybe a database like [ArangoDB](https://www.arangodb.com/). It's not rocket science, you aren't inventing something new or dealing with complex algorithms, so you expect it to be relatively straightforward.

You decide to implement the library with async. Most of the work in your library has to do with performing HTTP requests, which are mostly I/O, so it makes sense (that, and because it's what the cool kids use in Rust nowadays). You start coding and have the v0.1.0 release ready in a few days. "Neat", you say, as `cargo publish` finishes successfully and uploads your work to [crates.io](https://crates.io).

A couple of days pass, and you get a new notification on GitHub. Someone opened an issue:

>**How can I use this library synchronously?**
>
>My project doesn't use async because it's overly complex for what I need. I wanted to try your new library, but I'm not sure how to do it easily. I would rather not fill my code with `block_on(endpoint())`. I've seen crates like {% crate "reqwest" %} exporting a [`blocking` module](https://docs.rs/reqwest/0.11.4/reqwest/blocking/index.html) with the exact same functionality, could you perhaps do that as well?

Low-level wise, that sounds like a very complicated task. Having a common interface for both async code --- which requires a runtime like {% crate "tokio" %}, awaiting futures, pinning, etc --- and regular sync code? I mean, they asked nicely, so maybe we can try. After all, the only difference in the code would be the occurrences of the `async` and `await` keywords because you aren't doing anything fancy.

Well, this is _more or less_ what happened with the crate {% crate "rspotify" %}, which I used to maintain along with its creator [Ramsay](https://github.com/ramsayleung/). For those who don't know, it's a wrapper for the Spotify Web API. To clarify, I did get this working in the end, although not as cleanly as I was hoping; I'll try to explain the situation in this new article of the [Rspotify series](https://nullderef.com/series/rspotify).

<a name="_the_first_approaches"></a>
## The first approaches

To give more context, here's what Rspotify's client looks like, roughly:

```rust
struct Spotify { /* ... */ }

impl Spotify {
    async fn some_endpoint(&self, param: String) -> SpotifyResult<String> {
        let mut params = HashMap::new();
        params.insert("param", param);

        self.http.get("/some-endpoint", params).await
    }
}
```

Essentially, we would have to make `some_endpoint` available for both asynchronous and blocking users. The important question here is, how do you do this once you have dozens of endpoints? And how can you make it easy to switch between async and sync for the user?

<a name="_good_ol_copy_pasting"></a>
### Good ol' copy-pasting

This is what was first implemented. It was quite simple and it worked. You just need to copy the regular client code into a new [`blocking` module in Rspotify](https://github.com/ramsayleung/rspotify/tree/v0.9/src/blocking). [`reqwest`](https://docs.rs/reqwest) (our HTTP client) and [`reqwest::blocking`](https://docs.rs/reqwest/latest/reqwest/blocking/index.html) share the same interface, so we can manually remove keywords like `async` or `.await` and import `reqwest::blocking` instead of `reqwest` in the new module.

Then, the Rspotify user just can just use `rspotify::blocking::Client` instead of `rspotify::Client`, and voilà! Their code is now blocking. This will bloat the binary size for async-only users, so we can just feature-gate it under the name `blocking` and done.

The problem was much more clear later on, though. Half the crate's code was duplicated. Adding a new endpoint or modifying it meant writing or removing everything twice.

There is no way to make sure both implementations are equivalent unless you test absolutely everything. Which isn't a bad idea either, but maybe you copy-pasted the tests wrong! How about that? The poor reviewer would have to read through the same code twice to make sure both sides look alright --- which sounds incredibly prone to human errors.

In our experience, it really slowed down the development of Rspotify, specially for new contributors who weren't used to this whole ordeal. As a new excited maintainer of Rspotify, I began to [investigate other possible solutions](https://github.com/ramsayleung/rspotify/issues/112).

<a name="_calling_block_on"></a>
### Calling `block_on`

[The second approach](https://github.com/ramsayleung/rspotify/pull/120) consisted on implementing everything on the async side. Then, you just make wrappers for the blocking interface, which call [`block_on`](https://docs.rs/tokio/latest/tokio/runtime/struct.Runtime.html#method.block_on) internally. `block_on` will run the future until completion, basically making it synchronous. You still need to copy the method _definitions_, but the implementation is written once only:

```rust
mod blocking {
    struct Spotify(super::Spotify);

    impl Spotify {
        fn endpoint(&self, param: String) -> SpotifyResult<String> {
            runtime.block_on(async move {
                self.0.endpoint(param).await
            })
        }
    }
}
```

Note that in order to call `block_on`, you first have to create some kind of runtime in the endpoint method. For example, with `tokio`:

```rust
let mut runtime = tokio::runtime::Builder::new()
    .basic_scheduler()
    .enable_all()
    .build()
    .unwrap();
```

This raises the question: should we initialize the runtime in each call to the endpoint, or is there a way to share it? We could keep it as a global (_ewwww_), or perhaps better, we can save the runtime in the `Spotify` struct. But since it takes a _mutable_ reference to the runtime, you'd have to wrap it up with `Arc<Mutex<T>>`, completely killing the concurrency in your client. The proper way to do this is with Tokio's [`Handle`](https://docs.rs/tokio/latest/tokio/runtime/struct.Handle.html), which looks like this:

```rust
use tokio::runtime::Runtime;

lazy_static! { // You can also use `once_cell`
    static ref RT: Runtime = Runtime::new().unwrap();
}

fn endpoint(&self, param: String) -> SpotifyResult<String> {
    RT.handle().block_on(async move {
        self.0.endpoint(param).await
    })
}
```

While the handle does make our blocking client faster[^block-on-perf], there is an even more performant way to do it. This is what {% crate "reqwest" %} itself does, in case you're interested. In short, it spawns a thread that calls `block_on` waiting on a channel with jobs[^block-on-channels][^block-on-reqwest].

Unfortunately, this solution still has quite the overhead. You pull in large dependencies like `futures` or `tokio`, and include them in your binary. All of that, in order to... actually end up writing blocking code. So not only is it a cost at runtime, but also at compile time. It just feels wrong to me.

And you still have a good amount of duplicate code, even if it's just definitions, which can sum up. {% crate "reqwest" %} is a huge project and can probably afford this for their `blocking` module. But for a less popular crate like `rspotify`, this is harder to pull off.

<a name="_duplicating_the_crate"></a>
### Duplicating the crate

Another possible way to fix this is, as the features docs suggest, creating separate crates. We'd have `rspotify-sync` and `rspotify-async`, and users would just pick whichever crate they want as a dependency, even both if they need to. The problem is --- again --- how exactly do we generate both versions of the crate? [I was unable to do this without copy-pasting the entire crate](https://github.com/ramsayleung/rspotify/pull/253), even with Cargo tricks like two `Cargo.toml` files, one for each crate (which was quite inconvenient anyway).

With this idea we can't even use procedural macros because you can't just create a new crate within a macro. We could define a file format to write templates of Rust code in order to replace parts of the code like `async`/`.await`. But that sounds completely out of scope.

<a name="_what_ended_up_working_the_maybe_async_crate"></a>
## What ended up "working": the `maybe_async` crate

[The third attempt](https://github.com/ramsayleung/rspotify/pull/129) is based on a crate called {% crate "maybe_async" %}. I remember foolishly thinking it was the perfect solution back when I discovered it.

Anyway, the idea is that with this crate you can automatically remove the `async` and `.await` occurrences in your code with a procedural macro, essentially automating the copy-pasting approach. For example:

```rust
#[maybe_async::maybe_async]
async fn endpoint() { /* stuff */ }
```

Generates the following code:

```rust
#[cfg(not(feature = "is_sync"))]
async fn endpoint() { /* stuff */ }

#[cfg(feature = "is_sync")]
fn endpoint() { /* stuff with `.await` removed */ }
```

You can configure whether you want asynchronous or blocking code by toggling the `maybe_async/is_sync` feature when compiling the crate. The macro works for functions, traits and `impl` blocks. If one conversion isn't as easy as removing `async` and `.await`, you can specify custom implementations with the `async_impl` and `sync_impl` procedural macros. It does this wonderfully, and we've already been using it for Rspotify for a while now.

In fact, it worked so well that I made Rspotify _http-client agnostic_, which is even more flexible than being _async/sync agnostic_. This allows us to support multiple HTTP clients like {% crate "reqwest" %} and {% crate "ureq" %}, independently of whether the client is asynchronous or synchronous.

Being _http-client agnostic_ is not that hard to implement if you have `maybe_async` around. You just need to define a trait for the [HTTP client](https://github.com/ramsayleung/rspotify/blob/89b37219a2230cdcf08c4cfd2ebe46d64902f03d/rspotify-http/src/common.rs#L46), and then implement it for each of the clients you want to support. A snippet of code is worth a thousand words (_you can find the full source for Rspotify's [``reqwest``'s client here](https://github.com/ramsayleung/rspotify/blob/master/rspotify-http/src/reqwest.rs#L97), and [``ureq``'s here](https://github.com/ramsayleung/rspotify/blob/master/rspotify-http/src/ureq.rs#L56)_):
```rust
#[maybe_async]
trait HttpClient {
    async fn get(&self) -> String;
}

#[sync_impl]
impl HttpClient for UreqClient {
    fn get(&self) -> String { ureq::get(/* ... */) }
}

#[async_impl]
impl HttpClient for ReqwestClient {
    async fn get(&self) -> String { reqwest::get(/* ... */).await }
}

struct SpotifyClient<Http: HttpClient> {
    http: Http
}

#[maybe_async]
impl<Http: HttpClient> SpotifyClient<Http> {
    async fn endpoint(&self) { self.http.get(/* ... */) }
}
```

Then, we could extend it so that whichever client they want to use can be enabled with feature flags in their `Cargo.toml`. For example, if `client-ureq` is enabled, since `ureq` is synchronous, it would enable `maybe_async/is_sync`. In turn, this would remove the `async`/`.await` and the `#[async_impl]` blocks, and the Rspotify client would use ``ureq``'s implementation internally.

This solution has none of the downsides I listed in previous attempts:

* No code duplication at all
* No overhead neither at runtime nor at compile time. If the user wants a blocking client, they can use `ureq`, which doesn't pull `tokio` and friends
* Quite easy to understand for the user; just configure a flag in you `Cargo.toml`

However, stop reading for a couple of minutes and try to figure out why you shouldn't do this. In fact, I'll give you 9 months, which is how long it took me to do so...

<a name="_the_problem"></a>
### The problem

![Picturing what this felt like](/blog/rust-async-sync/preview.jpg)

Well, the thing is that features in Rust must be **additive**: "enabling a feature should not disable functionality, and it should usually be safe to enable any combination of features". Cargo may merge features of a crate when it's duplicated in the dependency tree in order to avoid compiling the same crate multiple times. [The reference explains this quite well, if you want more details](https://doc.rust-lang.org/cargo/reference/features.html#feature-unification).

This optimization means that mutually exclusive features may break a dependency tree. In our case, `maybe_async/is_sync` is a _toggle_ feature enabled by `client-ureq`. So if you try to compile it with `client-reqwest` also enabled, it will fail because `maybe_async` will be configured to generate synchronous function signatures instead. It's impossible to have a crate that depends on both sync and async Rspotify either directly or indirectly, and the whole concept of `maybe_async` is currently wrong according to the Cargo reference.

<a name="_the_feature_resolver_v2"></a>
### The feature resolver v2

A common misconception is that this is fixed by the "feature resolver v2", which [the reference also explains quite well](https://doc.rust-lang.org/cargo/reference/features.html#feature-resolver-version-2). It has been enabled by default since the 2021 edition, but you can specify it inside your `Cargo.toml` in previous ones. This new version, among other things, avoids unifying features in some special cases, but not in ours:

>* Features enabled on platform-specific dependencies for targets not currently being built are ignored.
>* Build-dependencies and proc-macros do not share features with normal dependencies.
>* Dev-dependencies do not activate features unless building a target that needs them (like tests or examples).

Just in case, I tried to reproduce this myself, and it did work as I expected. [This repository](https://github.com/marioortizmanero/resolver-v2-conflict) is an example of conflicting features, which breaks with any feature resolver.

<a name="_other_fails"></a>
### Other fails

There were a few crates that also had this problem:

* {% crate "arangors" %} and {% crate "aragog" %}: wrappers for ArangoDB. Both use `maybe_async` to switch between async and sync (``arangors``'s author is the same person, in fact)[^arangors-error][^aragog-error].
* {% crate "inkwell" %}: a wrapper for LLVM. It supports multiple versions of LLVM, which are not compatible with eachother[^inkwell-error].
* {% crate "k8s-openapi" %}: a wrapper for Kubernetes, with the same issue as `inkwell`[^k8s-error].

<a name="_fixing_maybe_async"></a>
### Fixing `maybe_async`

Once the crate started to gain popularity, this issue was opened in `maybe_async`, which explains the situation and showcases a fix:

<p style="text-align:center;">
  {% gh "issue" "fMeow/maybe-async-rs" 6 "async and sync in the same program" %}
</p>

`maybe_async` would now have two feature flags: `is_sync` and `is_async`. The crate would generate the functions in the same way, but with a `_sync` or `_async` suffix appended to the identifier so that they wouldn't be conflicting. For example:

```rust
#[maybe_async::maybe_async]
async fn endpoint() { /* stuff */ }
```

Would now generate the following code:

```rust
#[cfg(feature = "is_async")]
async fn endpoint_async() { /* stuff */ }

#[cfg(feature = "is_sync")]
fn endpoint_sync() { /* stuff with `.await` removed */ }
```

However, these suffixes introduce noise, so I wondered if it would be possible to do it in a more ergonomic way. I forked `maybe_async` and gave it a try, about which you can read more [in this series of comments](https://github.com/fMeow/maybe-async-rs/issues/6#issuecomment-880581551). In summary, it was too complicated, and I ultimately gave up.

The only way to fix this edge case would be to worsen the usability of Rspotify for everyone. But I'd argue that someone who depends on both async and sync is unlikely; we haven't actually had anyone complaining yet. Unlike `reqwest`, `rspotify` is a "high level" library, so it's hard to imagine a scenario where it appears more than once in a dependency tree in the first place.

Perhaps we could ask the Cargo devs for help?

<a name="_official_support"></a>
### Official Support

Rspotify is far from being the first who has been through this problem, so it might be interesting to read previous discussions about it:

* [This now-closed RFC for the Rust compiler](https://github.com/rust-lang/rfcs/pull/2962) suggested adding the `oneof` configuration predicate (think `#[cfg(any(...))]` and similars) to support exclusive features. This only makes it easier to have conflicting features for cases where there's _no choice_, but features should still be strictly additive.
* The previous RFC started [some discussion](https://internals.rust-lang.org/t/pre-rfc-cargo-mutually-exclusive-features/13182/27) in the context of allowing exclusive features in Cargo itself, and although it has some interesting info, it didn't go too far.
* [This issue in Cargo](https://github.com/rust-lang/cargo/issues/2980) explains a similar case with the Windows API. The discussion includes more examples and solution ideas, but none have made it to Cargo yet.
* [Another issue in Cargo](https://github.com/rust-lang/cargo/issues/4803) asks for a way to test and build with combinations of flags easily. If features are strictly additive, then `cargo test --all-features` will cover everything. But in case it doesn't, the user has to run the command with multiple combinations of feature flags, which is quite cumbersome. This is already possible unofficially thanks to [`cargo-hack`](https://github.com/taiki-e/cargo-hack).
* A completely different approach [based on the Keyword Generics Initiative](https://blog.rust-lang.org/inside-rust/2023/02/23/keyword-generics-progress-report-feb-2023.html). It seems to be the most recent take on solving this, but it's in an "exploration" phase, and [no RFCs are available as of this writing](https://blog.rust-lang.org/inside-rust/2022/07/27/keyword-generics.html#q-is-there-an-rfc-available-to-read).

According to [this old comment](https://github.com/rust-lang/rfcs/pull/2962#issuecomment-664656377), it's not something the Rust team has already discarded; it's still being discussed.

Although unofficial, another interesting approach that could be explored further in Rust is ["Sans I/O"](https://sans-io.readthedocs.io/). This is a Python protocol that abstracts away the use of network protocols like HTTP in our case, thus maximizing reusability. An existing example in Rust would be [`tame-oidc`](https://github.com/EmbarkStudios/tame-oidc).

<a name="_conclusion"></a>
## Conclusion

We currently have a choice to make between:

* Ignoring the Cargo Reference. We could assume that noone is going to use both sync and async for Rspotify at the same time.
* Fixing `maybe_async` and adding `_async` and `_sync` suffixes to each endpoint in our library.
* Dropping support for both async and sync code. It's kind of become a mess that we don't have the manpower to deal with and that [affects other parts of Rspotify](https://github.com/ramsayleung/rspotify/pull/224#issuecomment-909324671). The problem is that some crates that depend on rspotify like [`ncspot`](https://github.com/hrkfdn/ncspot) or [`spotifyd`](https://github.com/Spotifyd/spotifyd) are blocking, and others like [`spotify-tui`](https://github.com/Rigellute/spotify-tui) use async, so I'm not sure what they'd think.

  I know this is a problem that I've imposed to myself. We could just say "No. We only support async" or "No. We only support sync". While there are users interested in being able to use both, sometimes you just have to say no. If such a feature becomes so complicated to deal with that your entire codebase becomes a mess, and you don't have the engineering power to maintain it, then it's your only choice. If someone cared enough, they could just fork the crate and convert it to synchronous for their own usage.

  After all, most API wrappers and the like only support either asynchronous or blocking code. {% crate "serenity" %} (Discord API), {% crate "sqlx" %} (SQL toolkit) and {% crate "teloxide" %} (Telegram API) are async-only, for example, and they're quite popular.

Even though it was quite frustrating at times, I don't really regret spending so much time walking in circles trying to get both async and sync to work. I was contributing to Rspotify in the first place just to _learn_. I had no deadlines and no stress, I just wanted to try to improve a library in Rust in my free time. And I _have_ learned a lot; hopefully you too, after reading this.

Perhaps the lesson today is that we should remember that Rust is a low level language after all, and there are some things that aren't possible without a lot of complexity. Anyhow, I'm looking forward to how the Rust team fixes this in the future.

So what do you think? What would you do if you were a maintainer of Rspotify? You can leave a comment below if you like.

{% render "partials/subscribe.liquid" metadata: metadata %}

[^block-on-perf]: {% gh "issue-comment" "ramsayleung/rspotify" "112#issuecomment-683266508" "Cleaning up the `blocking` module" %}
[^block-on-channels]: [reqwest/src/blocking/client.rs @ line 757 --- GitHub](https://github.com/seanmonstar/reqwest/blob/0.10.x/src/blocking/client.rs#L757)
[^block-on-reqwest]: {% gh "issue-comment" "ramsayleung/rspotify" "112#issuecomment-683249563" "Cleaning up the `blocking` module" %}
[^features-additive]: [Cargo's Documentation, "Feature unification"](https://github.com/rust-lang/cargo/blob/master/src/doc/src/reference/features.md#feature-unification)
[^arangors-error]: {% gh "issue" "fMeow/arangors" 37 "Proposal: Move `sync` and `async` features into seperate modules" %}
[^aragog-error]: [aragog/src/lib.rs @ line 488 --- GitLab](https://gitlab.com/qonfucius/aragog/-/blob/0.140.0/src/lib.rs#L488)
[^inkwell-error]: [inkwell/src/lib.rs @ line 107 --- GitHub](https://github.com/TheDan64/inkwell/blob/bfb0e32bc329fd35f6c5a529a1a6209936a147f8/src/lib.rs#L107)
[^k8s-error]: [k8s-openapi/build.rs @ line 31 --- GitHub](https://github.com/Arnavion/k8s-openapi/blob/v0.13.0/build.rs#L31)
