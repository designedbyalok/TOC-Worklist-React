-- ============================================================
-- Anna MILU Agent — Complete Sample Data Seed
-- Run this in Supabase SQL Editor AFTER agents_migration.sql,
-- agent_config.sql, and goals migration
-- ============================================================

-- ─── 1. Update Anna agent with MILU use case ───
UPDATE agents SET
  name = 'Anna',
  use_case = 'Avergent MILU Consent & FoldCare App Outreach',
  version = '2.0',
  voice = '{"name":"Erica","gender":"Female","language":"English"}'::JSONB,
  last_updated = '04/09/2026',
  last_updated_by = 'Dr. Sarah Johnson',
  enabled = true
WHERE id = 'a1';

-- ─── 2. Insert agent_config for Anna ───
INSERT INTO agent_config (
  agent_id, agent_role, use_case_name, description, system_prompt,
  tone_of_voice, voice, empathy_level, speaking_pace,
  languages, adaptations, selected_policies,
  population_type, selected_worklist, modality,
  phone, email, office_hours, goal_ids
) VALUES (
  'a1',
  'coordinator',
  'Avergent MILU Consent & FoldCare App Outreach',
  'AI-powered voice assistant that helps patients stay connected with their care by assisting with FoldCare Mobile App setup and MILU Health Consent Form enrollment. Operates in compliance with HIPAA, identifies as AI, and ensures patients feel safe and supported.',
  E'You are Anna, an AI assistant calling on behalf of the uhVERjent care team.\n\nIf the patient asks a clarification question about MILU, the app, privacy, text messages, identity verification, or who is calling, answer using the approved responses below.\n\nRules:\n- Keep answers short and friendly.\n- Speak clearly since many patients are elderly.\n- Do NOT provide medical advice.\n- After answering, smoothly return to the previous step in the workflow.\n\nCore Principles:\n- ALWAYS say "Avergent" or "Avergent Collaborative Care" - NEVER use doctor names or clinic names\n- Asynchronous Operations - NEVER pause for system processing, avoid filler phrases\n- Only discuss pending items - skip tasks the patient has already completed\n- Be transparent about being an AI assistant\n- Patient privacy and HIPAA compliance above all\n- No pressure - all services are optional\n- Warm, empathetic communication throughout\n- Efficiency - target call duration under 7 minutes\n\nAvailable Tools & Functions:\n- check_patient_login_activity - Check if patient has logged into the app\n- get_form_response - Check if MILU consent form has been submitted\n- [SEND_SECURE_LINK] - Send FoldCare app download link\n- [SEND_FORM_LINK] - Send MILU consent form link\n- [CHECK_FORM_STATUS] - Verify if a form was already sent\n\nAutomation Link For App:\n- Email only: workflow_master_id = "09174bd1-1929-11f1-8487-39df6399a554"\n- SMS only: workflow_master_id = "4c83b8a6-1929-11f1-9954-39df6399a554"\n- Both Email and SMS: workflow_master_id = "8db63e74-1929-11f1-a4fc-39df6399a554"\n\nAutomation Link For Consent:\n- Email: workflow_master_id = "df860ef4-1927-11f1-8f82-39df6399a554"\n- SMS: workflow_master_id = "0f812955-1928-11f1-8b10-39df6399a554"\n- Both: workflow_master_id = "bd2817bd-1928-11f1-8e9f-39df6399a554"\n\nEmergency Protocol:\nIf patient mentions urgent medical issue: Stop immediately, direct to call 911, do not resume normal flow, flag for clinical review.',
  'warm',
  'erica',
  90,
  70,
  '["english", "spanish"]'::JSONB,
  '["elderly", "plain"]'::JSONB,
  '["emergency", "medication", "empathetic"]'::JSONB,
  'worklist',
  'toc',
  'voice',
  '(555) 867-5309',
  'anna@avergent.health',
  'Monday-Friday, 8 AM - 6 PM EST',
  '[1, 2, 3, 6, 7]'::JSONB
)
ON CONFLICT (agent_id) DO UPDATE SET
  agent_role = EXCLUDED.agent_role,
  use_case_name = EXCLUDED.use_case_name,
  description = EXCLUDED.description,
  system_prompt = EXCLUDED.system_prompt,
  tone_of_voice = EXCLUDED.tone_of_voice,
  voice = EXCLUDED.voice,
  empathy_level = EXCLUDED.empathy_level,
  speaking_pace = EXCLUDED.speaking_pace,
  languages = EXCLUDED.languages,
  adaptations = EXCLUDED.adaptations,
  selected_policies = EXCLUDED.selected_policies,
  population_type = EXCLUDED.population_type,
  selected_worklist = EXCLUDED.selected_worklist,
  modality = EXCLUDED.modality,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  office_hours = EXCLUDED.office_hours,
  goal_ids = EXCLUDED.goal_ids;

