---
title: "Aroa, I wish I could tell you how damn awesome you are"
description: TODO
image: "/TODO.jpg"
imageAlt: TODO
tags: ["personal"]
keywords: [TODO]
date: 2025-02-14
draft: true
---

TODO: escaneos 3d y mejor calidad de las 2d

{%- block head %}
  {{ super }}
  <script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>
{%- endblock %}

<style>
{% render "blog/draft-aroa/aroa.css" %}
</style>

[[toc]]

<p class="content-warning">
<i><strong>Note</strong>: This article contains themes that may be emotionally distressing for some readers. If you feel you may be vulnerable, consider your wellbeing before proceeding.</i>
</p>

Today, I want to convince you of how awesome my sister, Aroa, was. We lost her in November 2023, so I wanted to condense her essence into a single post and talk about mental health.

<p>
  <div class="art-container">
    <img alt="TODO" src="/blog/draft-aroa/art/IMG-20231128-WA0001.jpg">
    <details>
      <summary>Details</summary>
      <div class="art-description">
        Aroa made this painting as a gift to Luis, her therapist.<br>
      </div>
    </details>
  </div>
</p>

TODO: Mention astroboots / big red boots?

What you'd first appreciate when meeting Aroa is her irreverent style. Her most unusual clothing combinations somehow looked fabulous every single time. Cargo pants with a necktie? Slashing. Vans in different colors and bold pink glasses? Cool as hell. Her expressions and personality accompanied such a resourceful style:

TODO: picture of cool outfit, or maybe multiple clothes with addition signs (+) and the end result

<div class="gallery">
  <img alt="TODO" src="/blog/draft-aroa/style/necktie1.jpg">
  <img alt="TODO" src="/blog/draft-aroa/style/necktie2.jpg">
  <img alt="TODO" src="/blog/draft-aroa/style/necktie3.jpg">
</div>

I don't think she was fully aware of her coolness. Another testament were her artistic skills, particularly as she got started with 3D paintings. In this gift to me, she cut off pictures from a magazine and glued more things on top:

<!-- ![Painting she did for me](/blog/draft-aroa/art/office.jpg) -->
{% render "viz3d.liquid"
      src: "/blog/draft-aroa/art/3d/renaissance.glb"
      poster: "/blog/draft-aroa/art/3d/test-poster.webp"
      alt: "Test file 2"
%}

My therapists always asked me for rituals to remember her. Going to a techno club in her memory is probably my favorite, and luckily, I live in Germany. Here are three playlists that define her best; you can leave one playing in the background for a full immersion while reading:

TODO: make backups of these playlists as a simple list of song - author in this post

<div id="spotify-iframe-1" spotify-id="6VJs3ySqejEfX9mhqRe02v" class="spotify-iframe"></div>
<div id="spotify-iframe-2" spotify-id="1RY9QoO0tjUEDTgG6Qpqag" class="spotify-iframe"></div>
<div id="spotify-iframe-3" spotify-id="2sNZ4yNFkk4j5FwmuIcQic" class="spotify-iframe"></div>
<div style="margin-bottom: 8px;"></div>

<script>
{% render "blog/draft-aroa/spotify-players.js" %}
</script>

<!-- TODO: did she tattoo foreigners? that'd be a better word than "people" -->

A showcase of her persistency, or rather adventurousness, was how hard she tried to find a career. It was astronomy for a bit, and she even tried a semester of geology. She signed up for an automotive workshop and later gave a try to content creation for CBD companies. All while preparing cocktails in bars. Somewhere, a couple of people keep tattoos from when she got into that, too. I helped her build a CV, but we never managed to convince her to pursue arts! She argued she didn't want anyone telling her how to draw:

TODO: coger fotos de "Nuestra Aroa" en Google Photos

<!--
Commands used to optimize the videos:

ffmpeg \
  -i nata-original.mp4 \
  -vf "scale=650:-1,fps=15" \
  -an \
  -c:v libx264 \
  -crf 34 \
  -preset veryslow \
  -profile:v high \
  -level:v 4.1 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  nata.mp4

ffmpeg \
  -i nata-original.mp4 \
  -vf "scale=650:-1,fps=15" \
  -an \
  -c:v libvpx-vp9 \
  -b:v 0 \
  -crf 50 \
  -deadline best \
  -cpu-used 0 \
  -row-mt 1 \
  -pix_fmt yuv420p \
  -quality good \
  -tile-columns 2 \
  -auto-alt-ref 1 \
  nata.webm
-->

<div class="gallery">
  <video autoplay loop muted playsinline style="height: 20em; width: auto;">
    <source src="/blog/draft-aroa/style/nata.webm" type="video/webm">
    <source src="/blog/draft-aroa/style/nata.mp4" type="video/mp4">
  </video>
  <img alt="TODO" src="/blog/draft-aroa/art/IMG-20231130-WA0019.jpg" style="height: 20em; width: auto;">
</div>

