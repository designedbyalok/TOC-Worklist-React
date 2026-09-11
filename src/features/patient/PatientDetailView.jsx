import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../../components/Icon/Icon';
import { PatientP360Banner } from './shell/PatientP360Banner/PatientP360Banner';
import { PatientProfileTabs } from './left-panel/PatientProfileTabs/PatientProfileTabs';
import { ProfileTabBar } from './shell/ProfileTabBar/ProfileTabBar';
import { CareManagementView } from './right-panel/tabs/care-management/CareManagementView/CareManagementView';
import { OverviewTab } from './right-panel/tabs/overview/OverviewTab/OverviewTab';
import { MonitoringTab } from './right-panel/tabs/monitoring/MonitoringTab';
import { PatientNotesTab } from './right-panel/tabs/notes/PatientNotesTab';
import { ClinicalNotePreviewDrawer } from '../tasks/ClinicalNotePreviewDrawer';
import { ProfileTab } from './left-panel/tabs/profile/ProfileTab/ProfileTab';
import { TasksTab } from './left-panel/tabs/tasks/TasksTab/TasksTab';
import { CcmTimerWidget } from './shell/CcmTimerWidget/CcmTimerWidget';
import { CcmTimerDockProvider } from './shell/CcmTimerWidget/CcmTimerDockContext';
import { CARE_GAP_TABS } from './data/careGapsMock';
import styles from './PatientDetailView.module.css';

// Left-panel collapse is remembered per user (keyed by profile id) in
// localStorage so it survives reloads. A `:last` mirror holds the most recent
// choice on this device and seeds the first paint before the user profile has
// loaded, so a single-user browser never flickers open→closed on reload.
const COLLAPSE_KEY = 'patientLeftPanelCollapsed';
function readCollapse(id) {
  try { return localStorage.getItem(`${COLLAPSE_KEY}:${id}`); } catch { return null; }
}
function writeCollapse(id, value) {
  try {
    localStorage.setItem(`${COLLAPSE_KEY}:${id}`, String(value));
    localStorage.setItem(`${COLLAPSE_KEY}:last`, String(value));
  } catch { /* storage unavailable (private mode) */ }
}

function TabPlaceholder({ tabName }) {
  return (
    <div className={styles.placeholder}>
      <Icon name="solar:widget-2-linear" size={40} color="var(--neutral-150)" />
      <span className={styles.placeholderTitle}>{tabName}</span>
      <span className={styles.placeholderText}>This section is under development</span>
    </div>
  );
}

