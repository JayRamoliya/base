import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Building, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DealCard({ deal, index, contact, crmCompany, onEdit, onDelete }) {
  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className="hover:shadow-md transition-shadow duration-200 bg-white group">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-gray-900 leading-tight pr-2">{deal.name}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(deal)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(deal)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {crmCompany && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  {crmCompany.name}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-purple-700 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {deal.amount.toLocaleString()}
                </span>
                {deal.tags && deal.tags.length > 0 && (
                  <Badge variant="outline" className="text-xs">{deal.tags[0]}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}