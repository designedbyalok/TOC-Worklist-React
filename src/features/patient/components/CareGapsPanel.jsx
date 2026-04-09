import { useState, useRef, useEffect } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { StickyNote } from '../../../components/StickyNote/StickyNote';
import { StickyNoteAuditDrawer } from '../../../components/StickyNote/StickyNoteAuditDrawer';
import { useAppStore } from '../../../store/useAppStore';
import { CareGapSection } from './CareGapSection';
import { CARE_GAP_SECTIONS_EXTENDED, CARE_GAP_TABS } from '../data/careGapsMock';
import styles from './CareGapsPanel.module.css';

export function CareGapsPanel({ patientId }) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGaps, setSelectedGaps] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const searchRef = useRef(null);

  const stickyNotes = useAppStore(s => s.stickyNotes);
  const fetchStickyNotes = useAppStore(s => s.fetchStickyNotes);
  const createStickyNote = useAppStore(s => s.createStickyNote);
  const updateStickyNote = useAppStore(s => s.updateStickyNote);
  const deleteStickyNote = useAppStore(s => s.deleteStickyNote);

  useEffect(() => { if (patientId) fetchStickyNotes(patientId); }, [patientId]);

  useEffect(() => { if (searching && searchRef.current) searchRef.current.focus(); }, [searching]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') { setSearching(false); setSearchQuery(''); }
  };

  const toggleGap = (id) => {
    setSelectedGaps(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  // Filter care gaps by search query
  const filteredSections = CARE_GAP_SECTIONS_EXTENDED.map(section => ({
    ...section,
    items: searchQuery
      ? section.items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : section.items,
  }));

  return (
    <div className={styles.panel}>
      {/* Tab bar OR search input */}
      {searching ? (
        <div className={styles.searchBar}>
          <input
            ref={searchRef}
            className={styles.searchInput}
            placeholder="Search gaps"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button className={styles.searchClose} onClick={() => { setSearching(false); setSearchQuery(''); }} aria-label="Close search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-300)" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
      ) : (
        <div className={styles.tabRow}>
          {CARE_GAP_TABS.map((tab, i) => (
            <button key={tab} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`} onClick={() => setActiveTab(i)}>
              {tab}
            </button>
          ))}
          <button className={styles.searchIcon} onClick={() => setSearching(true)} aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-300)" strokeWidth="1.5"><circle cx="11.5" cy="11.5" r="9.5" /><path strokeLinecap="round" d="M18.5 18.5L22 22" /></svg>
          </button>
        </div>
      )}

      {/* Sticky Note (replaces static alert header) */}
      <StickyNote
        notes={stickyNotes}
        onSave={(id, text) => updateStickyNote(id, { text, author_name: 'You' }, patientId)}
        onCreate={(text) => createStickyNote({ patient_id: patientId, text, author_name: 'You', ehr_profile: 'Central Profile' })}
        onDelete={(id) => deleteStickyNote(id, patientId)}
        onAuditLog={() => setShowAuditDrawer(true)}
      />

      {/* Audit Log Drawer */}
      {showAuditDrawer && (
        <StickyNoteAuditDrawer
          patientId={patientId}
          note={stickyNotes[0]}
          profileOptions={['Central Profile', 'APC', 'JADE Health']}
          onClose={() => setShowAuditDrawer(false)}
        />
      )}

      {activeTab === 0 && (
        <>
          {/* Care Gaps header */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Care Gaps</span>
            <div className={styles.sectionActions}>
              <span className={styles.viewBy}>View By: Action</span>
              <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-300)" />
              <span className={styles.filterDivider} />
              <ActionButton icon="solar:filter-linear" size="S" tooltip="Filter" />
            </div>
          </div>

          {/* Care gap sections */}
          <div className={styles.sections}>
            {filteredSections.map(section => (
              <CareGapSection key={section.title} section={section} selectedGaps={selectedGaps} onToggleGap={toggleGap} />
            ))}
          </div>
        </>
      )}

      {activeTab !== 0 && (
        <div className={styles.placeholder}>
          <Icon name="solar:document-text-linear" size={32} color="var(--neutral-150)" />
          <span>Coming soon</span>
        </div>
      )}
    </div>
  );
}
