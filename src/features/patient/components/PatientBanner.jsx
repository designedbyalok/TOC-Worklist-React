import { useState, useEffect } from 'react';
import { Avatar } from '../../../components/Avatar/Avatar';
import { ActionButton } from '../../../components/ActionButton/ActionButton';
import { Icon } from '../../../components/Icon/Icon';
import { useAppStore } from '../../../store/useAppStore';
import { FALLBACK_P360 } from '../data/p360Mock';
import styles from './PatientBanner.module.css';

/* ── Expanded sub-panels ── */
function ExpandedDemographics({ p }) {
  return (
    <div className={styles.expandCol}>
      <h4 className={styles.expandTitle}>Patient Demographic Details</h4>
      <div className={styles.expandRows}>
        <div className={styles.expandRow}><Icon name="solar:map-point-linear" size={14} color="var(--neutral-200)" /><span>{p.location || '—'}{p.location_count > 0 && <span className={styles.moreCount}> +{p.location_count}</span>}</span></div>
        <div className={styles.expandRow}><Icon name="solar:translation-2-linear" size={14} color="var(--neutral-200)" /><span>{(p.languages || []).join(' • ')}</span></div>
        <div className={styles.expandRow}><Icon name="solar:letter-linear" size={14} color="var(--neutral-200)" /><span>{(p.emails || []).join(' • ')}</span></div>
        <div className={styles.expandItem}><span className={styles.expandLabel}>Plan Numbers (Primary):</span><span>{(p.plan_numbers_primary || []).join(' • ')}</span></div>
        <div className={styles.expandItem}><span className={styles.expandLabel}>Secondary Numbers:</span><span>{(p.plan_numbers_secondary || []).join(' • ')}</span></div>
      </div>
    </div>
  );
}

function ExpandedHealthStatus({ p }) {
  const v = p.recent_vitals || {};
  return (
    <div className={styles.expandCol}>
      <h4 className={styles.expandTitle}>Health Status</h4>
      <div className={styles.expandRows}>
        <div className={styles.expandItem}>
          <span className={styles.expandLabel}>Chronic Condition:</span>
          <div className={styles.conditionBadges}>{(p.chronic_conditions || []).map(c => <span key={c} className={styles.conditionBadge}>{c}</span>)}</div>
        </div>
        <div className={styles.expandItem}>
          <span className={styles.expandLabel}>Recent Vitals ({v.date || '—'}):</span>
          <div className={styles.vitalsGrid}><span>BP: {v.bp || '—'}</span><span>Weight: {v.weight || '—'}</span><span>Pulse: {v.pulse || '—'}</span><span>HbA1c: {v.hba1c || '—'}</span></div>
        </div>
        <div className={styles.expandItem}>
          <span className={styles.expandLabel}>Opted out of (Communication):</span>
          <span>{(p.opted_out_comms || []).join(' • ')}</span>
        </div>
      </div>
    </div>
  );
}

