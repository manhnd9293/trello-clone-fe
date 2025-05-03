import { cn } from '@/lib/utils.ts';
import { Task } from '@/services/tasks/task.ts';

export function TaskCard(props: { item: Task, className?: string }) {
  return <div
    className={cn('rounded-md min-h-16 shadow-md flex items-center px-4 cursor-grab bg-white', props.className)}>{`${props.item.name}`}
  </div>;
}
