
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar as CalendarIcon, Upload, User as UserIcon } from "lucide-react";
import { format, isValid } from "date-fns";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Notification } from "@/api/entities"; // Import Notification entity

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" }
];

// Helper function to generate page URLs
const createPageUrl = (pageName) => {
  // In a real application, this would typically be managed by a router or a centralized utility.
  // For this context, we assume "Tasks" points to the /tasks route.
  if (pageName === "Tasks") {
    return "/tasks";
  }
  return "/"; // Default fallback
};

export default function TaskCreateModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assigned_to: "",
    priority: "medium",
    due_date: null,
    attachment_url: ""
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
      // Reset form when modal opens
      setFormData({
        title: "",
        description: "",
        assigned_to: "",
        priority: "medium",
        due_date: null,
        attachment_url: ""
      });
    }
  }, [isOpen]);

  const loadTeamMembers = async () => {
    try {
      const users = await User.list();
      setTeamMembers(users);
    } catch (error) {
      console.error("Failed to load team members:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleChange("attachment_url", file_url);
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to upload file. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        ...formData,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null
      };
      
      await onSave(taskData);

      // Send notification if task is assigned
      if (taskData.assigned_to) {
        try {
          const assignedUser = teamMembers.find(m => m.email === taskData.assigned_to);
          if (assignedUser) {
            await Notification.create({
              user_email: assignedUser.email,
              title: "You have a new task",
              body: `You've been assigned the task: "${taskData.title}"`,
              url: createPageUrl("Tasks")
            });
          }
        } catch (notifError) {
          console.error("Failed to send assignment notification:", notifError);
          // Don't block task creation if notification fails, just log the error.
        }
      }

      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
    setIsSubmitting(false);
  };

  const getAssignedUser = () => {
    return teamMembers.find(member => member.email === formData.assigned_to);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
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
                <SelectItem value={null}> {/* Use empty string for unassigned */}
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

          {/* Attachment */}
          <div>
            <Label>Attachment</Label>
            <div className="mt-2">
              {formData.attachment_url ? (
                <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700">File uploaded successfully</p>
                    <p className="text-xs text-gray-500 truncate">{formData.attachment_url}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleChange("attachment_url", "")}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    id="attachment"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="attachment">
                    <Button variant="outline" className="w-full" asChild disabled={isUploading}>
                      <div className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload File'}
                      </div>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.title.trim()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
