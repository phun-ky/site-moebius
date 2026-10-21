const html = String.raw;
// Keep each link on one line: diff-dom, which renders these templates, does
// not close a tag written as `</a` + newline + `>`
const AUTHOR = 'https://phun-ky.net';
const LICENSE = 'https://github.com/phun-ky/site-moebius/blob/main/LICENSE';
const SOURCE = 'https://github.com/phun-ky/site-moebius';
const COLOR_NAME_LIST = 'https://github.com/meodai/color-names';
const COLOR_NAME_LICENSE = '/data/colornames.LICENSE.txt';

export const Footer = () => {
  return html`<footer class="ph">
    <div class="ph container">
      <p class="ph">
        moebius by
        <a class="ph" href="${AUTHOR}">Alexander Vassbotn Røyne-Helgesen</a>,
        under the <a class="ph" href="${LICENSE}">MIT License</a>.
        <a class="ph" href="${SOURCE}">Source on GitHub</a>.
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