-- ─── 3. Insert MILU-specific goals ───
INSERT INTO goals (id, name, program, program_color, description, status, weighted_scoring, passing_score, mode, steps, success_metrics, agents, completion_rate, total_runs) VALUES

-- Goal 6: MILU Health Consent Enrollment
('6', 'MILU Health Consent Enrollment', 'Outreach', 'blue',
 'Guide patients through the MILU Health Consent Form to authorize secure sharing of medical records for care coordination.',
 'active', true, 80, 'sequential',
 '[
   {"id":"s1","name":"Greeting & Reason for Call","type":"mandatory","score":15,"desc":"Agent clearly introduces themselves as AI from Avergent, explains purpose of call, asks if now is a good time.","condition":null},
   {"id":"s2","name":"Identity Verification (2-factor)","type":"mandatory","score":20,"desc":"Verify patient identity with name + DOB. Allow one retry. If still incorrect, provide callback number and end call.","condition":"Requires: Greeting complete"},
   {"id":"s3","name":"MILU Consent Explanation","type":"mandatory","score":25,"desc":"Explain MILU Health in patient-friendly terms: what it is, what it does, that it is free and optional. Answer patient questions using approved responses.","condition":"Requires: Identity verified"},
   {"id":"s4","name":"Consent Link Delivery","type":"mandatory","score":25,"desc":"Obtain verbal permission, confirm preferred contact method (text/email/both), send MILU consent form link via correct automation workflow.","condition":"Requires: Patient agrees to receive link"},
   {"id":"s5","name":"Confirmation & Close","type":"conditional","score":15,"desc":"Confirm link was sent, remind patient to check for it, offer human follow-up if needed, close politely.","condition":"Requires: Link sent successfully"}
 ]'::JSONB,
 '["Consent form link sent","Patient verbally consented","Identity verified","HIPAA compliance maintained"]'::JSONB,
 '["Anna"]'::JSONB, 78, 1856)
ON CONFLICT (id) DO NOTHING;

-- Goal 7: FoldCare App Onboarding
INSERT INTO goals (id, name, program, program_color, description, status, weighted_scoring, passing_score, mode, steps, success_metrics, agents, completion_rate, total_runs) VALUES
('7', 'FoldCare App Download & Setup', 'Onboarding', 'amber',
 'Assist patients in downloading the FoldCare mobile app and completing initial registration for secure care team communication.',
 'active', false, 100, 'sequential',
 '[
   {"id":"s1","name":"App Status Check","type":"mandatory","score":20,"desc":"Check if patient already has the app installed via check_patient_login_activity. Skip if already set up.","condition":null},
   {"id":"s2","name":"App Explanation","type":"mandatory","score":20,"desc":"Explain FoldCare app in simple terms: free, helps manage care, message care team. Address tech concerns for elderly patients.","condition":"Requires: Patient does not have app"},
   {"id":"s3","name":"App Link Delivery","type":"mandatory","score":30,"desc":"Obtain permission, confirm preferred channel, send secure download link via correct automation workflow.","condition":"Requires: Patient interested"},
   {"id":"s4","name":"Non-Tech Alternative Offered","type":"conditional","score":15,"desc":"If patient declines app or lacks smartphone, offer phone-based support alternative and note preference.","condition":"Triggered if patient declines"},
   {"id":"s5","name":"Setup Assistance","type":"conditional","score":15,"desc":"Walk patient through download and registration if they request help during the call.","condition":"Triggered if patient requests help"}
 ]'::JSONB,
 '["App link sent","Patient confirmed download","Alternative offered if declined"]'::JSONB,
 '["Anna"]'::JSONB, 63, 1856)
ON CONFLICT (id) DO NOTHING;

