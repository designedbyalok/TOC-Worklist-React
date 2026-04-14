import { useState, useRef, useEffect } from 'react';
import { Icon } from '../Icon/Icon';
import { CloseIcon } from '../Icon/CloseIcon';
import { BotIcon } from '../Icon/BotIcon';
import { Button } from '../Button/Button';
import { ActionButton } from '../ActionButton/ActionButton';
import { Checkbox } from '../ui/checkbox';
import { useAppStore } from '../../store/useAppStore';
import styles from './BulkBar.module.css';

export function BulkBar() {
  const selectedIds = useAppStore(s => s.selectedIds);
  const clearSelected = useAppStore(s => s.clearSelected);
  const setShowInvokeModal = useAppStore(s => s.setShowInvokeModal);
  const showToast = useAppStore(s => s.showToast);
  const [showMore, setShowMore] = useState(false);
  const [visible, setVisible] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Show bar when selections appear
  useEffect(() => {
    if (selectedIds.length > 0) setVisible(true);
  }, [selectedIds.length]);

  const handleDismiss = () => {
    clearSelected();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.bulkBar}>
      <div className={styles.count}>
        <Checkbox
          checked={selectedIds.length > 0}
          onCheckedChange={() => clearSelected()}
          style={{ width: 20, height: 20 }}
        />
        <span className={styles.countText}>{selectedIds.length} Selected</span>
      </div>
      <div className={styles.divider} />
      <Button variant="secondary" size="S" leadingIcon="solar:user-check-rounded-linear" onClick={() => showToast('Change Assignee – coming soon')}>
        Change Assignee
      </Button>
      <Button variant="secondary" size="S" leadingIcon="solar:bolt-outline" onClick={() => showToast('Run Automation – coming soon')}>
        Run Automation
      </Button>
      <div className={styles.moreWrap} ref={moreRef}>
        <ActionButton
          icon="solar:menu-dots-linear"
          size="L"
          tooltip="More actions"
          onClick={(e) => { e.stopPropagation(); setShowMore(v => !v); }}
        />
        {showMore && (
          <div className={styles.moreDropdown}>
            <div className={styles.moreTitle}>More Actions</div>
            {[
              { icon: 'solar:letter-opened-linear', label: 'Run Campaign' },
              { icon: 'solar:letter-linear', label: 'Send Email' },
              { icon: 'solar:chat-line-linear', label: 'Send SMS' },
              { icon: 'solar:calendar-minimalistic-linear', label: 'Schedule Appointment' },
              { icon: 'solar:hand-pills-linear', label: 'Medical Reconciliation' },
              { icon: 'solar:clipboard-add-linear', label: 'Send Assessment' },
              { icon: 'solar:book-linear', label: 'Send Education' },
              { icon: 'solar:checklist-minimalistic-linear', label: 'Create Task' },
              { icon: 'solar:tag-horizontal-linear', label: 'Set Tag' },
            ].map(item => (
              <button key={item.label} className={styles.moreItem} onClick={() => showToast(`${item.label} – coming soon`)}>
                <Icon name={item.icon} size={16} color="var(--neutral-400)" />
                {item.label}
              </button>
            ))}
            <button className={styles.moreItem} onClick={() => { setShowMore(false); setShowInvokeModal(true); }}>
              <BotIcon size={16} color="var(--neutral-400)" />
              <span style={{ flex: 1 }}>Invoke Agent</span>
              <Icon name="solar:alt-arrow-right-linear" size={16} color="var(--neutral-300)" />
            </button>
            <div className={styles.moreDivider} />
            <button className={`${styles.moreItem} ${styles.danger}`} onClick={() => showToast('Removed from list')}>
              <Icon name="solar:trash-bin-2-linear" size={16} />
              Remove from List
            </button>
          </div>
        )}
      </div>
      <div className={styles.divider} />
      <button className={styles.closeBtn} title="Close" onClick={handleDismiss}>
        <CloseIcon size={20} color="var(--neutral-300)" />
      </button>
    </div>
  );
}
