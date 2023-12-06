import { cx } from 'utils/cx';

const html = String.raw;

export type MoebiusSiteDialogPropsType = {
  content: string;
  className?: string;
  id?: string;
};

export const Dialog = (props: MoebiusSiteDialogPropsType) => {
  const { className, content, id } = props;
  const classNames = cx(`ph ${className}`);

  return html`
    <dialog class="${classNames}" id="${id}">
      <button class="ph close" autofocus>Close</button>
      ${content}
    </dialog>
  `;
};
