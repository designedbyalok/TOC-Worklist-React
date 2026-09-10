import { Button } from '../../../../../../components/Button/Button';
import { OutreachIcon } from '../../../../../../components/Icon/OutreachIcon';
import { ScheduleDrawer } from '../../../../../../components/ScheduleDrawer/ScheduleDrawer';
import { AddTaskDrawer } from '../AddTaskDrawer/AddTaskDrawer.jsx';
import { useOutreachTab } from './useOutreachTab';
import { OutreachTabForm } from './OutreachTabForm';
import { OutreachTabActivity } from './OutreachTabActivity';
import { OutreachDateTimePicker } from './OutreachDateTimePicker';
import styles from './OutreachTab.module.css';

export { OutreachDateTimePicker };

export function OutreachTab(props) {
  const {
    programsLabel = 'Select Programs/Gaps',
    hideLogForRow = false,
    hideActivity = false,
    ...hookProps
  } = props;

  const tab = useOutreachTab({ ...hookProps, hideLogForRow, programsLabel });

  return (
    <div className={styles.wrapper}>
      {!tab.formOpen && !tab.scopedProgram ? (
        <div className={styles.emptyCard}>
          <Button
            variant="alt"
            size="L"
            leadingIconElement={<OutreachIcon size={16} color="var(--primary-300)" />}
            onClick={() => { tab.setDatetime(tab.formatNow()); tab.setFormOpen(true); }}
          >
            Log New Outreach
          </Button>
        </div>
      ) : (
        <OutreachTabForm
          hideLogForRow={hideLogForRow}
          scopedProgram={tab.scopedProgram}
          logFor={tab.logFor}
          isHccGaps={tab.isHccGaps}
          type={tab.type}
          setType={tab.setType}
          datetime={tab.datetime}
          setDatetime={tab.setDatetime}
          showCallDetails={tab.showCallDetails}
          callBannerVisible={tab.callBannerVisible}
          setCallBannerVisible={tab.setCallBannerVisible}
          callDirection={tab.callDirection}
          setCallDirection={tab.setCallDirection}
          callViaNumber={tab.callViaNumber}
          setCallViaNumber={tab.setCallViaNumber}
          calledToNumber={tab.calledToNumber}
          setCalledToNumber={tab.setCalledToNumber}
          callType={tab.callType}
          setCallType={tab.setCallType}
          callDurationMin={tab.callDurationMin}
          setCallDurationMin={tab.setCallDurationMin}
          callDurationSec={tab.callDurationSec}
          setCallDurationSec={tab.setCallDurationSec}
          CALLED_TO_OPTIONS={tab.CALLED_TO_OPTIONS}
          programsLabel={tab.isHccGaps ? 'Select HCC Gaps' : programsLabel}
          PROGRAM_OPTIONS={tab.isHccGaps ? tab.HCC_GAP_OPTIONS : tab.PROGRAM_OPTIONS}
          selectedProgs={tab.selectedProgs}
          toggleProgram={tab.toggleProgram}
          outcome={tab.outcome}
          setOutcome={tab.setOutcome}
          separateNotes={tab.separateNotes}
          setSeparateNotes={tab.setSeparateNotes}
          useSeparate={tab.useSeparate}
          getPanel={tab.getPanel}
          patchPanel={tab.patchPanel}
          patchShared={tab.patchShared}
          sharedPanel={tab.sharedPanel}
          sharedPanelTitle={tab.sharedPanelTitle}
          addOutcome={tab.addOutcome}
          removeOutcome={tab.removeOutcome}
          handleNoteChange={tab.handleNoteChange}
          canSave={tab.canSave}
          handleLogForChange={tab.handleLogForChange}
          handleSave={tab.handleSave}
          handleDiscard={tab.handleDiscard}
          onAddTask={() => tab.setAddTaskOpen(true)}
          onSchedule={() => tab.setScheduleOpen(true)}
        />
      )}

      {!hideActivity && (
        <OutreachTabActivity
          activityFilter={tab.activityFilter}
          setActivityFilter={tab.setActivityFilter}
          activitySearchOpen={tab.activitySearchOpen}
          setActivitySearchOpen={tab.setActivitySearchOpen}
          activitySearchText={tab.activitySearchText}
          setActivitySearchText={tab.setActivitySearchText}
          outreachScope={tab.outreachScope}
          setOutreachScope={tab.setOutreachScope}
          filterMenu={tab.filterMenu}
          setFilterMenu={tab.setFilterMenu}
          logGroups={tab.logGroups}
          filteredLogGroups={tab.filteredLogGroups}
          onEdit={tab.handleEdit}
          onDelete={tab.handleDelete}
        />
      )}

      {tab.addTaskOpen && (
        <AddTaskDrawer
          onClose={() => tab.setAddTaskOpen(false)}
          onSave={task => tab.scopedProgram && tab.addProgramTask(tab.scopedProgram, task)}
        />
      )}
      {tab.scheduleOpen && (
        <ScheduleDrawer
          initialPatientId={tab.patientId}
          source="outreach"
          onClose={() => tab.setScheduleOpen(false)}
          onSave={row => {
            if (!tab.scopedProgram || !row) return;
            tab.addProgramAppointment(tab.scopedProgram, {
              id: `appt-${Date.now()}`,
              title: row.appointment_type_name || 'Appointment',
              subtitle: row.reason_for_visit || row.mode || '',
              type: 'Appointment',
              programCode: tab.scopedProgram,
              date: row.date || '',
              time: row.time_start || '',
              assignee: row.primary_user || 'Unassigned',
              recurring: !!row.recurring,
            });
          }}
        />
      )}
    </div>
  );
}
