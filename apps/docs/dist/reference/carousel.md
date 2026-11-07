# Carousel

Use `data-uif="carousel"` with children marked `data-uif-role="slide"`.
Set `data-uif-items-per-slide="2"` and `data-uif-step="1"` to display two images
and advance one image per step, including ordered wraparound.

## Automatic playback

Playback is opt-in with `data-uif-autoplay="true"`. Set `data-uif-interval="5000"`
to choose milliseconds between steps (default 5,000; bounded to 1,000–60,000).
Include a button with `data-uif-action="toggle-autoplay"` to pause or resume.
The component updates its label and pressed state automatically.

Playback pauses while hovered, keyboard focus is inside the carousel, or the
document is hidden. Reduced-motion preferences disable automatic startup.
Destroying the carousel removes its timer and event listeners.

Previous/next buttons use `data-uif-action="previous"` and `data-uif-action="next"`;
indicators use a zero-based `data-uif-slide-to`. A status element uses
`data-uif-role="status"`; automatic playback suppresses repeated live announcements.

See the component gallery for the working multi-image example.
