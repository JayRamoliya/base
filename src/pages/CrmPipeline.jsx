
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { Deal } from "@/api/entities";
import { Company } from "@/api/entities";
import { User } from "@/api/entities";
import { CrmCompany } from "@/api/entities";
import { Contact } from "@/api/entities";
import DealColumn from "../components/crm/DealColumn";
import DealForm from "../components/crm/DealForm";
import Loader from "../components/ui/Loader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "../components/ui/toast";
import ConfirmationModal from "../components/ui/ConfirmationModal"; // Import confirmation modal

const initialStageOrder = ["qualified", "proposal", "won", "lost"];
const stageTitles = {
  qualified: "Qualified",
  proposal: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

export default function CrmPipeline() {
  const [deals, setDeals] = useState([]);
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState(initialStageOrder);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState({});
  const [crmCompanies, setCrmCompanies] = useState({});
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null); // State for editing deal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // State for confirmation modal
  const [dealToDelete, setDealToDelete] = useState(null); // State for deal to delete
  const { success, error } = useToast();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [userData, companiesData] = await Promise.all([User.me(), Company.list()]);
        setUser(userData);

        if (companiesData.length > 0) {
          const company = companiesData[0];
          setCurrentCompany(company);
          await loadCrmData(company.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        error("Load Failed", "Could not load pipeline data. Please refresh the page.");
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadCrmData = async (companyId) => {
    try {
      const [dealsData, contactsData, crmCompaniesData] = await Promise.all([
        Deal.filter({ company_id: companyId }),
        Contact.filter({ company_id: companyId }),
        CrmCompany.filter({ company_id: companyId }),
      ]);
      
      const contactsMap = contactsData.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      const crmCompaniesMap = crmCompaniesData.reduce((acc, c) => ({ ...acc, [c.id]: c }), {});
      setContacts(contactsMap);
      setCrmCompanies(crmCompaniesMap);

      const newColumns = initialStageOrder.reduce((acc, stage) => {
        acc[stage] = { title: stageTitles[stage], deals: [] };
        return acc;
      }, {});

      dealsData.forEach(deal => {
        if (newColumns[deal.stage]) {
          newColumns[deal.stage].deals.push(deal);
        }
      });
      
      setDeals(dealsData);
      setColumns(newColumns);
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    }
    setIsLoading(false);
  };
  
  const handleSaveDeal = async (dealData) => {
    try {
      if (editingDeal) {
        // Update existing deal
        await Deal.update(editingDeal.id, dealData);
        success("Deal Updated", "The deal has been updated successfully.");
      } else {
        // Create new deal
        if (!currentCompany || !user) {
          console.error("Current company or user not loaded, cannot create deal.");
          return;
        }
        await Deal.create({
          ...dealData,
          owner_id: user.id,
          company_id: currentCompany.id,
          last_activity_date: new Date().toISOString(),
        });
        success("Deal Created", "New deal has been added to your pipeline successfully.");
      }
      await loadCrmData(currentCompany.id); // Reload data
      setIsDealFormOpen(false);
      setEditingDeal(null); // Clear editing deal after save
    } catch (err) {
      console.error("Failed to save deal:", err);
      error("Save Failed", "Could not save the deal. Please try again.");
    }
  };

  const handleEditDeal = (deal) => {
    setEditingDeal(deal);
    setIsDealFormOpen(true);
  };

  const handleDeleteDeal = (deal) => {
    setDealToDelete(deal);
    setIsConfirmOpen(true);
  };

  const confirmDeleteDeal = async () => {
    if (!dealToDelete) return;
    try {
      await Deal.delete(dealToDelete.id);
      success("Deal Deleted", `${dealToDelete.name} has been deleted.`);
      setIsConfirmOpen(false);
      setDealToDelete(null);
      await loadCrmData(currentCompany.id); // Reload data
    } catch (err) {
      console.error("Failed to delete deal:", err);
      error("Delete Failed", "Could not delete the deal.");
      setIsConfirmOpen(false); // Close modal even on error
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    const startCol = columns[source.droppableId];
    const endCol = columns[destination.droppableId];
    
    // Optimistic UI update
    const newColumns = { ...columns };

    if (startCol === endCol) {
      const newDeals = Array.from(startCol.deals);
      const [movedDeal] = newDeals.splice(source.index, 1);
      newDeals.splice(destination.index, 0, movedDeal);
      newColumns[source.droppableId] = { ...startCol, deals: newDeals };
    } else {
      const startDeals = Array.from(startCol.deals);
      const [movedDeal] = startDeals.splice(source.index, 1);
      const newStartCol = { ...startCol, deals: startDeals };

      const endDeals = Array.from(endCol.deals);
      endDeals.splice(destination.index, 0, movedDeal);
      const newEndCol = { ...endCol, deals: endDeals };
      
      newColumns[source.droppableId] = newStartCol;
      newColumns[destination.droppableId] = newEndCol;
    }

    setColumns(newColumns);

    // API call to update the deal stage
    try {
      await Deal.update(draggableId, { stage: destination.droppableId });
      success("Deal Moved", `Deal moved to ${stageTitles[destination.droppableId]} stage.`);
    } catch (err) {
      console.error("Failed to update deal stage:", err);
      error("Update Failed", "Could not move the deal. Please try again.");
      // Revert to original state on error
      if (currentCompany) {
        loadCrmData(currentCompany.id); 
      }
    }
  };

  if (isLoading) {
    return <Loader message="Loading CRM pipeline..." />;
  }

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal Pipeline</h1>
            <p className="text-gray-600">Manage your sales process and track deals.</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => { setEditingDeal(null); setIsDealFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Deal
          </Button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
            {(provided) => (
              <div 
                className="flex-1 overflow-x-auto overflow-y-hidden"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <div className="flex space-x-6 h-full min-w-max">
                  {columnOrder.map((columnId, index) => {
                    const column = columns[columnId];
                    if (!column) return null;
                    
                    return (
                      <DealColumn
                        key={columnId}
                        columnId={columnId}
                        column={column}
                        index={index}
                        contacts={contacts}
                        crmCompanies={crmCompanies}
                        onEditDeal={handleEditDeal}
                        onDeleteDeal={handleDeleteDeal}
                      />
                    );
                  })}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
      
      <DealForm
        isOpen={isDealFormOpen}
        onClose={() => { setIsDealFormOpen(false); setEditingDeal(null); }}
        onSave={handleSaveDeal}
        companyId={currentCompany?.id}
        deal={editingDeal}
      />
      
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDeleteDeal}
        title="Delete Deal"
        message={`Are you sure you want to delete the deal "${dealToDelete?.name}"? This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
      />
    </>
  );
}