Aroa showed me that people are much more than their career; you need to find fulfillment beyond it. Explore, learn, create. When I moved to Munich because of work, I stopped writing here and didn't prioritize learning German. I was learning about my job but not about me.

TODO: foto de arte aqui

TODO: more stuff she did: karate and taekwondo, guitar and base, dance, basketball.

When she was younger, Aroa got into anime and League of Legends and dyed her hair blue. The pictures are hilarious --- she'd kill me for writing this. She tried dancing and playing basketball, but mostly kicked ass in a boxing ring. This legend even participated in First Dates on her birthday, but that's a (very funny) story for another time.

<div class="gallery">
  <img alt="TODO" src="/blog/draft-aroa/style/blue-hair.jpg" style="height: 20em; width: auto;">
  <img alt="TODO" src="/blog/draft-aroa/style/boxing.jpg" style="height: 20em; width: auto;">
  <img alt="TODO" src="/blog/draft-aroa/style/tattoos.jpg" style="height: 20em; width: auto;">
</div>

My sister also appeared on TV after winning a baking competition, and in an ad for our local television network, where she skated. A little-known fact is that she has a song to her name, "[Los mundos de Aroa](https://open.spotify.com/track/2WOfcTp81iHvPljUNUmk1f?si=6373dc997aa941db)". One summer, we hiked to the Perdiguero, a 3,222m-high summit in the Pyrenees. She could both gracelessly pick up grasshoppers in the tracks, and rapel down canyon walls after a course she took with my father.

TODO: coger fotos de "Nuestra Aroa" en Google Photos

<div class="gallery">
  <img alt="TODO" src="/blog/draft-aroa/style/baking.jpg">
</div>

Her cinephile side appeared more recently, combining cult movies like *Scarface* with absurd ones like *Don't be a Menace to South Central While Drinking your Juice in the Hood*. I kid you not, she knew *Ali-G* by heart. **Every single line**. She sent me some recommendations, which I'm slowly watching:

<img width="40%" eleventy:widths="300" src="movies.jpg" alt="Movie recommendations: Project X, How High, Colegas del Barrio (translation: Don't be a menace to South Central While Drinking your Juice in the Hood), Fuga de Cerebros (1 > 2, translation: Brain Drain), Un espía y medio (translation: Central Intelligence), Supersalidos (translation: Superbad), Scary Movie (todas)">

All her life experiences brought her countless friends that loved her to no end. It was hard to keep track of them, my mother complains.

<p>
  <div class="art-container">
    <img alt="TODO" src="/blog/draft-aroa/art/arbolito.jpg">
    <details>
      <summary>Translation</summary>
      <div class="art-description">
        <strong>Parábola del árbol caído</strong><br>
        Érase una vez un arbolito que vivía de puntillas sobre el suelo. Este árbol ponía una sonrisa en primavera cuando brotaban sus tallos, alegría en verano, y nostalgia en otoño cuando se iba quedando desnudo.<br>
        Un invierno, vinieron unos hombres y lo cortaron.<br>
        El árbol vio cómo le arrancaban de aquel trozo de tierra y lo llevaron.<br>
        Era un árbol fuerte y valiente, que resistió hasta su misma muerte, y es que sabía lo que es aguantar el azote de la arena que llevaba el viento y el soplo helado de la noche que congelaba hasta la savia.<br>
        No dejó escapar una sola queja cuando lo cortaban, tan solo cayó una pequeña lágrima que fue a caer en el hueco que dejó la tierra.<br>
        Nadie se dio cuenta, pero con el paso del tiempo creció otro árbol que también era fuerte.<br>
        Un día, los hombres que cortaban los árboles se dieron cuenta de que el árbol nuevo que había crecido tenía forma de ave.<br>
        Y quedaron asombrados porque nunca habían visto cosa igual. Tanto les llamó la atención que se acercaron para cortarlo.<br>
        Pero antes de dar el primer hachazo, el árbol se echó a volar y sus hojas temblaron como plumas al viento.<br>
        Entonces avisaron al cazador. Disparó y cayó muerto el árbol al suelo, empapando la tierra con las gotas de sangre que manaban de la herida. Al año siguiente, una arboleda crecía en aquel lugar. Cada gota de sangre había llegado a ser un árbol fuerte.<br>
        <span class="author">— Unknown</span>
      </div>
    </details>
  </div>
</p>

![](/blog/draft-aroa/art/20241228_181749.heic.jpg)
![](/blog/draft-aroa/art/20241228_181759.heic.jpg)
![](/blog/draft-aroa/art/20241228_181802.heic.jpg)

## Mental health

We had absolutely no clue what was going on, and it happened so fast. After several visits to emergency care in a disastrous health care system, doctors started to hint it *might* be "[Borderline Personality Disorder](https://en.wikipedia.org/wiki/Borderline_personality_disorder) (BPD)". My mother always spent hours in hospitals only to be dismissed, told that intensive care had a one-year waitlist, and that Aroa being older than 18 limited our options.

NOTE: lyrics taken from the song "Ghostemane, Parv0•To Whom It May Concern"

