
import React, { useState, useEffect, useCallback } from "react";
import { Task } from "@/api/entities";
import { User } from "@/api/entities";
import { Company } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import Loader from "@/components/ui/Loader";
import KanbanColumn from "../components/tasks/KanbanColumn";
import TaskQuickModal from "../components/tasks/TaskQuickModal"; // New import
import TaskCreateModal from "../components/tasks/TaskCreateModal";

const priorityOptions = ["low", "medium", "high", "urgent"];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentCompany, setCurrentCompany] = useState(null);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const handleOpenDetailModal = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }, []);

  const loadTasks = useCallback(async (companyId, currentColumnOrder) => {
    if (!companyId || !currentColumnOrder) return;
    try {
      const tasksData = await Task.filter({ company_id: companyId }, "-created_date");
      setTasks(tasksData);
      
      const newColumns = currentColumnOrder.reduce((acc, status) => {
        acc[status] = { title: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), tasks: [] };
        return acc;
      }, {});

      tasksData.forEach(task => {
        const status = task.status || 'backlog';
        if (newColumns[status]) {
          newColumns[status].tasks.push(task);
        } else {
          // If a task has a status that's no longer a column, add it to the first column
          if (newColumns[currentColumnOrder[0]]) {
             newColumns[currentColumnOrder[0]].tasks.push(task);
          }
        }
      });
      setColumns(newColumns);

      // Check for taskId in URL after tasks are loaded
      const urlParams = new URLSearchParams(window.location.search);
      const taskIdFromUrl = urlParams.get('taskId');
      if (taskIdFromUrl) {
        const taskToOpen = tasksData.find(t => t.id === taskIdFromUrl);
        if (taskToOpen) {
          handleOpenDetailModal(taskToOpen);
        }
      }

    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  }, [handleOpenDetailModal]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setTasks([]); // Clear tasks before loading
    setColumns({}); // Clear columns before loading
    try {
      const userData = await User.me();
      setUser(userData);
      if (userData.company_id) {
        const company = await Company.get(userData.company_id);
        setCurrentCompany(company);
        const savedColumns = company.task_statuses ? JSON.parse(company.task_statuses) : ["backlog", "in_progress", "review", "done"];
        setColumnOrder(savedColumns);
        await loadTasks(company.id, savedColumns);
      } else {
        // Handle case with no company
        setColumnOrder(["backlog", "in_progress", "review", "done"]);
        setColumns({
          backlog: { title: "Backlog", tasks: [] },
          in_progress: { title: "In Progress", tasks: [] },
          review: { title: "Review", tasks: [] },
          done: { title: "Done", tasks: [] },
        });
      }
    } catch (e) {
      console.error("Failed to load initial data", e);
    } finally {
      setIsLoading(false);
    }
  }, [loadTasks]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTask(null);
    // Reload tasks to reflect any changes made in the modal
    if (currentCompany) {
      loadTasks(currentCompany.id, columnOrder);
    }
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateTask = async (taskData) => {
    if (!currentCompany) return;
    try {
      const newTask = await Task.create({
        ...taskData,
        status: "backlog", // Default to backlog column
        company_id: currentCompany.id,
      });
      
      await Activity.create({
        description: `<strong>${user.full_name}</strong> created a new task: <em>${newTask.title}</em>`,
        type: "create", 
        entity_type: "Task", 
        entity_title: newTask.title,
        user_name: user.full_name, 
        company_id: currentCompany.id
      });
      
      await loadTasks(currentCompany.id, columnOrder);
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error; // Re-throw to handle in modal
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    // --- Handling Column Dragging ---
    if (type === 'COLUMN') {
      const newColumnOrder = Array.from(columnOrder);
      newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, draggableId);
      
      setColumnOrder(newColumnOrder);
      // Persist the new column order
      try {
        await Company.update(currentCompany.id, { task_statuses: JSON.stringify(newColumnOrder) });
      } catch (error) {
        console.error("Failed to save column order", error);
        // Optionally revert UI change
        setColumnOrder(columnOrder);
      }
      return;
    }

    // --- Handling Task Dragging ---
    const startCol = columns[source.droppableId];
    const endCol = columns[destination.droppableId];

    if (startCol === endCol) {
      // Reordering within the same column
      const newTasks = Array.from(startCol.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);

      const newCol = { ...startCol, tasks: newTasks };
      setColumns({ ...columns, [source.droppableId]: newCol });

      // Here you might want to update an 'order' or 'position' field on the tasks in the backend
    } else {
      // Moving task to a different column
      const startTasks = Array.from(startCol.tasks);
      const [movedTask] = startTasks.splice(source.index, 1);
      const newStartCol = { ...startCol, tasks: startTasks };

      const endTasks = Array.from(endCol.tasks);
      endTasks.splice(destination.index, 0, movedTask);
      const newEndCol = { ...endCol, tasks: endTasks };

      setColumns({
        ...columns,
        [source.droppableId]: newStartCol,
        [destination.droppableId]: newEndCol,
      });

      try {
        await Task.update(draggableId, { status: destination.droppableId });
        await Activity.create({
          description: `<strong>${user.full_name}</strong> moved task <em>${movedTask.title}</em> from <strong>${startCol.title}</strong> to <strong>${endCol.title}</strong>`,
          type: "status_change", entity_type: "Task", entity_title: movedTask.title,
          user_name: user.full_name, company_id: currentCompany.id
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        // Revert UI on failure
        loadTasks(currentCompany.id, columnOrder);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const columnsWithFilteredTasks = columnOrder.reduce((acc, colId) => {
    if (columns[colId]) {
      acc[colId] = {
        ...columns[colId],
        tasks: columns[colId].tasks.filter(task => filteredTasks.some(ft => ft.id === task.id))
      };
    }
    return acc;
  }, {});

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6 flex-shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Task Board</h1>
            <p className="text-gray-600">Drag and drop to organize your workflow like Trello.</p>
          </div>
          <Button 
            onClick={handleOpenCreateModal} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search tasks by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-200"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorityOptions.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div 
              className="flex-1 overflow-x-auto overflow-y-hidden p-4 lg:p-8"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex space-x-6 h-full min-w-max">
                {columnOrder.map((columnId, index) => {
                  const column = columnsWithFilteredTasks[columnId];
                  if (!column) return null;
                  
                  return (
                    <KanbanColumn
                      key={columnId}
                      columnId={columnId}
                      column={column}
                      index={index}
                      onTaskClick={handleOpenDetailModal}
                    />
                  );
                })}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Task Quick Edit Modal */}
      {isDetailModalOpen && selectedTask && (
        <TaskQuickModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          taskId={selectedTask.id}
          user={user}
          companyId={currentCompany.id}
          onUpdate={() => {
            if (currentCompany) {
              loadTasks(currentCompany.id, columnOrder);
            }
          }}
        />
      )}

      {/* Task Create Modal */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreateTask}
      />
    </div>
  );
}
