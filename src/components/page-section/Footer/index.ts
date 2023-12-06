const html = String.raw;

export const Footer = () => {
  return html`<footer class="ph">
    <div class="ph container">
      <p class="ph">
        <a
          target="_blank"
          class="ph"
          rel="license"
          href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
        >
          <img
            alt="Creative Commons Licence"
            style="border-width: 0"
            width="88"
            height="31"
            src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png"
          />
        </a>
        <br />This work, except for the
        <a href="https://www.npmjs.com/package/@phun-ky/moebius" class="ph">
          @phun-ky/moebius
        </a>
        color package, and other assets created by
        <a
          target="_blank"
          class="ph"
          href="http://phun-ky.net"
          property="cc:attributionName"
          rel="cc:attributionURL"
        >
          Alexander Vassbotn Røyne-Helgesen
        </a>
        is licensed under a
        <!-- display: block -->
        <a
          target="_blank"
          class="ph"
          rel="license"
          href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
        >
          Creative Commons Attribution-NonCommercial-ShareAlike 4.0
          International License
        </a>
        .
      </p>
    </div>
  </footer>`;
};
