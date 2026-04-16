import { Icon } from './Icon';
import { AiInsightIcon } from './AiInsightIcon';
import { CloseIcon } from './CloseIcon';
import { UnityIcon } from '../UnityIcon/UnityIcon';

export default {
  title: 'Core/Icon',
  component: Icon,
  argTypes: {
    name: { control: 'text' },
    size: { control: 'number' },
    color: { control: 'color' },
  },
};

export const Default = { args: { name: 'solar:home-2-linear', size: 24 } };

export const CommonIcons = {
  render: () => {
    const icons = [
      'solar:home-2-linear', 'solar:users-group-rounded-linear', 'solar:settings-linear',
      'solar:filter-linear', 'solar:magnifer-linear', 'solar:add-circle-linear',
      'solar:phone-calling-linear', 'solar:chat-round-linear', 'solar:history-linear',
      'solar:check-circle-linear', 'solar:close-circle-linear', 'solar:menu-dots-bold',
      'solar:pen-linear', 'solar:trash-bin-minimalistic-linear', 'solar:file-text-linear',
      'solar:chart-2-linear', 'solar:arrow-up-linear', 'solar:arrow-down-linear',
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        {icons.map(name => (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <Icon name={name} size={24} />
            <span style={{ fontSize: 10, color: 'var(--neutral-300)', textAlign: 'center', wordBreak: 'break-all' }}>
              {name.replace('solar:', '')}
            </span>
          </div>
        ))}
      </div>
    );
  },
};

export const BrandedIcons = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <AiInsightIcon size={32} />
        <div style={{ fontSize: 10, color: 'var(--neutral-300)', marginTop: 4 }}>AI Insight</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <CloseIcon size={24} />
        <div style={{ fontSize: 10, color: 'var(--neutral-300)', marginTop: 4 }}>Close</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <UnityIcon size={24} color="var(--primary-300)" />
        <div style={{ fontSize: 10, color: 'var(--neutral-300)', marginTop: 4 }}>Unity</div>
      </div>
    </div>
  ),
};
