import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils.ts';
import SortableItem from '@/pages/home/SortableItem.tsx';
import { TaskCard } from '@/pages/home/TaskCard.tsx';
import { Column } from '@/services/columns/column.ts';
import AddTaskButton from '@/pages/home/AddTaskButton.tsx';
import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';

type TaskColumnProps = {
  id: string,
  column: Column,
  onCreateTask: (data: TaskCreateDto) => void
}

export function TaskColumn({ id, onCreateTask, column}: TaskColumnProps) {
  const {setNodeRef, active} = useDroppable({
    id
  });

  const activeId = active?.id;

  return (
    <SortableContext items={column.tasks ||[]} strategy={verticalListSortingStrategy} id={id}>
      <div ref={setNodeRef} className={
        cn('w-[220px] mt-2 p-2 bg-slate-100 rounded-md shadow-md flex flex-col gap-2 max-h-[600px] overflow-y-auto')
      }>
        <h1 className={'font-semibold text-center'}>{column.name}</h1>
        {(column.tasks || []).map(task => {
          return (
            <SortableItem key={task.id} id={task.id}>
              <TaskCard item={task} className={activeId === task.id ? 'bg-gray-300 text-gray-300' : ''}/>
            </SortableItem>
          )
        })}
        <AddTaskButton columnId={column.id}
                       onCreateTask={onCreateTask}/>
      </div>
    </SortableContext>
  )
}
