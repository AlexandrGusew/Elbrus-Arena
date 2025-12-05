const fs = require('fs');
const path = require('path');

const fixes = {
  'tooltip.tsx': '@radix-ui/react-tooltip',
  'toggle-group.tsx': '@radix-ui/react-toggle-group',
  'toggle.tsx': '@radix-ui/react-toggle',
  'tabs.tsx': '@radix-ui/react-tabs',
  'switch.tsx': '@radix-ui/react-switch',
  'slider.tsx': '@radix-ui/react-slider',
  'sidebar.tsx': '@radix-ui/react-slot',
  'sheet.tsx': '@radix-ui/react-dialog',
  'separator.tsx': '@radix-ui/react-separator',
  'select.tsx': '@radix-ui/react-select',
  'scroll-area.tsx': '@radix-ui/react-scroll-area',
  'resizable.tsx': 'react-resizable-panels',
  'radio-group.tsx': '@radix-ui/react-radio-group',
  'progress.tsx': '@radix-ui/react-progress',
  'popover.tsx': '@radix-ui/react-popover',
  'navigation-menu.tsx': '@radix-ui/react-navigation-menu',
  'menubar.tsx': '@radix-ui/react-menubar',
  'label.tsx': '@radix-ui/react-label',
  'input-otp.tsx': 'input-otp',
  'hover-card.tsx': '@radix-ui/react-hover-card',
  'form.tsx': { label: '@radix-ui/react-label', slot: '@radix-ui/react-slot', hookform: 'react-hook-form' },
  'dropdown-menu.tsx': '@radix-ui/react-dropdown-menu',
  'drawer.tsx': 'vaul',
  'dialog.tsx': '@radix-ui/react-dialog',
  'context-menu.tsx': '@radix-ui/react-context-menu',
  'command.tsx': 'cmdk',
  'collapsible.tsx': '@radix-ui/react-collapsible',
  'checkbox.tsx': '@radix-ui/react-checkbox',
  'chart.tsx': 'recharts',
  'carousel.tsx': 'embla-carousel-react',
  'sonner.tsx': { nextThemes: 'next-themes', sonner: 'sonner' }
};

const uiDir = path.join(__dirname, 'src', 'components', 'ui');

fs.readdirSync(uiDir).forEach(file => {
  if (!file.endsWith('.tsx')) return;
  
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  if (fixes[file]) {
    const fix = fixes[file];
    if (typeof fix === 'string') {
      content = content.replace(/@radix-ui\/react-accordion/g, fix);
      changed = true;
    } else if (typeof fix === 'object') {
      if (fix.label) content = content.replace(/@radix-ui\/react-accordion/g, fix.label);
      if (fix.slot) content = content.replace(/@radix-ui\/react-accordion/g, (match, offset, str) => {
        const before = str.substring(Math.max(0, offset - 50), offset);
        return before.includes('Slot') ? fix.slot : match;
      });
      if (fix.hookform) content = content.replace(/react-hook-form@[0-9.]+/g, fix.hookform);
      changed = true;
    }
  }
  
  // Fix version numbers
  content = content.replace(/@([0-9.]+)/g, '');
  content = content.replace(/([a-z-]+)@[0-9.]+/g, '$1');
  content = content.replace(/from ["']([^"']+)@[0-9.]+["']/g, "from '$1'");
  content = content.replace(/from ["']([^"']+)@[0-9.]+["']/g, 'from "$1"');
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
