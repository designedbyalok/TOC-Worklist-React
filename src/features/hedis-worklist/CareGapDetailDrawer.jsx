import { useState, useEffect, useRef } from 'react';
import { Drawer } from '../../components/Drawer/Drawer';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { ClinicalNotePanel } from './ClinicalNotePanel';
import { useClinicalNotePanel } from './useClinicalNotePanel';
import { ClinicalNoteWorkspaceBody, ConsolidatedNoteBody, HeaderActions as ClinicalNoteHeaderActions } from './ClinicalNotePanelParts';
import { ReviewerPickerPopover } from './ReviewerPickerPopover';
import { ClinicalNotesTab } from './ClinicalNotesTab';
import { ClinicalNotePreviewBody } from './ClinicalNotePreviewBody';
import { MeasureInfoBody } from './MeasureInfoBody';
import { TasksTab } from '../patient/left-panel/tabs/tasks/TasksTab/TasksTab';
import { groupTasksForTab } from '../patient/left-panel/tabs/tasks/TasksTab/groupTasksForTab';
import { TaskDetailDrawer } from '../tasks/TaskDetailDrawer';
import { useAddTaskDrawer } from '../tasks/useAddTaskDrawer';
import { AddTaskDrawerBody } from '../tasks/AddTaskDrawerBody';
import { useScheduleDrawer } from '../../components/ScheduleDrawer/useScheduleDrawer';
import { ScheduleDrawerBookingBody } from '../../components/ScheduleDrawer/ScheduleDrawerBookingForm';
import { CloseButton } from '../../components/CloseButton/CloseButton';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { PatientBanner } from '../../components/PatientBanner/PatientBanner';
import { ActionButton } from '../../components/ActionButton/ActionButton';
import { Icon } from '../../components/Icon/Icon';
import { TabStrip } from '../../components/TabStrip/TabStrip';
import { MenuPopover } from '../../components/MenuPopover/MenuPopover';
import { ActivityLog } from '../../components/ActivityLog/ActivityLog';
import { CardSkeleton } from '../../components/CardSkeleton/CardSkeleton';
import { OutreachTab } from '../patient/left-panel/tabs/outreach/OutreachTab/OutreachTab';
import { OUTREACH_LOG_COUNT } from '../patient/data/outreachLogMock';
import { useAppStore } from '../../store/useAppStore';
import { TABS, MORE_ACTIONS, toActivityLogEntries } from './CareGapDetailDrawer.utils';
import { CareGapDetailDrawerHeader } from './CareGapDetailDrawerHeader';
import styles from './CareGapDetailDrawer.module.css';

