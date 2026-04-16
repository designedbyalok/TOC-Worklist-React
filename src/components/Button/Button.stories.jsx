import { Button } from './Button';

export default {
  title: 'Core/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'ghost', 'alt', 'success', 'danger', 'dangerFilled', 'info'],
      description: 'Visual style of the button',
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
      control: 'select',
      options: ['S', 'L', 'XL'],
      description: 'S = 24px, L = 32px (default), XL = 52px (mobile)',
      table: { defaultValue: { summary: 'L' } },
    },
    children: {
      control: 'text',
      description: 'Button label text',
    },
    leadingIcon: {
      control: 'text',
      description: 'Solar icon name for leading icon (e.g. solar:add-circle-linear)',
    },
    trailingIcon: {
      control: 'text',
      description: 'Solar icon name for trailing icon',
    },
    iconOnly: {
      control: 'boolean',
      description: 'Square icon-only button (hides text)',
      table: { defaultValue: { summary: 'false' } },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Expand to fill container width',
      table: { defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
      table: { defaultValue: { summary: 'false' } },
    },
  },
};

/**
 * The default playground — tweak every prop in the Controls panel.
 * This single story replaces all the individual variant stories.
 */
export const Playground = {
  args: {
    variant: 'primary',
    size: 'L',
    children: 'Button Text',
    leadingIcon: '',
    trailingIcon: '',
    iconOnly: false,
    fullWidth: false,
    disabled: false,
  },
};

/**
 * Quick visual reference of every variant at size L.
 */
export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {['primary', 'secondary', 'tertiary', 'ghost', 'alt', 'success', 'danger', 'dangerFilled', 'info'].map(v => (
          <Button key={v} variant={v}>{v}</Button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {['primary', 'secondary', 'tertiary', 'ghost', 'alt', 'success', 'danger', 'dangerFilled', 'info'].map(v => (
          <Button key={v} variant={v} size="S">{v} (S)</Button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {['primary', 'secondary', 'ghost'].map(v => (
          <Button key={v} variant={v} leadingIcon="solar:add-circle-linear">With Icon</Button>
        ))}
        <Button variant="primary" iconOnly leadingIcon="solar:pen-linear" />
        <Button variant="primary" disabled>Disabled</Button>
      </div>
    </div>
  ),
};
