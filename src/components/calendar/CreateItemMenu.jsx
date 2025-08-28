import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Send, Target } from "lucide-react";

export default function CreateItemMenu({ isOpen, onClose, onSelect }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>What would you like to create?</DialogTitle>
          <DialogDescription>
            Choose an item to add to your calendar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col justify-center items-center gap-2"
            onClick={() => onSelect('general')}
          >
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="font-semibold">New Event</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col justify-center items-center gap-2"
            onClick={() => onSelect('post')}
          >
            <Send className="w-6 h-6 text-blue-600" />
            <span className="font-semibold">Schedule Post</span>
          </Button>
          <Button
            variant="outline"
            className="w-full h-20 flex flex-col justify-center items-center gap-2"
            onClick={() => onSelect('task')}
          >
            <Target className="w-6 h-6 text-green-600" />
            <span className="font-semibold">Create Task</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}