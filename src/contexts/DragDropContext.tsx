import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Control, ControlType } from '../types';

interface DragItem {
  id: string;
  type: string;
  controlType: ControlType;
  sourceId?: string;
  isNew?: boolean;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  setDraggedItem: (item: DragItem | null) => void;
  isDragging: boolean;
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
  canDropIn: (targetType: string) => boolean;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const DragDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = (item: DragItem) => {
    setDraggedItem(item);
    setIsDragging(true);
  };

  const endDrag = () => {
    setDraggedItem(null);
    setIsDragging(false);
  };

  const canDropIn = (targetType: string): boolean => {
    if (!draggedItem) return false;

    // Container controls can be dropped in canvas, tabs, or other containers
    if ([ControlType.Tab, ControlType.GroupBox, ControlType.Accordion, ControlType.ColumnLayout].includes(draggedItem.controlType)) {
      return ['canvas', 'tab', 'column'].includes(targetType);
    }

    // Basic and specialized controls can be dropped anywhere except directly on the canvas
    if (targetType === 'canvas') {
      return false;
    }

    // Allow dropping in any container
    return ['tab', 'column', 'accordion', 'groupbox'].includes(targetType);
  };

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        isDragging,
        startDrag,
        endDrag,
        canDropIn,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};