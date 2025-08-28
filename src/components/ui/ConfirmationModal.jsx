import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, CheckCircle, AlertCircle } from "lucide-react";

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = "warning", // "warning", "danger", "success", "info"
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false 
}) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-red-600" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "info":
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          button: "bg-red-600 hover:bg-red-700"
        };
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          button: "bg-green-600 hover:bg-green-700"
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700"
        };
      default:
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          button: "bg-[var(--primary)] hover:bg-[var(--primary-hover)]"
        };
    }
  };

  const colors = getColors();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 mb-4`}>
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${colors.button} text-white`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}