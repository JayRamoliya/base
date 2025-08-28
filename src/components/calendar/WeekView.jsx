import React from 'react';
import { format, isToday } from 'date-fns';
import CalendarItem from './CalendarItem'; // Use the shared item component

export default function WeekView({ daysInWeek, items, onEventClick, onTaskClick, onTimeslotClick }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col">
      {/* Day Headers */}
      <div className="grid grid-cols-[auto_1fr] sticky top-0 bg-white z-10">
        <div className="w-14 border-r border-b border-gray-200"></div>
        <div className="grid grid-cols-7">
          {daysInWeek.map((day) => (
            <div key={day} className="text-center p-2 border-b border-r border-gray-200">
              <div className="text-sm text-gray-500">{format(day, 'E')}</div>
              <div className={`text-lg font-medium ${isToday(day) ? 'text-purple-600' : 'text-gray-900'}`}>{format(day, 'd')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <div className="grid grid-cols-[auto_1fr]">
          {/* Time Gutter */}
          <div className="w-14">
            {hours.map((hour) => (
              <div key={hour} className="h-16 text-right pr-2 text-xs text-gray-400 relative -top-2">
                {hour > 0 && `${format(new Date(0, 0, 0, hour), 'ha')}`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          <div className="grid grid-cols-7 relative">
            {/* Grid Lines */}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {daysInWeek.map((day, dayIndex) => (
                  <div 
                    key={`${day}-${hour}`}
                    className={`h-16 border-t ${dayIndex < 6 ? 'border-r' : ''} border-gray-200 cursor-pointer hover:bg-gray-50`}
                    onClick={() => {
                        const dateTime = new Date(day);
                        dateTime.setHours(hour);
                        onTimeslotClick(dateTime);
                    }}
                  ></div>
                ))}
              </React.Fragment>
            ))}

            {/* Calendar Items (Events and Tasks) */}
            {items.map((item) => {
              const itemStart = new Date(item.date);
              const dayIndex = daysInWeek.findIndex(d => format(d, 'yyyy-MM-dd') === format(itemStart, 'yyyy-MM-dd'));
              if (dayIndex === -1) return null;

              const top = (itemStart.getHours() + itemStart.getMinutes() / 60) * 4; // 4rem per hour (h-16)
              const durationInHours = item.itemType === 'event' ? 0.75 : 0.5; // Events are 45min, tasks are 30min
              const height = durationInHours * 4; // in rem

              return (
                <div
                  key={`${item.itemType}-${item.id}`}
                  className="absolute p-1 rounded-lg text-xs border cursor-pointer overflow-hidden truncate"
                  style={{
                    top: `${top}rem`,
                    left: `calc(${(100 / 7) * dayIndex}% + 2px)`,
                    width: `calc(${(100 / 7)}% - 4px)`,
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