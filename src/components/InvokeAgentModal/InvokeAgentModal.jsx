import { useState } from 'react';
import { Avatar } from '../Avatar/Avatar';
import { Icon } from '../Icon/Icon';
import { useAppStore } from '../../store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const AGENTS = [
  { name: 'Ricardo', role: 'SNP Agent' },
  { name: 'Erica', role: 'TOC Agent' },
  { name: 'Maria', role: 'AWV Agent' },
  { name: 'Jia', role: 'Follow-up Agent' },
  { name: 'Dubois', role: 'SDOH Agent' },
];

export function InvokeAgentModal() {
  const [selected, setSelected] = useState(null);
  const selectedIds = useAppStore(s => s.selectedIds);
  const invokeAgent = useAppStore(s => s.invokeAgent);
  const showInvokeModal = useAppStore(s => s.showInvokeModal);
  const setShowInvokeModal = useAppStore(s => s.setShowInvokeModal);

  const handleConfirm = () => {
    if (!selected) return;
    const agent = AGENTS.find(a => a.name === selected);
    invokeAgent(selectedIds, agent.name, agent.role);
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setShowInvokeModal(false);
      setSelected(null);
    }
  };

  return (
    <Dialog open={showInvokeModal} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[360px] p-4 gap-3">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium text-[var(--neutral-400)] px-1">
            Select Agent to Invoke
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose an agent to invoke for the selected patients.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selected}
          onValueChange={setSelected}
          className="grid gap-1"
        >
          {AGENTS.map(agent => (
            <label
              key={agent.name}
              className={[
                'flex items-center gap-2.5 px-2 py-1 rounded-lg cursor-pointer border-[1.5px] transition-all duration-150',
                selected === agent.name
                  ? 'bg-[var(--primary-50)] border-[var(--primary-200)]'
                  : 'border-transparent hover:bg-[var(--primary-50)]',
              ].join(' ')}
            >
              <RadioGroupItem value={agent.name} />
              <Avatar variant="invokeAgent" agentName={agent.name} />
              <div className="flex-1">
                <div className="text-sm font-medium text-[var(--neutral-400)]">{agent.name}</div>
                <div className="text-xs text-[var(--neutral-300)] mt-px">{agent.role}</div>
              </div>
              {selected === agent.name && (
                <Icon name="solar:play-bold" size={14} color="var(--primary-300)" />
              )}
            </label>
          ))}
        </RadioGroup>

        <DialogFooter className="flex-row gap-2.5 mt-0 sm:flex-row">
          <button
            className="flex-1 h-8 rounded px-2 text-[13px] font-medium border border-[var(--neutral-150)] bg-[var(--neutral-0)] text-[var(--neutral-400)] hover:bg-[var(--neutral-50)] hover:border-[var(--neutral-200)] transition-all duration-150 cursor-pointer"
            onClick={() => setShowInvokeModal(false)}
          >
            Cancel
          </button>
          <button
            className="flex-1 h-8 rounded px-2 text-[13px] font-medium border border-[var(--primary-300)] bg-[var(--primary-300)] text-white hover:bg-[var(--primary-400)] hover:border-[var(--primary-400)] transition-all duration-150 cursor-pointer disabled:bg-[var(--neutral-100)] disabled:border-[var(--neutral-100)] disabled:text-[var(--neutral-200)] disabled:cursor-not-allowed"
            disabled={!selected}
            onClick={handleConfirm}
          >
            Invoke Agent
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
