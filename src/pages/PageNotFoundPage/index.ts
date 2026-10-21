import { escapeText } from 'utils/escape';

export const PageNotFoundPage = () => {
  // The path comes from the URL, so it is escaped before rendering
  const path = escapeText(decodeURI(location.pathname));

  return `<div class="ph container">
      <h1 class="ph">Page not found</h1>
      <p class="ph">There is no page at <code>${path}</code>.</p>
      <p class="ph">
        <a class="ph" href="/" data-link="/">Go to the palette generator</a>
      </p>
    </div>`;
};
