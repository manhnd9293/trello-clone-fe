import { Task } from '@/services/tasks/task.ts';

export class Column {
  id: string;
  name: string;
  tasks: Task[] | null = [];
}

