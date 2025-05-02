import { cn } from '@/lib/utils.ts';
import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useMutation } from '@tanstack/react-query';
import { ColumnsService } from '@/services/columns/columns.service.ts';

// type AddColumnButtonProps = {}

function AddColumnButton() {
  const [showForm, setShowForm] = useState(false);
  const [columnName, setColumnName] = useState('');
  const {mutateAsync} = useMutation({
    mutationFn: ColumnsService.addColumn
  });

  async function handleAddColumn() {
    if (!columnName) {
      return;
    }
    setColumnName('');
    setShowForm(false);
    await mutateAsync(columnName);
  }

  return <div
    className={
      cn('rounded-md w-xs shadow-md flex items-center px-4 cursor-pointer bg-white p-2')}>
    {
      !showForm &&
      <div className={'flex items-center gap-2 justify-center w-full'} onClick={() => setShowForm(true)}>
        <PlusIcon size={4}/>
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
