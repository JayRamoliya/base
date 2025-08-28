import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  Paperclip, 
  CheckSquare,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/api/entities';

const priorityColors = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200", 
  high: "bg-orange-100 text-orange-700 border-orange-200",
  urgent: "bg-red-100 text-red-700 border-red-200"
};

export default function TaskCard({ task, index, onClick }) {
  const [assignedUser, setAssignedUser] = React.useState(null);

  React.useEffect(() => {
    const loadAssignedUser = async () => {
      if (task.assigned_to) {
        try {
          const users = await User.list();
          const user = users.find(u => u.email === task.assigned_to);
          setAssignedUser(user);
        } catch (error) {
          console.error("Failed to load assigned user:", error);
        }
      }
    };
    loadAssignedUser();
  }, [task.assigned_to]);

  const getChecklistProgress = () => {
    if (!task.checklist || task.checklist.length === 0) return null;
    
    const totalItems = task.checklist.reduce((acc, checklist) => acc + checklist.items.length, 0);
    const completedItems = task.checklist.reduce((acc, checklist) => 
      acc + checklist.items.filter(item => item.completed).length, 0
    );
    
    return { completed: completedItems, total: totalItems };
  };

  const checklistProgress = getChecklistProgress();

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-pointer hover:shadow-md transition-all duration-200 bg-white border-gray-200 ${
            snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
          }`}
          onClick={onClick}
        >
          <CardContent className="p-4">
            {/* Task Title */}
            <h4 className="font-medium text-gray-900 mb-3 line-clamp-2">
              {task.title}
            </h4>

            {/* Task Description - if exists */}
            {task.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Priority Badge */}
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${priorityColors[task.priority]} border text-xs font-medium`}>
                {task.priority}
              </Badge>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Checklist Progress */}
                {checklistProgress && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CheckSquare className="w-3 h-3" />
                    <span>{checklistProgress.completed}/{checklistProgress.total}</span>
                  </div>
                )}

                {/* Attachment Indicator */}
                {task.attachment_url && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Paperclip className="w-3 h-3" />
                  </div>
                )}

                {/* Due Date */}
                {task.due_date && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CalendarIcon className="w-3 h-3" />
                    <span>{format(new Date(task.due_date), 'MMM d')}</span>
                  </div>
                )}
              </div>

              {/* Assigned User Avatar */}
              {task.assigned_to && (
                <div className="flex items-center">
                  {assignedUser ? (
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-purple-100 text-purple-600 text-xs font-medium">
                        {assignedUser.full_name?.charAt(0) || assignedUser.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
}