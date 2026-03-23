-- Agent Flows table: stores conversation flow graphs per agent
CREATE TABLE IF NOT EXISTS agent_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version TEXT NOT NULL DEFAULT '1.0',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  viewport JSONB DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Only one current version per agent
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_flows_current
  ON agent_flows(agent_id) WHERE is_current = true;

-- Enable RLS
ALTER TABLE agent_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to agent_flows"
  ON agent_flows FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create default flows for existing agents with starter nodes
INSERT INTO agent_flows (agent_id, version, nodes, edges) VALUES
('a1', '1.0',
 '[
   {"id":"start","type":"startNode","position":{"x":200,"y":300},"data":{"label":"Starts Here"}},
   {"id":"n1","type":"conversationNode","position":{"x":350,"y":240},"data":{"label":"Introduction & Patient Verification","prompt":"Hello, this is the Fold Health care support assistant calling as part of your Transitions of Care follow-up program.\n\nI''m reaching out because you were recently discharged from the hospital, and we want to make sure you''re recovering safely.\n\nIs now a good time to talk for about 5 minutes?","nodeType":"conversation","verified":true,"transitions":[{"condition":"If yes","target":"n2"},{"condition":"If no","target":"n3"}],"guardrails":"Do not share any patient data with the caller."}},
   {"id":"n2","type":"conversationNode","position":{"x":550,"y":120},"data":{"label":"Identity Verification Node","prompt":"To make sure I''m speaking with the right person, could you please confirm your full name and date of birth?","nodeType":"conversation","verified":true,"transitions":[{"condition":"Verified","target":"n4"},{"condition":"Not verified","target":"n5"}]}},
   {"id":"n3","type":"conversationNode","position":{"x":500,"y":480},"data":{"label":"Reschedule Node","prompt":"No problem. When would be a better time for us to call you back?","nodeType":"conversation","transitions":[{"condition":"Save callback time","target":"end"}]}},
   {"id":"n4","type":"conversationNode","position":{"x":750,"y":60},"data":{"label":"Discharge Confirmation","prompt":"Thank you for confirming. I can see you were recently discharged. How are you feeling today?","nodeType":"conversation","transitions":[{"condition":"Good","target":"n6"},{"condition":"Concerns","target":"n7"}]}},
   {"id":"n5","type":"conversationNode","position":{"x":750,"y":200},"data":{"label":"Transfer to Staff","prompt":"I''ll need to transfer you to a staff member for verification.","nodeType":"callTransfer","transitions":[]}},
   {"id":"n6","type":"conversationNode","position":{"x":950,"y":20},"data":{"label":"Medication Check","prompt":"Great to hear. Let me go through your discharge medications to make sure everything is in order.","nodeType":"conversation","transitions":[{"condition":"All confirmed","target":"end"}]}},
   {"id":"n7","type":"conversationNode","position":{"x":950,"y":160},"data":{"label":"Escalation","prompt":"I understand you have some concerns. Let me connect you with a care coordinator.","nodeType":"escalation","transitions":[]}},
   {"id":"end","type":"endNode","position":{"x":1150,"y":100},"data":{"label":"End"}}
 ]'::jsonb,
 '[
   {"id":"e-start-n1","source":"start","target":"n1","type":"smoothstep","animated":true},
   {"id":"e-n1-n2","source":"n1","target":"n2","sourceHandle":"t-0","type":"smoothstep","label":"If yes"},
   {"id":"e-n1-n3","source":"n1","target":"n3","sourceHandle":"t-1","type":"smoothstep","label":"If no"},
   {"id":"e-n2-n4","source":"n2","target":"n4","sourceHandle":"t-0","type":"smoothstep","label":"Verified"},
   {"id":"e-n2-n5","source":"n2","target":"n5","sourceHandle":"t-1","type":"smoothstep","label":"Not verified"},
   {"id":"e-n3-end","source":"n3","target":"end","sourceHandle":"t-0","type":"smoothstep","label":"Save callback time"},
   {"id":"e-n4-n6","source":"n4","target":"n6","sourceHandle":"t-0","type":"smoothstep","label":"Good"},
   {"id":"e-n4-n7","source":"n4","target":"n7","sourceHandle":"t-1","type":"smoothstep","label":"Concerns"},
   {"id":"e-n6-end","source":"n6","target":"end","sourceHandle":"t-0","type":"smoothstep","label":"All confirmed"}
 ]'::jsonb
);
