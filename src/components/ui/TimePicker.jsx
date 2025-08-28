import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TimePicker({ value, onChange, placeholder = "Select time" }) {
  const [isOpen, setIsOpen] = useState(false);

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  
  // Generate minutes (0, 15, 30, 45)
  const minutes = ['00', '15', '30', '45'];

  const currentHour = value ? value.split(':')[0] : '';
  const currentMinute = value ? value.split(':')[1] : '';

  const handleTimeSelect = (hour, minute) => {
    const timeString = `${hour}:${minute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start font-normal">
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col border-r">
            <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b">
              Hour
            </div>
            <ScrollArea className="h-60">
              <div className="space-y-1 p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    variant={currentHour === hour ? "default" : "ghost"}
                    className="w-full h-8 justify-start text-sm"
                    onClick={() => handleTimeSelect(hour, currentMinute || '00')}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex flex-col">
            <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b">
              Minute
            </div>
            <ScrollArea className="h-60">
              <div className="space-y-1 p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    variant={currentMinute === minute ? "default" : "ghost"}
                    className="w-full h-8 justify-start text-sm"
                    onClick={() => handleTimeSelect(currentHour || '10', minute)}
                  >
                    {minute}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}