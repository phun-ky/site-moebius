const html = String.raw;
// Keep each link on one line: diff-dom, which renders these templates, does
// not close a tag written as `</a` + newline + `>`
const COLOR_NAME_LIST = 'https://github.com/meodai/color-names';
const COLOR_NAME_LICENSE = '/data/colornames.LICENSE.txt';

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
      <p class="ph">
        Color names from
        <a class="ph" href="${COLOR_NAME_LIST}">color-name-list</a>
        by David Aerne, under the
        <a class="ph" href="${COLOR_NAME_LICENSE}">MIT License</a>.
      </p>
    </div>
  </footer>`;
};
