---
title: "Aroa, I wish I could tell you how damn awesome you are"
author: "Mario Ortiz Manero"
images: ["TODO"]
tags: [TODO]
date: 2024-01-14
GHissueID: TODO
draft: true
---

<script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
{{< viz3d-setup >}}

Today, I want to convince you of how admirable my sister, Aroa, was. We lost her in November 2023, so I wanted to condense her essence into a single post and talk about mental health.

<!-- TODO: try to not make the width 100% because it makes it hard to scroll. Or not the full height of the phone's screen, so that there are gaps at the top and bottom. -->
{{< viz3d
      src="/blog/draft-aroa/art/3d/test.glb"
      poster="/blog/draft-aroa/art/3d/test-poster.webp"
      alt="Test file"
>}}

TODO: Mention astroboots / big red boots?

What you'd first appreciate when meeting Aroa is her irreverent style. Her most unusual clothing combinations somehow looked fabulous every single time. Cargo pants with a necktie? Slashing. Vans in different colors and bold pink glasses? Cool as hell. Her expressions and personality accompanied such a resourceful style:

TODO: picture of cool outfit, or better, multiple clothes with addition signs (+) and the end result

I don't think she was fully aware of her coolness. Another testament were her artistic skills, particularly as she got started with 3D paintings. For example, here she cut off pictures from a magazine and glued more things on top:

TODO: picture of art in the home's office

My therapists always asked me for rituals to remember her. Going to a techno club in her memory is probably my favorite, and luckily, I live in Germany. Here are three playlists that define her best; you can leave one playing in the background for a full immersion while reading:

<!-- TODO: make backups of these playlists as a simple list of song - author in this post -->

<style>
.sticky-iframe {
  position: sticky;
  top: 8px;
  background-color: var(--theme);
  outline: 8px solid var(--theme);
}
</style>
<div id="spotify-iframe-1" spotify-id="6VJs3ySqejEfX9mhqRe02v" class="spotify-iframe"></div>
<div id="spotify-iframe-2" spotify-id="1RY9QoO0tjUEDTgG6Qpqag" class="spotify-iframe"></div>
<div id="spotify-iframe-3" spotify-id="2sNZ4yNFkk4j5FwmuIcQic" class="spotify-iframe"></div>
<div style="margin-bottom: 8px;"></div>

<script>
/* When the user starts to play music, we want to make the iframe sticky. This
 * will make it easier to pause if necessary. Also, we only want one playlist
 * playing at a time.
 *
 * Making the iframe sticky also fixes a bug. Whenever a new song in that
 * playlist starts, there's a scroll event to focus the iframe. This doesn't
 * allow the reader to scroll further while listening to the music. But if the
 * iframe is sticky, it will always be in the screen and won't scroll!
 */

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const elements = [
    document.getElementById('spotify-iframe-1'),
    document.getElementById('spotify-iframe-2'),
    document.getElementById('spotify-iframe-3')
  ];
  var embedControllers = [];

  elements.forEach(element => {
    const playlist_id = element.getAttribute('spotify-id');
    const options = {
      uri: `spotify:playlist:${playlist_id}`,
      height: 80,
    };

    const callback = (EmbedController) => {
      EmbedController.addListener('ready', () => {
        embedControllers.push(EmbedController);
      });

      EmbedController.addListener('playback_update', ev => {
        // The original element will have been replaced, so we need to find the
        // new iframe.
        const iframe = document.querySelector(`iframe[src*="${playlist_id}"]`);

        // Toggle the sticky class
        if (ev.data.isPaused) {
          iframe.classList.remove("sticky-iframe");
          console.log(`playlist ${playlist_id} is paused, so it's now non-sticky`);
        } else {
          iframe.classList.add("sticky-iframe");
          console.log(`playlist ${playlist_id} playing, so it's now sticky`);

          // Pause the other controllers. This is expected to raise some
          // `PlaybackError` exceptions because the other playlists may not be
          // loaded yet, but that's okay.
          embedControllers.forEach(embedController => {
            if (embedController === EmbedController) {
              return;
            }

            embedController.pause();
          });
        }
      });
    };

    // Replaces the element with the actual iframe.
    IFrameAPI.createController(element, options, callback);
    console.log(`Successfully set up ${element.id}`)
  });
};
</script>

<!-- TODO: did she tattoo foreigners? that'd be a better word than "people" -->

A showcase of her persistency, or rather adventurousness, was how hard she tried to find a career. It was astronomy for a bit, and she even tried a semester of geology. She signed up for an automotive workshop and later gave a try to content creation for CBD companies. All while preparing cocktails in bars. Somewhere, a couple of people keep tattoos from when she got into that, too. We built her CV together, but we never managed to convince her to pursue arts! Just look:

