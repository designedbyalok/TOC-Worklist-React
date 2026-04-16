import { ActionButton } from './ActionButton';

export default {
  title: 'Core/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text', description: 'Solar icon name' },
    size: { control: 'select', options: ['S', 'L', 'XL'], description: 'S=16px, L=20px, XL=32px icon' },
    state: { control: 'select', options: ['active', 'disabled', 'error'] },
    tooltip: { control: 'text' },
    notification: { control: 'boolean', description: 'Orange notification badge' },
    count: { control: 'text', description: 'Badge count text' },
    dot: { control: 'boolean', description: 'Red status dot' },
    chevron: { control: 'boolean', description: 'Dropdown chevron' },
    chevronOpen: { control: 'boolean' },
  },
};

export const Playground = {
  args: { icon: 'solar:filter-linear', size: 'L', tooltip: 'Filter', notification: false, dot: false, chevron: false },
};

export const AllExamples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <ActionButton icon="solar:filter-linear" tooltip="Default" />
        <ActionButton icon="solar:filter-linear" size="S" tooltip="Small" />
        <ActionButton icon="solar:bell-linear" notification count="3" tooltip="With badge" />
        <ActionButton icon="solar:bell-linear" dot tooltip="With dot" />
        <ActionButton icon="solar:pen-linear" state="disabled" tooltip="Disabled" />
        <ActionButton icon="solar:settings-linear" chevron tooltip="With chevron" />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8, background: 'var(--neutral-50)', borderRadius: 8 }}>
        <ActionButton icon="solar:refresh-linear" size="S" tooltip="Refresh" />
        <span style={{ width: 0.5, height: 16, background: 'var(--neutral-150)' }} />
        <ActionButton icon="solar:check-square-linear" size="S" tooltip="Select" />
        <span style={{ width: 0.5, height: 16, background: 'var(--neutral-150)' }} />
        <ActionButton icon="solar:filter-linear" size="S" tooltip="Filter" notification count="1" />
        <span style={{ width: 0.5, height: 16, background: 'var(--neutral-150)' }} />
        <ActionButton icon="solar:sort-vertical-linear" size="S" tooltip="Sort" />
        <span style={{ width: 0.5, height: 16, background: 'var(--neutral-150)' }} />
        <ActionButton icon="solar:magnifer-linear" size="S" tooltip="Search" />
      </div>
    </div>
  ),
};
