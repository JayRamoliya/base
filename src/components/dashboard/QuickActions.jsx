import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Calendar, 
  Send
} from "lucide-react";

const quickActions = [
  {
    title: "Create Content",
    icon: Sparkles,
    url: createPageUrl("CreativeStudio"),
    primary: true,
  },
  {
    title: "Schedule Posts",
    icon: Send,
    url: createPageUrl("Scheduler"),
    primary: false,
  }
];

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {quickActions.map((action) => (
        <Link key={action.title} to={action.url}>
          <Button 
            variant={action.primary ? "default" : "outline"}
            className={`transition-all duration-200 hover:scale-105 font-medium px-4 py-2.5 rounded-xl ${action.primary ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.title}
          </Button>
        </Link>
      ))}
    </div>
  );
}