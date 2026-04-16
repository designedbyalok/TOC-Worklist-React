// Load Fold Health design tokens + global styles so all stories render with the correct theme
import '../src/tokens/tokens.css';
import '../src/index.css';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'neutral-50', value: '#F6F7F8' },
        { name: 'dark', value: '#16181D' },
      ],
    },
    layout: 'centered',
  },
};

export default preview;
