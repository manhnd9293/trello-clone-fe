import { useState } from 'react';
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ColumnIdType } from '@/types/colum-id-type.ts';
import { TaskColumn } from '@/pages/home/TaskColumn.tsx';
import { TaskCard } from '@/pages/home/TaskCard.tsx';
import AddColumnButton from '@/pages/home/AddColumnButton.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ColumnsService } from '@/services/columns/columns.service.ts';
import { Task } from '@/services/tasks/task.ts';
import { TasksService } from '@/services/tasks/tasks.service.ts';
import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';

export function Home() {
  const [items, setItems] = useState<{ [key: string]: Task[] }>({});
  const [activeId, setActiveId] = useState<null | string>(null);

  const {data: columns, isLoading: loadingColumn} = useQuery({
    queryKey: ["Columns"],
    queryFn: ColumnsService.getAllColumns,
  });

  const {mutateAsync: mutateAddTask} = useMutation({
    mutationFn: TasksService.addTask
  });

  async function handleCreateItem(data: TaskCreateDto) {
    const task = await mutateAddTask(data);
    setItems(items => ({
        ...items, [data.columnId]: [...items[data.columnId], task]
      })
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    const {id: activeId} = active;
    const overId = over?.id;

    if (!activeId || !overId || activeId === overId) {
      return;
    }
    const activeColumnId = findContainerId(activeId as string);
    const overColumnId = findContainerId(overId as string);

    if (!activeColumnId || !overColumnId) {
      return;
    }
    if (activeColumnId !== overColumnId) {
      return;

    }

    if (activeColumnId !== overColumnId) {
      return;
    }

    const activeItems = items[activeColumnId];
    const oldIndex = activeItems.findIndex(item => item.id === activeId);
    const newIndex = activeItems.findIndex(item => item.id === overId);
    setItems(
      {
        ...items,
        [activeColumnId]: arrayMove(activeItems, oldIndex, newIndex)
      }
    );

  }

  function handleDragOver(event: DragOverEvent) {
    const activeId = event.active.id as string;
    const overId = event.over?.id as ColumnIdType || null;
    const activeColumnId = findContainerId(activeId);
    const overColumnId = findContainerId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    const activeItems = items[activeColumnId];
    const overItems = items[overColumnId];
    const newActiveItems = activeItems.filter(item => item.id !== activeId);
    let newOverItems: Task[] = [];
    const activeItem = activeItems.find(item => item.id === activeId)!;
    if (overId === overColumnId) {
      newOverItems = [...overItems, activeItem];
    } else {
      const overIndex = overItems.findIndex(item => item.id === overId);
      newOverItems = [...overItems.slice(0, overIndex), activeItem, ...overItems.slice(overIndex, overItems.length)]
    }

    setItems({
      ...items,
      [activeColumnId]: newActiveItems,
      [overColumnId]: newOverItems
    });
  }

  function handleStartDrag(e: DragStartEvent) {
    const {active} = e;
    setActiveId(String(active.id));
  }

  function findContainerId(taskOrColumnId: string) {
    if (taskOrColumnId in items) { // case columnId
      return taskOrColumnId;
    }
    return Object.keys(items).find(key => items[key].find(task => task.id === taskOrColumnId)); // case taskId
  }

  const activeItem: Task | undefined = activeId ? Object.values(items).flat().find(item => item.id === activeId) : undefined;

  return (
    <div className={'min-h-dvh bg-slate-50'}>
      <div className={'font-bold text-xl bg-white h-16 flex items-center justify-center text-cyan-600 shadow-sm'}>
        <div className={'max-w-6xl text-xl'}>Trello</div>
      </div>
      <div className={'max-w-7xl mx-auto overflow-y-auto'}>
        <div className={'mx-auto'}>
          <div className={'mt-4 font-semibold text-xl'}>Tasks management</div>
          {loadingColumn && <div>Loading ....</div>}
          <DndContext onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      collisionDetection={closestCorners}
                      onDragStart={handleStartDrag}
          >
            <div className={'mt-4 flex gap-4 items-start'}>
              {
                loadingColumn && <div>Loading column ...</div>
              }
              {
                !loadingColumn && columns && columns.map((column) => {
                  return (
                    <div className={'w-xs'} key={column.id}>
                      <div className={'flex items-baseline justify-start gap-2'}>
                      </div>
                      <TaskColumn tasks={column.tasks || []}
                                  column={column}
                                  id={column.id}
                                  onCreateTask={handleCreateItem}
                      />
                    </div>
                  )
                })
              }
              <AddColumnButton/>
            </div>

            <DragOverlay>
              {activeItem ? <TaskCard item={activeItem}/> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}


export default Home;
