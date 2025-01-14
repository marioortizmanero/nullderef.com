---
title: "Plugins in Rust: Reducing the Pain with Dependencies"
description: "Taking a look at the state of dynamic loading in the Rust ecosystem"
image: "/blog/plugin-abi-stable/cratesio.jpg"
imageAlt: "Preview image, with the logo of crates.io"
tags: ["tech", "programming", "rust", "open-source"]
keywords: ["tech", "programming", "rust", "rustlang", "dynamic loading", "plugin", "ffi", "abi", "abi_stable"]
series: "rust-plugins"
date: 2021-11-08
GHissueID: 1
hasMath: true
---

[[toc]]

[Previously](https://nullderef.com/blog/plugin-dynload/) in this [series](https://nullderef.com/series/rust-plugins/), I covered how the plugin system could be implemented from scratch. This is a lot of work if you're dealing with a relatively large codebase and therefore a complex interface in your plugin system, so let's see how we can make our lives easier. I've been wanting to try {% crate "abi_stable" %} for this since the beginning, which was specifically created for plugins. But we aren't really locked to that crate, so I'll show other alternatives as well, which can even be combined to your liking.

<a name="_handy_tools_for_our_plugin_system"></a>
## Handy tools for our Plugin System

<a name="_async_with_the_c_abi"></a>
### Async with the C ABI

In a previous post I mentioned that async was not supported in `abi_stable`. While this is true, because there is no FFI-safe `Future` in the crate, it's certainly possible, and it might be of interest later on.

Matthias recently let me know about the {% crate "async_ffi" %} crate, which lets us do exactly that. It exports the type `FfiFuture<T>`, which provides the same functionality as `Box<dyn Future<Output = T> + Send>`:

```rust
// This is how regular async works: the first function is practically equivalent
// to the second.
async fn example() -> String {
    read_file().await
}
fn example() -> impl Future<Output = String> {
    async {
        read_file().await
    }
}

// For FFI-safe interfaces there can't be generics involved, so the future is a
// concrete type instead of a trait. This conversion from `Future` to
// `FfiFuture` can be done with `into_ffi`.
fn example() -> FfiFuture<String> {
    async move {
        read_file().await
    }
    .into_ffi()
}
// `FfiFuture<T>` implements `Future<Output = T>`, so it can be awaited as usual
async fn user() {
    example().await
}
```

[Someone asked for this feature in `abi_stable` back in 2019](https://github.com/rodrimati1992/abi_stable_crates/issues/25), but noone seemed interested enough to implement it at that time, so maybe in the future.

<a name="_lccc"></a>
### LCCC

The [_Lightning Creations Compiler Collection_](https://github.com/LightningCreations/lccc) provides a set of frontends and backends with a uniform intermediate representation for multiple programming languages, [including Rust](https://github.com/LightningCreations/lccc/tree/riir/xlang/xlang_abi/src/).

This means that they've written their own standard library with the C ABI, which is exactly what we need. It's much simpler than Rust's standard library, but it includes the most popular types your library may use: `HashMap`, `Vec`, `String`, `Box`, etc. The source code is quite nice to read in comparison to `std`, which often includes lots of procedural macros and various forms of astral magic.

It's not too popular right now, and it's still Work In Progress, but it serves as an example of what we're looking for in this article. We just want to simplify our lives by having a `#[repr(C)]`-compatible standard library so that we don't have to write it ourselves. If all you need is something simple like LCCC, consider this library or a similar one.

<a name="_safer_ffi"></a>
### Safer FFI

If you don't like any of the solutions listed in this article, and you're going to end up writing the plugin interfaces by hand, you might be interested in {% crate "safer_ffi" %}.

All this crate provides is a set of procedural macros to make FFI interfacing an easier and safer task. With it, you'll be able to get rid of lots of `extern "C"` and `unsafe` instances in your code, which can get out of hands in larger codebases. Its documentation is excellent, you can check out [its book](https://getditto.github.io/safer_ffi/) for more information.

<a name="_cglue"></a>
### CGlue

<!-- TODO: response to https://github.com/h33p/cglue/issues/3 -->

In my last post, I was brought up the {% crate "cglue" %} crate [by its own creator](https://www.reddit.com/r/rust/comments/q2n6b8/plugins_in_rust_diving_into_dynamic_loading/hfmyn6o/). It takes a very interesting approach, achieving ABI stability through [_opaque types_](https://en.wikipedia.org/wiki/Opaque_data_type).

An opaque type is simply one for which you don't know its concrete layout. There's no `#[repr(C)]` needed at all, because one can only interact with it via void pointers and its associated vtables.

``cglue``'s README showcases the following snippet of code, and the repo even includes an [example of a plugin system](https://github.com/h33p/cglue/tree/main/examples).

```rust
use cglue::*;

// One annotation for the trait.
#[cglue_trait]
pub trait InfoPrinter {
    fn print_info(&self);
}

struct Info {
    value: usize
}

impl InfoPrinter for Info {
    fn print_info(&self) {
        println!("Info struct: {}", self.value);
    }
}

fn use_info_printer(printer: &impl InfoPrinter) {
    println!("Printing info:");
    printer.print_info();
}

fn main() -> () {
    let mut info = Info {
        value: 5
    };

    // Here, the object is fully opaque, and is FFI and ABI safe.
    let obj = trait_obj!(&mut info as InfoPrinter);

    use_info_printer(&obj);
}
```

`cglue` is limited to just generating FFI-safe trait objects, trying to make the whole process as straightforward as possible. You could say that `cglue` covers just a subset of what `abi_stable` does, because most of this is also available in `abi_stable` through the `sabi_trait` procedural macro, which I'll [explain later](#sabi_trait). It's possible to combine both crates, which is something `cglue` plans to do in the future. `cglue` offers the following benefits over `sabi_trait`[^cglue-vs-sabi]:

* It's possible to generate bindings for C/C++, which means that plugins can be written in languages other than Rust.
* You can define _trait groups_, even with optional traits.

Neither of these are particularly useful for my use-case, but if any of these features interests you, definitely take a deeper look. It's actively maintained and constantly being improved; the documentation is great and the author frequently uploads updates to his [personal blog](https://blaz.is/).

<a name="_miri"></a>
### Miri

[Miri](https://github.com/rust-lang/miri) is an interpreter for Rust's mid-level intermediate representation. This doesn't help us with the plugin system per se, but since it's very likely that we're going to end up writing unsafe code, it's good to know about it. That's exactly what Miri is used for: detecting undefined behavior, such as using uninitialized data or use-after-frees.

I was going to use Miri from the beginning, but since I'll be using {% crate "abi_stable" %} for now, there will be no unsafe code involved. If I end up having to resort to it, I'll try to add Miri to Tremor's workflow (mainly their Continuous Integration).

<a name="_cbindgen"></a>
### cbindgen

For the first steps with dynamic loading I think the C/C++ binding generator {% crate "cbindgen" %} will help us understand what's going on under the hood. We can take a look at the generated headers and see how it works internally. Unfortunately, it fails to run for the `abi_stable` crate:

```plain
(...)
WARN: Skip abi_stable::CONST - (...)

thread 'main' panicked at 'RResult has 2 params but is being instantiated with 1 values', src/bindgen/ir/enumeration.rs:596:9
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

This _probably_ has to do with the following warning found in [``cbindgen``'s documentation](https://github.com/eqrion/cbindgen/blob/master/docs.md):

>NOTE: A major limitation of cbindgen is that it does not understand Rust's module system or namespacing. This means that if cbindgen sees that it needs the definition for `MyType` and there exists two things in your project with the type name `MyType`, it won't know what to do. Currently, cbindgen's behaviour is unspecified if this happens. However, this may be ok if they have [different cfgs](https://github.com/eqrion/cbindgen/blob/master/docs.md#defines-and-cfgs).

If you're using something else like `cglue`, this will work without issues. But after letting the maintainers of `abi_stable` know about this in [an issue](https://github.com/rodrimati1992/abi_stable_crates/issues/52), they pointed out that this was expected and that they don't plan on supporting `cbindgen` because it would take too much effort. Understandable, so let's move on.

<a name="_working_with_abi_stable"></a>
## Working with `abi_stable`

I will personally use {% crate "abi_stable" %} because it seems like the easiest choice for now, and the one that meets my needs best. Not only does it provide a standard library defined with the C ABI, but also lots of other macros and utilities specially useful for plugin systems. With it, I won't need a line of unsafe, and I'll avoid reinventing the wheel in many instances.

_Once the plugin system is fully functional with ``abi_stable``_, I might consider using something more hand-crafted. This switch won't be too complicated, since our interface will already be `#[repr(C)]`, which is the most troublesome part. All we'd have to do is remove a few procedural macros, switch the `abi_stable` types, and load the plugins manually with something like {% crate "libloading" %}. The only thing I want right now is a plugin system that works, and then we can maybe focus on trying to make it available in other languages, making it more performant, or whatever.

So let's start comparing `abi_stable` with my experiments in the previous post using raw dynamic linking. I've created the `abi-stable-simple` directory [in the pdk-experiments repository](https://github.com/marioortizmanero/pdk-experiments). I'll be taking a look at the already implemented [examples](https://github.com/rodrimati1992/abi_stable_crates/tree/master/examples) for `abi_stable` in order to make the learning experience smoother. The base structure for a plugin system with `abi_stable` is the same as always: a crate for the plugin, another for the runtime, and `common`, with the shared interface.

<a name="_versioning"></a>
## Versioning

`abi_stable` [states this](https://github.com/rodrimati1992/abi_stable_crates#safety) regarding versioning:

>This library ensures that the loaded libraries are safe to use through these mechanisms:
>
>* The abi_stable ABI of the library is checked, Each `0.y.0` version and `x.0.0` version of abi_stable defines its own ABI which is incompatible with previous versions.
>* Types are recursively checked when the dynamic library is loaded, before any function can be called.

In summary, `abi_stable` itself is far from being permanently backward compatible, but it automatically makes sure that its versions are compatible when running the plugin. While it doesn't exactly stick to semantic versioning, it's good enough for us.

The version checking for the entire `common` crate is already implemented, i.e., we can't try to mix different versions that aren't compatible. We could still add a version string for each kind of plugin if more fine-grained control is needed, as described in the previous post.

<a name="_loading_lugins"></a>
## Loading plugins

`abi_stable` plugins are structured in _modules_, which can help us split up our functionality into smaller independent pieces. There must always be a [root module](https://docs.rs/abi_stable/latest/abi_stable/library/trait.RootModule.html) that initializes the entire library and provides metadata such as the name or the version strings. Then, we can have submodules to organize the functions exported by the library nicely.

Furthermore, the [`StableAbi`](https://docs.rs/abi_stable/latest/abi_stable/abi_stability/stable_abi_trait/trait.StableAbi.html) trait in `abi_stable` indicates that a type is FFI-safe. It contains information about the layout of the type, and it can be [derived automatically](https://docs.rs/abi_stable/latest/abi_stable/derive.StableAbi.html). Each item in ``abi_stable``'s standard library (`RStr`, `RSlice<T>`, `RArc<T>`, etc) implements this trait, and it's used to make sure the types are compatible when loading the plugin.

This also introduces the concept of [_prefix types_](https://docs.rs/abi_stable/latest/abi_stable/docs/prefix_types/index.html). When a type derives `StableAbi` and has the `#[sabi(kind(Prefix(...)))]` attribute, two more types are generated:

* `<name>_Prefix`, which contains all the fields up to the `#[sabi(last_prefix_field)]` attribute in the original type.
* `<name>_Ref`, which is a pointer to `<name>_Prefix` that can actually be passed through the FFI barrier safely.

Prefix types are needed to guarantee some kind of individual versioning to avoid breakage in future patches. It will let us add more fields to the module after the `last_prefix_field` attribute in patch (`0.0.x`) updates. Moving this attribute requires a backward-incompatible version bump. Prefix types are often used for modules and vtables.

For now, I'll just have a single root module and call it `MinMod`, exporting the `min` function:

```rust
// Using the stable C ABI
#[repr(C)]
// Deriving the `StableAbi` trait, which defines the layout of the struct at
// compile-time:
// https://docs.rs/abi_stable/0.10.2/abi_stable/derive.StableAbi.html
#[derive(StableAbi)]
// Marking the struct as a prefix-type:
// https://docs.rs/abi_stable/0.10.2/abi_stable/docs/prefix_types/index.html
#[sabi(kind(Prefix))]
pub struct MinMod {
    /// Initializes the state, which will be passed to the functions in this
    /// module. I'll explain more about the state later on.
    pub new: extern "C" fn() -> State,

    /// Calculates the minimum between two integers. This is the last defined
    /// field for the current version. If we try to load fields after this, all
    /// of them will be an `Option`.
    #[sabi(last_prefix_field)]
    pub min: extern "C" fn(&mut State, i32, i32) -> i32,
}
```

Most of the loading functionality is already handled by `abi_stable`. The module we're exporting implements the `RootModule` trait, which includes functions to load the plugin, such as [`RootModule::load_from_file`](https://docs.rs/abi_stable/latest/abi_stable/library/trait.RootModule.html#method.load_from_file) or [`RootModule::load_from_directory`](https://docs.rs/abi_stable/latest/abi_stable/library/trait.RootModule.html#method.load_from_directory):

```rust
// Marking `MinMod` as the main module in this plugin. Note that `MinMod_Ref` is
// a pointer to the prefix of `MinMod`.
impl RootModule for MinMod_Ref {
    // The name of the dynamic library
    const BASE_NAME: &'static str = "min";
    // The name of the library for logging and similars
    const NAME: &'static str = "min";
    // The version of this plugin's crate
    const VERSION_STRINGS: VersionStrings = package_version_strings!();

    // Implements the `RootModule::root_module_statics` function, which is the
    // only required implementation for the `RootModule` trait.
    declare_root_module_statics!{MinMod_Ref}
}
```

When loading directories, it makes the following decisions by default (though we could change them if we wanted to):

* It does so non-recursively, i.e., only checking the immediate files in the given directory.
* The name of the library must be the `RootModule::BASE_NAME` in lowercase, according to the [Operating System's defaults](https://doc.rust-lang.org/std/env/consts/index.html). For example, in Linux our plugin would be `libmin.so`, and on Windows it'd be `min.dll`.

This means that we should add the following parameter to the plugin's `Cargo.toml` file:

```toml
[lib]
# This way, the shared object will be saved as `abi_stable` prefers, for example
# `libmin.so`.
name = "min"
```

Finally, this is what the runtime may look like:

```rust
pub fn run_plugin(path: &str) -> Result<()> {
    let plugin = MinMod_Ref::load_from_directory(path.as_ref())?;
    println!("Loading plugin {}", MinMod_Ref::NAME);

    // First we obtain the function pointer. This is not an `Option` because
    // `new` is defined before `min`, the last prefix field.
    let new_fn = plugin.new();

    // We initialize the plugin, obtaining a state.
    let mut state = new_fn();

    // Same for the `min` function
    let min_fn = plugin.min();

    println!("initial state: {:?}", state);
    println!("  min(1, 2): {}", min_fn(&mut state, 1, 2));
    println!("  min(-10, 10): {}", min_fn(&mut state, -10, 10));
    println!("  min(2000, 2000): {}", min_fn(&mut state, 2000, 2000));
    println!("final state: {:?}", state);

    Ok(())
}
```

Executing the `plugin-sample` implementation:

```plain
$ make debug-sample
Loading plugin min
initial state: State { counter: 0 }
  min(1, 2): 1
  min(-10, 10): -10
  min(2000, 2000): 2000
final state: State { counter: 3 }
```

<a name="_handling_state"></a>
## Handling state

<a name="_regular_rust"></a>
### Regular Rust

As we saw in the previous example, we need some kind of generic `State` type that each plugin can implement with their own data. In regular Rust, we'd do as follows. [See the full code here](https://github.com/marioortizmanero/pdk-experiments/tree/master/generics/regular-rust).
```rust
trait State: Debug {}

// Remember that we can't use generics, so we need `dyn`, either by itself as a
// reference, or in a box.
type StateBox = Box<dyn State>;

fn usage(state: &mut StateBox) {
    println!("state debug: {:?}", state);
}
```

<a name="_interface_types"></a>
### Interface types

Unfortunately, we already know that regular `dyn` is not FFI-safe. I covered how it's possible to work around it with pointers, but here we can resort to ``abi_stable``'s safer and more convenient alternatives. Here's one of them ([see the full code here](https://github.com/marioortizmanero/pdk-experiments/tree/master/generics/interface-types)):

```rust
#[repr(C)]
#[derive(StableAbi)]
// An `InterfaceType` describes which traits are required when constructing
// `StateBox` and are then usable afterwards.
#[sabi(impl_InterfaceType(Debug, PartialEq))]
struct State;

// A trait object for `State`
type StateBox = DynTrait<'static, RBox<()>, State>;

// It can then be used easily like this
fn usage(state: &mut StateBox) {
    println!("state debug: {:?}", state);
}
```

Here we first declare a `State` [_interface type_](https://docs.rs/abi_stable/latest/abi_stable/trait.InterfaceType.html). Note that even though it's defined as a `struct`, this is a translation of the previous snippet of code, so it acts as the empty "trait". But all it does is establish `Debug` and `PartialEq` as its supertraits and give access to them; you can't really add custom methods to the trait.

Unlike `dyn`, this even works with supertraits that aren't object-safe. Thus, we can use something like `PartialEq`. Its main disadvantage is that it's limited to a set of 21 hardcoded traits, so it might not be enough for us.

<a name="sabi_trait"></a>
### Trait objects

If we want something more akin to traits on Rust, we can use [`#[sabi_trait]`](https://docs.rs/abi_stable/latest/abi_stable/attr.sabi_trait.html). The trait has to be object-safe, and by default there's no support for `PartialEq` in the list of supertraits, so I'll remove it. [See the full code here](https://github.com/marioortizmanero/pdk-experiments/tree/master/generics/sabi-trait).

```rust
#[sabi_trait]
pub trait State: Debug {
    fn counter(&self) -> i32;
}

// A trait object for the `State` Trait Object
pub type StateBox = State_TO<'static, RBox<()>>;

// It can then be used easily like this
pub fn usage(state: &mut StateBox) {
    println!("state debug: {:?}", state);
    println!("state counter: {:?}", state.counter());
}
```

As its documentation explains, this still has a limited number of possible supertraits, but at least it lets us require functions as usual, and it even works with default implementations.

<a name="_error_handling"></a>
## Error handling

`abi_stable` is just a wrapper over {% crate "libloading" %} after all. It doesn't include a sandbox, so if the plugin developer was a malicious actor, they'd have full access to the computer the runtime is being executed on. Other popular plugin systems such as [nginx's](https://www.nginx.com/resources/wiki/extending/) or [apache's](https://httpd.apache.org/docs/2.4/dso.html) suffer from the same issues, for reference.

However, I think it's not so bad to assume that no bad actors will be involved here. A sandbox would be mandatory if we were working on something like [Solana](https://solana.com/) (one of the main users of eBPF in Rust), which basically executes random code from the internet. But with Tremor we can assume that the plugins come from trusted sources because they're installed and configured manually by the user.

There are some additional security measures that could be implemented in the future, like checking the integrity of the plugins and verifying they come from a trusted source before loading them. Of course, if we could afford to have a sandbox it'd definitely be the best way to do it, but we've already seen in this series that it's currently not really viable for this use-case.

Still, we trust that the plugin developer has good intentions, but not necessarily that they know what they're doing. We should make fatal errors as hard as possible to happen so that Tremor isn't constantly crashing. The fewer pitfalls, the better.

The full source for the example that's supported to work is [here](https://github.com/marioortizmanero/pdk-experiments/tree/master/abi-stable-simple/plugin-sample). Let's see a few ways in which the plugin could go wrong:

<a name="_version_mismatch"></a>
### Version mismatch

The versions of the `common` library are checked automatically. In case there's a mismatch in those considered incompatible (changes in `x.0.0` or `0.x.0`), this is what will show up. [See the full code here](https://github.com/marioortizmanero/pdk-experiments/tree/master/abi-stable-simple/plugin-versionmismatch).


```plain
$ make debug-versionmismatch
Error when running the plugin:

(...)

Error:incompatible package versions
Expected:
    0.2.0
Found:
    0.1.0
```

We can absolutely catch this error gracefully and continue with the execution of the runtime, just like with raw dynamic loading. It's even easier because it works out of the box.

<a name="_missing_fields_and_wrong_types"></a>
### Missing fields and wrong types

The layout of every type is recursively checked before trying to use them to make sure they are compatible. Unlike raw dynamic loading, these errors can be caught gracefully, which is a huge plus (it used to segfault). [See the full code here](https://github.com/marioortizmanero/pdk-experiments/tree/master/abi-stable-simple/plugin-wrongtype).

```plain
$ make debug-wrongtype
Error when running the plugin:
Compared <this>:
    --- Type Layout ---
    type:PrefixRef<'a, MinMod>
    (...)
To <other>:
    --- Type Layout ---
    type:PrefixRef<'a, MinMod>
    (...)

0 error(s).

0 error(s)inside:
    <other>

    (...)

Layout of expected type:
    --- Type Layout ---
    type:MinMod
    (...)

Layout of found type:
    --- Type Layout ---
    type:MinMod
    (...)

(...)
```

The error message is way too long to show here, but it basically shows the entire layout tree of the types that don't match for each of its versions (runtime vs plugin). For this example, I changed the `State` trait to use a boolean instead of an integer counter, and the message describes it perfectly: their sizes, alignments, and types differ in the trait's methods.

<a name="_panicking"></a>
### Panicking

Panicking trough the FFI boundary is _undefined behaviour_; we aren't guaranteed that the plugin will abort. It may just continue its execution in a completely invalid state, which is scary. But turns out `abi_stable` properly handles this for us! It will use what it calls an `AbortBomb` to even print out the line and file where it happened. This is publicly available through the macro [`extern_fn_panic_handling`](https://docs.rs/abi_stable/latest/abi_stable/macro.extern_fn_panic_handling.html). [See the full code here](https://github.com/marioortizmanero/pdk-experiments/tree/master/abi-stable-simple/plugin-panic).


```plain
$ make debug-panic
Loading plugin min
initial state: State { counter: 0 }
thread '<unnamed>' panicked at 'This will crash everything', src/lib.rs:26:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

file:src/lib.rs
line:24
Attempted to panic across the ffi boundary.
Aborting to handle the panic...
```

If we panic in the plugin it won't be undefined behaviour anymore because `abi_stable` already makes sure the panic doesn't reach the FFI boundary.

<a name="_panicking_and_ffi"></a>
## Panicking and FFI

As we've already seen, plugins cannot panic across the FFI boundary under any circumstance[^panic-ffi]. If we aren't using something like `abi_stable`, every single function we export in the plugin should wrap its contents in [`catch_unwind`](https://doc.rust-lang.org/std/panic/fn.catch_unwind.html) in order to be able to panic.

_Unwinding_ is a process in which all local objects are destroyed, properly calling the destructors in the thread in order to continue execution safely[^panic-book][^unwinding]. Knowing this is something taken for granted when taking a look at documentation about exceptions in Rust, but it wasn't so clear to me at the beginning.

For example, the following snippet will panic after creating the vector. If panics were configured to abort, the contents of the vector wouldn't be freed at all; the program would just end abruptly, and the cleaning up would be left to the Operating System. But if it _unwinds_, Rust will call ``Vec``'s destructor, freeing its allocated memory properly, making it possible to continue the execution of the program.

```rust
{
    let data = vec![1, 2, 3];
    panic!("oh no!");
    println!("My data: {:?}", data); // Unreachable
}
```

In a typical usage of Rust, a panic usually means that your program writes some scary message to stdout and then ends. This is because unwinding is propagated and it may end up finishing the execution of the program if it's not stopped. But that's exacty what `catch_unwind` is for:

```rust
let result = panic::catch_unwind(|| {
    let data = vec![1, 2, 3];
    panic!("oh no!");
    println!("My data: {:?}", data); // Unreachable
});

// This will run just fine and print out `true`
println!("Did it panic? {}", result.is_err());
```

Rust makes it very clear that `catch_unwind` is not intended for regular error handling (you have `Result` for that). But in our case we are almost forced to use it in order to not invoke undefined behaviour when panicking through the FFI boundary. Every single function in the FFI interface that has a possibility of panicking should use it so that the panic doesn't try to propagate. And this is quite tricky because even things like addition may cause a panic (overflow in debug mode).

Let's see what else can we do about panicking:

<a name="_aborting"></a>
### Aborting

The simplest way to do it would be to just configure plugins to abort on panic instead of unwinding. This is possible with the `panic = "abort" option in the plugin's `Cargo.toml`. It will still show the panic message, but the execution will be completely stopped by an abort:

```plain
$ cargo r -q
thread 'main' panicked at 'Oh no!', src/main.rs:2:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
zsh: abort (core dumped)  cargo r -q
```

This is sound because the entire program's execution ends before reaching the FFI boundary. The problem is that cleaning up will never happen, and that although there's [a hack you can use in your `common` library](https://stackoverflow.com/questions/51860663/is-it-possible-to-check-if-panic-is-set-to-abort-while-a-library-is-compilin) to make sure the plugin is compiled with `panic = "abort", it's only available on nightly until this is merged:

<p style="text-align:center;">
  {% gh "issue" "rust-lang/rust" 32837 "Pluggable panic implementations (tracking issue for RFC 1513)" %}
</p>

<a name="_c_unwind"></a>
### `C-unwind`

This problem is something the Rust devs are aware of, and that they're trying to fix. It has been proposed under the "C-unwind" ABI string. Just like how you currently use `extern "C"`, if we used `extern "C-unwind"`, we'd get more guarantees about what happens when a thread panics. More information here:

* [Current reference to FFI and panics](https://doc.rust-lang.org/nomicon/ffi.html?highlight=panic#ffi-and-panics)
* [RFC](https://rust-lang.github.io/rfcs/2945-c-unwind-abi.html)
* [Pull Request](https://github.com/rust-lang/rust/pull/76570)
* [Project Group](https://github.com/rust-lang/project-ffi-unwind)

The most relevant things this feature offers us is:

* Support for unwinding through the FFI boundary.
* A guarantee that even with `extern "C"`, panicking is not undefined behavior, it'll just abort (except for some very specific cases). Switching between "abort" and "unwind" for the `panic` option in `Cargo.toml` is always sound.

Unfortunately, it's moving somewhat slowly, and I'm not quite sure when this will be ready. In the meanwhile, we'll need to use something else to ensure no undefined behaviour occurs in our plugin system.

<a name="_abortbomb"></a>
### `AbortBomb`

`abi_stable` does this in a pretty clever way: it creates an `AbortBomb` struct at the beginning of the function, which contains its filename and line of code. If something panics and unwraps, ``AbortBomb``'s destructor will be called, which aborts the program. Otherwise, `mem::forget` is called for the `AbortBomb` at the end of the function, which will avoid calling its destructor and the function will be able to end successfully.

Note that even though `mem::forget` is called, no memory is actually being leaked, because the filename is a `'static str` --- which lives for the entirety of the program --- and the line number is an integer, which will be in the stack and doesn't need fancy destructors.

This approach is completely fine and works great, but it aborts the whole plugin system, so you can't recover from it at all. In the case of Tremor, if a plugin panics, from a logical standpoint it doesn't make much sense to continue the execution because there's a piece missing in the pipeline. It couldn't continue anyway... Right? Well, we could actually load the plugin that panicked again and use that instead for the remainder of the program. But since our plugin system doesn't support unloading, we'd be leaking memory, and if the plugin keeps panicking it'd eventually crash.

Recovering from a plugin panicking is definitely viable, and it might be an interesting feature for the future. Unfortunately, it's a lot of work to make sure it works properly, and it's not really an objective for the first implementation, so for now I'll just use ``abi_stable``'s solution.

<a name="_recovering_with_catch_unwind"></a>
### Recovering with `catch_unwind`

As I explained in the beginning, `catch_unwind` can be used to detect and stop unwinding panics. One way to notify the runtime that a plugin has panicked so that it can act accordingly would be to use an enum equivalent to `Option<T>`:

```rust
#[repr(C)]
#[derive(Debug, StableAbi)]
pub enum MayPanic<T> {
    Panic,
    NoPanic(T)
}
```

`MayPanic` is a type that only returns the original value if the function finished without panicking. Since the contents returned by `catch_unwind` are just `dyn Any` and don't provide much value for us, they're discarded and the `Panic` variant is empty. The panicking information will be printed automatically as output anyway (or whatever is configured with [the panic hook](https://doc.rust-lang.org/std/panic/fn.set_hook.html)). We will use it in FFI contexts, so it also implements `StableAbi` and it's `#[repr(C)]`.

I didn't want to use `Result` for this because panic errors should be treated differently from a regular error. Apart from the fact that `panic::catch_unwind` returns a `Box<dyn Any>`, which doesn't implement `Error`, panics happen when the plugin reaches an unrecoverable state and cannot continue. We really have to make sure this is handled differently from a regular error, so having the type safety of a different type can help.

It implements `From<thread::Result<T>>`, so it can simply be used like this:

```rust
fn plugin_stuff() -> MayPanic<Whatever> {
    panic::catch_unwind(|| {
        // Code goes here
    })
    .into()
}
```

Ideally, `MayPanic` could be accompanied by a `#[may_panic]` procedural macro that adds this boilerplate automatically to the function it's attached to. Additionally, it could come with a `#[may_not_panic]` variant that attaches the `#[no_panic]` macro from the {% crate "no-panic" %} crate to make sure the statement is true at compile time. However, `no-panic` isn't too reliable, so perhaps it could be opt-in with something like `#[may_not_panic(enforce)]`.

Something that complicates this whole thing considerably is the concept of _exception safety_. Unfortunately, `catch_unwind` isn't as easy to use as just slapping your code into its closure/function, as there are some types that aren't considered unwind safe. You can read more about that [here](https://doc.rust-lang.org/stable/std/panic/trait.UnwindSafe.html), but I won't get into more details because we aren't going to use `MayPanic` in our own plugin system anyway.

<a name="_type_conversions"></a>
## Type conversions

It's important to know the complexity of conversions from and to `abi_stable` types. If `Vec<T>` → `RVec<T>` wasn't $O(n)$ it might be worth avoiding it altogether.

This means that I should spend at least a bit of my time on understanding how the `abi_stable` types are implemented and making sure this isn't the case. In `std`, the definition of `Vec` is actually quite simple if we remove most of the noise:

```rust
// A non-null pointer to `T` that indicates ownership.
pub struct Unique<T: ?Sized> {
    pointer: *const T, // The data itself
    _marker: PhantomData<T>, // Indicating that we own a `T`
}

// Low level type related to allocation
pub struct RawVec<T> {
    ptr: Unique<T>,
    cap: usize,
}

pub struct Vec<T> {
    buf: RawVec<T>,
    len: usize,
}
```

It's mostly self-explanatory; a `Vec<T>` is a pointer to `T` with a set capacity and length. What about ``abi_stable``'s implementation?

```rust
#[repr(C)] // Notice this, so that it's FFI-safe
#[derive(StableAbi)] // This trait marks `RVec` as FFI-safe, with info about its layout
pub struct RVec<T> {
    pub(super) buffer: *mut T,
    pub(super) length: usize,
    capacity: usize,
    vtable: VecVTable_Ref<T>,
    _marker: PhantomData<T>,
}
```

Yup, basically the same, but packed inside a single struct. The single difference is that we have a field with the vtable. The conversion between these types is written with a macro, but if expanded, it looks like this:

```rust
impl<T> From<Vec<T>> for RVec<T> {
    fn from(this: Vec<T>) -> RVec<T> {
        let mut this = std::mem::ManuallyDrop::new(this);
        RVec {
            vtable: VTableGetter::<T>::LIB_VTABLE,
            buffer: this.as_mut_ptr(),
            length: this.len(),
            capacity: this.capacity(),
            _marker: PhantomData,
        }
    }
}
```

The only "weird" part is the usage of `std::mem::ManuallyDrop`, which is simply a wrapper that indicates Rust to not call the destructor of its contents automatically. In this case it's basically a less error-prone `std::mem::forget`, as [its docs explain](https://doc.rust-lang.org/stable/std/mem/fn.forget.html#relationship-with-manuallydrop). Thanks to it, the memory from the `Vec` won't be dropped when this function ends, and its pointer ownership can be safely moved into `RVec`, with no copying.

This happens for every type I checked in `abi_stable`, including `RSlice<T>`, which contains a reference to a slice, `RStr`, which is just a `RSlice<u8>`, and `RString`, which is just a `RVec`.

<a name="_thread_safety"></a>
## Thread safety

`abi_stable` uses `libloading`, whose error-handling is not fully thread-safe on some platforms, such as `dlerror` on FreeBSD[^libloading-th][^dlerror-th]. It's fully thread-safe on Linux[^linux-th], macOS[^macos-th], and Windows[^windows-th], so for Tremor specifically we don't have to worry about this. But if your programs supports other Operating Systems, you might want to check their manuals one by one in order to make sure.

However, for the first version of our system this won't be a problem at all. For simplicity's sake, loading plugins after the startup will not be implemented yet, and we'll do it sequentially. But it's good to know it for the future.

<a name="_performance"></a>
## Performance

I first tried to write these benchmarks with [cargo nightly's implementation](https://doc.rust-lang.org/nightly/cargo/commands/cargo-bench.html?highlight=feature). However, since it's so basic, not updated regularly, and requires nightly, I moved to {% crate "criterion" %}, which I quite liked after using it for [another post](https://nullderef.com/blog/web-api-client/).

First, we can take a look at already implemented plugin systems in order to have an idea of the performance hit we'll experience in Tremor. This is what we should expect once our system is polished and ready for deployment:

* nginx reports 20% slower startup times and up to a 5% slowdown in their execution times[^nginx-perf].
* [This article](https://www.technovelty.org/linux/plt-and-got-the-key-to-code-sharing-and-dynamic-libraries.html) explains that the only performance difference is saving the [resolved address](https://en.wikipedia.org/wiki/Position-independent_code) of the symbol in a table the first time, and then it's just a couple more instructions to access it. Also, obviously, the fact that the compiler can't optimize parts of the code (e.g., inline function calls).

These are the results of the benchmarks I wrote, on my not-so-fast laptop:

```plain
dynamic setup           time:   [652.53 ns 654.72 ns 657.34 ns]
Found 7 outliers among 100 measurements (7.00%)
  3 (3.00%) high mild
  4 (4.00%) high severe

abi_stable setup        time:   [30.386 ns 30.477 ns 30.575 ns]
Found 9 outliers among 100 measurements (9.00%)
  7 (7.00%) high mild
  2 (2.00%) high severe

dynamic runtime         time:   [1.8814 ns 1.8878 ns 1.8947 ns]
Found 5 outliers among 100 measurements (5.00%)
  1 (1.00%) low mild
  2 (2.00%) high mild
  2 (2.00%) high severe

abi_stable runtime      time:   [3.2155 ns 3.2325 ns 3.2494 ns]
Found 3 outliers among 100 measurements (3.00%)
  1 (1.00%) low mild
  2 (2.00%) high mild

native runtime          time:   [817.39 ps 819.33 ps 821.38 ps]
Found 6 outliers among 100 measurements (6.00%)
  3 (3.00%) high mild
  3 (3.00%) high severe
```

Note that the benchmarks still don't represent a real usage of Tremor; it's just using the plugin I described in this post with the `min` function. But we can more or less analyze the performance differences between `abi_stable` and raw dynamic loading --- I doubt it's worth implementing the final version with both methods just to run some benchmarks.

The loading times aren't so important for performance because they only happen once at the beginning of the program. But ``abi_stable``'s way of recursively checking the types in the plugins is not free; the difference with raw dynamic loading should be quite noticeable. But somehow, in my benchmarks `abi_stable` was _way_ faster. What??

It turns out that `abi_stable` just leaks the library when it's loaded to prevent a user-after-free. And since it won't be unloaded anyway, it's not much of a problem in terms of leaking memory. The library will be saved into a static variable (of type [`LateStaticRef`](https://docs.rs/abi_stable/latest/abi_stable/sabi_types/struct.LateStaticRef.html)), and the next times it's loaded the initial value will be reused. So in my bencharks for `abi_stable`, loading only actually happens once, and for dynamic loading it happens for every iteration.

Once the library is loaded, it seems that using dynamic loading versus static linking is quite bad, being more than twice as slow. This is understandable; the problem with the native benchmark was, and most likely still is, that the Rust compiler is too smart. If I called `min` with fixed parameters --- say `10.min(3)` --- it was optimized away, so I had to write a more intricate example that was different for each loop. Furthermore, using tools like `sabi_trait` instead of a `void*` almost doubles the execution time again.

<a name="_conclusion"></a>
## Conclusion

We've learned a lot about `abi_stable` and the overall state of dynamic loading in Rust. We'll definitely avoid a lot of work thanks to these dependencies. It's not as bad as I thought; there's plenty of tools for each use-case, though most are admittedly only in early stages.

Hopefully, the performance degradations we've found won't be as noticeable in the final version of the system. We'll use `sabi_trait` only when loading the library instead of for each call. And having a more complex use-case will probably avoid such incredible optimizations in the native code. You can find the full statistical reports in the [`criterion-reports`](https://github.com/marioortizmanero/pdk-experiments/tree/master/criterion-reports) directory of the [repository](https://github.com/marioortizmanero/pdk-experiments/).

In the next article, I'll cover the different caveats I'm finding as I try to actually implement the plugin system on Tremor, and the different ways in which they can be approached.

{% render "partials/subscribe.liquid" metadata: metadata %}

[^cglue-vs-sabi]: {% gh "issue" "h33p/cglue" 3 "A few questions about the library" %}
[^panic-ffi]: [FFI and panics --- Rustonomicon](https://doc.rust-lang.org/nomicon/ffi.html#ffi-and-panics)
[^panic-book]: [Unrecoverable Errors with `panic!` --- The Rust Programming Language](https://doc.rust-lang.org/book/ch09-01-unrecoverable-errors-with-panic.html)
[^unwinding]: [Unwinding --- Rustonomicon](https://doc.rust-lang.org/nomicon/unwinding.html)
[^libloading-th]: [Thread-safety --- Libloading v0.7.1](https://docs.rs/libloading/0.7.1/libloading/struct.Library.html#thread-safety)
[^dlerror-th]: [`dlerror` --- The Open Group Base Specifications](https://pubs.opengroup.org/onlinepubs/009604499/functions/dlerror.html)
[^linux-th]: [`dlerror` attributes --- Linux Manual Page](https://man7.org/linux/man-pages/man3/dlerror.3.html#ATTRIBUTES)
[^macos-th]: [`dlerror` --- Mac OS X Man Pages](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man3/dlerror.3.html)
[^windows-th]: [`SetThreadErrorMode` --- Microsoft Documentation](https://docs.microsoft.com/en-us/windows/win32/api/errhandlingapi/nf-errhandlingapi-setthreaderrormode)
[^nginx-perf]: [Advantages and Disadvantages --- Dynamic Shared Object (DSO) Support](https://httpd.apache.org/docs/2.4/dso.html#advantages)
