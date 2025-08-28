import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import DealCard from './DealCard';

export default function DealColumn({ columnId, column, index, contacts, crmCompanies, onEditDeal, onDeleteDeal }) {
  const totalValue = column.deals.reduce((sum, deal) => sum + deal.amount, 0);

  return (
    <div className="w-80 flex-shrink-0">
      <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 capitalize">{column.title}</h3>
          <p className="text-sm text-gray-500">
            {column.deals.length} deals • ${totalValue.toLocaleString()}
          </p>
        </div>
        
        <Droppable droppableId={columnId} type="DEAL">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 p-4 overflow-y-auto space-y-4 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-purple-50' : ''}`}
            >
              {column.deals.map((deal, index) => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  index={index}
                  contact={contacts[deal.contact_id]}
                  crmCompany={crmCompanies[deal.crm_company_id]}
                  onEdit={onEditDeal}
                  onDelete={onDeleteDeal}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}