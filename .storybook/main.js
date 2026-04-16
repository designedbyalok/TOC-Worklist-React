/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    '../src/components/**/*.stories.@(js|jsx)',
    '../src/features/**/*.stories.@(js|jsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
};
export default config;
