// Prism highlights the CSS and JavaScript export code blocks. It is bundled
// instead of loaded from unpkg, so the site loads nothing from other hosts
// (#34). The `prismjs` main module includes the CSS and JavaScript grammars
// and sets window.Prism, which the extras and the plugin use. JSON is for
// the design tokens.
import 'prismjs';
import 'prismjs/components/prism-css-extras';
import 'prismjs/components/prism-json';
import 'prismjs/plugins/inline-color/prism-inline-color';
import 'prismjs/plugins/inline-color/prism-inline-color.css';

import './styles/vendor/phun-ky/prism.css';