-- Goal 8: Legitimacy & Trust Building
INSERT INTO goals (id, name, program, program_color, description, status, weighted_scoring, passing_score, mode, steps, success_metrics, agents, completion_rate, total_runs) VALUES
('8', 'Caller Legitimacy Verification', 'Outreach', 'blue',
 'Handle patient concerns about call legitimacy with approved responses. Validate concerns, offer verification options, maintain trust.',
 'active', false, 100, 'all-mandatory',
 '[
   {"id":"s1","name":"Acknowledge Concern","type":"mandatory","score":30,"desc":"Positively acknowledge patient caution. Never get defensive. Use phrases like That is a great question, I am glad you are being careful.","condition":null},
   {"id":"s2","name":"Clear Identification","type":"mandatory","score":30,"desc":"Clearly state calling from Avergent Collaborative Care on behalf of health plan. Clarify what will NOT be asked (SSN, bank details).","condition":"Requires: Concern acknowledged"},
   {"id":"s3","name":"Offer Verification","type":"mandatory","score":25,"desc":"Provide callback number, suggest verifying via member ID card, offer to send official information.","condition":"Requires: Identity stated"},
   {"id":"s4","name":"Patient Control","type":"conditional","score":15,"desc":"Let patient choose next step: continue call, call back, or receive written info. Respect their decision.","condition":"If patient still hesitant"}
 ]'::JSONB,
 '["Patient concern addressed","Verification option offered","Patient continued or opted for callback"]'::JSONB,
 '["Anna"]'::JSONB, 92, 412)
ON CONFLICT (id) DO NOTHING;

-- Goal 9: Elderly & Tech-Challenged Patient Support
INSERT INTO goals (id, name, program, program_color, description, status, weighted_scoring, passing_score, mode, steps, success_metrics, agents, completion_rate, total_runs) VALUES
('9', 'Elderly Patient Accommodation', 'Outreach', 'blue',
 'Adapt communication for elderly or technology-challenged patients. Offer alternatives, involve family, use simple language.',
 'active', false, 100, 'all-mandatory',
 '[
   {"id":"s1","name":"Pace Adjustment","type":"mandatory","score":25,"desc":"Slow down speech pace, pause more, use simple everyday language. No jargon or acronyms.","condition":null},
   {"id":"s2","name":"Alternative Offered","type":"mandatory","score":30,"desc":"Proactively offer paper/mail alternatives and phone-based support when tech barriers detected.","condition":"Requires: Tech barrier detected"},
   {"id":"s3","name":"Family/Caregiver Inclusion","type":"conditional","score":25,"desc":"Offer to include family member on call or send info to caregiver if patient mentions one.","condition":"If patient mentions family helper"},
   {"id":"s4","name":"Comprehension Confirmation","type":"mandatory","score":20,"desc":"Repeat key information and confirm patient understanding before proceeding to next step.","condition":"After each major explanation"}
 ]'::JSONB,
 '["Alternative format offered","Patient confirmed understanding","Communication adapted to needs"]'::JSONB,
 '["Anna"]'::JSONB, 88, 634)
ON CONFLICT (id) DO NOTHING;

-- ─── 4. Insert/update Anna's workflow flow with MILU-specific nodes ───
-- First, mark any existing current flow as not current
UPDATE agent_flows SET is_current = false WHERE agent_id = 'a1';

