---
title: "Why there isn't an EInk Smarphone yet: mythbusters"
description: "TODO"
image: "/TODO.jpg"
imageAlt: TODO
tags: ["tech"]
keywords: [TODO]
series: "dont-use-this-phone"
date: 2024-06-01
draft: true
---

This is also when stuff starts to go wrong. There are always endless delays when crowdfunding, and if you don't design it well enough, your whole project will look like a scam. This has happened many times already.

Other phones:
* Ubuntu Touch
* Firefox OS
* https://www.unihertz.com/en-de/products/jelly-2

What's hard:
* Patents (fake)
* GMS (fake; Boox Palma has Play Store)
* Connectivity?? (still don't know)

== GMS

Maybe it's just not allowed because of GMS' requirements?

https://source.android.com/docs/compatibility/overview

Android 12:

Use of MUST/RECOMMENDED/etc defined by https://www.ietf.org/rfc/rfc2119.txt. Looks like there's no minimum for recommended ones or anything similar.

=== Device type requirements (Handheld)

Have a physical diagonal screen size in the range of 3.3 inches (or 2.5 inches for devices which launched on an API level earlier than Android 11) to 8 inches

[ 7.1 .4.5/H-1-1] MUST advertise support for the EGL_EXT_gl_colorspace_bt2020_pq , EGL_EXT_surface_SMPTE2086_metadata , EGL_EXT_surface_CTA861_3_metadata , VK_EXT_swapchain_colorspace , and VK_EXT_hdr_metadata extensions.

[ 3.8 .1/H-SR] Are STRONGLY RECOMMENDED to include a default launcher app that shows badges for the app icons

[ 3.8 .2/H-SR] Are STRONGLY RECOMMENDED to support third-party app widgets.

[ 3.8 .3/H-0-1] MUST allow third-party apps to notify users of notable events through the Notification and NotificationManager API classes.

[ 3.8 .3/H-0-2] MUST support rich notifications.

[ 3.8 .3/H-0-3] MUST support heads-up notifications.

If Android Handheld device implementations support a lock screen, they:

- [ 3.8 .10/H-1-1] MUST display the Lock screen Notifications including the Media Notification Template.

[ 8.1 /H-0-1] Consistent frame latency . Inconsistent frame latency or a delay to render frames MUST NOT happen more often than 5 frames in a second, and SHOULD be below 1 frames in a second

[ 8.1 /H-0-2] User interface latency . Device implementations MUST ensure low latency user experience by scrolling a list of 10K list entries as defined by the Android Compatibility Test Suite (CTS) in less than 36 secs.

[ 8.1 /H-0-3] Task switching . When multiple applications have been launched, re- launching an already-running application after it has been launched MUST take less than 1 second.

[7.5/H-1-1] MUST have a primary rear facing camera with a resolution of at least 12 megapixels supporting video capture at 4k@30fps. The primary rear-facing camera is the rear-facing camera with the lowest camera ID.

[7.5/H-1-2] MUST have a primary front facing camera with a resolution of at least 4 megapixels supporting video capture at 1080p@30fps. The primary front-facing camera is the front-facing camera with the lowest camera ID.

=== Software requirements

==== launcher

==== widgets

==== web compatibility

[C-1-2] MUST use the Chromium Project build from the upstream Android Open Source Project on the Android 12 branch for the implementation of the android.webkit.WebView API.

==== notification details

=== Hardware compatibility

Includes clause about folding phones.

Conversely, if device implementations do not support wide-gamut displays, they:

* [C-2-1] SHOULD cover 100% or more of sRGB in CIE 1931 xyY space, although the screen color gamut is undefined

All of a device implementation's Android-compatible displays:

* [C-0-1] MUST be capable of rendering 16-bit color graphics.
* SHOULD support displays capable of 24-bit color graphic
* [C-0-2] MUST be capable of rendering animations.
* [C-0-3] MUST have a pixel aspect ratio (PAR) between 0.9 and 1.15. That is, the pixel aspect ratio MUST be near square (1.0) with a 10 ~ 15% tolerance

=== Performance and power

(nothing?)