![](/blog/draft-aroa/art/20241228_181752.heic.jpg)

Marsha Linehan argues that BPD is caused by both a genetic vulnerability and environmental stressors (*biosocial model*). The major symptoms are unstable relationships, a distorted sense of self, intense emotions, fear of abandonment, impulsivity, self-harm, and dissociation. This tough disorder may, however, improve significantly with consistent therapy and, in some cases, supplementary medication. Meeting more people who face it has been an honor --- they are the most compassionate!

![](/blog/draft-aroa/art/20241228_181756.heic.jpg)

She found art as a way to express her feelings through hardship. Disconnecting in a house away from the city also did her good. There, she spent time by the pool with our snarky-yet-loveable chihuaha, Berlin. I'm happy she came to Munich for a visit, too. We watched bangers from Martin Garrix live with my mother, and she saw my life here. Above all, her greatest help was her therapist, who put his soul and heart into it.

TODO: maybe use this lifeline instead: https://988lifeline.org/

If you ever have suicidal thoughts, please reach for help. This website contains some resources in [Spanish](https://ifdsurvive.com/) and this one in [English](TODO). You can donate here or here. Caring for someone with BPD can also be challenging, making you feel like "walking on eggshells". Education and support groups help to learn healthy boundaries and how to best support the person.

![](/blog/draft-aroa/art/20231210_212726.heic.jpg)

## My experience

My mother called me to tell me the news. The timing was extraordinary, as I was sitting in a plane two minutes away from its takeoff. It was gut-wrenching to tell my father, too. The attentive flight attendants took me to their reserved row to calm my nerves after the departure. My constant sobbing worried them that I'd dehydrate or get a panic attack. So they asked me to take a tranquilizer... as a rectal suppository. For flight reasons, I suppose. I'm sure Aroa would have gotten a huuuuuge kick out of that. Man, I know she's still laughing somewhere.

Being stuck for 4 hours in a flight, I thought of all the things that can be thought, and I felt all the feelings that can be felt. Not all of them being negative --- I'll eternally be grateful to my mother for calling me immediately.

NOTE: lyrics taken from the song "Ghostemane, Parv0•To Whom It May Concern"

![](/blog/draft-aroa/art/20241228_181805.heic.jpg)

After reuniting with my family, I couldn't comprehend what had happened. What was obvious is how completely broken everyone was. Instinctively, I worried more for others than for myself at the beginning. This took time, but I've gotten better at it.

<p>
  <div class="art-container">
    <img alt="TODO" src="/blog/draft-aroa/art/20241228_181811.heic.jpg">
    <details>
      <summary>Translation</summary>
      <div class="art-description">
        <strong>Left</strong><br>
        AÚN CREEMOS<br>
        QUE EL DOLOR<br>
        MÁS GRANDE ES<br>
        MORIR<br>
        <strong>Right</strong><br>
        ¿Puede la muerte<br>
        estar dormida, si la vida<br>
        es solo un sueño?<br>
        ¿Y las escenas de dicha pasan como<br>
        un fantasma? LOS EFÍMEROS PLACERES<br>
        a quienes se asemejan.<br>
        Y aún creemos que el dolor más grande es morir.
      </div>
    </details>
  </div>
</p>

A shocking part was the physical reaction, as I didn't know the concept of "[somatization](https://en.wikipedia.org/wiki/Somatization)". Mental health ***is*** physical health. The airplane call made my arms literally numb for several minutes. It was completely disconcerting and alarming. My physical strength later took a nosedive. I got ill, and the worst back cramps of my life left me in bed for two days straight. The exhaustion lasted for weeks. Part of me wanted to swim for kilometers, but frustratingly, my body refused.

<!-- ![](/blog/draft-aroa/art/skate.jpg) -->
{% render "viz3d.liquid"
      src: "/blog/draft-aroa/art/3d/skate-web.glb"
      poster: "/blog/draft-aroa/art/3d/test-poster.webp"
      alt: "Test file 1"
%}

It's gotten much better through therapy, loved ones, and time. There are still crappy moments, and the story is ongoing. But I try to have a positive outlook, and brag about how great Aroa was to this day. She wanted to raise awareness about BPD, so I hope this post helps!

At first, therapy makes things worse. It's like throwing all the shit into a pot and stirring it together. But in the long term, you need it to heal. Everyone deals with issues in their own way, and that's okay.

TODO: rest of pictures go here

<!-- TODO: try to not make the width 100% because it makes it hard to scroll. Or not the full height of the phone's screen, so that there are gaps at the top and bottom. Either that, or make 3d movements only with two fingers at once. -->
{% render "viz3d.liquid"
      src: "/blog/draft-aroa/art/3d/test.glb"
      poster: "/blog/draft-aroa/art/3d/test-poster.webp"
      alt: "Test file"
%}
{% render "viz3d.liquid"
      src: "/blog/draft-aroa/art/3d/test2.glb"
      poster: "/blog/draft-aroa/art/3d/test-poster.webp"
      alt: "Test file"
%}
