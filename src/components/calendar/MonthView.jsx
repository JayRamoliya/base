
import React, { useState } from 'react';
import { format, isSameMonth, isToday, isSameDay } from 'date-fns';
import { Plus, Eye, Calendar, Target, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import CalendarItem from './CalendarItem'; // Import the new component

const DayNames = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500">
      {days.map((day) => (
        <div key={day} className="py-2">{day}</div>
      ))}
    </div>
  );
};

export default function MonthView({ currentDate, daysInMonth, itemsByDate, onDateClick, onEventClick, onTaskClick, selectedDate, setSelectedDate }) {
  const [hoveredDate, setHoveredDate] = useState(null);

  return (
    <div className="w-full">
      <DayNames />
      <div className="grid grid-cols-7 border-t border-l border-gray-200">
        {daysInMonth.map((day, i) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const isSelectedDay = isSameDay(day, selectedDate);
          
          const dayItems = itemsByDate[format(day, 'yyyy-MM-dd')] || [];

          return (
            <div
              key={i}
              className={`relative h-24 md:h-32 p-2 border-b border-r border-gray-200 transition-colors duration-200 flex flex-col ${
                isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
              } ${isSelectedDay ? 'bg-purple-50' : ''}`}
              onMouseEnter={() => setHoveredDate(day)}
              onMouseLeave={() => setHoveredDate(null)}
              onClick={() => onDateClick(day)} // Handle click on the entire day cell
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                    isCurrentDay ? 'bg-purple-600 text-white' : ''
                  }`}
                >
                  {format(day, 'd')}
                </div>
                
                {hoveredDate && isSameDay(hoveredDate, day) && isCurrentMonth && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDateClick(day); }} 
                    className="w-6 h-6 p-0 opacity-70 hover:opacity-100 flex items-center justify-center rounded-md hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden mt-1">
                <div className="space-y-1">
                  {dayItems.slice(0, 2).map(item => (
                    <CalendarItem 
                      key={`${item.itemType}-${item.id}`}
                      item={item}
                      onEventClick={onEventClick}
                      onTaskClick={onTaskClick}
                    />
                  ))}
                  {dayItems.length > 2 && (
                    <div className="text-xs text-gray-500 mt-1 pl-1">
                      + {dayItems.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
