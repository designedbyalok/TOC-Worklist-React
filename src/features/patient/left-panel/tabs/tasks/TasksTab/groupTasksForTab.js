/** Map store task rows into the shape TasksTab expects. */
export function groupTasksForTab(tasks) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pending = [];
  const overdue = [];
  const completed = [];
  (tasks || []).forEach((t) => {
    const shared = {
      id: t.id,
      title: t.name || 'Task',
      priority: t.priority || 'medium',
      due: t.due_date || '',
      subtasks: t.subtasks || 0,
      attachments: t.attachments || 0,
      comments: t.comments || 0,
      assignee: t.assigned_to || '',
      assigneeInitials: t.assigned_to ? t.assigned_to.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '',
    };
    if (t.status === 'completed') {
      completed.push({ ...shared, completedOn: t.completed_at || t.updated_at || '' });
      return;
    }
    if (t.status === 'missed') {
      overdue.push(shared);
      return;
    }
    const dueDate = t.due_date ? new Date(t.due_date) : null;
    if (dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < today) {
      overdue.push(shared);
    } else {
      pending.push(shared);
    }
  });
  return { pending, overdue, completed };
}
