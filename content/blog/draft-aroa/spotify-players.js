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
