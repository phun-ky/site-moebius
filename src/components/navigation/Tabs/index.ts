import { addOnClick, useState } from 'lib/spa';
import { MoebiusSiteEventType } from 'types';

import './styles/tabs.styl';

const html = String.raw;

export type MoebiusSiteTabItem = {
  id: string;
  name: string;
  content: string;
};

export type MoebiusSiteTabItems = MoebiusSiteTabItem[];

export type MoebiusSitePropsType = {
  id: string;
  items: MoebiusSiteTabItems;
};

export const Tabs = (props: MoebiusSitePropsType) => {
  const { id, items } = props;
  const [activeTab, setActiveTab] = useState('interpolate', 'palette-tabs');

  items.forEach((item: MoebiusSiteTabItem) => {
    const { id: itemId } = item;

    addOnClick(`tab-${itemId}`, (e: MoebiusSiteEventType<HTMLElement>) => {
      e.preventDefault();

      setActiveTab(itemId);
    });
  });

  return html`<div class="ph tabs" id="tabs-${id}">
    <ul class="ph tabs-list" role="tablist">
      ${items
    .map((item) => {
      const { id, name } = item;
      const attributes = {
        tabIndex: id === activeTab ? 0 : -1,

        id: `tab-${id}`,
        role: 'tab',
        'data-rel': id
      };

      if (id === activeTab) {
        attributes['aria-selected'] = true;
      }

      const attrs = Object.entries(attributes)
        .map((attr) => {
          const [property, value] = attr;

          return ` ${property}="${value}"`;
        })
        .join(' ');

      return html`<li class="ph tabs-list-item" role="presentation">
            <a class="ph tabs-list-action" ${attrs} href="#section-${id}">
              ${name}
            </a>
          </li>`;
    })
    .join('\n')}
    </ul>
    ${items
    .map((item) => {
      const { id, content } = item;
      const attributes = {
        'aria-labelledby': `tab-${id}`,
        id: `panel-${id}`,
        'data-rel': id,
        tabIndex: -1,
        role: 'tabpanel'
      };

      if (id !== activeTab) {
        attributes['hidden'] = true;
      }

      const attrs = Object.entries(attributes)
        .map((attr) => {
          const [property, value] = attr;

          return ` ${property}="${value}"`;
        })
        .join(' ');

      return html`<section class="ph" ${attrs} id="section-${id}">
          ${content}
        </section>`;
    })
    .join('\n')}
  </div>`;
};
