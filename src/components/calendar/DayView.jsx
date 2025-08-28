import React from 'react';
import { format } from 'date-fns';
import CalendarItem from './CalendarItem'; // Use the shared item component

export default function DayView({ selectedDate, items, onEventClick, onTaskClick, onTimeslotClick }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayItems = items.filter(item => format(new Date(item.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col">
      <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <div className="grid grid-cols-[auto_1fr]">
          {/* Time Gutter */}
          <div className="w-16">
            {hours.map((hour) => (
              <div key={hour} className="h-16 text-right pr-2 text-xs text-gray-400 relative -top-2">
                {hour > 0 && `${format(new Date(0, 0, 0, hour), 'ha')}`}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative border-l border-gray-200">
            {/* Grid Lines */}
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-16 border-t border-gray-200 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  const dateTime = new Date(selectedDate);
                  dateTime.setHours(hour);
                  onTimeslotClick(dateTime);
                }}
              ></div>
            ))}
            
            {/* Calendar Items (Events and Tasks) */}
            {dayItems.map(item => {
              const itemStart = new Date(item.date);
              const top = (itemStart.getHours() + itemStart.getMinutes() / 60) * 4; // 4rem per hour (h-16)
              const durationInHours = item.itemType === 'event' ? 0.75 : 0.5;
              const height = durationInHours * 4;

              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className="absolute p-1 rounded-lg border cursor-pointer overflow-hidden truncate left-2 right-2"
                  style={{
                    top: `${top}rem`,
                    height: `${height}rem`,
                  }}
                >
                  <CalendarItem 
                    item={item}
                    onEventClick={onEventClick}
                    onTaskClick={onTaskClick}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}