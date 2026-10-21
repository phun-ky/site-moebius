import { escapeText } from 'utils/escape';

export const ErrorPage = ({ params }) => {
  const { error } = params;

  return `<div>
      <h1>Something went wrong</h1>
      <p>${escapeText(error)}</p>
      <pre>
        <code>${escapeText(error?.stack)}</code>
      </pre>
    </div>`;
};
