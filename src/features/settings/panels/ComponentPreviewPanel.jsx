import { Icon } from '../../../components/Icon/Icon';

/**
 * Preview mode for embedded components.
 * Shows mockups of how the component renders across selected surfaces.
 * TODO: Full implementation in next phase.
 */
export function ComponentPreviewPanel() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <Icon name="solar:eye-linear" size={40} color="var(--neutral-150)" />
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--neutral-400)', margin: '12px 0 4px' }}>
        Preview Mode
      </p>
      <p style={{ fontSize: 13, color: 'var(--neutral-200)' }}>
        Component preview with surface switcher and dev console — coming soon.
      </p>
    </div>
  );
}
