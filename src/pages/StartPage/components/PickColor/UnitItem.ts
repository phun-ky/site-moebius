import { Label } from 'components/input-fields/Label';
import { TextInput } from 'components/input-fields/TextInput';

const html = String.raw;

export type MoebiusSiteUnitItemPropsType = {
  item: {
    unit: string;
    title: string;
    value: string | Record<string, string | number>;
  };
  idPrefix: string;
};

export const UnitItem = (props: MoebiusSiteUnitItemPropsType) => {
  const { item, idPrefix } = props;
  const id = `${idPrefix}-${item.unit}`;

  return html`<div class="ph input-group">
    ${Label({ labelFor: id, label: item.title })}
    ${TextInput({
      readonly: true,
      className: `ph ${item.unit}`,
      id,
      value:
        typeof item.value !== 'string'
          ? Object.keys(item.value)
              .map(
                (unit) => (item.value as Record<string, string | number>)[unit]
              )
              .join(', ')
          : item.value
    })}
  </div>`;
};
