import { Label } from 'components/Input/Label';
import { TextInput } from 'components/Input/TextInput';

const html = String.raw;

export type MoebiusSiteUnitItemPropsType = {
  item: {
    unit: string;
    title: string;
    value: string;
  };
};

export const UnitItem = (props: MoebiusSiteUnitItemPropsType) => {
  const { item } = props;

  return html`<div class="ph input-group">
    ${Label({ labelFor: item.unit, label: item.title })}
    ${TextInput({
    readonly: true,
    className: `ph ${item.unit}`,
    id: item.unit,
    value:
        typeof item.value !== 'string'
          ? Object.keys(item.value)
            .map((unit) => item.value[unit])
            .join(', ')
          : item.value
  })}
  </div>`;
};
