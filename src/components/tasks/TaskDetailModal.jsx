
import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '@/api/entities';
import { Activity } from '@/api/entities';
import { Comment } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Type, 
  AlignLeft, 
  CheckSquare, 
  Trash2, 
  Tag,
  Paperclip,
  MessageSquare,
  Send
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';

const priorityOptions = ["low", "medium", "high", "urgent"];

// New component to encapsulate the task editing UI
function TaskEditModalContent({
  task,
  comments,
  user,
  companyId,
  onClose,
  onSave, // Prop for saving changes (calls parent's handleUpdate)
  onDelete, // Prop for deleting task (calls parent's handleDelete)
  onReloadComments // Prop to trigger reloading comments (calls parent's loadData)
}) {
  // Internal state to manage changes before saving to parent
  const [editedTask, setEditedTask] = useState(task);
  const [newComment, setNewComment] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("Checklist");

  // Update internal editedTask whenever the 'task' prop changes
  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  const handleFieldUpdate = async (field, value) => {
    // Only call onSave if the value has actually changed
    if (editedTask[field] !== value) {
      try {
        await onSave({ [field]: value });
      } catch (error) {
        console.error(`Failed to save ${field}:`, error);
        // Optionally, revert local state if save fails
        setEditedTask(task); 
      }
    }
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    try {
      await Comment.create({
        content: newComment,
        task_id: task.id, // Use task.id from props
        user_name: user.full_name,
        company_id: companyId
      });
      setNewComment("");
      onReloadComments(); // Trigger parent to reload comments
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleChecklistItemToggle = async (checklistIndex, itemIndex) => {
    const newChecklists = JSON.parse(JSON.stringify(editedTask.checklist || []));
    newChecklists[checklistIndex].items[itemIndex].completed = !newChecklists[checklistIndex].items[itemIndex].completed;
    try {
      await onSave({ checklist: newChecklists });
    } catch (error) {
      console.error("Failed to toggle checklist item:", error);
    }
  };
  
  const handleAddChecklistItem = async (checklistIndex) => {
    if (!newChecklistItem.trim()) return;
    const newChecklists = JSON.parse(JSON.stringify(editedTask.checklist || []));
    newChecklists[checklistIndex].items.push({ text: newChecklistItem, completed: false });
    try {
      await onSave({ checklist: newChecklists });
      setNewChecklistItem("");
    } catch (error) {
      console.error("Failed to add checklist item:", error);
    }
  };
  
  const handleAddChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    const newChecklists = [...(editedTask.checklist || []), { title: newChecklistTitle, items: [] }];
    try {
      await onSave({ checklist: newChecklists });
      setNewChecklistTitle("Checklist");
    } catch (error) {
      console.error("Failed to add checklist:", error);
    }
  };

  const renderChecklist = useCallback((checklist, checklistIndex) => {
    const completedItems = checklist.items.filter(item => item.completed).length;
    const totalItems = checklist.items.length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    
    return (
      <div key={checklistIndex} className="space-y-3">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800 flex-1">{checklist.title}</h4>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs text-gray-500">{Math.round(progress)}%</span>
           <Progress value={progress} className="h-2 w-full" />
        </div>
        <div className="space-y-2 pl-8">
          {checklist.items.map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-2">
              <Checkbox
                id={`item-${checklistIndex}-${itemIndex}`}
                checked={item.completed}
                onCheckedChange={() => handleChecklistItemToggle(checklistIndex, itemIndex)}
              />
              <label htmlFor={`item-${checklistIndex}-${itemIndex}`} className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {item.text}
              </label>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pl-8">
          <Input 
            placeholder="Add an item..." 
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem(checklistIndex)}
            className="h-8 text-sm"
          />
          <Button onClick={() => handleAddChecklistItem(checklistIndex)} size="sm" variant="outline">Add</Button>
        </div>
      </div>
    );
  }, [editedTask, newChecklistItem]); // Re-render if editedTask (specifically checklist) or newChecklistItem changes

  return (
    <>
      <DialogHeader className="p-6 border-b">
        <DialogTitle className="flex items-center gap-3">
          <Type className="w-6 h-6 text-purple-600" />
          <Input
            value={editedTask.title}
            onChange={(e) => setEditedTask(prev => ({...prev, title: e.target.value}))}
            onBlur={(e) => handleFieldUpdate('title', e.target.value)}
            className="text-xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto"
          />
        </DialogTitle>
        <p className="text-sm text-gray-500 ml-9">in list <span className="font-medium text-gray-700">{editedTask.status.replace(/_/g, ' ')}</span></p>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-3 lg:col-span-2 space-y-8">
          {/* Description */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <AlignLeft className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
            </div>
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask(prev => ({...prev, description: e.target.value}))}
              onBlur={(e) => handleFieldUpdate('description', e.target.value)}
              placeholder="Add a more detailed description..."
              className="min-h-24"
            />
          </div>

          {/* Checklists */}
          {editedTask.checklist && editedTask.checklist.map(renderChecklist)}
          
          {/* Comments */}
            <div>
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Textarea 
                  placeholder="Write a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="h-20"/>
                <Button onClick={handleAddComment} size="sm"><Send className="w-4 h-4"/></Button>
              </div>
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-purple-600">
                      {comment.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-sm">{comment.user_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm bg-gray-100 p-3 rounded-lg mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-3 lg:col-span-1 space-y-6">
          <h4 className="font-semibold text-gray-600 text-xs uppercase">Add to card</h4>
          <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2"><Tag className="w-4 h-4"/> Labels</Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleAddChecklist}><CheckSquare className="w-4 h-4"/> Checklist</Button>
              <Button variant="outline" className="w-full justify-start gap-2"><Paperclip className="w-4 h-4"/> Attachment</Button>
          </div>

          <h4 className="font-semibold text-gray-600 text-xs uppercase">Actions</h4>
          <div>
              <Label>Priority</Label>
              <Select value={editedTask.priority} onValueChange={(val) => handleFieldUpdate('priority', val)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                    {priorityOptions.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
          </div>
          <Button variant="destructive" className="w-full justify-start gap-2" onClick={onDelete}>
              <Trash2 className="w-4 h-4"/> Delete Task
          </Button>
        </div>
      </div>
    </>
  );
}

export default function TaskDetailModal({ isOpen, onClose, taskId, user, companyId }) {
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (isOpen && taskId) {
      setIsLoading(true);
      try {
        const [fetchedTask, fetchedComments] = await Promise.all([
          Task.get(taskId),
          Comment.filter({ task_id: taskId }, '-created_date')
        ]);
        setTask(fetchedTask);
        setComments(fetchedComments);
      } catch (error) {
        console.error("Failed to load task details:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = useCallback(async (updatedData) => {
    if (!task) return;
    try {
      // Update the task in the database
      await Task.update(taskId, updatedData);
      // Log the activity
      await Activity.create({
        description: `<strong>${user.full_name}</strong> updated task: <em>${task.title}</em>`,
        type: "update", 
        entity_type: "Task", 
        entity_title: task.title, // Use the current task's title for activity log
        user_name: user.full_name, 
        company_id: companyId
      });
      // Reload all data to ensure UI is in sync with the database
      loadData(); 
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error; // Re-throw to allow calling component to handle
    }
  }, [task, taskId, user, companyId, loadData]); // Depend on task, taskId, user, companyId, loadData

  const handleDelete = useCallback(async () => {
    if (!task) return; // Ensure task is loaded before attempting delete
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      try {
        await Task.delete(task.id); // Use task.id for deletion
        await Activity.create({
          description: `<strong>${user.full_name}</strong> deleted task: <em>${task.title}</em>`,
          type: "delete", 
          entity_type: "Task", 
          entity_title: task.title, // Use the current task's title for activity log
          user_name: user.full_name, 
          company_id: companyId
        });
        onClose(); // Close the modal after successful deletion
      } catch (error) {
        console.error("Failed to delete task:", error);
        throw error; // Re-throw to allow calling component to handle
      }
    }
  }, [task, user, companyId, onClose]); // Depend on task, user, companyId, onClose

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        {isLoading || !task ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : (
          <TaskEditModalContent
            task={task}
            comments={comments}
            user={user}
            companyId={companyId}
            onClose={onClose}
            onSave={handleUpdate}
            onDelete={handleDelete}
            onReloadComments={loadData} // Pass loadData for comments to refresh
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
