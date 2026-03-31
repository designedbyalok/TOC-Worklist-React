import { useState, useEffect } from 'react';
import { Icon } from '../../../components/Icon/Icon';
import { useAppStore } from '../../../store/useAppStore';
import { SimpleTableSkeleton } from '../../../components/Skeleton/CardSkeleton';

const FALLBACK_FAQS = [
  { id: 1, question: 'What is Transitional Care Management (TCM)?', answer: 'TCM is a Medicare program that covers services for patients transitioning from hospital to home or other setting.', category: 'General', updatedAt: '2026-03-15' },
  { id: 2, question: 'How do I schedule a follow-up appointment?', answer: 'Our AI agent can help schedule your follow-up during the call, or you can call our scheduling line at (555) 123-4567.', category: 'Appointments', updatedAt: '2026-03-10' },
  { id: 3, question: 'What should I do if I run out of medication?', answer: 'Contact your pharmacy directly for refills. If it\'s urgent, call your care team or visit the ER.', category: 'Medications', updatedAt: '2026-03-08' },
  { id: 4, question: 'When will I get my lab results?', answer: 'Lab results are typically available within 3-5 business days. Your provider will contact you if anything needs attention.', category: 'Labs', updatedAt: '2026-02-28' },
  { id: 5, question: 'How can I opt out of AI calls?', answer: 'You can opt out at any time by saying "opt out" during a call or contacting our office directly.', category: 'Compliance', updatedAt: '2026-02-20' },
];

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '0.5px solid #d0d6e1' },
  title: { fontSize: 14, fontWeight: 600, color: '#3a485f', display: 'flex', alignItems: 'center', gap: 6 },
  count: { fontSize: 12, fontWeight: 400, color: '#6f7a90' },
  addBtn: { padding: '6px 14px', border: '0.5px solid #d0d6e1', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#8c5ae2', fontWeight: 500 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { padding: '10px 14px', fontSize: 12, fontWeight: 500, color: '#6f7a90', textAlign: 'left', borderBottom: '1px solid #d0d6e1', background: '#fafbff' },
  td: { padding: '12px 14px', borderBottom: '0.5px solid #e9ecf1', color: '#3a485f', verticalAlign: 'top' },
  category: { padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: '#ede5fb', color: '#8c5ae2', display: 'inline-block' },
  actions: { display: 'flex', gap: 6 },
  actionBtn: { padding: '4px 8px', border: '0.5px solid #d0d6e1', borderRadius: 4, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6f7a90', fontSize: 12 },
};

export function KnowledgeBasePanel() {
  const faqsData = useAppStore(s => s.faqsData);
  const fetchFaqs = useAppStore(s => s.fetchFaqs);
  const deleteFaq = useAppStore(s => s.deleteFaq);
  const showToast = useAppStore(s => s.showToast);
  useEffect(() => { fetchFaqs(); }, [fetchFaqs]);
  const faqs = faqsData || [];
  const isLoading = !faqsData;

  if (isLoading) {
    return <SimpleTableSkeleton rows={5} cols={4} />;
  }

  return (
    <div>
      <div style={s.header}>
        <div style={s.title}>
          <Icon name="solar:book-bold" size={16} color="#8c5ae2" />
          Knowledge Base
          <span style={s.count}>({faqs.length} articles)</span>
        </div>
        <button style={s.addBtn}>
          <Icon name="solar:add-circle-linear" size={14} />
          Add FAQ
        </button>
      </div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Question</th>
            <th style={s.th}>Category</th>
            <th style={s.th}>Last Updated</th>
            <th style={s.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {faqs.length === 0 && (
            <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#8a94a8' }}>
              <Icon name="solar:book-linear" size={32} color="#d0d6e1" />
              <div style={{ fontSize: 14, fontWeight: 500, color: '#6f7a90', marginTop: 8 }}>No FAQ articles yet</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Add your first FAQ to help patients and agents.</div>
            </td></tr>
          )}
          {faqs.map(faq => (
            <tr key={faq.id}>
              <td style={s.td}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{faq.question}</div>
                <div style={{ fontSize: 12, color: '#6f7a90', lineHeight: 1.4 }}>{faq.answer}</div>
              </td>
              <td style={s.td}><span style={s.category}>{faq.category}</span></td>
              <td style={s.td}><span style={{ fontSize: 13, color: '#6f7a90' }}>{faq.updatedAt}</span></td>
              <td style={s.td}>
                <div style={s.actions}>
                  <button style={s.actionBtn}><Icon name="solar:pen-linear" size={14} /> Edit</button>
                  <button style={{ ...s.actionBtn, color: '#D72825' }}><Icon name="solar:trash-bin-2-linear" size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
