---
title: "GSoC Proposal: Implementing a Plugin Development Kit for Tremor"
description: "My proposal for 2021's GSoC"
image: "/blog/gsoc-proposal/logo.png"
imageAlt: "Preview image, with the Google Summer of Code logo"
eleventyExcludeFromCollections: true
# tags: ["tech", "programming", "rust", "open source"]
# keywords: ["tech", "programming", "rust", "rustlang", "dynamic loading", "google summer of code"]
date: 2021-04-13
GHissueID: 8
---

[[toc]]

<a name="_abstract"></a>
## Abstract

This Google Summer of Code project consists on developing a universal interface for Tremor plugins[^resources], allowing said library to become more modular and reduce the core set of dependencies.

This will achieve a considerably reduced core size for Tremor, meaning that the library will be faster to compile and have a smaller binary size. Most importantly, it will transform Tremor's architecture to be completely modular, where plugins can be configured as needed and developed independently, in a language-agnostic way.

<a name="_implementation_plan"></a>
## Implementation Plan

There are a few details to take into account about the proposed implementation:

* Modules can be loaded into a Tremor instance either at start-time or dynamically and then used in deployments.
* Plugin unloading is not to be implemented for this project.
* Template projects, traits, and examples are out of scope in this
* Tremor supports Linux, Max OS X and Windows, so this feature should integrate seamlessly on any of these Operating Systems as well.
* Dynamic library loading usually requires usage of `unsafe`, so this implementation ought to make sure their appearances do not raise safety concerns in Tremor. Thorough error handling is a must for this.

The following sections list the problems that need to be solved. These haven't been discussed with Tremor members much, so they are subject to heavy changes and are just introductions to possible approaches.

<a name="_defining_an_interface"></a>
### Defining an Interface

