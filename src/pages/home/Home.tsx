import { useEffect, useRef, useState } from 'react';
import { closestCorners, DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskColumn } from '@/pages/home/TaskColumn.tsx';
import { TaskCard } from '@/pages/home/TaskCard.tsx';
import AddColumnButton from '@/pages/home/AddColumnButton.tsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ColumnsService } from '@/services/columns/columns.service.ts';
import { Task } from '@/services/tasks/task.ts';
import { TasksService } from '@/services/tasks/tasks.service.ts';
import { Column } from '@/services/columns/column.ts';
import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';

export function Home() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeId, setActiveId] = useState<null | string>(null);

  const {data, isLoading: loadingColumn} = useQuery({
    queryKey: ["allColumns"],
    queryFn: ColumnsService.getAllColumns,
  });
  const startDragTaskRef = useRef<Task>(null);
  const newActiveTaskRef = useRef<Task>(null);

  useEffect (()=> {
    ColumnsService.getAllColumns().then(data => setColumns(data));
  }, [])


  const {mutateAsync: mutateAddColumn} = useMutation({
    mutationFn: ColumnsService.addColumn
  });

  const {mutateAsync: mutateAddTask} = useMutation({
    mutationFn: TasksService.addTask
  });

  const {mutateAsync: mutateTaskPositionAsync} = useMutation({
    mutationFn: TasksService.updateTaskPosition
  });

  async function handleCreateTask(data: TaskCreateDto) {
    const task = await mutateAddTask(data);
    const updateIndex = columns.findIndex(column => column.id === task.columnId);
    const oldColumn = columns[updateIndex];
    const updateColumn : Column = {...oldColumn, tasks: (oldColumn.tasks || []).concat(task)}
    setColumns(prev => ([
      ...prev.slice(0, updateIndex),
      updateColumn,
      ...prev.slice(updateIndex + 1, columns.length)
    ]))

  }

  async function handleDragEnd(event: DragEndEvent) {
    if(!columns) return;

    const {active, over} = event;
    const {id: activeId} = active;
    const overId = over?.id;

    if (!activeId || !overId || (activeId === overId && newActiveTaskRef.current === null)) {
      return;
    }
    startDragTaskRef.current = null;
    newActiveTaskRef.current = null;

    const activeColumnId = findColumnId(activeId as string);
    const overColumnId = findColumnId(overId as string);
    if (!activeColumnId || !overColumnId) {
      return;
    }
    if (activeColumnId !== overColumnId) {
      const overColumn = columns.find(c => c.id === overColumnId);
      const overColumTasks = overColumn?.tasks || [];
      const overIndex = overId === overColumnId ? 0 : overColumTasks.findIndex(task => task.id === overId);
      await mutateTaskPositionAsync({
        id: String(activeId),
        position: overIndex,
        columnId: overColumnId
      })
      return;
    }

    const updateColumns = structuredClone(columns);
    const activeColumn = updateColumns.find(c => c.id === activeColumnId)
    const tasks = activeColumn?.tasks || [];
    const oldIndex = tasks.findIndex(task => task.id === activeId);
    const newIndex = tasks.findIndex(task => task.id === overId);
    activeColumn!.tasks = arrayMove(tasks, oldIndex, newIndex)

    setColumns(updateColumns);
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
    const activeColumnId = findColumnId(activeId);
    const overColumnId = findColumnId(overId);

    if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
      return;
    }
    const updateColumns = structuredClone(columns);

    const activeColumn = updateColumns.find(c => c.id === activeColumnId)!;
    const overColumn = updateColumns.find(c => c.id === overColumnId)!;

    const currentActiveItem = (activeColumn!.tasks || []).find(task => task.id === activeId)!;
    activeColumn.tasks = (activeColumn!.tasks || []).filter(task => task.id !== activeId);

    const overColumTasks = overColumn!.tasks || [];
    const overIndex = overId === overColumnId ? 0 : overColumTasks.findIndex(task => task.id === overId);
    const newActiveTask : Task = {...currentActiveItem, columnId: overColumnId};
    if (overId === overColumnId) {
      overColumn.tasks = [...overColumTasks, newActiveTask];
    } else {
      overColumn.tasks = [...overColumTasks.slice(0, overIndex), newActiveTask, ...overColumTasks.slice(overIndex, overColumTasks.length)]
    }

    newActiveTaskRef.current = structuredClone(newActiveTask);
    setColumns(updateColumns)
  }

  function handleStartDrag(e: DragStartEvent) {
    const {active} = e;
    const startId = String(active.id);
    setActiveId(startId);
    const startDragTask =  columns.reduce((tasks: Task[], column: Column) => {
      const colTasks = column.tasks || []
      tasks.push(...colTasks);
      return tasks;
    }, []).find(t => t.id === activeId);
    startDragTaskRef.current = structuredClone(startDragTask!);
  }

  function findColumnId(taskOrColumnId: string) {
    if (!columns) {
      return null;
    }
    if (columns.find(c => c.id === taskOrColumnId)) { // case columnId
      return taskOrColumnId;
    }
    const col =  columns.find(c => (c.tasks || []).some(task => task.id  === taskOrColumnId)); // case taskId
    return col!.id;
  }

  const activeTask: Task | undefined = activeId ?
    columns.reduce((tasks: Task[], column: Column) => {
      const colTasks = column.tasks || []
      tasks.push(...colTasks);
      return tasks;
    }, []).find(t => t.id === activeId)
    : undefined;


  async function handleAddColumn(name: string) {
    const column = await mutateAddColumn(name);
    setColumns(prev => [...prev, column]);
  }

  return (
    <div className={'min-h-dvh bg-slate-50'}>
      <div className={'font-bold text-xl bg-white h-16 flex items-center justify-center text-cyan-600 shadow-sm'}>
        <div className={'max-w-6xl text-xl'}>Trello</div>
      </div>
      <div className={'max-w-7xl mx-auto overflow-y-auto min-w-2xl h-[900px] p-4'}>
        <div className={'mx-auto'}>
          <div className={'mt-4 font-semibold text-xl'}>Tasks management</div>
          {loadingColumn && <div>Loading ....</div>}
          <DndContext onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      collisionDetection={closestCorners}
                      onDragStart={handleStartDrag}
          >
            <div className={'mt-4 flex gap-4 items-start flex-nowrap'}>
              {
                loadingColumn && <div>Loading column ...</div>
              }
              {
                !loadingColumn && columns.map((column) => {
                  return (
                    <div className={'w-xs'} key={column.id}>
                      <div className={'flex items-baseline justify-start gap-2'}>
                      </div>
                      <TaskColumn column={column}
                                  id={column.id}
                                  onCreateTask={handleCreateTask}
                      />
                    </div>
                  )
                })
              }
              <AddColumnButton onAddColumn={handleAddColumn}/>
            </div>

            <DragOverlay>
              {activeTask ? <TaskCard item={activeTask}/> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}


export default Home;