// Every worklist (HCC, AWV, CCM, SNP, HEDIS) keeps its own member slice
// with a compact row shape (id, in, g, memberId, …). The patient banner
// expects the fuller patients-table shape, so we normalize any worklist
// row into that shape before the profile view consumes it.
function worklistMemberToPatient(m) {
  if (!m) return null;
  // Field naming diverges across slices: HCC/AWV use short `in`/`g`,
  // CCM/SNP/HEDIS use full `initials`/`gender`. Read both so a slice with
  // either shape flows through to the banner.
  const rawG = m.g ?? m.gender;
  return {
    id: m.id,
    memberId: m.memberId,
    name: m.name,
    initials: m.in || m.initials || (m.name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(),
    gender: rawG === 'M' ? 'Male' : rawG === 'F' ? 'Female' : (rawG || ''),
    age: m.age,
    dob: m.dob,
    pcp: m.pcp,
    rp: m.rp,
    language: m.language || 'en',
    patientAppActive: m.patientAppActive ?? false,
  };
}

export function PatientDetailView() {
  const selectedPatientId = useAppStore(s => s.selectedPatientId);
  const patients = useAppStore(s => s.patients);
  const hccMembers = useAppStore(s => s.hccMembers);
  const awvMembers = useAppStore(s => s.awvMembers);
  const ccmWorklistMembers = useAppStore(s => s.ccmWorklistMembers);
  const snpWorklistMembers = useAppStore(s => s.snpWorklistMembers);
  const hedisMembers = useAppStore(s => s.hedisMembers);
  const allPatients = useAppStore(s => s.allPatients);
  const fetchPatients = useAppStore(s => s.fetchPatients);
  const fetchHccMembers = useAppStore(s => s.fetchHccMembers);
  const fetchAwvMembers = useAppStore(s => s.fetchAwvMembers);
  const fetchCcmWorklistMembers = useAppStore(s => s.fetchCcmWorklistMembers);
  const fetchSnpWorklistMembers = useAppStore(s => s.fetchSnpWorklistMembers);
  const fetchHedisMembers = useAppStore(s => s.fetchHedisMembers);
  const fetchAllPatients = useAppStore(s => s.fetchAllPatients);
  const fetchOrgFeatures = useAppStore(s => s.fetchOrgFeatures);
  const navigateBackToWorklist = useAppStore(s => s.navigateBackToWorklist);
  const patientsLoading = useAppStore(s => s.patientsLoading);
  const patientsDidFetch = useAppStore(s => s.patientsDidFetch);
  const hccMembersLoading = useAppStore(s => s.hccMembersLoading);
  const hccMembersDidFetch = useAppStore(s => s.hccMembersDidFetch);
  const awvMembersLoading = useAppStore(s => s.awvMembersLoading);
  const awvMembersDidFetch = useAppStore(s => s.awvMembersDidFetch);
  const ccmWorklistLoading = useAppStore(s => s.ccmWorklistLoading);
  const ccmWorklistDidFetch = useAppStore(s => s.ccmWorklistDidFetch);
  const snpWorklistLoading = useAppStore(s => s.snpWorklistLoading);
  const snpWorklistDidFetch = useAppStore(s => s.snpWorklistDidFetch);
  const hedisLoading = useAppStore(s => s.hedisLoading);
  const hedisDidFetch = useAppStore(s => s.hedisDidFetch);
  const allPatientsLoading = useAppStore(s => s.allPatientsLoading);
  const allPatientsDidFetch = useAppStore(s => s.allPatientsDidFetch);
  // Active profile tab is stored on the store so callers (e.g. the CCM
  // worklist's "View billing" button) can deep-link into a specific tab.
  const activeTab = useAppStore(s => s.patientProfileTab);
  const setActiveTab = useAppStore(s => s.setPatientProfileTab);
  const currentUserId = useAppStore(s => s.currentUserProfile?.id);
  const [leftWidth, setLeftWidth] = useState(496);
  // Seed from the device's most recent choice so the first paint matches;
  // the per-user value is reconciled once the profile id resolves (below).
  const [leftCollapsed, setLeftCollapsed] = useState(() => readCollapse('last') === 'true');
  // Left-panel tab, lifted here so it survives collapse: when the panel is
  // collapsed its tabs flow into the right-panel tab bar and its content
  // renders in the right panel. `showingLeftContent` is only meaningful while
  // collapsed — true means a flowed-in left tab is the active view.
  const [leftTab, setLeftTab] = useState(CARE_GAP_TABS[0]);
  const [showingLeftContent, setShowingLeftContent] = useState(false);
  const dragging = useRef(false);
  const bodyRef = useRef(null);

  // Collapsed: the tab bar is the merged [right tabs, …left tabs]. Route a
  // click to the correct side and record which content the right panel shows.
  const handleRightTabChange = useCallback((key) => {
    if (leftCollapsed && CARE_GAP_TABS.includes(key)) {
      setLeftTab(key);
      setShowingLeftContent(true);
    } else {
      setActiveTab(key);
      setShowingLeftContent(false);
    }
  }, [leftCollapsed, setActiveTab]);

  // Once the signed-in user is known, load their saved collapse state (only if
  // they have one — a new user keeps the device default until they toggle).
  useEffect(() => {
    if (!currentUserId) return;
    const saved = readCollapse(currentUserId);
    if (saved !== null) setLeftCollapsed(saved === 'true');
  }, [currentUserId]);

  // Toggling the panel flows the left tabs back to the left panel; the right
  // panel returns to its own active tab, and the choice is persisted per user.
  const toggleLeft = useCallback(() => {
    setLeftCollapsed(c => {
      const next = !c;
      writeCollapse(currentUserId || 'anon', next);
      if (c) setShowingLeftContent(false); // expanding → right panel shows a right tab
      return next;
    });
  }, [currentUserId]);

  // While collapsed and viewing a flowed-in left tab, the tab bar's active key
  // is that left tab; otherwise it's the right tab.
  const barActiveTab = leftCollapsed && showingLeftContent ? leftTab : activeTab;

  // Keep the left panel mounted through the collapse animation so it slides
  // out (width + fade) instead of snapping, then unmount it. On expand it
  // mounts immediately and slides back in.
  const [leftMounted, setLeftMounted] = useState(!leftCollapsed);
  useEffect(() => {
    if (!leftCollapsed) { setLeftMounted(true); return undefined; }
    const t = setTimeout(() => setLeftMounted(false), 320); // matches CSS width transition
    return () => clearTimeout(t);
  }, [leftCollapsed]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e) => {
      if (!dragging.current || !bodyRef.current) return;
      const rect = bodyRef.current.getBoundingClientRect();
      const newWidth = Math.max(300, Math.min(700, e.clientX - rect.left));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Fall back through every worklist slice when the id isn't in the main
  // patients list — those rows live in separate slices and shouldn't 404.
  // Also match by memberId so a deep-link URL with the fold id (from
  // #/population/<list>/patient/<memberId>) resolves before the router's
  // reverse lookup has store data to work with.
  const matchesId = m => m && (m.id === selectedPatientId || String(m.memberId) === String(selectedPatientId));
  const patient = patients.find(matchesId)
    || worklistMemberToPatient(hccMembers.find(matchesId))
    || worklistMemberToPatient(awvMembers?.find(matchesId))
    || worklistMemberToPatient(ccmWorklistMembers?.find(matchesId))
    || worklistMemberToPatient(snpWorklistMembers?.find(matchesId))
    || worklistMemberToPatient(hedisMembers?.find(matchesId))
    || worklistMemberToPatient(allPatients?.find(matchesId));

  // Worklist slices don't all carry patient_app_active — merge from the
  // patients / all_patients tables when the resolved row is missing it.
  const patientWithAppStatus = useMemo(() => {
    if (!patient) return null;
    if (patient.patientAppActive != null) return patient;
    const byMember = (rows) => rows?.find(
      (r) => r.id === patient.id || String(r.memberId) === String(patient.memberId),
    );
    const source = byMember(patients) || byMember(allPatients);
    if (!source || source.patientAppActive == null) return patient;
    return { ...patient, patientAppActive: source.patientAppActive };
  }, [patient, patients, allPatients]);

  // The app assumes we're always inside a real patient's record — if the id
  // doesn't resolve to a patient (e.g. a stale hash from a deleted row, or a
  // worklist row wired to a placeholder id), bounce straight back to the
  // worklist instead of showing an orphan "Patient not found" screen.
  // A slice is still resolving when it's empty and either hasn't been fetched
  // yet or its fetch is in flight. Wait for every slice before deciding the
  // patient id is stale — otherwise the first slice to return (often
  // `patients`) trips the bounce while SNP/HCC rows are still loading.
  const slicePending = (items, didFetch, loading) =>
    (items?.length || 0) === 0 && (!didFetch || loading);
  const patientLookupPending = selectedPatientId && !patient && (
    slicePending(patients, patientsDidFetch, patientsLoading)
    || slicePending(hccMembers, hccMembersDidFetch, hccMembersLoading)
    || slicePending(awvMembers, awvMembersDidFetch, awvMembersLoading)
    || slicePending(ccmWorklistMembers, ccmWorklistDidFetch, ccmWorklistLoading)
    || slicePending(snpWorklistMembers, snpWorklistDidFetch, snpWorklistLoading)
    || slicePending(hedisMembers, hedisDidFetch, hedisLoading)
    || slicePending(allPatients, allPatientsDidFetch, allPatientsLoading)
  );

  // Cold-refresh into a patient URL (e.g. #/population/toc/patient/10003)
  // arrives with every worklist slice empty because no table has mounted
  // to trigger a fetch. Kick off every empty slice so the patient lookup
  // (matchesId across every slice) can resolve. Guarded by
  // `selectedPatientId && !patient` so this only fires while we're
  // actually stuck looking for a patient, not on normal profile mounts
  // where the row is already in memory.
  useEffect(() => { fetchOrgFeatures?.(); }, [fetchOrgFeatures]);

  useEffect(() => {
    if (!selectedPatientId || patient) return;
    if (patients.length === 0) fetchPatients?.();
    if (hccMembers.length === 0) fetchHccMembers?.();
    if ((awvMembers?.length || 0) === 0) fetchAwvMembers?.();
    if ((ccmWorklistMembers?.length || 0) === 0) fetchCcmWorklistMembers?.();
    if ((snpWorklistMembers?.length || 0) === 0) fetchSnpWorklistMembers?.();
    if ((hedisMembers?.length || 0) === 0) fetchHedisMembers?.();
    if ((allPatients?.length || 0) === 0) fetchAllPatients?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatientId, patient]);
  useEffect(() => {
    if (selectedPatientId && !patient && !patientLookupPending) navigateBackToWorklist();
  }, [selectedPatientId, patient, patientLookupPending, navigateBackToWorklist]);

  // Deep links carry the fold member id; normalize to the store row id once
  // slices load so downstream fetches (care programs, P360) query correctly.
  useEffect(() => {
    if (!patient?.id || !selectedPatientId || patient.id === selectedPatientId) return;
    if (String(patient.memberId) === String(selectedPatientId)) {
      useAppStore.setState({ selectedPatientId: patient.id });
    }
  }, [patient, selectedPatientId]);

  if (!patientWithAppStatus) return null;

  return (
    <CcmTimerDockProvider>
    <div className={styles.wrapper}>
      <PatientP360Banner patient={patientWithAppStatus} />
      <CcmTimerWidget />
      <div className={styles.body} ref={bodyRef}>
        {leftMounted && (
          <>
            <div
              className={`${styles.leftPanel} ${leftCollapsed ? styles.leftPanelCollapsed : ''}`}
              style={{ width: leftCollapsed ? 0 : leftWidth }}
            >
              {/* Fixed-width inner keeps the content's shape while the outer
                  clips it, so collapse reads as a slide rather than a reflow. */}
              <div className={styles.leftPanelInner} style={{ width: leftWidth }}>
                <PatientProfileTabs
                  patientId={selectedPatientId}
                  patient={patientWithAppStatus}
                  activeTab={leftTab}
                  onTabChange={setLeftTab}
                />
              </div>
            </div>
            {/* Drag handle — fades with the panel it borders. */}
            <div
              className={`${styles.dragHandle} ${leftCollapsed ? styles.dragHandleHidden : ''}`}
              onMouseDown={handleMouseDown}
            >
              <div className={styles.dragHandleLine} />
            </div>
          </>
        )}
        <div className={styles.rightPanel}>
          <ProfileTabBar
            activeTab={barActiveTab}
            onTabChange={handleRightTabChange}
            leftCollapsed={leftCollapsed}
            onToggleLeft={toggleLeft}
            extraTabs={leftCollapsed ? CARE_GAP_TABS : undefined}
          />
          <div className={styles.tabContent}>
            {leftCollapsed && showingLeftContent ? (
              // Left tabs flowed into this panel: render the left content here,
              // capped + centered so a narrow form doesn't stretch across the
              // now-full-width panel.
              <div className={styles.centeredContent}>
                <PatientProfileTabs
                  patientId={selectedPatientId}
                  patient={patientWithAppStatus}
                  activeTab={leftTab}
                  onTabChange={setLeftTab}
                  showTabBar={false}
                />
              </div>
            ) : activeTab === 'Overview' ? (
              <OverviewTab />
            ) : activeTab === 'Monitoring' ? (
              <MonitoringTab patient={patientWithAppStatus} />
            ) : activeTab === 'Notes' ? (
              <PatientNotesTab patient={patientWithAppStatus} />
            ) : activeTab === 'Care Management' ? (
              <CareManagementView />
            ) : activeTab === 'Profile' ? (
              <ProfileTab patient={patientWithAppStatus} />
            ) : activeTab === 'Tasks' ? (
              <TasksTab />
            ) : (
              <TabPlaceholder tabName={activeTab} />
            )}
          </div>
        </div>
      </div>
      <P360NotePreviewMount />
    </div>
    </CcmTimerDockProvider>
  );
}

/**
 * P360-level mount for the standalone `ClinicalNotePreviewDrawer`, driven
 * by the store's `previewNoteFromHover` slice. The P360 Notes tab (and
 * anywhere else on this page that calls `openNotePreview`) needs a mount
 * point — TasksView already owns one for the Tasks page, but P360 didn't
 * have one, so the Notes-tab View action was a silent no-op.
 */
function P360NotePreviewMount() {
  const previewNote = useAppStore(s => s.previewNoteFromHover);
  const closeNotePreview = useAppStore(s => s.closeNotePreview);
  if (!previewNote) return null;
  return (
    <ClinicalNotePreviewDrawer note={previewNote} onClose={closeNotePreview} />
  );
}
