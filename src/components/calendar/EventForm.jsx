import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { platforms } from './common';

export default function EventForm({ isOpen, onClose, onSave, onDelete, event, selectedDate, eventType = 'general' }) {
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    scheduled_at_date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
    scheduled_at_time: format(new Date(), 'HH:mm'),
    platform: "instagram",
    type: eventType,
  });

  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.scheduled_at);
      setFormData({
        id: event.id,
        title: event.title || "",
        description: event.description || "",
        scheduled_at_date: format(eventDate, 'yyyy-MM-dd'),
        scheduled_at_time: format(eventDate, 'HH:mm'),
        platform: event.platform || "instagram",
        type: event.type || 'post',
      });
    } else {
      // Pre-fill with selected date for new events
      setFormData({
        id: null,
        title: "",
        description: "",
        scheduled_at_date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
        scheduled_at_time: format(new Date(), 'HH:mm'),
        platform: "instagram",
        type: eventType,
      });
    }
  }, [event, selectedDate, isOpen, eventType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePlatformClick = (platformId) => {
    setFormData(prev => ({ ...prev, platform: platformId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const scheduled_at = new Date(`${formData.scheduled_at_date}T${formData.scheduled_at_time}`);
    onSave({
      ...formData,
      scheduled_at: scheduled_at.toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (formData.id && window.confirm("Are you sure you want to delete this event?")) {
      onDelete(formData.id);
      onClose();
    }
  };
  
  const formTitle = event ? `Edit ${formData.type === 'post' ? 'Post' : 'Event'}` : `Create New ${eventType === 'post' ? 'Post' : 'Event'}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={eventType === 'post' ? "What's this post about?" : "What's the event?"}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details..."
              className="mt-2"
            />
          </div>

          {formData.type === 'post' && (
            <div>
              <Label>Platform</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {platforms.map(p => (
                  <Button
                    key={p}
                    type="button"
                    variant={formData.platform === p ? "default" : "outline"}
                    onClick={() => handlePlatformClick(p)}
                    className="capitalize"
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_at_date">Date</Label>
              <Input
                id="scheduled_at_date"
                name="scheduled_at_date"
                type="date"
                value={formData.scheduled_at_date}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="scheduled_at_time">Time</Label>
              <Input
                id="scheduled_at_time"
                name="scheduled_at_time"
                type="time"
                value={formData.scheduled_at_time}
                onChange={handleChange}
                required
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            {event && (
              <Button type="button" variant="destructive" onClick={handleDelete} className="mr-auto">
                Delete
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}