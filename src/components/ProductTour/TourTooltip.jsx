import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import styles from './ProductTour.module.css';

/**
 * Custom tooltip for React Joyride — uses Fold Health design system.
 *
 * Receives TooltipRenderProps from Joyride:
 * - continuous, index, step, size (total steps)
 * - backProps, closeProps, primaryProps, skipProps, tooltipProps
 */
export function TourTooltip({
  continuous,
  index,
  step,
  size,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}) {
  const isFirst = index === 0;
  const isLast = index === size - 1;

  return (
    <div className={styles.tooltip} {...tooltipProps}>
      {/* Close button */}
      <button className={styles.closeBtn} {...closeProps}>
        <Icon name="solar:close-linear" size={16} color="var(--neutral-300)" />
      </button>

      {/* Step icon + content */}
      <div className={styles.tooltipBody}>
        {step.icon && (
          <div className={styles.tooltipIcon}>
            <Icon name={step.icon} size={20} color="var(--primary-300)" />
          </div>
        )}
        <div className={styles.tooltipContent}>
          {step.title && <h4 className={styles.tooltipTitle}>{step.title}</h4>}
          {step.content && <p className={styles.tooltipDesc}>{step.content}</p>}
        </div>
      </div>

      {/* Footer: progress + navigation */}
      <div className={styles.tooltipFooter}>
        <div className={styles.tooltipProgress}>
          {Array.from({ length: size }, (_, i) => (
            <span
              key={i}
              className={`${styles.progressDot} ${i === index ? styles.progressDotActive : ''} ${i < index ? styles.progressDotDone : ''}`}
            />
          ))}
          <span className={styles.stepCount}>{index + 1} of {size}</span>
        </div>
        <div className={styles.tooltipActions}>
          {!isFirst && (
            <Button variant="ghost" size="S" {...backProps}>
              Back
            </Button>
          )}
          {isFirst && size > 1 && (
            <Button variant="ghost" size="S" {...skipProps}>
              Skip Tour
            </Button>
          )}
          {continuous && (
            <Button variant="primary" size="S" {...primaryProps}>
              {isLast ? 'Done' : 'Next'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
