import { useState } from 'react';
import { Icon } from '../../../components/Icon/Icon';

const s = {
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: '#3a485f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 },
  card: { background: '#fff', border: '0.5px solid #d0d6e1', borderRadius: 8, padding: 16, marginBottom: 12 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #e9ecf1', fontSize: 14, color: '#3a485f' },
  input: { padding: '4px 8px', border: '0.5px solid #d0d6e1', borderRadius: 4, fontSize: 13, color: '#3a485f', width: 80, textAlign: 'center' },
  label: { flex: 1 },
  desc: { fontSize: 12, color: '#6f7a90', marginTop: 2 },
  keywordsList: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  keyword: { padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 500, background: '#FFF5F5', color: '#D72825', border: '0.5px solid rgba(215,40,37,0.2)', display: 'flex', alignItems: 'center', gap: 4 },
  select: { padding: '6px 10px', border: '0.5px solid #d0d6e1', borderRadius: 4, fontSize: 13, color: '#3a485f', background: '#fff' },
};

const EMERGENCY_KEYWORDS = ['suicide', 'kill', 'hurt myself', 'emergency', '911', 'chest pain', 'can\'t breathe', 'overdose', 'bleeding', 'unconscious'];

export function EscalationPolicyPanel() {
  const [config, setConfig] = useState({
    confidenceThreshold: 70,
    sentimentThreshold: 30,
    maxLoops: 3,
    maxTurns: 20,
    callbackSlaMinutes: 30,
    transferNumber: '(555) 123-4567',
    queueThreshold: 5,
  });

  const update = (key, val) => setConfig(p => ({ ...p, [key]: val }));

  return (
    <div style={{ padding: 16 }}>
      {/* Confidence & Sentiment Thresholds */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Icon name="solar:tuning-square-2-bold" size={16} color="#8c5ae2" />
          Escalation Triggers
        </div>
        <div style={s.card}>
          <div style={s.row}>
            <div style={s.label}>
              Confidence Threshold
              <div style={s.desc}>Escalate when AI confidence drops below this %</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input style={s.input} type="number" min={0} max={100} value={config.confidenceThreshold} onChange={e => update('confidenceThreshold', +e.target.value)} />
              <span style={{ fontSize: 12, color: '#6f7a90' }}>%</span>
            </div>
          </div>
          <div style={s.row}>
            <div style={s.label}>
              Negative Sentiment Threshold
              <div style={s.desc}>Escalate when negative sentiment exceeds this %</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input style={s.input} type="number" min={0} max={100} value={config.sentimentThreshold} onChange={e => update('sentimentThreshold', +e.target.value)} />
              <span style={{ fontSize: 12, color: '#6f7a90' }}>%</span>
            </div>
          </div>
          <div style={s.row}>
            <div style={s.label}>
              Max Conversation Loops
              <div style={s.desc}>Escalate after this many repeated loops</div>
            </div>
            <input style={s.input} type="number" min={1} max={10} value={config.maxLoops} onChange={e => update('maxLoops', +e.target.value)} />
          </div>
          <div style={{ ...s.row, borderBottom: 'none' }}>
            <div style={s.label}>
              Max Turn Count
              <div style={s.desc}>Escalate after this many conversation turns</div>
            </div>
            <input style={s.input} type="number" min={5} max={50} value={config.maxTurns} onChange={e => update('maxTurns', +e.target.value)} />
          </div>
        </div>
      </div>

      {/* Transfer Configuration */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Icon name="solar:phone-calling-bold" size={16} color="#E8742C" />
          Transfer Configuration
        </div>
        <div style={s.card}>
          <div style={s.row}>
            <div style={s.label}>Transfer Phone Number</div>
            <input style={{ ...s.input, width: 140 }} value={config.transferNumber} onChange={e => update('transferNumber', e.target.value)} />
          </div>
          <div style={s.row}>
            <div style={s.label}>
              Queue Threshold
              <div style={s.desc}>Offer callback when queue exceeds this count</div>
            </div>
            <input style={s.input} type="number" min={1} max={50} value={config.queueThreshold} onChange={e => update('queueThreshold', +e.target.value)} />
          </div>
          <div style={{ ...s.row, borderBottom: 'none' }}>
            <div style={s.label}>
              Callback SLA
              <div style={s.desc}>Promised callback time in minutes</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input style={s.input} type="number" min={5} max={120} value={config.callbackSlaMinutes} onChange={e => update('callbackSlaMinutes', +e.target.value)} />
              <span style={{ fontSize: 12, color: '#6f7a90' }}>min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Keywords */}
      <div style={s.section}>
        <div style={s.sectionTitle}>
          <Icon name="solar:danger-triangle-bold" size={16} color="#D72825" />
          Emergency Keywords
        </div>
        <div style={s.card}>
          <div style={{ fontSize: 13, color: '#6f7a90', marginBottom: 8 }}>
            Calls containing these keywords will trigger immediate escalation to a human agent.
          </div>
          <div style={s.keywordsList}>
            {EMERGENCY_KEYWORDS.map(kw => (
              <span key={kw} style={s.keyword}>
                {kw}
                <Icon name="solar:close-circle-bold" size={12} color="#D72825" style={{ cursor: 'pointer' }} />
              </span>
            ))}
          </div>
          <button style={{ marginTop: 10, padding: '6px 12px', border: '0.5px solid #d0d6e1', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#8c5ae2' }}>
            <Icon name="solar:add-circle-linear" size={14} /> Add Keyword
          </button>
        </div>
      </div>
    </div>
  );
}
