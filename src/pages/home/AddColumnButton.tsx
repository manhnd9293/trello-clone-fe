import { cn } from '@/lib/utils.ts';
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

type AddColumnButtonProps = {
  onAddColumn: (name: string) => void
}

function AddColumnButton({onAddColumn}: AddColumnButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [columnName, setColumnName] = useState('');


  async function handleAddColumn() {
    if (!columnName) {
      return;
    }
    setColumnName('');
    setShowForm(false);
    onAddColumn(columnName)
  }

  return <div
    className={
      cn('rounded-md min-w-[220px] shadow-sm flex items-center px-4 cursor-pointer bg-white p-2')}>
    {
      !showForm &&
      <div className={'flex items-center gap-2 justify-center w-full'}
           onClick={() => setShowForm(true)}>
        <PlusIcon className={'size-4'}/>
        <span>Add a column</span>
      </div>
    }
    {
      showForm &&
      <div className={'flex flex-col gap-2 w-full'}>
        <Input placeholder={'Enter column name'} value={columnName}
               onChange={(event) => setColumnName(event.target.value)}/>
        <Button onClick={handleAddColumn}>Add column</Button>
      </div>
    }
  </div>;
}

export default AddColumnButton;
