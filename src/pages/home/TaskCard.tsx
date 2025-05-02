import { Task } from '@/types/task.ts';
import { cn } from '@/lib/utils.ts';

export function TaskCard(props: { item: Task, className?: string }) {
  return <div
    className={cn('rounded-md h-16 shadow-md flex items-center px-4 cursor-grab bg-white', props.className)}>{`${props.item.name}`}
  </div>;
}
