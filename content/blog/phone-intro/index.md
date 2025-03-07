---
title: "Beyond Dumbphones: Building a Minimalist Yet Functional Phone"
description: "Ever feel like your phone controls you? Can we design a smartphone
that minimized how much you used it?"
image: "/blog/phone-intro/cover.jpg"
imageAlt: "Preview image, with a phone telling the user to touch grass"
tags: ["tech", "entrepreneurship", "research"]
keywords: ["tech", "phone dependency", "phone addiction", "eink", "calm companies", "dumbphones", "design"]
series: "dont-use-this-phone"
date: 2024-06-01
GHissueID: 13
---

[[toc]]

What if there was a company selling phones that, against all odds, optimized how _little_ they were used? There's a lot of potential here, given that every company is trying to get you hooked on their app.

["Dumbphones"](https://en.wikipedia.org/wiki/Feature_phone) have emerged for this very reason. These are phones whose functionality is intentionally locked down, with the purest examples only supporting calls and SMS. On the other side of the spectrum, we have smartphones. It wouldn't be far-fetched to say that most people owning one use it more than they'd like.

I've seen people around me switching to a dumbphone. A _digital detox_ is not a bad idea; it helps reduce anxiety in the short term. But in the longer term, it's pretty much impossible. A few apps like WhatsApp or Google Maps can be indispensable, and the rest actually improve our lifes when used reasonably. TikTok can be incredibly addicting, but it's arguably a great way for people to learn, relax, or connect with others.

Even the founders of the [Light Phone](https://en.wikipedia.org/wiki/Light_Phone) --- the most popular dumbphone brand --- thought it was too restrictive for them, and they have released a more featureful version[^light-phone-v1]. Don't get me wrong! I admire the company and all the work they do; this is such a small industry that anything helps. But I wonder if there's something that could become more mainstream.

Besides, as a big fan of second-hand stuff, I'd rather give an old Motorola a second life than bring yet another phone to the world. It'd also be really cool to open and close a retro flip-phone (right???).

So what if we tried to find a middle point? There are two possible approaches:

1. A dumbphone trying to be a smartphone
2. Or a smartphone trying to be a dumbphone

I'm a bigger fan of the latter, because most dumbphones don't give you direct access to an app store. Given how huge the mobile ecosystem is, supporting everyone's use-cases one by one ends up being very restrictive. Your dumbphone's operating system could add custom support for Uber, but there may be someone who won't buy the phone unless it has Spotify. And a password manager. And their banking app. And after implementing all of these, someone will need a damned parking app for their apartment complex (yes, really[^parking]).

The question arises: how in the world would you even design a phone? It sounds like the most daunting task, so that's what I'll be researching in this series! We'll get started with broader topics like addiction, building companies, or existing solutions, and eventually get into more details. I'm no expert, so let's see how far the internet can take us.

<a name="_looking_at_the_state_of_things"></a>
## Looking at the state of things

I've been [~~nerdsniped~~](https://xkcd.com/356/) drawn to this space for some time, learning more about it from different perspectives:

<a name="_technology"></a>
### Technology

Firstly, let's take a step back from "phones that shouldn't be used". Can we generalize it to "tech that shouldn't be used"? Or rather, "tech that doesn't unnecessarily grab your attention"? Now we're onto something! That's what ["Calm Technology"](https://en.wikipedia.org/wiki/Calm_technology) is all about, a concept coined by Mark Weiser and John Seely Brown at [XEROX Parc](https://en.wikipedia.org/wiki/PARC_(company)) in the '90s.

Calm Technology describes design principles that let a piece of technology _inform_ the user without _demanding_ their attention. Anything from hammers to Roombas can be considered "calm". Researcher Amber Case [picked up on this](https://calmtech.com/) and recently announced [an institute](https://www.calmtech.institute/) to certify products that meet these standards. Also inspired by Mark and John's original work, Jon Yablonski shares his take and more resources in his website [Humane By Design](https://humanebydesign.com/).

The [Center for Humane Technology](https://www.humanetech.com/) is a more established organization on this topic. This non-profit aims to educate people and companies, raise awareness, and aid in policymaking. It gained popularity in Neflix's hit documentary [_The Social Dilemma_](https://www.thesocialdilemma.com/), which focuses on social media. One of its founders, Tristan Harris, created [an internal presentation at Google](http://www.minimizedistraction.com/) in 2013 that has aged like fine wine.

On the flip side, Cal Newport writes about what _humans_ can do to stop their attention from being hijacked. He calls it ["Digital Minimalism"](https://www.goodreads.com/book/show/40672036-digital-minimalism) and also covers managing your attention span in ["Deep Work"](https://www.goodreads.com/book/show/25744928-deep-work), or living a more minimalist life in general. This is also discussed on [NoSurf](https://nosurf.net/), the biggest community on the topic I could find, with even more information[^nosurf-resources].

<a name="_negative_effects"></a>
### Negative effects

Is the population aware of [problematic smartphone use](https://en.wikipedia.org/wiki/Problematic_smartphone_use)? Is it even a problem to them? Certainly, there are studies on how phone usage leads to poorer psychological health. But it doesn't help that there's no medical consensus nor recognition; [there's correlation, but not clear causation](https://youtu.be/8B271L3NtAw?t=10)[^phone-depression]

Phones have undoubtedly impacted our society. Some changes are good, others, not so much. We fiddle with our phones to avoid eye contact, social media worsens our self-esteem, and we have attention issues. It's just hard to be bored anymore, which is actually good for you[^bored][^bored-2]. Phones also disrupt our sleep cycles[^phones-sleep-filter], and cars frequently crash because of them[^phones-crash]. Nothing you don't already know.

There are increasingly more stories about [Hikikomori](https://en.wikipedia.org/wiki/Hikikomori), described as "total withdrawal from society and seeking extreme degrees of social isolation and confinement". Of course, it's not limited to Japan. Wikipedia sheds light on the role of technology in this condition:

>Although the connection between modern communication technologies (such as the Internet, social media and video games) and the phenomenon is not conclusively established, those technologies are considered at least an exacerbating factor that can deepen and nurture withdrawal.

It even specifically mentions our topic:

>The emergence of mobile phones and then smartphones may also have deepened the issue, given that people can continue their addiction to gaming and online surfing anywhere, even in bed.

Some people suffering from migraines or light sensitivity are affected by the screen itself[^light-sensitivity-1][^light-sensitivity-2]. There's also the topic of phones for children or the elderly, but that's a huge rabbit hole. Looking at the broader population, nearly 6 in 10 U.S. smartphone users admit that they use their phone too much[^gallup-survey]. So the good news is that people are at least aware of the issue. That surely means there's a need for solutions, regardless of science?

<a name="_companies"></a>
### Companies

In order to start a company that cares about people's mental health, it's sensible to say that its workers shouldn't be crunching 60 hours per week. I learned a lot about this by reading ["It doesn't have to be crazy at work"](https://basecamp.com/books/calm), written by the founders of Basecamp. Part of its contents are also available online[^basecamp][^basecamp-handbook][^signalvnoise]. You don't have to agree with everything to admit it makes you rethink how companies are built.

This includes leadership, benefits, planning, hiring, funding... and how to make them more reasonable. One key idea is that starting a business with the goal of changing the world sets the stakes too high from the beginning. The desire to get rich becomes the justification for all-nighters and bad practices, which spreads from founders to employees. Other so-called "Calm Companies" that share this mindset include Transistor.fm[^calm-transistor][^build-your-saas][^transistor-handbook][^transistor-justin], Wildbit[^wildbit], or Convertkit[^convertkit], but Basecamp is the loudest about it.

An important caveat is that we must ensure the company stays true to its values. In this case, that the less screen time, the better (within profitable means). Not that the more revenue, the better. However, this depends on who controls the company, which is often the person who provides the funding.

We can learn this lesson from [CouchSurfing](https://en.wikipedia.org/wiki/CouchSurfing), a website that helps you find a couch at someone's home for a short stay. The company's goal wasn't just to "connect hosts to guests", but to "create lasting positive experiences and relationships between strangers". And it wasn't gibberish: their internal metric for success was "positive time had thanks to CouchSurfing" subtracted by "time spent on the website"[^tristan-distraction]. But after a hectic story, they changed to a for-profit and started heading in the opposite direction, fueled by the need for monetization[^couch-end].

What most Calm Companies do is _bootstrap_, meaning the founders use their own money. They promise never to go public, and Basecamp goes a step further by assuring they will never sell the company[^basecamp-basic]. Unfortunately, that only works for purely software companies; manufacturing hardware means you will need money. The [Nothing company](https://intl.nothing.tech/) spends $30 to $50 million for each new product they develop[^nothing-money]. On a "smaller" scale, the Light Phone 2 raised a total of $11.9 million in 2019[^light-phone-money]. You'd probably do fine with much less, but it shows how hard it'd be to save up that kind of money yourself.

A popular choice for niche hardware is [crowdfunding](https://en.wikipedia.org/wiki/Crowdfunding), where the money comes from a bunch of interested people on the internet. Bigme, reMarkable, Light Phone, Minimal Phone, Librem. They all started like this. But from what I've learned, the crowdfunded money usually only covers the hardware costs, not so much the upfront design and testing. The successful path seems to be [Venture Capital (VC) funding](https://en.wikipedia.org/wiki/Venture_capital) to set up the team and build a prototype, and then crowdfunding to actually manufacture it.

Going back to the Light Phone 2, they raised $3.5M from consumers on IndieGoGo[^light-phone-igg] but also $8.4M in seed funding[^light-phone-money]. Similarly, reMarkable was able to secure $11M from presales but required an essential $10M in seed funding[^remarkable-money]. It's hard to avoid VC funding if you aren't already a billionaire, like in the case of [Mudita](https://mudita.com/). This company was founded by Michał Kiciński, who had already succeeded with [CD Projekt](https://en.wikipedia.org/wiki/CD_Projekt)[^mudita-funding].

Nowadays, startups raise VC money _precisely_ by asserting they will change the world. Their solution will blow the competition out of the water. Prepare to invest RIGHT NOW or miss the train. It's just [FOMO](https://en.wikipedia.org/wiki/Fear_of_missing_out) for investors. How could this work in the context of a Calm Company?

Although harder, I don't believe it's impossible. There are funds that leave plenty of freedom to the founders. And a minority of them are specialized in Calm Companies, such as CalmFund (which just [paused operations](https://calmfund.com/writing/pause)), [indie.vc](https://www.indie.vc/), or [tinyseed](https://tinyseed.com/).

Once you get over the necessity of raising money, there are other ways to preserve the company's ideals. OpenAI famously failed to do so as a pure non-profit, allegedly because raising money was too hard as just a nonprofit[^openai]. So maybe we could take that as a learned lesson. Other ideas are certifications like [B Corporation](https://en.wikipedia.org/wiki/B_Corporation_(certification)) or [Social Enterprise](https://en.wikipedia.org/wiki/Social_enterprise), but I'm not sure how effective they are.

You can see how much more I can research about this topic in future posts. And we haven't even gotten to the phones section yet!

<a name="_software"></a>
### Software

Smartphones actually come with solid features to block apps and minimize screen time in general. However, they don't seem to be good enough to gain adoption.

Firstly, they aren't well marketed; most people aren't aware of their existence. Android calls the features ["Digital Wellbeing"](https://www.android.com/digital-wellbeing/) and iOS ["Screen Time"](https://support.apple.com/guide/iphone/get-started-with-screen-time-iphbfa595995/ios). Personally, I receive more system notifications about new AI features in my camera than things like this.

Secondly, they aren't first-party citizens; the tools are there, but they don't quite integrate seamlessly. The most powerful feature on Android is "modes", which allows you to switch settings for different situations. For example: when your GPS shows you're in the library, it can disable Instagram and set the screen to grayscale. Being so powerful, it's also complicated to configure (and to keep your setup up to date). If the company prioritized reducing screen time over ad revenue, we’d likely see more ideas to improve its adoption.

There are heaps of alternatives on the app marketplaces, although their source code may not be available, and most have in-app payments or ads. Here are some cool features I've seen while trying out Android apps[^apps][^apps2]:

- fancy tutorials,
- syncing across devices (including your laptop or tablet),
- blocking websites (or even features inside an app, like YouTube Shorts),
- blocking pre-bundled categories of apps and websites (such as "shopping"),
- breathing exercises before opening apps (or having to read a book),
- motivational quotes,
- forums,
- a floating timer indicating total usage on that day,
- notification filtering and bundling,
- [gamification](https://en.wikipedia.org/wiki/Gamification) (competing against yourself or friends),
- comprehensive statistics,
- or having someone else to control your usage.

Not everything is limited to blocking apps; there are also minimal app launchers[^launchers] or simple productivity timers[^timers]. {% render "app" name: "minimalist phone" android: "com.qqlabs.minimalistlauncher" %} does well in the "seamless experience" department by filtering notifications and taking over your launcher to control how you open apps. I don't want to do an exhaustive analysis, but just searching "screentime" will already return many results on the app store. It's worth downloading a few until you find your favorite anyway.

However, manufacturers have it much easier, given that they have full system access over your phone. For instance, the open-source app {% render "app" name: "TimeLimit" android: "io.timelimit.android.google.store" %} is an even more configurable alternative to "Digital Wellbeing". But being external, it needs to start with a long (and worrying) step to grant permissions. This alone is one step too many to make it widespread --- I'd argue that even having to install an app is too much.

To improve the user experience, some apps make emphasis on explaining how to use their features. Others avoid it by trying to be smarter; they have your current phone's usage data, so they already know which apps you use too much. One last approach is to be opinionated and only support a subset of features that may integrate better or have more impact. The Light Phone 2 does this by only providing their limited list of features; if you're missing one, maybe you'll get it, but maybe not.

Something else raising the barrier of entry is monetization. Although necessary, some subscription models can be too much. A particularly creative app I liked was {% render "app" name: "Digital Detox" android: "com.urbandroid.ddc" %}, which makes you pay $2 upon failing to meet your phone usage goals.

It's just great to have so many options and not being locked in to any of them. Different solutions for different people.

<a name="_accessories"></a>
### Accessories

Some products allow you to disable apps based on physical access. Imagine a keychain with an NFC chip that can restrict apps on your phone. Having to find it and hold it near your phone can help break the habit of opening Instagram automatically, turning it into a conscious decision. These tools can also help transform your phone into a dumbphone: simply block the apps and leave the device at home to fully disconnect.

A couple of options are [Brick](https://getbrick.app/) and [UnPluq](https://www.unpluq.com/). They only solve part of the issue, though, and UnPluq follows a subscription-based model that costs 70€ per year. Still, they seem to work well for some folks, which is awesome.

<a name="_phones"></a>
### Phones

What would a phone minimizing screen time look like? Many of the popular ones have [_e-paper_ displays](https://en.wikipedia.org/wiki/Electronic_paper) instead of LCD, which is most commonly seen on e-readers. E-paper feels like real paper, is easier to see under sunlight, and may increase battery time. It doesn't come without drawbacks, given that it literally moves physical particles in your screen instead of emitting light. You can judge yourself:

<iframe loading="lazy" width="1600" height="400" src="https://www.youtube.com/embed/IFgxUr26A8g" title="E ink phone | YouTube | Linus Tech Tips | Hisense A9" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Hey, it's not a good experience for videos, but it doesn't take 5 seconds per refresh like your crappy 10-year-old Kindle. Knowing how it works under the hood, this sample is impressive to me. Here's another monitor that recently came out focusing on latency:

<iframe loading="lazy" width="1600" height="400" src="https://www.youtube.com/embed/pXn-bAwzNv4?start=183" title="Modos Paper Monitor Status Update" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

E-paper has always had a poor refresh rate. The issue isn't just that videos are hard to watch --- you shouldn't do it often, anyway. The real problem is that sluggish animations worsen the user experience. Recently, a wave of e-paper products with faster refresh times[^daylight-zdnet][^eink-glider] has emerged, so I'm hoping that will improve.

Another charasteristic of most e-paper screens is that they are grayscale. While the absence of colors is linked with reduced addiction[^grayscale-attention], it can also be frustrating. I've set my phone to grayscale, and I know how confusing Google Maps can sometimes be without colors. Additionally, charts that rely on color require you to view them on a different device. And I haven't even tried gaming. One could argue that this is intentional, to get you to use different devices for different purposes. Instead of playing Candy Crush on the train, you might read and wait until you get home to use your PS4.

There's now color e-paper, with Kobo having released its first e-readers in 2024[^kobo-color-eink]. But it does have downsides, such as worse refresh rates or lower contrast ratios. Personally, I'd love to try to embrace the limitations of grayscale. Issues with essential apps like Google Maps could be resolved with custom software. And not having the best experience watching YouTube on your phone might be for good. It's possible that having a single color like red could improve the user experience by highlighting important items, though.

Nowadays, the biggest brands that go beyond e-readers are HiSense and Boox. However, they aren't well-supported in the west. Some apps refuse to open, and connectivity only works with certain providers, if at all[^hisense-review][^boox-connectivity]. Boox is known for violating GPL compliance, too[^boox-gpl]. There are startups releasing similar devices, but they have a long road ahead: Mudita will announce a new phone soon[^mudita-release], and Daylight might work on a phone if their $729 tablet is successful[^daylight-release][^daylight-podcast].

For 360€, the Blloc Zero18 was one of the few phones that didn't use e-paper but wasn't a dumbphone either. It balanced full functionality with impressive features designed to keep you from opening apps at all[^blloc-review]. By default, its screen was grayscale, but tapping the fingerprint sensor would bring back the color. The homepage combined all your chats into a single feed, similar to [Beeper](https://www.beeper.com/), and had interactive widgets for news, notes, or YouTube search. As you can tell from my use of the past sense, though, they ended up ditching the phone. The company shifted focus to just developing the launcher, and they ended up running out of money[^blloc-dead]. Many employees have since joined [Nothing](https://intl.nothing.tech).

Another notable flop[^yota-bankrupt] was the [YotaPhone](https://en.wikipedia.org/wiki/Yota). This unique phone featured an additional e-paper screen on the back, marketed for reading and basic tasks. As innovative as it was, you'd have to _really_ like reading to justify spending over $600 for a phone that was otherwise unimpressive[^yota-2-review]. Unfortunately, it never gained popularity in Europe and was not released in the US[^yota-1-eu][^yota-2-eu][^yota-crowd-fail][^yota-3-fail].

A simpler approach to consider is what [Ghost Mode](https://ghostmode.us/) does. They lock down a Pixel6a with their custom operating system and resell it. In the end, it's essentially a dumbphone with a nice camera. They don't need to deal with manufacturing, and the software still has system access for advanced features. I'm only afraid that relying on Google might not be a good idea[^google-kills], but they could switch to a different base phone. Its unpopularity might also have to do with money: at $600, it's pricey for a dumbphone.

<a name="_wrapping_up"></a>
## Wrapping up

I hope this topic can eventually be "a thing". Just like there are movements for "sustainability" or "diversity", there should also be one for "reduced screentime". To me, it has a strong relationship with mental health, and there's a lot to improve in that regard. I love the internet: being able to share this post so easily is wonderful. But what can we do to reduce the bad parts?

We still don't fully know what this hybrid between a smartphone and a dumbphone looks like. However, this research has taught us many essential things: the relevant organizations, its societal impact, how to build the company, existing software and hardware solutions, and some history.

More details about the design will come later in [the series](https://nullderef.com/series/dont-use-this-phone/). You can [subscribe](https://nullderef.com/subscribe) for free to keep up to date. It's hard to say yet, but I'd love to build something in this area in the future. Manufacturing a phone sounds crazy, but I'd love to see what can be done :)

_Disclaimer: I am not affiliated with any of the companies mentioned in this post. The opinions expressed are my own and are based on my personal experiences and research._

{% render "partials/subscribe.liquid" metadata: metadata %}

[^light-phone-v1]: [The high hopes of the low-tech phone --- The Verge](https://www.theverge.com/2019/9/4/20847717/light-phone-2-minimalist-features-design-keyboard-crowdfunding)
[^parking]: [I have to use an app to open my apartment complex parking gate, the app is called Gatewise. My lease does not mention anything about needing a smartphone or the use of any apps for garage access. Street parking is not an option. I just want technological equity --- r/dumbphones](https://www.reddit.com/r/dumbphones/comments/sjtkm2/i_have_to_use_an_app_to_open_my_apartment_complex/)
[^nosurf-resources]: [Digital Minimalism Reading List --- r/NoSurf](https://www.reddit.com/r/nosurf/comments/p73msh/digital_minimalism_reading_list/)
[^phone-depression]: [Apple investors say iPhones cause teen depression. Science doesn't --- Wired](https://www.wired.com/story/apple-investors-iphone-kids-depression-suicide-evidence/)
[^bored]: [Why Boredom is Good For You --- YouTube, Veritasium](https://www.youtube.com/watch?v=LKPwKFigF8U)
[^bored-2]: [Louis CK Embrace Your Loneliness --- YouTube, The Impossible Conversation](https://www.youtube.com/watch?v=uuCoyILqut8)
[^phones-sleep-filter]: [Study: Using Apple’s Night Shift to improve your sleep? Don’t bother --- arstechnica](https://arstechnica.com/gadgets/2021/05/iphones-night-shift-feature-doesnt-help-you-sleep-better-study-finds/) (_Quote: "it is important to think about what portion of that stimulation is light emission versus other cognitive and psychological stimulations"_)
[^phones-crash]: [Phones Track Everything but Their Role in Car Wrecks --- The New York Times](https://www.nytimes.com/2024/01/26/health/cars-phones-accidents.html) (_In summary, the exact number is unknown. [This NSC report](https://www.prnewswire.com/news-releases/national-safety-council-estimates-that-at-least-16-million-crashes-are-caused-each-year-by-drivers-using-cell-phones-and-texting-81252807.html) estimates it to be 1.6 million crashes, but it's not precise and from 2010_)
[^light-sensitivity-1]: [LEDStrain Forum](https://ledstrain.org/)
[^light-sensitivity-2]: [Has anyone here been diagnosed with central sensitization and/or relate somehow to my story? (36M, pain started at 33) --- r/ChronicPain](https://www.reddit.com/r/ChronicPain/comments/b936z9/has_anyone_here_been_diagnosed_with_central/)
[^gallup-survey]: [Americans Have Close but Wary Bond With Their Smartphone --- Gallup](https://news.gallup.com/poll/393785/americans-close-wary-bond-smartphone.aspx)
[^basecamp]: [37signals (the company that owns Basecamp)](https://37signals.com/)
[^basecamp-handbook]: [The 37signals Employee Handbook](https://basecamp.com/handbook)
[^signalvnoise]: [Signal v. Noise (37signals' former blog)](https://signalvnoise.com/)
[^calm-transistor]: [I'm 40 years old and I finally bootstrapped a SaaS, Transistor.fm, to millions in revenue (with a co-founder!) --- r/SaaS](https://www.reddit.com/r/SaaS/comments/nrjsao/im_40_years_old_and_i_finally_bootstrapped_a_saas/)
[^build-your-saas]: [Build Your SaaS --- transistor.fm](https://saas.transistor.fm/episodes)
[^transistor-handbook]: [What are our values? --- GitHub TransistorFM/handbook](https://github.com/TransistorFM/handbook/blob/master/values.md)
[^transistor-justin]: [Justin Jackson (co-founder of Transistor.fm)](https://justinjackson.ca/)
[^wildbit]: [Wildbit](https://wildbit.com/)
[^convertkit]: [The ConvertKit Team Handbook](https://convertkit.com/handbook)
[^tristan-distraction]: [Distracted? Let's make technology that helps us spend our time well | Tristan Harris | TEDxBrussels --- YouTube, TEDx Talks](https://www.youtube.com/watch?v=jT5rRh9AZf4)
[^couch-end]: [Paradise lost: The rise and ruin of Couchsurfing.com --- Input](https://www.inverse.com/input/features/rise-and-ruin-of-couchsurfing)
[^basecamp-basic]: [An obligation to independence --- 37signals (the company that owns Basecamp)](https://37signals.com/01)
[^nothing-money]: [Nothing CEO Carl Pei on the Phone 2 and the future of gadgets | The Vergecast --- YouTube](https://youtu.be/dDI9h4ool-E?t=1549) @ 25:49
[^light-phone-money]: [This credit-card-size phone can do only 3 things and doesn't have any apps — and it may be the key to freeing us from our smartphones --- Business Insider](https://www.businessinsider.com/light-phone-2-dumb-phone-price-release-date-specs-2019-9)
[^light-phone-igg]: [Light Phone 2 --- IndieGoGo](https://www.indiegogo.com/projects/light-phone-2)
[^remarkable-money]: [Remarkable raises $15 million to bring its e-paper tablets to more scribblers --- VentureBeat](https://venturebeat.com/media/remarkable-raises-15-million-to-bring-its-e-paper-tablets-to-more-scribblers/)
[^mudita-funding]: [Mudita new technology company co-founder of CD Projekt --- eurogamer.pl (archive)](https://archive.ph/4FODk)
[^openai]: [Our structure --- OpenAI](https://openai.com/our-structure/)
[^apps2]: [How to add a timer to social media](https://speedbumpapp.com/en/blog/social-media-timer/) ([Spanish](https://speedbumpapp.com/es/blog/social-media-timer/), [German](https://speedbumpapp.com/de/blog/social-media-timer/))
[^apps]: Digital control:
    {% render "app"
          name: "AppBlock"
          android: "cz.mobilesoft.appblock" %},
    {% render "app"
          name: "Freedom"
          android: "to.freedom.android2"
          ios: "freedom-screen-time-control/id1269788228" %},
    {% render "app"
          name: "YourHour"
          android: "com.mindefy.phoneaddiction.mobilepe" %},
    {% render "app"
          name: "Digital Detox"
          android: "com.urbandroid.ddc" %},
    {% render "app"
          name: "StayFree"
          android: "com.burockgames.timeclocker" %},
    {% render "app"
          name: "Stay Focused"
          android: "com.stayfocused" %},
    {% render "app"
          name: "StayOff"
          android: "com.app.floatingapptimer.com" %},
    {% render "app"
          name: "ActionDash"
          android: "com.actiondash.playstore" %},
    {% render "app"
          name: "ClearSpace"
          ios: "clearspace-reduce-screen-time/id1572515807" %},
    {% render "app"
          name: "Refocus"
          ios: "refocus-app-website-blocker/id1645639057" %},
    {% render "app"
          name: "Opal"
          ios: "opal-screen-time-for-focus/id1497465230" %},
    {% render "app"
          name: "Jomo"
          ios: "jomo-screen-time-blocker/id1609960918" %},
    {% render "app"
          name: "SocialFocus: Hide Distractions"
          ios: socialfocus-hide-distractions/id1661093205" %},
    {% render "app"
          name: "UnTrap for YouTube"
          ios: "untrap-for-youtube/id1637438059" %},
    {% render "app"
          name: "BB - Screen Time & App Blocker"
          ios: "bb-screen-time-app-blocker/id6443657745" %}
[^launchers]: Launchers:
    {% render "app"
          name: "Olauncher"
          android: "app.olauncher" %},
    {% render "app"
          name: "minimalist phone"
          android: "com.qqlabs.minimalistlauncher" %},
    {% render "app"
          name: "Indistract"
          android: "com.indistractablelauncher.android" %},
    {% render "app"
          name: "Blank Spaces"
          ios: "blank-spaces-app/id1570856853" %}
[^timers]: Productivity timers:
    {% render "app"
          name: "Forest"
          android: "cc.forestapp" %},
    {% render "app"
          name: "Flora"
          ios: "flora-green-focus/id1225155794" %},
    {% render "app"
          name: "Plantie"
          ios: "plantie-stay-focused/id1135988868" %}
[^daylight-zdnet]: [ Daylight debuts world's first 'blue-light-free computer' with a 120Hz LivePaper display --- ZDNET](https://www.zdnet.com/article/daylight-debuts-worlds-first-blue-light-free-computer-with-a-120hz-livepaper-display/) (_Note: Daylight uses a mix between conventional electrophoretic e-paper and LCD. It feels slightly less like paper, but still improves refresh rate._)
[^eink-glider]: ["Open-source Eink monitor with an emphasis on low latency" --- GitHub Modos-Labs/Glider](https://github.com/Modos-Labs/Glider)
[^grayscale-attention]: [Will turning your phone to greyscale really do wonders for your attention? --- The Guardian](https://www.theguardian.com/technology/2017/jun/20/turning-smartphone-greyscale-attention-distraction-colour)
[^kobo-color-eink]: [Kobo announces its first color e-readers --- The Verge](https://www.theverge.com/2024/4/10/24124411/kobo-libra-colour-clara-colour-e-reader-kindle-e-ink)
[^hisense-review]: [Hisense A9 - 1 Week Review --- r/eink](https://www.reddit.com/r/eink/comments/10hl3bv/hisense_a9_1_week_review/)
[^boox-connectivity]: [Why oh why no SIM-card / mobile data support? --- Boox Forums](https://help.boox.com/hc/en-us/community/posts/15815361554068-Why-oh-why-no-SIM-card-mobile-data-support)
[^boox-gpl]: [GPL Compliance, Onyx Boox --- Wikipedia](https://en.wikipedia.org/wiki/Onyx_Boox#GPL_Compliance)
[^mudita-release]: [First glimpse of Mudita Kompakt --- Mudita](https://mudita.com/community/blog/introducing-mudita-kompakt/)
[^daylight-release]: [The Daylight DC1 is a $729 attempt to build a calmer computer --- The Verge](https://www.theverge.com/2024/5/23/24163225/daylight-dc1-tablet-livepaper)
[^daylight-podcast]: [Episode #234: Anjan Katta (Founder of Daylight Computer Co), by THE 2AM PODCAST --- YouTube](https://youtu.be/2Y1nogFltPY?t=2240) @ 37:20
[^blloc-review]: [Android in Monochrome? | Blloc Zero 18 - exclusive first look](https://www.youtube.com/watch?v=31FrND2oqys)
[^blloc-dead]: [Blloc's Discord server](https://discord.gg/NSJC3XcKaK) (more information in the _announcements_ channel)
[^yota-bankrupt]: [The company behind the dual-screen YotaPhone is bankrupt --- The Verge](https://www.theverge.com/2019/4/19/18508418/yota-devices-bankrupt-yotaphone)
[^yota-2-review]: [Yotaphone 2 review --- TechRadar](https://www.techradar.com/reviews/phones/mobile-phones/yotaphone-2-1228308/review)
[^yota-1-eu]: [Dual-Screen YotaPhone Launches in Russia, Europe --- PCMag](https://www.pcmag.com/news/dual-screen-yotaphone-launches-in-russia-europe) (_Release of first generation only in EU, Russia, and Middle East_)
[^yota-2-eu]: [Dual-Screened YotaPhone 2 Launches in Europe --- PCMag](https://www.pcmag.com/news/dual-screened-yotaphone-2-launches-in-europe) (_Release of second generation only in EU, Russia, and Middle East_)
[^yota-crowd-fail]: [Supply Issues Force Cancellation Of North American YotaPhone 2 Despite Successful Crowdfunding Campaign --- Android Police](https://www.androidpolice.com/2015/07/31/supply-issues-force-cancellation-of-north-american-yotaphone-2-despite-successful-crowdfunding-campaign/) (_Release failure of second generation in the US_)
[^yota-3-fail]: [Dual-screen YotaPhone 3 is finally official and it's just as kooky as the last two --- TechRadar](https://www.techradar.com/news/dual-screen-yotaphone-3-has-now-launched-and-its-as-odd-as-ever) (_Release of third and last generation only in China_)
[^google-kills]: [Killed by Google](https://killedbygoogle.com/)
