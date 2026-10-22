import { escapeText } from 'utils/escape';

const html = String.raw;

export type MoebiusSiteCodeBlockPropsType = {
  id: string;
  language: string;
  content: string;
};

export const CodeBlock = (props: MoebiusSiteCodeBlockPropsType) => {
  const { id, language, content } = props;

  return html`<div class="ph code-toolbar">
    <div class="ph tools">
      <span class="ph language">${language}</span>
      <button type="button" class="ph copy">copy</button>
      <span class="ph copy-status visually-hidden" role="status"></span>
    </div>
    <pre
      class="ph language-${language}"
      language="${language}"
    ><code class="ph language-${language} ${language}" id="${id}-code-${language}">${escapeText(
      content
    )}</code></pre>
  </div>`;
};