function ExpandedAppointments({ p }) {
  return (
    <div className={styles.expandCol}>
      <h4 className={styles.expandTitle}>Upcoming Appointments</h4>
      <div className={styles.expandRows}>
        {(p.upcoming_appointments || []).map((a, i) => (
          <div key={i} className={styles.apptRow}>
            <Icon name={i === 0 ? 'solar:clipboard-text-linear' : 'solar:calendar-linear'} size={14} color="var(--primary-300)" />
            <div className={styles.apptInfo}><span className={styles.apptType}>{a.type}</span><span className={styles.apptMeta}>{a.date}{a.time ? `, ${a.time}` : ''} • {a.program} • & {a.provider}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandedFamily({ p }) {
  return (
    <div className={styles.expandCol}>
      <h4 className={styles.expandTitle}>Family and Caregiver</h4>
      {p.family_caregiver_count > 0 && <div className={styles.familyNotice}><Icon name="solar:check-circle-linear" size={14} color="var(--status-success)" />Member is identified as family & caregiver for {p.family_caregiver_count} Members</div>}
      <div className={styles.expandRows}>
        {(p.family_members || []).map((m, i) => <div key={i} className={styles.personRow}><Avatar variant="assignee" initials={m.initials} /><div><span className={styles.personName}>{m.name}</span><span className={styles.personRole}>{m.relation}</span></div></div>)}
        {(p.family_members || []).length > 0 && <button className={styles.viewAllBtn}>View All &gt;</button>}
      </div>
      <div className={styles.careTeamSection}>
        <div className={styles.careTeamHeader}><span className={styles.expandLabel}>Care Team</span><Icon name="solar:pen-2-linear" size={12} color="var(--neutral-200)" /><div style={{ flex: 1 }} /><span className={styles.profileTypeLabel}>{p.care_team_profile_type} <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--neutral-200)" /></span></div>
        {(p.care_team || []).map((m, i) => <div key={i} className={styles.personRow}><Avatar variant="assignee" initials={m.initials} /><div><span className={styles.personName}>{m.name} {m.role && <span className={styles.roleTag}>{m.role}</span>}</span><span className={styles.personRole}>{m.title}</span></div></div>)}
        {(p.care_team || []).length > 0 && <button className={styles.viewAllBtn}>View All &gt;</button>}
      </div>
    </div>
  );
}

/* ── Main Banner ── */
export function PatientBanner({ patient }) {
  const [expanded, setExpanded] = useState(false);
  const [tags, setTags] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('central');
  const p360Profile = useAppStore(s => s.p360Profile);
  const fetchP360Profile = useAppStore(s => s.fetchP360Profile);

  useEffect(() => { if (patient?.id) fetchP360Profile(patient.id); }, [patient?.id]);

  const p = p360Profile || FALLBACK_P360;

  useEffect(() => { setTags(p.condition_tags || FALLBACK_P360.condition_tags); }, [p.condition_tags]);

  if (!patient) return null;

  return (
    <div className={styles.banner}>
      {/* ── ROW 1: Profile strip ── */}
      <div className={styles.row1}>
        {/* User info */}
        <div className={styles.userInfo}>
          <Avatar variant="patient" initials={patient.initials || '??'} />
          <div className={styles.nameBlock}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{patient.name}</span>
              <Icon name="solar:pen-2-linear" size={16} color="var(--neutral-200)" />
            </div>
            <div className={styles.meta}>{patient.gender} • {patient.dob || '9/14/1968'} ({patient.age})</div>
          </div>
        </div>

        <span className={styles.vDivider} />

        {/* Main info strip */}
        <div className={styles.mainInfo}>
          {/* Profile card with dropdown */}
          <div style={{ position: 'relative' }}>
            <div className={styles.profileCard} onClick={() => setShowProfileDropdown(v => !v)} style={{ cursor: 'pointer' }}>
              <div className={styles.profileCardTop}>
                <Icon name="solar:hospital-linear" size={14} color="var(--neutral-300)" />
                <span className={styles.profileLink}>{(p.insurance_profiles || FALLBACK_P360.insurance_profiles).find(pr => pr.id === selectedProfileId)?.name || p.profile_type} <Icon name="solar:alt-arrow-down-linear" size={12} color="var(--neutral-300)" /></span>
              </div>
              <div className={styles.profileCardBottom}>
                <strong>{selectedProfileId === 'central' ? p.health_plan_name : (p.insurance_profiles || FALLBACK_P360.insurance_profiles).find(pr => pr.id === selectedProfileId)?.name}</strong> <span>({p.health_plan_id})</span>
                <span className={`${styles.badge} ${styles.badgeGrey}`} style={{ height: 18, fontSize: 12, padding: '0 4px', marginLeft: 4 }}>+{((p.insurance_profiles || FALLBACK_P360.insurance_profiles).length - 1)}</span>
              </div>
            </div>
            {showProfileDropdown && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setShowProfileDropdown(false)} />
                <div className={styles.profileDropdown}>
                  <div className={styles.profileDropdownTitle}>Member Insurance Profiles</div>
                  {(p.insurance_profiles || FALLBACK_P360.insurance_profiles).map(prof => (
                    <div key={prof.id} className={`${styles.profileOption} ${selectedProfileId === prof.id ? styles.profileOptionSelected : ''}`} onClick={() => { setSelectedProfileId(prof.id); setShowProfileDropdown(false); }}>
                      <div className={styles.profileOptionHeader}>
                        <div>
                          <div className={styles.profileOptionName}>{prof.name}</div>
                          <div className={styles.profileOptionSub}>{prof.subtitle}</div>
                        </div>
                        {selectedProfileId === prof.id ? (
                          <Icon name="solar:check-circle-bold" size={20} color="var(--status-success)" />
                        ) : (
                          <span className={styles.profileOptionRadio} />
                        )}
                      </div>
                      {prof.enrolledOn && (
                        <div className={styles.profileOptionDetails}>
                          <div className={styles.profileOptionDetail}><span className={styles.profileOptionDetailLabel}>Enrolled On</span><span className={styles.profileOptionDetailValue}>{prof.enrolledOn}</span></div>
                          <div className={styles.profileOptionDetail}><span className={styles.profileOptionDetailLabel}>Insurance</span><span className={styles.profileOptionDetailValue}>{prof.insurance}</span></div>
                          <div className={styles.profileOptionDetail}><span className={styles.profileOptionDetailLabel}>HP Code</span><span className={styles.profileOptionDetailValue}>{prof.hpCode}</span></div>
                        </div>
                      )}
                      {prof.hpDesc && (
                        <div className={styles.profileOptionDesc}><span className={styles.profileOptionDetailLabel}>HP Description</span><span className={styles.profileOptionDetailValue}>{prof.hpDesc}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Consent */}
          <div className={styles.metricCol}>
            <span className={styles.metricLabel}>Consent</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.badge} ${styles.badgeWarning}`}>{p.consent_given}/{p.consent_total} <Icon name="solar:alt-arrow-down-linear" size={10} color="var(--status-warning)" /></span>
            </div>
          </div>

          {/* Acuity */}
          <div className={styles.metricCol}>
            <span className={styles.metricLabel}>Acuity</span>
            <div className={styles.metricValueRow}>
              <span className={`${styles.badge} ${styles.badgeError}`}>{p.acuity}</span>
            </div>
          </div>

          {/* RAF */}
          <div className={styles.metricCol}>
            <span className={styles.metricLabel}>RAF</span>
            <div className={styles.metricValueRow}>
              <span className={styles.rafValue}>{p.raf_score}</span>
              {p.raf_change > 0 && <span className={styles.rafChangeBadge}>+{p.raf_change} <Icon name="solar:arrow-up-linear" size={12} color="var(--status-error)" /></span>}
            </div>
          </div>

          {/* Next Appt */}
          <div className={styles.metricCol}>
            <span className={styles.metricLabel}>Next Appt.</span>
            <div className={styles.metricValueRow}><span className={styles.nextApptValue}>{p.next_appointment_date || '—'}</span></div>
          </div>

          {/* Last Contact */}
          <div className={styles.metricCol}>
            <span className={styles.metricLabel}>Last Contact</span>
            <div className={styles.lastContactBtn}>
              <Icon name="solar:phone-calling-linear" size={16} color="var(--status-error)" />
              <span className={styles.lastContactText}>{p.last_contact_type}({p.last_contact_days}d)</span>
            </div>
          </div>

          {/* Programs */}
          <div className={styles.metricCol}>
            <span className={styles.metricLabel}>Programs</span>
            <div className={styles.programBadges}>
              {(p.programs || []).map(pr => <span key={pr} className={`${styles.badge} ${styles.badgeInfo}`} style={{ width: pr.length > 3 ? 'auto' : 40 }}>{pr}</span>)}
              <span className={`${styles.badge} ${styles.badgeGrey}`} style={{ width: 30 }}>+2</span>
            </div>
          </div>

          {/* Expand arrow */}
          <button className={styles.expandArrow} onClick={() => setExpanded(v => !v)}>
            <Icon name={expanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'} size={16} color="var(--status-success)" />
          </button>
        </div>

        {/* Actions: EHR | Call | Email | ... */}
        <div className={styles.actionsGroup}>
          <div className={styles.actionCol}><ActionButton icon="solar:square-top-down-linear" size="L" tooltip="EHR" /><span className={styles.actionLabel}>EHR</span></div>
          <span className={styles.hDivider} />
          <div className={styles.actionCol}><ActionButton icon="solar:phone-linear" size="L" tooltip="Call" /><span className={styles.actionLabel}>Call</span></div>
          <span className={styles.hDivider} />
          <div className={styles.actionCol}><ActionButton icon="solar:letter-linear" size="L" tooltip="Email" /><span className={styles.actionLabel}>Email</span></div>
          <span className={styles.hDivider} />
          <ActionButton icon="solar:menu-dots-bold" size="L" tooltip="More" />
        </div>
      </div>

      {/* ── ROW 2: Tags ── */}
      <div className={styles.row2}>
        <button className={styles.patientTypeBadge}>
          {p.patient_type} <Icon name="solar:alt-arrow-down-linear" size={12} color="var(--neutral-300)" />
        </button>
        <span className={styles.tagDivider} />
        {tags.map((tag, i) => (
          <span key={i} className={tag === 'Needs Transportation' ? styles.tagBlue : styles.tagCyan}>
            {tag}
            <button className={styles.tagClose} onClick={() => setTags(prev => prev.filter((_, j) => j !== i))}>
              <Icon name="solar:close-linear" size={12} color={tag === 'Needs Transportation' ? 'var(--status-info)' : '#109CAE'} />
            </button>
          </span>
        ))}
        <button className={styles.addTagBtn}><Icon name="solar:add-circle-linear" size={12} color="var(--neutral-300)" /></button>
      </div>

      {/* ── Expanded: 4-column grid ── */}
      {expanded && (
        <div className={styles.expandedGrid}>
          <ExpandedDemographics p={p} />
          <ExpandedHealthStatus p={p} />
          <ExpandedAppointments p={p} />
          <ExpandedFamily p={p} />
        </div>
      )}
    </div>
  );
}