// Compact MM/DD/YYYY formatter used by the preview subtitle. Kept local
// so the drawer file doesn't reach into date-utils modules for a one-off.
function formatPreviewDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export function CareGapDetailDrawer({ member, gapCode, year, onClose }) {
  const showToast = useAppStore(s => s.showToast);
  const updateGapStatus = useAppStore(s => s.updateGapStatus);
  const updateGapAssignee = useAppStore(s => s.updateGapAssignee);
  const logCareGapActivity = useAppStore(s => s.logCareGapActivity);
  const currentActorName = useAppStore(s => s.currentActorName);
  const activityEntries = useAppStore(s => s.caregapActivity[member?.id]);
  const platformUsers = useAppStore(s => s.platformUsers);
  const fetchPlatformUsers = useAppStore(s => s.fetchPlatformUsers);
  useEffect(() => { fetchPlatformUsers(); }, [fetchPlatformUsers]);
  const caregapActivityLoaded = useAppStore(s => s.caregapActivityLoaded);
  const fetchCaregapActivity = useAppStore(s => s.fetchCaregapActivity);
  useEffect(() => { fetchCaregapActivity(); }, [fetchCaregapActivity]);
  const appointments = useAppStore(s => s.appointments);
  const fetchAppointments = useAppStore(s => s.fetchAppointments);
  useEffect(() => { fetchAppointments?.(); }, [fetchAppointments]);
  // Clinical notes + tasks slices used by the Clinical Notes and Tasks tabs.
  const memberNotes = useAppStore(s => (member?.id ? s.clinicalNotesByMember?.[member.id] : null)) || [];
  const fetchClinicalNotesForMember = useAppStore(s => s.fetchClinicalNotesForMember);
  useEffect(() => { if (member?.id) fetchClinicalNotesForMember?.(member.id); }, [member?.id, fetchClinicalNotesForMember]);
  const allTasks = useAppStore(s => s.tasks);
  // Populate the tasks slice on mount so the nested "Preview task" eye
  // on Pending Review / Sign-off cards can resolve their linked task
  // (allTasks.find(t => t.id === reviewTask.taskId)). Without this,
  // `state.tasks` is empty when the user opens the Care Gap drawer
  // directly (bypassing Home / TasksView) and the eye silently no-ops.
  // fetchTasks is idempotent (tasksDidFetch guard) so this is cheap.
  const fetchTasks = useAppStore(s => s.fetchTasks);
  useEffect(() => { fetchTasks?.(); }, [fetchTasks]);
  // The eye affordance inside the Clinical Notes tab (and Activity Log) can
  // navigate to the Tasks page for a linked sign-off task. When that
  // navigation fires (activePage flips to 'tasks'), close this drawer so
  // the reviewer isn't looking at the Tasks page through our overlay.
  const activePage = useAppStore(s => s.activePage);
  useEffect(() => { if (activePage === 'tasks') onClose?.(); }, [activePage, onClose]);
  // Slice appointments to just this member. Supabase persists patient_id,
  // so a save from the inline Schedule pane immediately shows up here
  // after fetchAppointments refreshes.
  const memberAppointments = (appointments || []).filter(a => a.patient_id === member?.id);

  const gaps = member?.gaps ?? [];
  const [currentCode, setCurrentCode] = useState(gapCode);
  const gapKey = `${member?.id ?? ''}|${gapCode ?? ''}`;
  const [prevGapKey, setPrevGapKey] = useState(gapKey);
  if (prevGapKey !== gapKey) { setPrevGapKey(gapKey); setCurrentCode(gapCode); }

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusAnchorRect, setStatusAnchorRect] = useState(null);

  const [selectedYear, setSelectedYear] = useState(year);
  const [prevYear, setPrevYear] = useState(year);
  if (prevYear !== year) { setPrevYear(year); setSelectedYear(year); }
  const [yearOpen, setYearOpen] = useState(false);
  const yearOptions = [year, year - 1, year - 2];

  const moreBtnRef = useRef(null);
  const [moreMenuRect, setMoreMenuRect] = useState(null);
  const openMoreMenu = () => { const r = moreBtnRef.current?.getBoundingClientRect(); if (r) setMoreMenuRect(r); };
  const closeMoreMenu = () => setMoreMenuRect(null);
  // Route Add Note based on how many gaps are open for this member.
  //   >1 → consolidated ClinicalNotePanel drawer (stacked-sections layout).
  //    1 → inline single-gap workspace on this drawer's left pane.
  // Matches Figma 872:76360.
  const openClinicalNoteFlow = () => {
    if (openGapCount > 1) setShowClinicalNote(true);
    else setLeftWorkspace('clinical-note');
  };
  const runMoreAction = (a) => {
    closeMoreMenu();
    if (a.openClinicalNote) openClinicalNoteFlow();
    else if (a.key === 'task') setLeftWorkspace('task');
    else if (a.key === 'appointment') setLeftWorkspace('schedule');
    else showToast(`${a.label} — coming soon`);
  };

  const [activeTab, setActiveTab] = useState('Activity Log');
  const [showClinicalNote, setShowClinicalNote] = useState(false);
  // Single-slot left workspace — only one workspace mounts at a time
  // ('task' | 'schedule' | null). Sharing the slot means widening the
  // drawer, mounting the banner inline, and running the collapse
  // animation all key off the same state instead of two parallel flags.
  const [leftWorkspace, setLeftWorkspace] = useState(null);
  // Track which clinical note the eye affordance opened so the preview
  // pane can resolve the exact note (signed vs. pending) instead of the
  // first note that happens to cover the current gap code. Without this,
  // clicking the Signed eye showed the Pending Review card because
  // `memberNotes.find` returned the first match for the gap.
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  // Called from the note-card eye affordance. Signed notes open a read-
  // only summary view (ClinicalNotePreviewBody) matching Figma 511:105429.
  // Draft / Pending Review notes open the editable workspace so the
  // author can amend before the reviewer signs. useClinicalNotePanel's
  // draft-restore effect (upstream 3e0aa74) hydrates the form fields from
  // the newest saved note for that gap so nothing extra is needed on the
  // editable path.
  const [amendNoteId, setAmendNoteId] = useState(null);
  const openNoteInWorkspace = (dc) => {
    if (!dc?.gapCode && !dc?.noteId && !dc?.id) return;
    if (dc.gapCode) {
      const found = gaps.find(g => g.code === dc.gapCode);
      if (found) setCurrentCode(found.code);
    }
    // Remember the exact note the user clicked so the preview pane
    // resolves that note (via memberNotes.find by id) instead of the
    // first note that covers the gap. Fixes the "Signed eye showed
    // Pending Review" bug when a member has multiple notes for the
    // same gaps.
    if (dc.noteId) setSelectedNoteId(dc.noteId);
    else if (dc.id) setSelectedNoteId(dc.id);
    else setSelectedNoteId(null);
    // Eye behavior per role/state — same underlying note record for
    // both users. NEVER creates a duplicate note; permissions are
    // decided by the current user's relationship to the note.
    //   • Draft                            → inline editable (author).
    //   • Signed                           → read-only preview (Amend
    //                                        flips to editor per audit
    //                                        rules — existing behavior).
    //   • Pending Review AND current user
    //     is the assigned reviewer         → editable consolidated view
    //                                        directly (no extra Edit
    //                                        click) — Provider path.
    //   • Pending Review AND current user
    //     is anyone else (author / NP)     → read-only preview with
    //                                        Edit affordance to flip
    //                                        into the editable
    //                                        consolidated view — NP
    //                                        path.
    if (dc.status === 'Draft') {
      setAmendNoteId(dc.noteId || null);
      setLeftWorkspace('clinical-note');
      return;
    }
    if (dc.status === 'Pending Review' || dc.status === 'Submitted') {
      const noteForClick = dc.noteId
        ? memberNotes.find(n => n.id === dc.noteId)
        : memberNotes.find(n => (n.gapCodes || []).includes(dc.gapCode));
      const iAmReviewer = !!noteForClick
        && !!noteForClick.reviewerName
        && noteForClick.reviewerName === currentActorName();
      setAmendNoteId(null);
      setLeftWorkspace(iAmReviewer ? 'clinical-note-consolidated' : 'clinical-note-preview');
      return;
    }
    setAmendNoteId(null);
    setLeftWorkspace('clinical-note-preview');
  };
  const [commentText, setCommentText] = useState('');
  const [commentExpanded, setCommentExpanded] = useState(false);
  const [inPlaceTaskId, setInPlaceTaskId] = useState(null);
  const inPlaceTaskRaw = inPlaceTaskId ? (allTasks || []).find(t => t.id === inPlaceTaskId) : null;
  const inPlaceTask = inPlaceTaskRaw ? {
    ...inPlaceTaskRaw,
    hedisMemberId: inPlaceTaskRaw.hedisMemberId || member?.id,
    hedisGapCodes: inPlaceTaskRaw.hedisGapCodes || (currentCode ? [currentCode] : []),
  } : null;
  const handleOpenTaskInPlace = (taskIdOrObj) => {
    const id = typeof taskIdOrObj === 'object' ? taskIdOrObj?.id : taskIdOrObj;
    if (!id) return;
    // Open the task in the drawer's own left workspace (like Add Task /
    // Schedule / Clinical Note) instead of a separate TaskDetailDrawer.
    // Reviewers get task context inline while still seeing the Care Gap
    // Details right pane behind it.
    setInPlaceTaskId(id);
    setLeftWorkspace('task-detail');
  };

  // Open-gap count drives the "Add Note" routing rule (see openClinicalNoteFlow).
  // Mirrors the hook's own filter so both counts agree.
  const openGapCount = (member?.gaps ?? [])
    .filter(g => g.status !== 'Completed' && !String(g.status).startsWith('Closed'))
    .length;

  // Both workspace hooks are called unconditionally (React rules) and
  // their outputs only wire into the UI when their key is active.
  const addTask = useAddTaskDrawer({
    defaultStatus: undefined,
    initialMember: member?.name || '',
    onTaskCreated: (task) => {
      showToast('Task created');
      // Log an activity entry so the Care Gap Drawer's Activity Log
      // shows the create action, and close the left workspace so the
      // Tasks tab (which reads from the store) is immediately visible.
      logCareGapActivity(member?.id, {
        title: 'Task Added',
        detail: task?.name || 'Task',
        actor: currentActorName(),
        icon: 'solar:clipboard-list-linear',
        t: 'task',
        gapCodes: [currentCode],
        detailCard: {
          taskId: task?.id,
          title: task?.name || 'Task',
          assignee: task?.assigned_to || null,
          priority: task?.priority || 'none',
          status: task?.status === 'completed' ? 'Completed' : 'Pending',
        },
      });
      runLeftClose();
    },
    // hedisMemberId lets the Tasks tab filter reliably (member.name is
    // fragile — two members can share a display name). extraFields is
    // spread into the task payload by useAddTaskDrawer.
    extraFields: { hedisMemberId: member?.id, careGap: currentCode, measurementYear: selectedYear },
    // These three fields have no columns in public.tasks — strip them
    // before the Supabase INSERT so the row is actually persisted (they
    // stay on the in-memory task object for the drawer's own use).
    dbOmit: ['hedisMemberId', 'careGap', 'measurementYear'],
  });
  const scheduleDrawer = useScheduleDrawer({
    onClose: () => closeLeftWorkspace(),
    // On successful create, surface a toast, log an activity entry so the
    // Activity feed reflects the schedule action, and refresh the list
    // (the hook already calls createAppointment + fetchAppointments, but
    // this guarantees the local `memberAppointments` slice is up to date
    // before the pane collapses).
    onSave: (row) => {
      showToast('Appointment scheduled');
      // Match Figma 1230:74055 — Activity entry is a detail card with the
      // appointment type as title, a "date, time · provider" subtitle, and
      // the appointment's own status pill (default Scheduled).
      const subtitleBits = [];
      if (row?.date) subtitleBits.push(row.date);
      if (row?.time_start) subtitleBits.push(row.time_end ? `${row.time_start} – ${row.time_end}` : row.time_start);
      const subtitleLeft = subtitleBits.join(', ');
      const provider = row?.primary_user || '';
      logCareGapActivity(member.id, {
        when: new Date().toISOString(),
        actor: currentActorName(),
        t: 'appointment',
        title: 'Appointment Scheduled',
        detailCard: {
          title: row?.appointment_type_name || 'Appointment',
          subtitle: [subtitleLeft, provider].filter(Boolean).join(' • '),
          status: row?.status || 'Scheduled',
        },
      });
      fetchAppointments?.();
    },
    // Pre-populate the patient using the current gap's member. Passing the
    // synthesized object (not just an id) skips the patients.find lookup —
    // HEDIS members don't share ids with the appointments' patients table.
    initialSelectedPatient: member && {
      id: member.id,
      name: member.name,
      gender: member.gender,
      age: member.age,
      dob: member.dob,
      facility: member.facility,
      laceScore: member.laceScore,
    },
  });
  // Inline single-gap Clinical Note hook — always mounted (React rules) but
  // only wired into the UI when leftWorkspace === 'clinical-note' /
  // 'clinical-note-consolidated' / 'clinical-note-preview'. selectedNoteId
  // hydrates the form from the exact note the eye affordance opened;
  // amendNoteId seeds the form from that note's persisted payload when the
  // Amend button is clicked from a preview.
  const clinicalNote = useClinicalNotePanel({
    member,
    gapCode: currentCode,
    selectedNoteId,
    amendNoteId,
    onClose: () => { setAmendNoteId(null); runLeftClose(); },
  });

  // Two-phase close so the drawer collapses with the same easing it opens
  // with. Phase 1 (250ms) — drawer.width transitions 1280 → 700 while the
  // left pane is still mounted; its flex space shrinks in lock-step so it
  // reads as sliding back into the right pane. Phase 2 — actually unmount.
  const [leftClosing, setLeftClosing] = useState(false);
  const runLeftClose = () => {
    setLeftClosing(true);
    setTimeout(() => { setLeftWorkspace(null); setLeftClosing(false); setSelectedNoteId(null); setAmendNoteId(null); setInPlaceTaskId(null); }, 250);
  };
  const closeLeftWorkspace = () => {
    // Task workspace has a "discard unsaved changes?" guard; the scheduler
    // discards silently for parity with its standalone usage.
    if (leftWorkspace === 'task' && addTask.guardClose() === false) return;
    // Clear the selected note so the next preview starts from currentCode
    // rather than a stale id.
    setSelectedNoteId(null);
    if (leftWorkspace === 'clinical-note' && amendNoteId) setAmendNoteId(null);
    runLeftClose();
  };
  const inSplit = !!leftWorkspace || leftClosing;
  const isExpanded = !!leftWorkspace && !leftClosing;

  if (!member || gaps.length === 0) return null;

  const idx = Math.max(0, gaps.findIndex(g => g.code === currentCode));
  const gap = gaps[idx] ?? gaps[0];
  const canPrev = idx > 0;
  const canNext = idx < gaps.length - 1;
  const status = gap?.status ?? 'Open';
  const statusLocked = status === 'Completed';
  const activityLogEntries = toActivityLogEntries(activityEntries);
  // Clinical Notes tab is DB-driven (clinicalNotesByMember) so it shows the
  // current state per note — a Pending Review note that is later Signed
  // updates in place instead of appearing as two rows. Activity Log keeps
  // both history entries; the Notes tab mirrors the DB's single row per
  // note, which is what the user expects ("should have updated the Below
  // Consolidated note status to signed instead of creating 1 more duplicate").
  const clinicalNoteEntries = (() => {
    const notes = memberNotes || [];
    if (notes.length === 0) return [];
    const mapped = notes.map(n => {
      const rawStatus = n.status;
      const statusLabel = rawStatus === 'submitted' ? 'Pending Review' : rawStatus === 'signed' ? 'Signed' : rawStatus === 'draft' ? 'Draft' : String(rawStatus || '');
      const gapList = n.gapCodes || [];
      const isMulti = gapList.length > 1;
      const title = isMulti ? 'Consolidated Clinical Note' : (gapList[0] ? `${gapList[0]} Visit Note` : 'Clinical Note');
      const chip = isMulti ? `${gapList.length} Gaps` : undefined;
      let subtitle = '';
      if (rawStatus === 'draft') {
        subtitle = `Save as Draft by ${n.authorName || '—'}`;
      } else if (rawStatus === 'submitted') {
        subtitle = n.reviewerName ? `Submitted for Review to ${n.reviewerName}` : 'Submitted for Review';
      } else if (rawStatus === 'signed') {
        const signer = n.signedByName || n.reviewerName || n.authorName || 'Provider';
        const when = n.signedAt ? ` · ${formatPreviewDate(n.signedAt)}` : '';
        subtitle = `Signed by ${signer}${when}`;
      }
      // Attach the linked review task only while the note is still pending;
      // once signed the task is complete and the nested card should disappear
      // (fixes "below entry those action will not be visible").
      let reviewTask = null;
      if (rawStatus === 'submitted' && n.reviewTaskId) {
        const t = (allTasks || []).find(x => String(x.id) === String(n.reviewTaskId));
        if (t) {
          const s = String(t.status || '').toLowerCase();
          if (s !== 'completed') {
            reviewTask = {
              taskId: t.id,
              title: t.name || `Request for Sign-off - ${title}`,
              assignee: t.assigned_to || n.reviewerName || '',
              status: 'Pending',
            };
          }
        } else {
          reviewTask = {
            taskId: n.reviewTaskId,
            title: `Request for Sign-off - ${title}`,
            assignee: n.reviewerName || '',
            status: 'Pending',
          };
        }
      }
      const when = n.signedAt || n.updatedAt || n.createdAt || new Date().toISOString();
      return {
        id: `note-${n.id}`,
        t: 'clinical_note',
        when,
        at: when,
        actor: n.authorName || n.signedByName || 'Provider',
        title,
        gapCodes: gapList,
        detailCard: {
          noteId: n.id,
          memberId: member.id,
          gapCode: gapList[0] || currentCode,
          gapCodes: gapList,
          title,
          chip,
          status: statusLabel,
          subtitle,
          reviewTask,
          pdfDataUrl: n.pdfDataUrl || null,
        },
      };
    });
    return toActivityLogEntries(mapped);
  })();
  // Count of actual note entries (excludes month-group headers) — used for
  // the tab label and empty-state gating.
  const clinicalNoteCount = clinicalNoteEntries.filter(e => e.t === 'clinical_note').length;
  // Tasks tab lists every task tied to this HEDIS member — sign-off tasks
  // (created by createCareGapSignOffTask) always have hedisMemberId set;
  // manually created tasks land here via the `member` denormalized field.
  const memberTasks = (allTasks || []).filter(
    t => (t.hedisMemberId && t.hedisMemberId === member?.id)
      || (member?.name && t.member === member.name),
  );
  const openTaskDetail = (task) => handleOpenTaskInPlace(task);
  const tabCounts = {
    'Activity Log': activityEntries?.length ?? 0,
    Outreaches: OUTREACH_LOG_COUNT,
    'Appt/Reminders': memberAppointments.length,
    'Clinical Notes': clinicalNoteCount,
    Tasks: memberTasks.length,
  };

  const goPrev = () => { if (canPrev) { setCurrentCode(gaps[idx - 1].code); setStatusOpen(false); } };
  const goNext = () => { if (canNext) { setCurrentCode(gaps[idx + 1].code); setStatusOpen(false); } };

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text) return;
    logCareGapActivity(member.id, { when: new Date().toISOString(), actor: currentActorName(), t: 'comment', title: 'Added a Comment', commentBody: text });
    setCommentText('');
    setCommentExpanded(false);
  };

  return (
    <>
      {showClinicalNote && (
        <ClinicalNotePanel member={member} gapCode={gap.code} year={selectedYear} onClose={() => setShowClinicalNote(false)} />
      )}
      {/* The task detail no longer opens as its own standalone Drawer —
          it renders inline as the left workspace when leftWorkspace ===
          'task-detail' (see the leftPane branches below). */}
      {addTask.showCloseConfirm && (
        <ConfirmDialog
          icon="solar:danger-triangle-linear"
          iconColor="var(--status-warning)"
          title="Discard unsaved task?"
          description="You have unsaved changes. Closing now will discard them."
          confirmLabel="Discard"
          cancelLabel="Keep editing"
          variant="error"
          onConfirm={() => { addTask.setShowCloseConfirm(false); runLeftClose(); }}
          onCancel={() => addTask.setShowCloseConfirm(false)}
        />
      )}
      <ReviewerPickerPopover
        open={clinicalNote.reviewerPickerOpen}
        onClose={() => clinicalNote.setReviewerPickerOpen(false)}
        onConfirm={(reviewer) => clinicalNote.handleConfirmSubmitForReview(reviewer)}
      />
      <Drawer
        title="Care Gap Details"
        onClose={onClose}
        noCloseDivider
        // Mirror the Diagnosis Gaps drawer sizing so both surfaces feel like
        // one system — 700px closed, 1280px expanded (640 + 640 split). The
        // right pane stays fixed at 640px so the Care Gap content doesn't
        // reflow when a workspace (Add Task / Add Note / Schedule) opens;
        // the drawer simply expands leftward and collapses back.
        width={isExpanded ? 1280 : 700}
        className={`${styles.panel} ${isExpanded ? styles.panelExpanded : ''}`}
        bodyClassName={inSplit ? `${styles.drawerBody} ${styles.drawerBodySplit}` : styles.drawerBody}
        headerRight={
          <div className={styles.headerNav}>
            <ActionButton icon="solar:alt-arrow-left-linear" size="L" tooltip="Previous gap" state={canPrev ? 'active' : 'disabled'} onClick={goPrev} />
            <ActionButton icon="solar:alt-arrow-right-linear" size="L" tooltip="Next gap" state={canNext ? 'active' : 'disabled'} onClick={goNext} />
            <span className={styles.headerDivider} />
          </div>
        }
        banner={inSplit ? undefined : (
          <div className={styles.patientBannerWrap}>
            <PatientBanner initials={member.in} name={member.name} gender={member.gender} age={member.age} dob={member.dob}
              memberId={member.memberId} hidePatientLabel onCall={() => showToast('Call — coming soon')} />
          </div>
        )}
      >
        {inSplit && (() => {
          // Look up the note we're previewing / editing once so both the
          // pane header title and its right-side actions can branch on the
          // note's status (Signed vs. Submitted / Pending Review). Prefer
          // the exact note the eye affordance opened (selectedNoteId); fall
          // back to the first note that covers the current gap so the
          // Add-Note entry points still resolve.
          const previewNoteHoisted = (leftWorkspace === 'clinical-note-preview' || leftWorkspace === 'clinical-note-consolidated')
            ? (selectedNoteId ? memberNotes.find(n => n.id === selectedNoteId) : null)
              || memberNotes.find(n => (n.gapCodes || []).includes(currentCode))
            : null;
          const previewStatus = previewNoteHoisted?.status;
          return (
          <div className={styles.leftPane}>
            <div className={styles.paneHeader}>
              {(() => {
                if (leftWorkspace === 'schedule') {
                  return <span className={styles.paneTitle}>Schedule Appointment</span>;
                }
                if (leftWorkspace === 'task') {
                  return <span className={styles.paneTitle}>Add Task</span>;
                }
                if (leftWorkspace === 'clinical-note-consolidated') {
                  return <span className={styles.paneTitle}>Consolidated Clinical Note</span>;
                }
                if (leftWorkspace === 'task-detail') {
                  return <span className={styles.paneTitle}>Task Details</span>;
                }
                if (leftWorkspace === 'measure-info') {
                  return <span className={styles.paneTitle}>Measure Tutorial</span>;
                }
                const isPreview = leftWorkspace === 'clinical-note-preview';
                const previewNote = previewNoteHoisted;
                const codes = previewNote?.gapCodes?.length
                  ? previewNote.gapCodes
                  : [currentCode];
                const noteTitle = codes.length > 1
                  ? 'Consolidated Clinical Note'
                  : `${codes[0]} Visit Note`;
                // Editable mode: gap-specific title (COL Visit Note /
                // Consolidated Clinical Note) with a small icon+text status
                // subtitle underneath — same icon vocabulary the HCC
                // worklist uses (solar:sun-bold for Action Needed / In
                // Progress). Preview mode keeps its Signed / Submitted /
                // Draft attribution subtitle instead.
                if (!isPreview) {
                  const status = previewNote?.status;
                  const stat = status === 'signed'
                    ? { icon: 'solar:check-circle-bold', color: 'var(--status-success)', label: 'Signed' }
                    : status === 'submitted'
                      ? { icon: 'solar:clock-circle-bold', color: 'var(--status-warning)', label: 'Pending Review' }
                      : status === 'draft'
                        ? { icon: 'solar:file-text-linear', color: 'var(--neutral-300)', label: 'Draft' }
                        : { icon: 'solar:sun-bold', color: 'var(--status-warning)', label: 'In Progress' };
                  return (
                    <div className={styles.paneTitleStack}>
                      <span className={styles.paneTitle}>{noteTitle}</span>
                      <span className={styles.paneStatusRow} style={{ color: stat.color }}>
                        <Icon name={stat.icon} size={12} color={stat.color} />
                        {stat.label}
                      </span>
                    </div>
                  );
                }
                let subtitle = null;
                if (previewNote?.status === 'signed') {
                  const signer = previewNote.signedByName || previewNote.reviewerName || previewNote.authorName || 'Provider';
                  const when = previewNote.signedAt ? ` · ${formatPreviewDate(previewNote.signedAt)}` : '';
                  subtitle = `Signed by ${signer}${when}`;
                } else if (previewNote?.status === 'submitted') {
                  subtitle = `Submitted for Review to ${previewNote.reviewerName || '—'}`;
                } else if (previewNote?.status === 'draft') {
                  subtitle = `Draft · ${previewNote.authorName || 'You'} · ${formatPreviewDate(previewNote.updatedAt || previewNote.createdAt)}`;
                }
                return (
                  <div className={styles.paneTitleStack}>
                    <span className={styles.paneTitleSm}>{noteTitle}</span>
                    {subtitle && (
                      <span className={styles.paneSubtitleSm}>
                        <Icon name="solar:pen-new-square-linear" size={11} color="var(--primary-300)" />
                        {subtitle}
                      </span>
                    )}
                  </div>
                );
              })()}
              <div className={styles.paneHeaderRight}>
                {leftWorkspace === 'schedule' ? (
                  <Button variant="primary" size="M" disabled={!scheduleDrawer.canSchedule} onClick={scheduleDrawer.handleSchedule}>
                    Schedule
                  </Button>
                ) : leftWorkspace === 'clinical-note' ? (
                  (() => {
                    // The author revisiting their own Pending Review note
                    // sees Update-and-Save instead of Sign & Save — pushes
                    // the revised state back to the same reviewer via
                    // handleSubmitForReview (which re-notifies). Signing is
                    // still available from the chevron menu as an escape
                    // hatch.
                    const amendNote = amendNoteId ? memberNotes.find(n => n.id === amendNoteId) : null;
                    const authorEditingSubmitted = !!amendNote
                      && amendNote.status === 'submitted'
                      && amendNote.authorName === currentActorName();
                    return (
                      <ClinicalNoteHeaderActions
                        onSaveDraft={clinicalNote.handleSaveDraft}
                        onSubmitForReview={clinicalNote.handleSubmitForReview}
                        onSaveAndSign={clinicalNote.handleSaveAndSign}
                        onSignAndPrint={clinicalNote.handleSignAndPrint}
                        canSaveDraft={clinicalNote.hasChanges}
                        canSign={clinicalNote.activeMandatoryComplete}
                        authorEditingSubmitted={authorEditingSubmitted}
                      />
                    );
                  })()
                ) : leftWorkspace === 'clinical-note-preview' ? (
                  // Preview affordances branch on the note's DB status:
                  //   • signed    → Displayed-to-Member + Print + Amend
                  //     (Amend seeds the editable workspace from this note's
                  //      persisted payload; the DB trigger snapshots the
                  //      prior row for versioned audit).
                  //   • submitted → Pending Review status pill + Edit
                  //     (Edit flips to the stacked consolidated editor so
                  //      the author can revise a note that is out for review
                  //      before it comes back).
                  previewStatus === 'submitted' ? (
                    <>
                      <span className={styles.previewPendingReview}>
                        <Icon name="solar:clock-circle-linear" size={16} color="var(--status-warning)" />
                        Pending Review
                      </span>
                      <span className={styles.headerDivider} />
                      <Button
                        variant="tertiary"
                        size="M"
                        leadingIcon="solar:pen-new-square-linear"
                        onClick={() => {
                          const note = selectedNoteId ? memberNotes.find(n => n.id === selectedNoteId) : memberNotes.find(n => (n.gapCodes || []).includes(currentCode));
                          if (note?.id) setAmendNoteId(note.id);
                          setLeftWorkspace('clinical-note-consolidated');
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className={styles.previewDisplayed}>
                        <Icon name="solar:check-circle-linear" size={16} color="var(--status-success)" />
                        Displayed to Member
                      </span>
                      <span className={styles.headerDivider} />
                      <ActionButton
                        icon="solar:printer-linear"
                        size="L"
                        tooltip="Print"
                        onClick={() => {
                          const url = memberNotes.find(n => n.id === selectedNoteId)?.pdfDataUrl || memberNotes.find(n => (n.gapCodes || []).includes(currentCode))?.pdfDataUrl;
                          if (url) { const w = window.open(url, '_blank'); try { w?.focus(); } catch {} }
                          else showToast('No PDF for this version');
                        }}
                      />
                      <Button
                        variant="tertiary"
                        size="M"
                        leadingIcon="solar:lock-keyhole-minimalistic-linear"
                        onClick={() => {
                          const note = selectedNoteId ? memberNotes.find(n => n.id === selectedNoteId) : memberNotes.find(n => (n.gapCodes || []).includes(currentCode));
                          if (note?.id) setAmendNoteId(note.id);
                          setLeftWorkspace('clinical-note');
                        }}
                      >
                        Amend
                      </Button>
                    </>
                  )
                ) : leftWorkspace === 'clinical-note-consolidated' ? (
                  (() => {
                    const amendNote = amendNoteId ? memberNotes.find(n => n.id === amendNoteId) : null;
                    const authorEditingSubmitted = !!amendNote
                      && amendNote.status === 'submitted'
                      && amendNote.authorName === currentActorName();
                    return (
                      <ClinicalNoteHeaderActions
                        onSaveDraft={clinicalNote.handleSaveDraft}
                        onSubmitForReview={clinicalNote.handleSubmitForReview}
                        onSaveAndSign={clinicalNote.handleSaveAndSign}
                        onSignAndPrint={clinicalNote.handleSignAndPrint}
                        canSaveDraft={clinicalNote.hasChanges}
                        canSign={clinicalNote.anyReadyForReview}
                        authorEditingSubmitted={authorEditingSubmitted}
                      />
                    );
                  })()
                ) : leftWorkspace === 'task-detail' ? (
                  // Task detail is a read/edit surface; the task's own
                  // header (status pill, title, etc.) lives in the body so
                  // there's no CTA to render alongside the close button.
                  null
                ) : leftWorkspace === 'measure-info' ? (
                  // Measure Details is a read-only reference pane — no
                  // CTA next to the close button.
                  null
                ) : (
                  <Button variant="primary" size="M" disabled={!addTask.canSave} onClick={addTask.handleSave}>
                    Save Task
                  </Button>
                )}
                <span className={styles.headerDivider} />
                <CloseButton
                  size={18}
                  onClick={closeLeftWorkspace}
                  label={
                    leftWorkspace === 'schedule'
                      ? 'Close Schedule Appointment'
                      : leftWorkspace === 'clinical-note'
                        || leftWorkspace === 'clinical-note-preview'
                        || leftWorkspace === 'clinical-note-consolidated'
                        ? 'Close Clinical Note'
                        : leftWorkspace === 'task-detail'
                          ? 'Close Task Details'
                          : leftWorkspace === 'measure-info'
                            ? 'Close Measure Tutorial'
                            : 'Close Add Task'
                  }
                />
              </div>
            </div>
            {/* Consolidated workspace pins its info banner as a sibling of
                leftPaneBody so it sits directly under the pane header,
                edge-to-edge, and stays fixed while the body scrolls. */}
            {leftWorkspace === 'clinical-note-consolidated' && (
              <div className={styles.clinicalNoteInfoBanner}>
                <Icon name="solar:info-circle-linear" size={14} color="var(--status-info)" />
                <span>All signed notes sync to the patient's EHR.</span>
              </div>
            )}
            <div className={`${styles.leftPaneBody} ${leftWorkspace === 'clinical-note' ? styles.leftPaneBodyClinicalNote : ''}`}>
              {leftWorkspace === 'schedule' ? (
                <ScheduleDrawerBookingBody {...scheduleDrawer} timezoneLabel="GMT" patientLocked />
              ) : leftWorkspace === 'clinical-note' ? (
                <ClinicalNoteWorkspaceBody v={clinicalNote} />
              ) : leftWorkspace === 'clinical-note-preview' ? (
                <ClinicalNotePreviewBody memberId={member?.id} gapCode={currentCode} noteId={selectedNoteId} />
              ) : leftWorkspace === 'clinical-note-consolidated' ? (
                <ConsolidatedNoteBody v={clinicalNote} />
              ) : leftWorkspace === 'task-detail' ? (
                inPlaceTask ? (
                  <TaskDetailDrawer task={inPlaceTask} inline onClose={closeLeftWorkspace} />
                ) : null
              ) : leftWorkspace === 'measure-info' ? (
                <MeasureInfoBody gapCode={currentCode} />
              ) : (
                <AddTaskDrawerBody {...addTask} />
              )}
            </div>
          </div>
          );
        })()}
        <div className={styles.contentBody}>
          {inSplit && (
            <div className={styles.patientBannerWrap}>
              <PatientBanner initials={member.in} name={member.name} gender={member.gender} age={member.age} dob={member.dob}
                memberId={member.memberId} hidePatientLabel onCall={() => showToast('Call — coming soon')} />
            </div>
          )}
          <CareGapDetailDrawerHeader
            gap={gap} member={member} selectedYear={selectedYear} setSelectedYear={setSelectedYear}
            yearOpen={yearOpen} setYearOpen={setYearOpen} yearOptions={yearOptions}
            status={status} statusLocked={statusLocked}
            statusOpen={statusOpen} setStatusOpen={setStatusOpen} statusAnchorRect={statusAnchorRect} setStatusAnchorRect={setStatusAnchorRect} updateGapStatus={updateGapStatus}
            platformUsers={platformUsers} updateGapAssignee={updateGapAssignee}
            showToast={showToast} setShowClinicalNote={setShowClinicalNote}
            onOpenClinicalNote={openClinicalNoteFlow}
            onScheduleAppointment={() => setLeftWorkspace('schedule')}
            onOpenMeasureInfo={() => setLeftWorkspace('measure-info')} moreBtnRef={moreBtnRef}
            moreMenuRect={moreMenuRect} openMoreMenu={openMoreMenu} closeMoreMenu={closeMoreMenu}
            goPrev={goPrev} goNext={goNext} canPrev={canPrev} canNext={canNext}
          />

          {/* Shared TabStrip — same underline motion the HCC drawer uses.
              Counts are baked into `label` as "(N)" so we skip the Badge
              default that `count` renders. `fullWidth={false}` because
              this drawer's `.drawerBody` already has `padding: 0` — the
              default bleed would apply a -24px margin and push the row
              past the drawer's own edges. */}
          <TabStrip
            items={TABS.map((tab) => ({
              key: tab.key,
              label: tabCounts[tab.key] != null
                ? `${tab.label} (${tabCounts[tab.key]})`
                : tab.label,
            }))}
            activeKey={activeTab}
            onChange={setActiveTab}
            fullWidth={false}
            size="S"
          />

          <div className={`${styles.tabContentWrap} ${(activeTab === 'Tasks' || activeTab === 'Outreaches') ? styles.tabContentWrapFlush : ''}`}>
            {activeTab === 'Activity Log' ? (
              <div className={styles.activityLog}>
                <div className={styles.commentInput}>
                  {commentExpanded ? (
                    <Textarea autoFocus placeholder="Add a comment, use @ to mention someone" rows={3}
                      value={commentText} onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Escape') { setCommentExpanded(false); setCommentText(''); } }} />
                  ) : (
                    <Input placeholder="Add a comment" onFocus={() => setCommentExpanded(true)} style={{ cursor: 'text', width: '100%' }} />
                  )}
                  {commentExpanded && (
                    <div className={styles.commentActions}>
                      <Button variant="primary" size="S" disabled={!commentText.trim()} onClick={handleAddComment}>Comment</Button>
                      <Button variant="secondary" size="S" onClick={() => { setCommentExpanded(false); setCommentText(''); }}>Cancel</Button>
                    </div>
                  )}
                </div>
                {caregapActivityLoaded
                  ? <ActivityLog entries={activityLogEntries} emptyLabel="No activity yet for this care gap." onOpenTask={handleOpenTaskInPlace} onOpenNote={openNoteInWorkspace} />
                  : <CardSkeleton />}
              </div>
            ) : activeTab === 'Outreaches' ? (
              <OutreachTab defaultPrograms={[gap.code]} defaultLogFor="care-program" hideLogForRow />
            ) : activeTab === 'Clinical Notes' ? (
              // Flat column-headed list per Figma 1030:78586 — no timeline
              // rail, no month grouping. Card affordances are shared with
              // the Activity Log via ClinicalNoteCardActions.
              <ClinicalNotesTab entries={clinicalNoteEntries} onOpenNote={openNoteInWorkspace} onOpenTask={handleOpenTaskInPlace} />
            ) : activeTab === 'Tasks' ? (
              // Same layout as the P360 patient profile's Tasks tab —
              // Pending / Overdue / Completed sections, checkbox rows,
              // priority + due columns, so a task looks identical in
              // both the drawer here and the P360 view.
              <TasksTab
                hideToolbar
                data={groupTasksForTab(memberTasks)}
                onTaskClick={openTaskDetail}
              />
            ) : activeTab === 'Appt/Reminders' ? (
              memberAppointments.length === 0 ? (
                <div className={styles.emptyTab}>
                  <Icon name="solar:calendar-linear" size={36} color="var(--neutral-200)" />
                  <p className={styles.emptyTabTitle}>No appointments scheduled yet.</p>
                </div>
              ) : (
                <div className={styles.apptList}>
                  {memberAppointments.map(a => {
                    const meta = [
                      a.date,
                      a.time_start && (a.time_end ? `${a.time_start} – ${a.time_end}` : a.time_start),
                      a.primary_user,
                    ].filter(Boolean).join(' · ');
                    return (
                      <div key={a.id} className={styles.apptCard}>
                        <Icon name="solar:calendar-linear" size={18} color="var(--primary-300)" />
                        <div className={styles.apptCardBody}>
                          <div className={styles.apptCardTitle}>
                            {a.appointment_type_name || 'Appointment'}
                          </div>
                          {meta && <div className={styles.apptCardMeta}>{meta}</div>}
                        </div>
                        {a.status && (
                          <span className={styles.apptCardStatus}>{a.status}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className={styles.emptyTab}>
                <Icon name="solar:hourglass-line-linear" size={36} color="var(--neutral-200)" />
                <p className={styles.emptyTabTitle}>{activeTab} — coming soon</p>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {moreMenuRect && (
        <MenuPopover
          anchorRect={moreMenuRect}
          items={MORE_ACTIONS.map(a => ({ key: a.key, label: a.label, icon: a.icon }))}
          onSelect={(key) => {
            const action = MORE_ACTIONS.find(x => x.key === key);
            if (action) runMoreAction(action);
          }}
          onClose={closeMoreMenu}
          ariaLabel="More actions"
          width={220}
        />
      )}
    </>
  );
}
