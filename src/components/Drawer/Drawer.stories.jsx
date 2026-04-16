import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from '../Button/Button';

export default {
  title: 'Layout/Drawer',
  parameters: { layout: 'fullscreen' },
};

function DrawerDemo({ title = 'Drawer Title', footer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 24 }}>
      <Button variant="primary" onClick={() => setOpen(true)}>Open Drawer</Button>
      {open && (
        <Drawer title={title} onClose={() => setOpen(false)} footer={footer}>
          <div style={{ padding: 16 }}>
            <p style={{ color: 'var(--neutral-400)', fontSize: 14, lineHeight: 1.6 }}>
              This is the shared Drawer component — 700px wide, 8px inset, 16px border-radius.
              Used across the entire app for all side panels (call queue, detail view, preferences, HCC diagnosis review, etc.).
            </p>
            <p style={{ color: 'var(--neutral-300)', fontSize: 13, marginTop: 12 }}>
              Click the overlay or the close button to dismiss.
            </p>
          </div>
        </Drawer>
      )}
    </div>
  );
}

export const Default = {
  render: () => <DrawerDemo />,
};

export const WithFooter = {
  render: () => (
    <DrawerDemo
      title="Edit Patient"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      }
    />
  ),
};
