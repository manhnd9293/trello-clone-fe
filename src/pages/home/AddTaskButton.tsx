import { Dices, PlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';
import { TaskCreateDto } from '@/services/tasks/task-create.dto.ts';
import { Textarea } from '@/components/ui/textarea.tsx';

type AddTaskButtonProps = {
  columnId: string;
  onCreateTask: (data: TaskCreateDto) => void
}

function AddTaskButton({columnId, onCreateTask}: AddTaskButtonProps) {
  const [showInput, setShowInput] = useState(false);
  const [taskName, setTaskName] = useState('');

  async function pickRandomTask() {
    const response = await fetch('https://dummyjson.com/todos/random')
      .then(res => res.json());
    setTaskName(response.todo)
  }

  function handleCreateTask() {
    setTaskName('');
    onCreateTask({
      name: taskName,
      columnId
    })

  }

  return (
    <div>
      {
        showInput && (
          <div className={'flex flex-col gap-2 items-center w-full'}>
            <div className={'flex w-[90%] gap-2 items-center'}>
              <Textarea placeholder={'Task'}
                     value={taskName}
                     onChange={e => setTaskName(e.target.value)}
                     className={'bg-white w-full'}
              />
              <Button variant={'secondary'}
                      onClick={pickRandomTask}
                      className={'bg-cyan-200 hover:bg-cyan-500 text-cyan-900'}
              >
                <Dices className={'size-4'}/>
              </Button>
            </div>
            <div className={'flex gap-2 w-full items-center justify-center mt-2'}>
              <Button onClick={handleCreateTask}>Add</Button>

              <Button variant={'secondary'} onClick={() => {
                setTaskName('');
                setShowInput(false)
              }}>
                <XIcon/>
              </Button>
            </div>
          </div>
        )
      }
      {
        !showInput &&
        <Button size={'sm'}
                variant={'outline'}
                className={'bg-transparent border-none hover:bg-cyan-100 hover:text-cyan-700 hover:bg-cyan-200 hover:font-bold w-full'}
                onClick={() => setShowInput(true)}
        >
          <PlusIcon/>
          <span>Add a task</span>
        </Button>
      }
    </div>
  );
}

export default AddTaskButton;
