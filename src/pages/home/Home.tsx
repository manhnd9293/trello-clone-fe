import { useEffect, useRef, useState } from 'react';
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskColumn } from '@/pages/home/TaskColumn.tsx';
import { TaskCard } from '@/pages/home/TaskCard.tsx';
import AddColumnButton from '@/pages/home/AddColumnButton.tsx';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnsService } from '@/services/columns/columns.service.ts';
import { Task } from '@/services/tasks/task.ts';
import { TasksService } from '@/services/tasks/tasks.service.ts';
import { Column } from '@/services/columns/column.ts';
import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';

export function Home() {
  const [idToColumns, setIdToColumns] = useState<{ [key: string]: Column }>({});
  const [activeId, setActiveId] = useState<null | string>(null);
  // const queryClient = useQueryClient();
  //
  const {data, isLoading: loadingColumn} = useQuery({
    queryKey: ["allColumns"],
    queryFn: ColumnsService.getAllColumns,
  });
  const startDragTaskRef = useRef<Task>(null);
  const newActiveTaskRef = useRef<Task>(null);

  useEffect (()=> {
    ColumnsService.getAllColumns().then(data => setIdToColumns(data));
  }, [])


  const {mutateAsync: mutateAddTask} = useMutation({
    mutationFn: TasksService.addTask
  });

  const {mutateAsync: mutateTaskPositionAsync} = useMutation({
    mutationFn: TasksService.updateTaskPosition
  });

  async function handleCreateItem(data: TaskCreateDto) {
    const task = await mutateAddTask(data);

    setIdToColumns(prev => ({
      ...prev,
      [task.columnId]: {
        ...prev[task.columnId],
        tasks: [...(prev[task.columnId].tasks || []), task]
      }
    }))
  }

  async function handleDragEnd(event: DragEndEvent) {

    if(!idToColumns) return;

    const {active, over} = event;
    const {id: activeId} = active;
    const overId = over?.id;

    console.log({activeId, overId})

    if (!activeId || !overId || (activeId === overId && newActiveTaskRef.current === null)) {
      return;
    }
    startDragTaskRef.current = null;
    newActiveTaskRef.current = null;

    const activeColumnId = findContainerId(activeId as string);
    const overColumnId = findContainerId(overId as string);
    console.log({activeColumnId, overColumnId})
    if (!activeColumnId || !overColumnId) {
      return;
    }
    if (activeColumnId !== overColumnId) {
      const overColumn = idToColumns[overColumnId];
      const overColumTasks = overColumn.tasks || [];
      const overIndex = overId === overColumnId ? 0 : overColumTasks.findIndex(task => task.id === overId);
      await mutateTaskPositionAsync({
        id: String(activeId),
        position: overIndex,
        columnId: overColumnId
      })
      return;
    }

    const activeItems = idToColumns[activeColumnId];
    const tasks = activeItems.tasks || [];
    const oldIndex = tasks.findIndex(item => item.id === activeId);
    const newIndex = tasks.findIndex(item => item.id === overId);

    const newIdToColumns = {
      ...idToColumns,
      [activeColumnId]: {
        ...idToColumns[activeColumnId],
        tasks: arrayMove(tasks, oldIndex, newIndex)
      }
    };
    setIdToColumns(newIdToColumns);
    await mutateTaskPositionAsync({
      id: String(activeId),
      position: newIndex,
      columnId: activeColumnId
    })
  }

  async function handleDragOver(event: DragOverEvent) {
    const activeId = event.active.id as string;
    const overId = event.over?.id as string || null;
    if (!overId) {
      return;

    }
    const activeColumnId = findContainerId(activeId);
    const overColumnId = findContainerId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }

    const activeColumn = idToColumns[activeColumnId];
    const overColumn = idToColumns[overColumnId];
    const newActiveColumnTasks = (activeColumn.tasks || []).filter(task => task.id !== activeId);
    let newOverColumnTasks: Task[] = [];
    const currentActiveItem = (activeColumn.tasks || []).find(task => task.id === activeId)!;
    const newActiveItem = {...currentActiveItem, columnId: overColumnId};
    const overColumTasks = overColumn.tasks || [];
    const overIndex = overId === overColumnId ? 0 : overColumTasks.findIndex(task => task.id === overId);
    if (overId === overColumnId) {
      newOverColumnTasks = [...overColumTasks, newActiveItem];
    } else {
      newOverColumnTasks = [...overColumTasks.slice(0, overIndex), newActiveItem, ...overColumTasks.slice(overIndex, overColumTasks.length)]
    }

    newActiveTaskRef.current = structuredClone(newActiveItem);
    setIdToColumns(prevState => ({
      ...prevState,
      [activeColumnId]: {...activeColumn, tasks: newActiveColumnTasks},
      [overColumnId]: {...overColumn, tasks: newOverColumnTasks}
    }))
  }

  function handleStartDrag(e: DragStartEvent) {
    const {active} = e;
    const startId = String(active.id);
    setActiveId(startId);
    const startDragTask = (Object.values(idToColumns || []).map(value => (value.tasks || []))).flat().find(item => item.id === startId);
    startDragTaskRef.current = structuredClone(startDragTask!);
  }

  function findContainerId(taskOrColumnId: string) {
    if (!idToColumns) {
      return null;
    }
    if (taskOrColumnId in idToColumns) { // case columnId
      return taskOrColumnId;
    }
    return Object.keys(idToColumns)
      .find(key => (idToColumns[key].tasks || []).find(task => task.id === taskOrColumnId)); // case taskId
  }

  const activeItem: Task | undefined = activeId ?
    (Object.values(idToColumns || []).map(value => (value.tasks || []))).flat().find(item => item.id === activeId)
    : undefined;

  return (
    <div className={'min-h-dvh bg-slate-50'}>
      <div className={'font-bold text-xl bg-white h-16 flex items-center justify-center text-cyan-600 shadow-sm'}>
        <div className={'max-w-6xl text-xl'}>Trello</div>
      </div>
      <div className={'max-w-7xl mx-auto overflow-y-auto min-w-2xl p-4'}>
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
                !loadingColumn && idToColumns && Object.keys(idToColumns).map((id) => {
                  return (
                    <div className={'w-xs'} key={id}>
                      <div className={'flex items-baseline justify-start gap-2'}>
                      </div>
                      <TaskColumn column={idToColumns[id]}
                                  id={id}
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
