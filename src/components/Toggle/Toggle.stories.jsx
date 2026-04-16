import { useState } from 'react';
import { Toggle } from './Toggle';

export default {
  title: 'Core/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['S', 'M'], description: 'S = 28px/13px, M = 32px/14px' },
    fullWidth: { control: 'boolean', description: 'Flex buttons to fill width' },
  },
};

function Wrapper(props) {
  const items = props.items || ['Option A', 'Option B'];
  const [active, setActive] = useState(typeof items[0] === 'string' ? items[0] : items[0]?.key);
  return <Toggle {...props} items={items} active={active} onChange={setActive} />;
}

export const Playground = {
  render: (args) => <Wrapper {...args} />,
  args: { items: ['HCC', 'ICD'], size: 'M', fullWidth: false },
};

export const AllExamples = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div><span style={{ fontSize: 12, color: 'var(--neutral-300)', marginBottom: 4, display: 'block' }}>2 options</span><Wrapper items={['HCC', 'ICD']} /></div>
      <div><span style={{ fontSize: 12, color: 'var(--neutral-300)', marginBottom: 4, display: 'block' }}>3 options</span><Wrapper items={['Workflow', 'Configure', 'Analytics']} /></div>
      <div><span style={{ fontSize: 12, color: 'var(--neutral-300)', marginBottom: 4, display: 'block' }}>Key/label (compact)</span><Wrapper items={[{ key: 'pmpm', label: 'PMPM' }, { key: 'total', label: 'Total Cost' }]} size="S" /></div>
      <div style={{ width: 260 }}><span style={{ fontSize: 12, color: 'var(--neutral-300)', marginBottom: 4, display: 'block' }}>Full width</span><Wrapper items={['Node', 'Components']} fullWidth /></div>
    </div>
  ),
};
