import React from 'react';
import { Target, Send, Calendar as CalendarIcon } from 'lucide-react';

const itemStyles = {
  task: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: <Target className="w-3 h-3 mr-1.5 flex-shrink-0" />,
  },
  post: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: <Send className="w-3 h-3 mr-1.5 flex-shrink-0" />,
  },
  general: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: <CalendarIcon className="w-3 h-3 mr-1.5 flex-shrink-0" />,
  },
};

export default function CalendarItem({ item, onEventClick, onTaskClick }) {
  const isEvent = item.itemType === 'event';
  // For events, distinguish between 'post' and 'general'
  const styleKey = isEvent ? (item.type || 'post') : 'task';
  const styles = itemStyles[styleKey];

  const handleClick = (e) => {
    e.stopPropagation();
    if (isEvent) {
      onEventClick(item);
    } else {
      onTaskClick(item);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-1 rounded-md cursor-pointer text-xs truncate flex items-center ${styles.bg} ${styles.text}`}
      title={item.title}
    >
      {styles.icon}
      <span className="truncate">{item.title}</span>
    </div>
  );
}