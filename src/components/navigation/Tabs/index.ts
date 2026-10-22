import { addOnClick, useState } from 'lib/spa';
import { MoebiusSiteEventType } from 'types';

import './styles/tabs.css';

const html = String.raw;

export type MoebiusSiteTabItem = {
  id: string;
  name: string;
  // A function is only called for the active tab, so hidden tabs cost
  // nothing to render
  content: string | (() => string);
};

export type MoebiusSiteTabItems = MoebiusSiteTabItem[];

export type MoebiusSitePropsType = {
  id: string;
  items: MoebiusSiteTabItems;
  // The active tab, when it is kept outside the tabs, such as in the page's
  // options; choosing a tab then calls onSelect instead
  active?: string;
  onSelect?: (id: string) => void;
};

// Arrow keys, Home and End move between tabs, as in the ARIA tabs pattern.
// The tabs are re-rendered on every change, so one listener on the document
// handles them all; moving to a tab clicks it, which selects it.
const TAB_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

document.addEventListener('keydown', (event) => {
  const tab = (event.target as Element | null)?.closest?.('[role="tab"]');

  if (!tab || !TAB_KEYS.includes(event.key)) return;

  const tabs = [
    ...(tab
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
  ];
  const index = tabs.indexOf(tab as HTMLElement);
  const next = {
    ArrowLeft: (index - 1 + tabs.length) % tabs.length,
    ArrowRight: (index + 1) % tabs.length,
    Home: 0,
    End: tabs.length - 1
  }[event.key as 'ArrowLeft' | 'ArrowRight' | 'Home' | 'End'];

  event.preventDefault();
  tabs[next].focus();
  tabs[next].click();
});

export const Tabs = (props: MoebiusSitePropsType) => {
  const { id, items, active, onSelect } = props;
  const [ownActiveTab, setOwnActiveTab] = useState(items[0]?.id, `tabs-${id}`);
  const activeTab = active ?? ownActiveTab;

  items.forEach((item: MoebiusSiteTabItem) => {
    const { id: itemId } = item;

    addOnClick(`tab-${itemId}`, (e: MoebiusSiteEventType<HTMLElement>) => {
      e.preventDefault();

      if (onSelect) onSelect(itemId);
      else setOwnActiveTab(itemId);
    });
  });

  return html`<div class="ph tabs" id="tabs-${id}">
    <ul class="ph tabs-list" role="tablist">
      ${items
        .map((item) => {
          const { id, name } = item;
          const attributes: Record<string, string | number | boolean> = {
            tabIndex: id === activeTab ? 0 : -1,

            id: `tab-${id}`,
            role: 'tab',
            'data-rel': id
          };

          if (id === activeTab) {
            attributes['aria-selected'] = 'true';
          }

          const attrs = Object.entries(attributes)
            .map((attr) => {
              const [property, value] = attr;

              // A boolean attribute is written without a value
              return value === true
                ? ` ${property}`
                : ` ${property}="${value}"`;
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
        const attributes: Record<string, string | number | boolean> = {
          'aria-labelledby': `tab-${id}`,
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

            // A boolean attribute is written without a value
            return value === true ? ` ${property}` : ` ${property}="${value}"`;
          })
          .join(' ');
        const panelContent =
          id !== activeTab
            ? ''
            : typeof content === 'function'
              ? content()
              : content;

        return html`<section class="ph" ${attrs} id="section-${id}">
          ${panelContent}
        </section>`;
      })
      .join('\n')}
  </div>`;
};
