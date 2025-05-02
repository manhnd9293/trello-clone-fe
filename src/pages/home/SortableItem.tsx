import { CSS } from '@dnd-kit/utilities';

import { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';

type DragItemProp = {
  id: string,
  children: ReactNode
}

function SortableItem({id, children}: DragItemProp) {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}

export default SortableItem;
