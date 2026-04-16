import { useRef, useState, useCallback, useEffect } from 'react';
import styles from './Toggle.module.css';

/**
 * Fold Health Toggle — animated segmented control with a sliding pill indicator.
 *
 * Extracted from the agent-builder NodePanel toggle. Uses `data-active` + JS
 * offset tracking to animate the pill to the selected option's position.
 *
 * Props:
 *  - items      (string[] | {key:string, label:string}[])
 *                 Segments. Strings are used as both key and label.
 *                 Objects let you decouple the stored value from the display text.
 *  - active     (string)     Currently selected key (or label if items are strings)
 *  - onChange   (function)   Called with the key of the clicked segment
 *  - className  (string)     Extra class on the outer container
 *  - size       ('S'|'M')    S = compact (height 28px, font 13px), M = default (height 32px, font 14px)
 *  - fullWidth  (boolean)    If true, each button flexes equally to fill available width
 */
export function Toggle({ items = [], active, onChange, className, size = 'M', fullWidth = false }) {
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({});

  // Normalize items to { key, label } shape
  const normalized = items.map(item =>
    typeof item === 'string' ? { key: item, label: item } : item,
  );

  const updateSlider = useCallback(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      setSliderStyle({ left: activeBtn.offsetLeft, width: activeBtn.offsetWidth });
    }
  }, []);

  useEffect(() => { updateSlider(); }, [active, updateSlider]);
  useEffect(() => { requestAnimationFrame(updateSlider); }, [updateSlider]);

  const sizeClass = size === 'S' ? styles.sizeS : styles.sizeM;

  return (
    <div
      ref={containerRef}
      className={[styles.toggle, sizeClass, fullWidth ? styles.fullWidth : '', className || ''].filter(Boolean).join(' ')}
      role="radiogroup"
    >
      <div className={styles.slider} style={sliderStyle} />
      {normalized.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={active === key}
          data-active={active === key}
          className={`${styles.btn} ${active === key ? styles.btnActive : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