The minimum common denominator to define binary interfaces most times is C. This would allow Tremor plugins to be written in any language, but the complexity of this project would increase tremendously. Types required for the interface like `tremor_script::Value` (currently used by [some traits](https://github.com/tremor-rs/tremor-runtime/blob/main/src/codec.rs#L70)), error handling, and other advanced features like lifetimes or templates would have to be simplified to the C ABI. Not only would this be an incredibly tedious and complicated task, but it'd also introduce a small overhead for every function in the plugin.

Thus, the only viable solution is a Rust to Rust FFI, using [`dylib`](https://doc.rust-lang.org/rustc/command-line-arguments.html#--crate-type-a-list-of-types-of-crates-for-the-compiler-to-emit) libraries for the plugins. The problem in this case is that Rust doesn't have a stable ABI, and it doesn't plan to define one in the future[^stable-abi]. This means that programs or plugins compiled with different versions of rustc won't be compatible at all. This could be less of a problem with alternatives like [`abi_stable_crates`](https://github.com/rodrimati1992/abi_stable_crates/), which provide unofficial stable ABIs, but they don't follow Rust's objectives nor are very popular, so these libraries might end up unmaintained or just not worth it.

***WARNING**: Upon further investigation, in future articles I've discovered that the previous statement is not true. Rust to Rust FFI is completely unstable and should not be used at all for a plugin system; using the C ABI is the best way to do it. This is [explained in the next articles in detail](https://nullderef.com/blog/plugin-start/#_abi_unstability_its_much_worse_than_it_seems).*

Interface improvements may also happen in the future, where a method might be deprecated, removed, or added. The same could happen with Tremor; different API versions wouldn't be backwards compatible either.

Knowing this, it's important to correctly handle version upgrades. This means that some kind of interface versioning is needed. Tremor could disallow loading plugins that would inevitably break after a version upgrade, or perhaps it could show a message informing the user that they should upgrade their plugin before the deprecations turn into actual changes. Most Plugin Development Kit interfaces include some way of providing metadata about the plugin[^metadata]. This may include the following fields:

* **Versioning**:
  * Interface version
  * Tremor version
  * Rustc version
  * Core version
* **Interface type**: to avoid incorrectly loading a codec plugin as a pipeline operator, for example.
* **Other information about the module itself**:
  * Version
  * Author
  * License
  * Description

The Linux Kernel Module system for example inserts this in the `.modinfo` section of the binary, where the fields can be read [as a key-value c-string](https://github.com/lizhuohua/linux-kernel-module-rust/blob/master/yes_chardev/src/lib.rs#L136). C extensions for Python, on the other hand, use a [`PyModuleDef` struct](https://docs.python.org/3/c-api/module.html#c.PyModuleDef) with all the fields. The last option is by exporting globals with known names, which is the most straightforward.

<a name="_dynamically_loading_objects"></a>
### Dynamically Loading Objects

The next step after declaring a basic interface is somehow importing the dynamic objects into the core of Tremor, in Rust. The main library that can help with this is [`libloading`](https://docs.rs/libloading/), which seems to be somewhat mature and well maintained. Although it does offer OS-dependent features, its main usage is wrapped to be cross-platform, following the same behaviour on all platforms. `libloading` would allow Tremor to load symbols from an external module, like functions or variables. Here's an [example](https://github.com/kmdouglass/rust-libloading-example) of how it's used. After loading the dynamic library, the Tremor core would wrap its exported functions so that they can be used without `unsafe` and unnecessary boilerplate.

<a name="_configuration"></a>
### Configuration

Something to consider is where the plugins are going to be loaded dynamically from, or how that can be configured. Tremor currently has quite a few ways to handle [configuration](https://docs.tremor.rs/operations/configuration/) via repositories and registries.

One way to approach this would be to have a directory inside `/etc/tremor/` --- or any user-configurable path when launching Tremor --- with all the available plugins. Tremor would read its contents when starting and load all the plugins it finds. It should also be possible to load new plugins on demand, so the repository could be given the path of a library to include at runtime, for example with the `tremor` CLI tool.

It's important to make the plugin system as easy to use as possible, and to avoid breaking already existing installations of Tremor. For this, the default Tremor configuration should include the current libraries in the default dynamic library location.

<a name="impls"></a>
### Implementations

The proposal establishes the following components of Tremor as the main deliverables:

1. Pipeline Operators
2. Codecs
3. Preprocessors
4. Postprocessors
5. Modules/Functions

After defining its interfaces and implementing the architecture, these features would be turned into plugins, which would allow them to be developed independently, and thus wouldn't have to be in the main [tremor-runtime](https://github.com/tremor-rs/tremor-runtime) repository. For simplicity, though, it might be best to keep them there. Or at least group them up in less repositories to avoid having too many. Some components are [quite simple](https://github.com/tremor-rs/tremor-runtime/blob/main/src/codec/null.rs) and it might not be necessary to create a new repository for them, with a copy of the CI, README... But this is up to the core contributors of Tremor, after all.

<a name="_enhancements"></a>
### Enhancements

The requirements also list a few optional targets, which can be implemented if there's remaining time after the main goals are fully finished:

1. Implement connectors RFC (pre-requirement for connector plugins).
2. Contribute to and finalize {% gh "pr" "tremor-rs/tremor-rfcs" 32 "Connectors and Streams" %}.
3. Add source, sink, and peering connectors to pluggable artefacts.
4. Add a TCK (test compatibility kit) that asserts plugin invariants and provides testing mechanisms for plugin developers.
5. Consider plugin documentation generation and another tooling for better developer convenience and usability.
6. Make trickle sub-graphs a first-class modular and pluggable artefact.

The most likely to be implemented of these is the fifth, as documentation is important for this new breaking feature. It also looks like the easiest one, or at least seemingly more flexible, considering there most likely won't be that much extra time after the main goals, if any.

The "development tooling" part would also be inevitably developed as the project progresses, since I'll need them anyway to move the existing [implementations](#impls) to the plugin system. Said resources could be contained in a separate `tremor_plugin` crate, with all kinds of utilities to make plugin development easier, including traits or even procedural macros if necessary, which are a very interesting part of Rust, and I'm looking forward to on working on as well, and [I've already done in the past](https://github.com/vidify/structconf).

<a name="_proposal_timeline"></a>
## Proposal Timeline

I do not plan on giving a very specific and tight timeline because it's still really early, so the following are rough estimates and are subject to modifications. I'll also include an extra week for possible delays, or otherwise for work towards the enhancements to the initial target, so that the established 175 hours of work by Google are fully covered. This is expected to happen over 10 weeks, which means about 17.5 hours of work per week. Depending on my speed of development this might increase to up to around 20 hours per week so that the proposed requirements can be fulfilled.

I will be in contact with the Tremor team at all times during the development process. I'll also make a detailed blog post after this is finished, and possibly smaller ones after finishing the more important goals of the project.

<a name="_13th_april_to_17th_may_application_review"></a>
### 13th April to 17th May: Application Review

* I don't have experience with Tremor itself, since I've discovered it thanks to the GSoC, but I plan on contributing at least an [exec offramp](https://github.com/tremor-rs/tremor-runtime/issues/17) soon to get myself familiarized with the codebase.
* I will do more research about the theory needed for this project: dynamic shared object libraries, and specifically in Rust (What libraries can I use? How unsafe is it? How stable is it?).
* Research more about libraries like [`abi_stable_crates`](https://github.com/rodrimati1992/abi_stable_crates/) and evaluate if said method to increase of compatibility for plugins is actually worth it.
* I will take a look at how other libraries implement this. I consider it vital to know about how this has been done in the past in order to avoid their failures and improve their solutions rather than starting from scratch.

<a name="_17th_may_to_7th_june_community_bonding"></a>
### 17th May to 7th June: Community Bonding

* Here I will try to get smaller prototypes of plugin systems working, which can later be extended for Tremor, and with which I could discuss with the Tremor team.
* Plan how the development will work in detail and structure my research and ideas in a single place --- perhaps a blog post.

<a name="_7th_june_to_16th_august_coding"></a>
### 7th June to 16th August: Coding

As the code is written, documentation and the tests also will. Tests are a great method to make sure a feature really works while developing it, and a solid way to move on to another feature when coding is to sum it up with documentation before forgetting more about its details; I consider it a bad idea to forget these points until the very end.

There are five main objectives proposed for the initial target, to be distributed in 9 weeks. Some will take more effort to implement, so here's an estimate:

* **Implementing the plugin-loading architecture into Tremor**: _weeks 1 to 2_.
* **Configuration of the plugin system in Tremor's repositories/registry**: _week 3_.
* **Defining the main component interfaces**: _weeks 4 to 5_.
* **Implementing all of Tremor's components as plugins** (pipeline operators, codecs, preprocessors, postprocessors and modules/functions): _weeks 6 to 9_.

***NOTE**: I expect to make less progress until around the 15th of June, since I will be on finals until that day, and it will be harder to keep up with both at the same time. This means that the work will most likely not be evenly distributed; some weeks I'll have more time than others, so I'll make more progress in these to even it out.*

<a name="_about_myself"></a>
## About Myself

I'm Mario Ortiz Manero, a Computer Science student at the University of Zaragoza, Spain. I'm currently finishing my third year. Thanks to the university, I'm mostly experienced with Python, C and C++, but I've also been interested in Rust since 2020's summer, when I took a deep dive and learned it on my own. I would love to have an opportunity where I can contribute to a big project with mentorship to sharpen my skills.

So far I've been interested in Software Development, but I recently learned more about Distributed and Concurrent Systems, which has really caught my attention. Tremor seems to be involved in this as well, which makes me excited to collaborate with them. I'm a long time open source contributor, mostly for projects of my own, but also to help other communities I'm passionate about, as I love the community and its ideals it represents:

* The project I'm most proud of is [Vidify](https://github.com/vidify), a set of programs to automatically reproduce music videos for whatever music is playing on a device.
* I'm currently a maintainer of [rspotify](https://github.com/ramsayleung/rspotify), the most popular Spotify Web API bindings in Rust.
* [Many](https://aur.archlinux.org/account/marioom/) [other](https://github.com/marioortizmanero/polybar-pulseaudio-control) [smaller](https://github.com/maremotocafe) [contributions](https://github.com/felix-hilden/tekore) to various projects.
* I'm also very interested in Hackathons, having participated in [Hacktoberfest](https://hacktoberfest.digitalocean.com/) for two years in a row, [Google's Hashcode 2019](https://codingcompetitions.withgoogle.com/hashcode/), [Adidas uCode 2019](https://www.ucode.es/) and [NASA's SpaceApps 2019](https://www.spaceappschallenge.org/).

You can contact me at marioortizmanero _at_ gmail _dot_ com, or via Discord as Glow#5433.

{% render "partials/subscribe.liquid" metadata: metadata %}

[^resources]: As described in detail in its [issue on Tremor's repository](https://github.com/tremor-rs/tremor-runtime/issues/791) or its [RFC](https://www.tremor.rs/rfc/accepted/plugin-development-kit/).
[^stable-abi]: See [rust-lang/rfcs/#600](https://github.com/rust-lang/rfcs/issues/600)
[^metadata]: More details on this post: [Plugins in Rust](https://adventures.michaelfbryan.com/posts/plugins-in-rust/#determining-the-plugin-interface)
