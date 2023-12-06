const html = String.raw;

export type MoebiusSiteLabelPropsType = {
  labelFor: string;
  label: string;
  className?: string;
};

export const Label = (props: MoebiusSiteLabelPropsType) => {
  const { labelFor, label, className = 'ph' } = props;

  return html`<label class="${className}" for="${labelFor}">${label}</label>`;
};
