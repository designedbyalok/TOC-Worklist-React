import { Icon } from '../../../components/Icon/Icon';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { PATIENT_SYNOPSIS, RECENT_NOTES, ACTIVE_CARE_PROGRAMS, UPCOMING_APPOINTMENTS } from '../data/overviewMock';
import styles from './OverviewTab.module.css';

function SectionHeader({ title, onAdd, viewAll }) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionTitle}>{title}</span>
      <div className={styles.sectionActions}>
        {onAdd && <ActionButton icon="solar:add-circle-linear" size="S" tooltip="Add" onClick={onAdd} />}
        {viewAll && (
          <>
            <span className={styles.actionDivider} />
            <button className={styles.viewAllLink}>View All <Icon name="solar:alt-arrow-right-linear" size={14} color="var(--primary-300)" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function PatientSynopsis() {
  return (
    <div className={styles.card}>
      <div className={styles.synopsisHeader}>
        <Icon name="solar:stars-minimalistic-linear" size={16} color="var(--primary-300)" />
        <span className={styles.synopsisLabel}>Patient Synopsis</span>
      </div>
      <div className={styles.synopsisBody}>
        <div className={styles.synopsisLeft}>
          <div className={styles.templateRow}>
            <button className={styles.templateDropdown}>
              Diabetes Standard Template <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-300)" />
            </button>
            <div className={styles.synopsisActions}>
              <ActionButton icon="solar:clipboard-linear" size="S" tooltip="Copy" />
              <ActionButton icon="solar:refresh-linear" size="S" tooltip="Re-Generate" />
              <ActionButton icon="solar:dislike-linear" size="S" tooltip="Dislike" />
              <ActionButton icon="solar:like-linear" size="S" tooltip="Like" />
            </div>
          </div>
          <p className={styles.synopsisText}>{PATIENT_SYNOPSIS}</p>
          <div className={styles.synopsisFooter}>
            <span>Last Generated on: 11/09/2025, 2:30 PM &bull; Dr. Michael Chen</span>
            <span className={styles.internalBadge}><Icon name="solar:lock-linear" size={10} color="var(--neutral-200)" /> Internal Use Only</span>
          </div>
          <div className={styles.feedbackRow}>
            <span>Are these Synopsis useful?</span>
            <ActionButton icon="solar:like-linear" size="S" tooltip="Yes" />
            <ActionButton icon="solar:dislike-linear" size="S" tooltip="No" />
            <ActionButton icon="solar:clipboard-linear" size="S" tooltip="Copy" />
            <ActionButton icon="solar:share-linear" size="S" tooltip="Share" />
          </div>
        </div>
        <div className={styles.synopsisRight}>
          <div className={styles.healthMapPlaceholder}>
            <Icon name="solar:graph-linear" size={32} color="var(--neutral-150)" />
            <span>Health Map</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentNotesTable() {
  return (
    <div className={styles.card}>
      <SectionHeader title="Recent Notes" onAdd={() => {}} viewAll />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Note Title</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Last Updated</th>
              <th>Template Name</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_NOTES.map(note => (
              <tr key={note.id}>
                <td><input type="checkbox" className={styles.checkbox} /></td>
                <td>
                  <div className={styles.noteTitle}>{note.title}</div>
                  <div className={styles.noteSub}>{note.subtitle}</div>
                </td>
                <td><span style={{ color: note.statusColor }}>{note.status}</span></td>
                <td>
                  <div>{note.createdBy}</div>
                  <div className={styles.dateText}>{note.createdDate}</div>
                </td>
                <td>
                  <div>{note.updatedBy}</div>
                  <div className={styles.dateText}>{note.updatedDate}</div>
                </td>
                <td>{note.template}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActiveCareProgramsTable() {
  return (
    <div className={styles.card}>
      <SectionHeader title="Active Care Programs" onAdd={() => {}} viewAll />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Program Name</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Last Updated</th>
              <th>Assignee</th>
              <th>PCP</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVE_CARE_PROGRAMS.map(prog => (
              <tr key={prog.id}>
                <td>
                  <div className={styles.programName}>
                    <Icon name="solar:calendar-mark-linear" size={14} color="var(--primary-300)" />
                    {prog.name}
                  </div>
                </td>
                <td><span className={styles.statusLink}>{prog.status}</span></td>
                <td>{prog.startDate}</td>
                <td>{prog.endDate}</td>
                <td>{prog.lastUpdated}</td>
                <td>{prog.assignee}</td>
                <td>{prog.pcp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UpcomingAppointmentsTable() {
  return (
    <div className={styles.card}>
      <SectionHeader title="Upcoming Appointments" onAdd={() => {}} viewAll />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Provider</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {UPCOMING_APPOINTMENTS.map(appt => (
              <tr key={appt.id}>
                <td>{appt.type}</td>
                <td>{appt.date}</td>
                <td>{appt.time}</td>
                <td>{appt.provider}</td>
                <td>{appt.location}</td>
                <td><span className={styles.statusBadge}>{appt.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CareRecommendations() {
  return (
    <div className={styles.card}>
      <SectionHeader title="Care Plan Recommendations" />
      <div className={styles.placeholderContent}>
        <Icon name="solar:clipboard-heart-linear" size={32} color="var(--neutral-150)" />
        <span>AI-powered care plan recommendations will appear here</span>
      </div>
    </div>
  );
}

export function OverviewTab() {
  return (
    <div className={styles.overview}>
      <PatientSynopsis />
      <RecentNotesTable />
      <ActiveCareProgramsTable />
      <UpcomingAppointmentsTable />
      <CareRecommendations />
    </div>
  );
}
