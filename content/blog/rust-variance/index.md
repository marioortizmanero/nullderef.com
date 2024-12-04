---
title: "Blindsided by Rust's Subtyping and Variance"
description: "One of the toughest bugs I've come across... Thanks to my good friends Subtyping and Variance."
author: "Mario Ortiz Manero"
images: ["/blog/rust-variance/preview.jpg"]
tags: ["tech", "programming", "rust", "open source"]
keywords: ["tech", "programming", "rust", "rustlang", "variance", "subtyping", "invariant", "covariant", "abi_stable", "ffi"]
series: ["rust-plugins"]
date: 2024-09-14
GHissueID: 14
---

_Subtyping and variance_ is a concept that works in the background, making your life easier without you knowing about it. That is, until it starts making your life harder instead. It's a good idea to know about it, in case you end up being a fool like me. So let's take a look at what went wrong, and how it was resolved.

<a name="_the_problem"></a>
## The problem

As part of my [Plugin System in Rust](https://nullderef.com/series/rust-plugins/) series, I was making one of [Tremor](https://www.tremor.rs/)'s types FFI-compatible. Put simply, instead of using types from the standard library like `String`, we wanted custom types defined [with `#[repr(C)]`](https://doc.rust-lang.org/nomicon/other-reprs.html#reprc). The crate {{< crate abi_stable >}} exists for this exact purpose, with an equivalent for the most important types. Theoretically, the task should be as easy as changing the `std` types in our core `enum` with theirs:

```rust
// Before (simplified)
pub enum Value {
    String(String),
    Object(Box<HashMap<String, Value>>),
    Bytes(Vec<u8>),
}
```

```rust
// After (simplified)
use abi_stable::std_types::{RString, RVec, RBox, RHashMap};

#[repr(C)]
pub enum Value {
    String(RString),
    Object(RBox<RHashMap<RString, Value>>),
    Bytes(RVec<u8>),
}
```

The `Value` type is used a lot in the codebase, so this breaking change brought up lots of compilation errors. But for whatever reason, 70 of these errors were related to lifetimes, which I hadn't changed at all...

<a name="_debugging"></a>
## Debugging

Instead of a `String` or `Vec`, we actually used [`Cow<'a>`](https://doc.rust-lang.org/stable/alloc/borrow/enum.Cow.html) for performance reasons. `Cow<'a>` is a type that can hold either a borrowed or an owned value at runtime. The idea is to use the borrowed one as much as possible, and only if ownership or mutation is needed, the underlying value is cloned ([a better explanation can be found here](https://www.reddit.com/r/rust/comments/v1z6bx/what_is_a_cow/iape1qq/)).

[Heinz](https://mastodon.social/@heinz), my mentor at Tremor, managed to reproduce the issue to `Cow` and its equivalent, `RCow`. [A Playground snippet can be found here](https://play.rust-lang.org/?version=stable&mode=debug&edition=2021&gist=660f8633738fd0a8817cc8ee9bbddfa8).

```rust
use abi_stable::std_types::RCow;
use std::borrow::Cow;

// This works
fn cmp_cow<'a, 'b>(left: &Cow<'a, ()>, right: &Cow<'b, ()>) -> bool {
    left == right
}

// This fails to compile
fn cmp_rcow<'a, 'b>(left: &RCow<'a, ()>, right: &RCow<'b, ()>) -> bool {
    left == right
}
```

It failed to compile with the following error, which didn't help much. In Rust 1.62.0, they actually improved it to explain what's going on (shown at the end of the article):

```text
$ cargo b
   Compiling repro v0.1.0 (/home/mario/Downloads/repro)
error[E0623]: lifetime mismatch
  --> src/lib.rs:10:10
   |
9  | fn cmp_rcow<'a, 'b>(left: &RCow<'a, ()>, right: &RCow<'b, ()>) -> bool {
   |                            ------------          ------------
   |                            |
   |                            these two types are declared with different lifetimes...
10 |     left == right
   |          ^^ ...but data from `left` flows into `right` here

For more information about this error, try `rustc --explain E0623`.
error: could not compile `repro` due to previous error
```

What? Why do lifetimes matter here if it's just a comparison?

This hinted that the issue was in the underlying library, not my code. `RCow` is supposed to be a drop-in replacement for `Cow`. It also had something to do with `PartialOrd`, which is the trait used for `==` here. But I couldn't see a difference in its implementations:

```rust
impl<'a, B: ?Sized> PartialOrd for Cow<'a, B>
where
    B: PartialOrd + ToOwned,
{
    #[inline]
    fn partial_cmp(&self, other: &Cow<'a, B>) -> Option<Ordering> {
        PartialOrd::partial_cmp(&**self, &**other)
    }
}
```

```rust
impl<'a, B> PartialOrd<RCow<'a, B>> for RCow<'a, B>
where
    B: PartialOrd + BorrowOwned<'a> + ?Sized,
{
    #[inline]
    fn partial_cmp(&self, other: &RCow<'a, B>) -> Option<Ordering> {
        PartialOrd::partial_cmp(&**self, &**other)
    }
}
```

There are more libraries providing drop-in replacements for `Cow`. And for example, {{< crate "beef" >}} managed to get it right, somehow. I wasn't able to reproduce the issue with their version... but why?

```rust
impl<A, B, U, V> PartialOrd<beef::Cow<'_, B, V>> for beef::Cow<'_, A, U>
where
    A: Beef + ?Sized + PartialOrd<B>,
    B: Beef + ?Sized,
    U: Capacity,
    V: Capacity,
{
    #[inline]
    fn partial_cmp(&self, other: &beef::Cow<'_, B, V>) -> Option<Ordering> {
        PartialOrd::partial_cmp(self.borrow(), other.borrow())
    }
}
```

<a name="_some_progress_or_not"></a>
## Some progress... or not?

Other traits like `PartialEq` also caused similar lifetime errors. I was able to fix some by introducing a new lifetime `'b` into the trait implementation. This indicated the Rust compiler that comparing objects with different lifetimes is okay:

```diff
-impl<'a, B> PartialEq<RCow<'a, B>> for RCow<'a, B>
+impl<'a, 'b, B, C> PartialEq<RCow<'b, C>> for RCow<'a, B>
 where
     B: PartialEq + BorrowOwned<'a> + ?Sized,
+    C: BorrowOwned<'b> + ?Sized,
 {
-    fn eq(&self, other: &RCow<'a, B>) -> bool {
+    fn eq(&self, other: &RCow<'b, C>) -> bool {
         PartialEq::eq(&**self, &**other)
     }
 }
```

I suddenly got a bit of hope. But this could never work for `Ord`, which also failed. The `Ord` trait uses `Self` for the `other` parameter, so I can't just introduce a new lifetime.

```rust
impl<'a, B: ?Sized> Ord for RCow<'a, B>
where
    B: Ord + BorrowOwned<'a>,
{
    #[inline]
    fn cmp(&self, other: &Self) -> Ordering {
        Ord::cmp(&**self, &**other)
    }
}

// Implementation in the standard library:
impl<B: ?Sized> Ord for Cow<'_, B>
where
    B: Ord + ToOwned,
{
    #[inline]
    fn cmp(&self, other: &Self) -> Ordering {
        Ord::cmp(&**self, &**other)
    }
}
```

<a name="_discovering_the_root_cause"></a>
## Discovering the root cause

Some wonderful people on the Rust Discord server helped me understand what was going on. So I started learning more about the so-called "Subtyping and Variance".

![Discord discussion](/blog/rust-variance/discord.png)

This topic isn't covered in [The Rust Book](https://doc.rust-lang.org/book/). We'll only find it in its more obscure, unsafer brother, The Rustonomicon. This book explains it incredibly well, so I won't repeat it here. Here are some resources:

1. ["Subtyping and Variance" --- The Rustonomicon](https://doc.rust-lang.org/nomicon/subtyping.html) (_an explanation_)
2. ["Subtyping and Variance" --- The Rust Reference](https://doc.rust-lang.org/reference/subtyping.html) (_a cheatsheet_)
3. ["Covariance and contravariance" --- Wikipedia](https://en.wikipedia.org/wiki/Covariance_and_contravariance_%28computer_science%29) (_the general term_)

A couple blog posts take a more practical approach, like ["Rust Lifetime Subtype Variance" --- Prolific K](https://medium.com/@orbitalK/rust-lifetime-subtype-variance-b58434fe36ed) or ["Diving Deep: implied bounds and variance" --- lcnr.de](https://lcnr.de/blog/diving-deep-implied-bounds-and-variance/). Or if you're a visual learner, [this video from Jon Gjengset](https://www.youtube.com/watch?v=iVYWDIW71jk) might be best for you.

<a name="_trying_to_fix_it"></a>
## Trying to fix it

The difference between `RCow` and `Cow` was the `BorrowOwned<'a>` trait. For technical reasons, it was being used as a [subtrait](https://doc.rust-lang.org/rust-by-example/trait/supertraits.html) of `ToOwned`, and it had to bind to a lifetime `'a`. Ultimately, this made `RCow` _invariant_ over `'a`, while `Cow` was _covariant_. We want `RCow` to be _covariant_ for this to work.

```diff
 impl<B: ?Sized> Ord for Cow<'a, B>
 where
-    B: Ord + ToOwned,  // in Cow
+    B: Ord + BorrowOwned<'a>,  // in RCow
 {
     #[inline]
     fn cmp(&self, other: &Self) -> Ordering {
         Ord::cmp(&**self, &**other)
     }
 }
```

<a name="_attempt_1_gats"></a>
### Attempt #1: GATs

I had an idea of using [Generic Associated Types (GATs)](https://blog.rust-lang.org/2022/10/28/gats-stabilization.html). Instead of binding the lifetime to the trait, I could do so to its associated type. Then, I'd be able to use `BorrowOwned` instead of `BorrowOwned<'a>`:

```rust
impl<T> BorrowOwned for T {
    type RBorrowed<'a> where T: 'a = &'a T;
}
```

But [a section in the Rust Developer Book](https://rustc-dev-guide.rust-lang.org/variance.html#variance-and-associated-types) states that "traits with associated types must be invariant with respect to all of their inputs". So that still didn't help make our type covariant.

Note I only found that statement in the book for developers of the compiler! I opened [an issue about that in The Rustonomicon](https://github.com/rust-lang/nomicon/issues/338), and moved on to something else.

<a name="_attempt_2_transmute"></a>
### Attempt #2: `transmute`

After many wasted hours, I was tempted to use `transmute` and call it a day. Here's what Heinz suggested (_trigger warning_):

```rust
fn compare<'a, 'b>(left: &RCow<'a, str>, right: &RCow<'b, str>) -> Ordering {
    unsafe {
        let right: &RCow<'a, str> = std::mem::transmute(right);
        left.cmp(right)
    }
}
```

It worked! In theory, it's safe because both `'a` and `'b` will live for at least as long as the function does, and we're returning an owned type.

Ideally, we'd abstract it away by writing a wrapper around `RCow` with the fix. But that wouldn't help because invariant relationships are inherited, and the wrapper's implementation of `Ord` would still use `BorrowOwned<'a>`.

```rust
struct SCow<'a>(RCow<'a, ()>);  // will still be invariant!
```

One workaround would be to hide `RCow` under a `*const ()`. Then, I can pointer-cast back and forth from it. But in this project, I already had too many things backfire. Traumatized, I continued looking for a solution.

<a name="_attempt_3_getting_rid_of_borrowowneda"></a>
### Attempt #3: getting rid of `BorrowOwned<'a>`

The best way to not have problems with this trait is to get rid of it. The standard library has `ToOwned`, which links a borrowed type with its owned counterpart. For example, `&str` and `String`. If `Cow<B>` requires `B: ToOwned`, then the `Cow::Borrowed` variant can just hold `&B` and `Cow::Owned` can hold `B::Owned`.

`BorrowOwned<'a>` roughly did the same thing for types defined in `abi_stable`, such as `RStr` and `RString`:

```rust
// standard library
let x: &str = "abc";
let x_owned: String = x.to_owned();

// abi_stable
let x_ffi_safe: RStr<'_> = rstr!("abc");
let x_owned: String = x.to_owned();
let x_ffi_safe_owned: RString = x.r_to_owned();
```

Note that we need a lifetime in `BorrowOwned` because the equivalent of `&'a str` is `RStr<'a>`. Which is not exactly the same. This is because `str` is a [Dynamically Sized Type (DST)](https://doc.rust-lang.org/nomicon/exotic-sizes.html#dynamically-sized-types-dsts), but custom DSTs aren't supported by Rust.

```rust
impl ToOwned for str {  // okay
    type Owned = String;
    // `&self` is `&str`
    fn to_owned(&self) -> String { ... }
}

impl ToOwned for RStr {
    type Owned = RString;
    // `&self` is `&RStr<'a>`, but we want `RStr<'a>`
    // So we can't quite use `ToOwned` here
    fn to_owned(&self) -> RString { ... }
}
```

So instead of establishing this relationship through a trait, we can introduce a new generic paramter `O`. `B` would be the borrowed type, and `O` the owned one. This is similar to what the {{< crate "cervine" >}} crate does, which relaxes the constraints of `Cow`:

```rust
// Before:
#[repr(C)]
enum RCow<'a, B>
where
    B: BorrowOwned<'a> + ?Sized,
{
    Borrowed(<B as BorrowOwned<'a>>::RBorrowed),
    Owned(<B as BorrowOwned<'a>>::ROwned),
}
```

```rust
// After:
#[repr(C)]
enum RCow<B, O> {
    Borrowed(B),
    Owned(O),
}

/// Ffi-safe equivalent of `Cow<'a, T>`, either a `&T` or `T`.
type RCowVal<'a, T> = RCow<&'a T, T>;
/// Ffi-safe equivalent of `Cow<'a, str>`, either an `RStr` or `RString`.
type RCowStr<'a> = RCow<RStr<'a>, RString>;
/// Ffi-safe equivalent of `Cow<'a, [T]>`, either an `RSlice` or `RVec`.
type RCowSlice<'a, T> = RCow<RSlice<'a, T>, RVec<T>>;
```

Without the `BorrowOwned` trait, our struct was now covariant over `'a`, and the errors disappeared. [Rodri](https://github.com/rodrimati1992), the author of `abi_stable` ended up proposing [the fix that was merged](https://github.com/rodrimati1992/abi_stable_crates/commit/0b048ecf07177d1aa664a65d3a78fe5a2aba421e). You can find [a simplified version here](https://github.com/rodrimati1992/abi_stable_crates/issues/75#issuecomment-1043874752).

<a name="_conclusion"></a>
## Conclusion

This showcased two gaps in the language:

1. There were no indications in the error message about the issue being related to "variance". I had no idea what that was, and it wasn't covered in the book.
2. It was very hard to debug the variance of a type, given that they are implicit.

So it's amazing to hear that starting in Rust 1.62.0, you're even taken to the documentation. It will still be hard to understand the whole topic, but at least you know where to start!

```text
error: lifetime may not live long enough
  --> src/main.rs:55:5
   |
54 | fn test2<'a, 'b>(left: &RCow<'a, u8>, right: &RCow<'b, u8>) -> Ordering {
   |          --  -- lifetime `'b` defined here
   |          |
   |          lifetime `'a` defined here
55 |     left.cmp(right)
   |     ^^^^^^^^^^^^^^^ argument requires that `'a` must outlive `'b`
   |
   = help: consider adding the following bound: `'a: 'b`
   = note: requirement occurs because of the type `RCow<'_, u8>`, which makes the generic argument `'_` invariant
   = note: the enum `RCow<'a, B>` is invariant over the parameter `'a`
   = help: see <https://doc.rust-lang.org/nomicon/subtyping.html> for more information about variance
```

I was lucky to have such a great team at Tremor, and an OSS maintainer as helpful as Rodri. You can find all the details of the discussion in the original GitHub issue:

<p style="text-align:center;">
  {{< gh issue "rodrimati1992/abi_stable_crates" 75 "lifetimes with R* types break compared to non R* types" >}}
</p>