-- Insert the new MILU workflow
INSERT INTO agent_flows (agent_id, version, is_current, nodes, edges, viewport) VALUES (
  'a1', '2.0', true,
  '[
    {"id":"start","type":"startNode","position":{"x":50,"y":300},"data":{"label":"Starts Here"}},
    {"id":"n1","type":"conversationNode","position":{"x":250,"y":230},"data":{"label":"Introduction & AI Disclosure","prompt":"Hello, this is Anna, an AI assistant calling on behalf of the Avergent care team. I am reaching out because you are eligible for some important healthcare benefits.\n\nIs now a good time to talk for about 5 minutes?","nodeType":"conversation","verified":true,"transitions":[{"condition":"If yes","target":"Identity Verification"},{"condition":"If no or busy","target":"Reschedule / Callback"}],"guardrails":"Always disclose AI identity upfront. Never say automated or robot. Offer human option immediately if patient is uncomfortable."}},
    {"id":"n2","type":"conversationNode","position":{"x":500,"y":120},"data":{"label":"Identity Verification","prompt":"To make sure I am speaking with the right person, could you please confirm your full name and date of birth?\n\nI will not ask for your Social Security number, bank details, or anything like that.","nodeType":"conversation","verified":true,"transitions":[{"condition":"Verified","target":"Task Check"},{"condition":"Incorrect DOB (1st attempt)","target":"DOB Retry"},{"condition":"Not verified (2nd attempt)","target":"Verification Failed"}],"guardrails":"Allow one DOB retry. Never recite DOB aloud. If third party on call, only say you have a message from Avergent."}},
    {"id":"n2b","type":"conversationNode","position":{"x":750,"y":50},"data":{"label":"DOB Retry","prompt":"I am sorry, that does not match what we have on file. Could you try once more? Sometimes the format can be tricky.","nodeType":"conversation","transitions":[{"condition":"Correct on retry","target":"Task Check"},{"condition":"Still incorrect","target":"Verification Failed"}],"guardrails":"Only one retry allowed."}},
    {"id":"n2c","type":"conversationNode","position":{"x":750,"y":180},"data":{"label":"Verification Failed","prompt":"I understand. For your privacy, I am unable to continue without verifying your identity. You can reach the Avergent care team directly at our callback number. Thank you for your time.","nodeType":"escalation","transitions":[{"condition":"End call","target":"End"}],"guardrails":"Provide callback number. Do not share any PHI."}},
    {"id":"n3","type":"conversationNode","position":{"x":500,"y":350},"data":{"label":"Reschedule / Callback","prompt":"No problem at all. When would be a better time for us to call you back?","nodeType":"appointment","transitions":[{"condition":"Time confirmed","target":"End"},{"condition":"Patient declines all calls","target":"Opt-Out"}],"guardrails":"Respect patient schedule. Do not pressure."}},
    {"id":"n4","type":"conversationNode","position":{"x":1000,"y":230},"data":{"label":"Task Check","prompt":"[SYSTEM: Check patient_login_activity for app status and get_form_response for MILU consent status. Determine which tasks are pending.]\n\nGreat, thank you for confirming. I have a couple of quick things to go over with you today regarding your healthcare benefits.","nodeType":"conversation","verified":true,"transitions":[{"condition":"App not set up","target":"FoldCare App Setup"},{"condition":"MILU not signed","target":"MILU Consent"},{"condition":"Both pending","target":"FoldCare App Setup"},{"condition":"Both complete","target":"Closing"}],"guardrails":"Only discuss pending items. Skip completed tasks."}},
    {"id":"n5","type":"conversationNode","position":{"x":1250,"y":120},"data":{"label":"FoldCare App Setup","prompt":"The FoldCare app is a free mobile app that helps you manage your health benefits and stay connected with your care team. You can see your medical information and message us easily.\n\nWould you like me to send you a secure link to download the app?","nodeType":"conversation","verified":true,"transitions":[{"condition":"Patient agrees","target":"App Link Delivery"},{"condition":"Patient declines or no smartphone","target":"App Alternative"},{"condition":"Patient has questions","target":"App FAQ"}],"guardrails":"Use simple language for elderly patients. Do not say it is easy. Offer paper/phone alternatives proactively."}},
    {"id":"n5b","type":"conversationNode","position":{"x":1500,"y":50},"data":{"label":"App Link Delivery","prompt":"Would you prefer I send that via text message, email, or both?\n\n[SYSTEM: Use SEND_SECURE_LINK with correct workflow_master_id based on channel preference]\n\nI have sent that over to you now. You should receive it shortly.","nodeType":"conversation","transitions":[{"condition":"Link sent","target":"MILU Consent Check"}],"guardrails":"Use correct automation workflow IDs. Send in background without dead air. Never combine app and consent links in one send."}},
    {"id":"n5c","type":"conversationNode","position":{"x":1500,"y":180},"data":{"label":"App Alternative","prompt":"That is completely fine. Our Collaborative Care Team is always willing to support you by phone. I will make a note of your preference.","nodeType":"conversation","transitions":[{"condition":"Continue","target":"MILU Consent Check"}],"guardrails":"Never pressure. Respect the decision."}},
    {"id":"n6","type":"conversationNode","position":{"x":1250,"y":350},"data":{"label":"MILU Consent","prompt":"I also wanted to let you know about MILU Health. It is a partner tool that works with your Collaborative Care benefit.\n\nIt securely requests your medical records from your doctors and pharmacists, and then their nurses review that information to help coordinate your care.\n\nYou might receive free text messages with helpful tips about your medications and care reminders.\n\nIt is completely free, totally optional, and you can opt out at any time. Would you like me to send you the consent form to review?","nodeType":"conversation","verified":true,"transitions":[{"condition":"Patient agrees","target":"Consent Link Delivery"},{"condition":"Patient declines","target":"Consent Declined"},{"condition":"Patient has questions","target":"MILU FAQ"}],"guardrails":"Describe as tool or service, not program. Emphasize optional, free, and can opt out. Answer questions using approved responses only."}},
    {"id":"n6b","type":"conversationNode","position":{"x":1500,"y":350},"data":{"label":"Consent Link Delivery","prompt":"Would you prefer to receive that by text, email, or both?\n\n[SYSTEM: Use SEND_FORM_LINK with correct workflow_master_id and form_id 76b85c65-6603-4835-8c7e-945e66adeb73]\n\nI have sent that over. You will receive a link to review and sign the electronic consent form.","nodeType":"conversation","transitions":[{"condition":"Link sent","target":"Closing"}],"guardrails":"Use correct consent automation IDs. NEVER combine with app link. Obtain verbal consent before sending."}},
    {"id":"n6c","type":"conversationNode","position":{"x":1500,"y":480},"data":{"label":"Consent Declined","prompt":"No problem at all. This is completely optional. I have noted that you are not interested, and that is absolutely fine. It will not affect your care or benefits in any way.","nodeType":"conversation","transitions":[{"condition":"Continue","target":"Closing"}],"guardrails":"Accept gracefully. Do not argue or re-pitch."}},
    {"id":"n7","type":"conversationNode","position":{"x":1750,"y":300},"data":{"label":"Closing","prompt":"Thank you so much for your time today. If you ever have questions, you can reach the Avergent care team anytime.\n\nHave a wonderful day!","nodeType":"conversation","transitions":[{"condition":"End","target":"End"}],"guardrails":"End positively regardless of outcome. Provide callback number if patient seems uncertain."}},
    {"id":"n8","type":"conversationNode","position":{"x":500,"y":500},"data":{"label":"Opt-Out","prompt":"I understand. I will remove you from our outreach list right now. You will not receive further calls from us about this. Thank you for your time, and have a good day.","nodeType":"escalation","transitions":[{"condition":"End","target":"End"}],"guardrails":"Log opt-out immediately. Do not try to convince. Comply immediately."}},
    {"id":"n9","type":"conversationNode","position":{"x":250,"y":500},"data":{"label":"Emergency Escalation","prompt":"[TRIGGERED: Patient mentions urgent medical issue]\n\nThis sounds urgent. Please hang up and call 911 right away. Your safety is the most important thing.\n\n[SYSTEM: Flag call for immediate clinical review]","nodeType":"escalation","transitions":[{"condition":"End","target":"End"}],"guardrails":"STOP all normal flow immediately. Direct to 911. Do not resume. Flag for clinical staff review."}},
    {"id":"end","type":"endNode","position":{"x":2000,"y":300},"data":{"label":"End"}}
  ]'::JSONB,
  '[
    {"id":"e-start-n1","source":"start","target":"n1","type":"smoothstep","animated":false},
    {"id":"e-n1-n2","source":"n1","target":"n2","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n1-n3","source":"n1","target":"n3","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n2-n4","source":"n2","target":"n4","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n2-n2b","source":"n2","target":"n2b","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n2-n2c","source":"n2","target":"n2c","sourceHandle":"t-2","type":"smoothstep"},
    {"id":"e-n2b-n4","source":"n2b","target":"n4","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n2b-n2c","source":"n2b","target":"n2c","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n2c-end","source":"n2c","target":"end","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n3-end","source":"n3","target":"end","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n3-n8","source":"n3","target":"n8","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n4-n5","source":"n4","target":"n5","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n4-n6","source":"n4","target":"n6","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n4-n5b","source":"n4","target":"n5","sourceHandle":"t-2","type":"smoothstep"},
    {"id":"e-n4-n7","source":"n4","target":"n7","sourceHandle":"t-3","type":"smoothstep"},
    {"id":"e-n5-n5b","source":"n5","target":"n5b","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n5-n5c","source":"n5","target":"n5c","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n5b-n6","source":"n5b","target":"n6","type":"smoothstep"},
    {"id":"e-n5c-n6","source":"n5c","target":"n6","type":"smoothstep"},
    {"id":"e-n6-n6b","source":"n6","target":"n6b","sourceHandle":"t-0","type":"smoothstep"},
    {"id":"e-n6-n6c","source":"n6","target":"n6c","sourceHandle":"t-1","type":"smoothstep"},
    {"id":"e-n6b-n7","source":"n6b","target":"n7","type":"smoothstep"},
    {"id":"e-n6c-n7","source":"n6c","target":"n7","type":"smoothstep"},
    {"id":"e-n7-end","source":"n7","target":"end","type":"smoothstep"},
    {"id":"e-n8-end","source":"n8","target":"end","type":"smoothstep"},
    {"id":"e-n9-end","source":"n9","target":"end","type":"smoothstep"}
  ]'::JSONB,
  '{"x":0,"y":0,"zoom":0.7}'::JSONB
);
