import { Avatar } from './Avatar';

export default {
  title: 'Core/Avatar',
  component: Avatar,
  argTypes: {
    initials: { control: 'text' },
    variant: { control: 'select', options: ['patient', 'agent', 'provider', 'assignee'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export const Patient = { args: { variant: 'patient', initials: 'AB' } };
export const Agent = { args: { variant: 'agent', initials: 'E' } };
export const Large = { args: { variant: 'patient', initials: 'JR', size: 'lg' } };

export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar variant="patient" initials="SM" size="sm" />
      <Avatar variant="patient" initials="MD" />
      <Avatar variant="patient" initials="LG" size="lg" />
    </div>
  ),
};
