import React, { useState, useEffect } from 'react';
import { Task } from '@/api/entities';
import { User } from '@/api/entities';
import { Activity } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar as CalendarIcon, User as UserIcon, Save, X, Trash2 } from 'lucide-react';
import { format, isValid } from 'date-fns';

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" }
];

export default function TaskQuickModal({ isOpen, onClose, taskId, user, companyId, onUpdate }) {
  const [task, setTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    due_date: null,
    status: ""
  });

  useEffect(() => {
    if (isOpen && taskId) {
      loadData();
    }
  }, [isOpen, taskId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [taskData, users] = await Promise.all([
        Task.get(taskId),
        User.list()
      ]);
      
      setTask(taskData);
      setTeamMembers(users);
      setFormData({
        title: taskData.title || "",
        description: taskData.description || "",
        assigned_to: taskData.assigned_to || "",
        priority: taskData.priority || "medium",
        due_date: taskData.due_date ? new Date(taskData.due_date) : null,
        status: taskData.status || "backlog"
      });
    } catch (error) {
      console.error("Failed to load task:", error);
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        ...formData,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null
      };
      
      await Task.update(taskId, updateData);
      
      // Create activity log
      await Activity.create({
        description: `<strong>${user.full_name}</strong> updated task: <em>${formData.title}</em>`,
        type: "update",
        entity_type: "Task",
        entity_title: formData.title,
        user_name: user.full_name,
        company_id: companyId
      });
      
      onUpdate?.(); // Trigger refresh in parent
      onClose();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
    setIsSaving(false);
  };

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      return;
    }
    
    setIsSaving(true);
    try {
      await Task.delete(taskId);
      
      // Create activity log
      await Activity.create({
        description: `<strong>${user.full_name}</strong> deleted task: <em>${formData.title}</em>`,
        type: "delete",
        entity_type: "Task",
        entity_title: formData.title,
        user_name: user.full_name,
        company_id: companyId
      });
      
      onUpdate?.(); // Trigger refresh in parent
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task. Please try again.");
    }
    setIsSaving(false);
  };

  const getAssignedUser = () => {
    return teamMembers.find(member => member.email === formData.assigned_to);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Task Title */}
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Enter task title..."
                className="mt-2"
              />
            </div>

            {/* Task Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Enter task description..."
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Assigned To */}
            <div>
              <Label>Assigned To</Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) => handleChange("assigned_to", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select team member">
                    {formData.assigned_to && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {getAssignedUser()?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{getAssignedUser()?.full_name || formData.assigned_to}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.email}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                            {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name || 'No Name'}</div>
                          <div className="text-xs text-gray-500">{member.email}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue>
                    {priorityOptions.find(p => p.value === formData.priority)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${priority.color.split(' ')[0]}`}></div>
                        <span>{priority.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal mt-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date && isValid(formData.due_date) 
                      ? format(formData.due_date, 'PPP') 
                      : 'Select due date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => handleChange("due_date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Delete Task Section */}
            <div className="pt-4 border-t border-gray-200">
              <Button 
                variant="destructive" 
                onClick={handleDeleteTask}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isSaving}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !formData.title.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}