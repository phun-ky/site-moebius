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
      <button class="ph copy">copy</button>
    </div>
    <pre
      class="ph language-${language}"
      language="${language}"
    ><code class="ph language-${language} ${language}" id="${id}-code-${language}">${content}</code></pre>
  </div>`;
};
