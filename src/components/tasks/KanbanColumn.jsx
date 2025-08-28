import React from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TaskCard from './TaskCard';

export default function KanbanColumn({ columnId, column, index, onTaskClick }) {
  return (
    <Draggable draggableId={columnId} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="w-80 flex-shrink-0"
        >
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full">
            <div 
              {...provided.dragHandleProps}
              className="p-4 border-b border-gray-200 flex items-center justify-between cursor-grab"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <Droppable droppableId={columnId} type="TASK">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 space-y-3 flex-1 overflow-y-auto transition-colors min-h-24 ${snapshot.isDraggingOver ? 'bg-purple-50' : ''}`}
                >
                  {column.tasks.map((task, taskIndex) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={taskIndex} 
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                  {provided.placeholder}
                  {column.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No tasks yet</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      )}
    </Draggable>
  );
}