TODO: a few art pieces in here
TODO: encontrar el video donde hace un truco con nata en el bar??

Aroa showed me that people are much more than their career; you also need to find fulfillment beyond it. Explore, learn, create. When I moved to Munich because of work, I stopped writing here and didn't prioritize learning German. I was learning about my job but not about me.

TODO: picture

When she was younger, Aroa got into anime and League of Legends and dyed her hair blue. The pictures are hilarious --- she'd kill me for writing this. Then, she learned to skate and later on how to kick ass boxing. All her life experiences brought her countless friends that loved her to no end. She even participated in First Dates on her birthday, but that's a (very funny) story for another time. She sent me some recommendations, which I'm slowly watching:

TODO: picture boxing

Her cinephile side appeared more recently, featuring both cult movies like *Scarface* and absurd ones like *Don't be a Menace to South Central While Drinking your Juice in the Hood*. I kid you not, she knew *Ali-G* by heart. Every single line.

<img width="40%" src="movies.jpg" alt="Movie recommendations: Project X, How High, Colegas del Barrio (translation: Don't be a menace to South Central While Drinking your Juice in the Hood), Fuga de Cerebros (1 > 2, translation: Brain Drain), Un espía y medio (translation: Central Intelligence), Supersalidos (translation: Superbad), Scary Movie (todas)">

TODO: historia de arbolito

## Mental health

We had absolutely no clue what was going on, and it happened so fast. After several visits to emergency care in a disastrous health care system, doctors started to hint it *might* be "[Borderline Personality Disorder](https://en.wikipedia.org/wiki/Borderline_personality_disorder) (BPD)". My mother always spent hours to get help only to be given scarce information, told that intensive care had a one-year waitlist, and that Aroa being older than 18 limited our options.

BPD is a tough mental disease that is definitely solvable with experts and work.

About TLP:
- Origen biosocial
- Recursos que tienen que ver con Marsha Linehan y como lo aborda ella
- https://ifdsurvive.com/
- It's okay to mention that "she took her life", just not how

TODO: link to donate?

Mental health is a field that's been taken seriously only recently, so institutions and research around it are limited. Marsha Linehan argues that its cause is a combination of genetic vulnerability and environmental stressors. It's a complicated disorder, but with proper care it can be dealt with.

If you ever have suicidal thoughts, please reach for help. This website contains some resources in [Spanish](https://ifdsurvive.com/) and this one in [English](TODO).

## My experience

My mother called me to tell me the news. The timing was extraordinary, as I was sitting in a plane two minutes away from its takeoff. My world fell apart: I couldn't stop crying. It was gut-wrenching to tell my father, too. The attentive flight attendants took me to their reserved row at the front to calm my nerves. My sobbing worried them that I'd dehydrate or get a panic attack. So they asked me to take a tranquilizer... as a rectal suppository. For flight reasons, I suppose. I'm sure Aroa would have gotten a huuuuuge kick out of that. Man, I know she's still laughing somewhere.

Being stuck for 4 hours in a flight, I thought of all the things that can be thought, and I felt all the feelings that can be felt. Not necessarily all of them being negative. I'll eternally be grateful to my mother for her instinct to immediately call me.

After reuniting with my family, I couldn't comprehend what had happened. What was obvious is how completely broken they were. Instinctively, I worried more for others than for myself at the beginning. This took time, but I've gotten better at it.

A shocking part was the physical reaction, as I didn't know the concept of "[somatization](https://en.wikipedia.org/wiki/Somatization)". Mental health ***is*** physical health. The airplane call made my arms literally numb for several minutes. It was completely disconcerting and alarming. My physical strength later took a nosedive: I got ill and the worst back cramps of my life left me in bed for two days straight. The exhaustion lasted for weeks. My brain was ready to swim for kilometers, but frustratingly, my body refused.

It's gotten much better through therapy, loved ones, and time. There are still crappy moments, and the story is ongoing. But I try to have a Stoic and positive outlook, and brag about how great Aroa was to this day. She wanted to raise awareness about BPD, so I hope this post helps!

At first, therapy may make things worse. It's like pulling all the shit out and mixing it together. But in the long term, you need it to heal. I thought of therapy as sitting in a white neat room with someone asking questions. The questions part remains true, but the environment in which they are asked can be quite flexible. Some find more comfort in sharing a beer with a laid-back therapist, while others prefer nature or among horses. This comes down to the fact that everyone deals with issues in their own way, and that's okay.

TODO: rest of pictures go here
