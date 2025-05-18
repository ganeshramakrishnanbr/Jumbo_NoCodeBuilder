import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { Control, ControlType } from '../types';

interface DragItem {
  id: string;
  type: string;
  controlType: ControlType;
  sourceId?: string;
  isNew?: boolean;
  sourceIndex?: number;
}

interface DragDropContextType {
  draggedItem: DragItem | null;
  setDraggedItem: (item: DragItem | null) => void;
  isDragging: boolean;
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
  canDropIn: (targetType: string) => boolean;
  getSourceContainer: () => string | null;
  getSourceIndex: () => number | null;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export const DragDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sourceContainerRef = useRef<string | null>(null);
  const sourceIndexRef = useRef<number | null>(null);

  const startDrag = (item: DragItem) => {
    console.log('[DragDropContext] Starting drag operation:', item);
    setDraggedItem(item);
    setIsDragging(true);
    
    // Store the source container type for later reference
    sourceContainerRef.current = item.sourceId ? 'container' : 'canvas';
    
    // Store the source index if provided
    sourceIndexRef.current = item.sourceIndex !== undefined ? item.sourceIndex : null;
    
    console.log('[DragDropContext] Drag source:', {
      container: sourceContainerRef.current,
      index: sourceIndexRef.current
    });
  };

  const endDrag = () => {
    console.log('[DragDropContext] Ending drag operation');
    setDraggedItem(null);
    setIsDragging(false);
    sourceContainerRef.current = null;
    sourceIndexRef.current = null;
  };
  
  const getSourceContainer = (): string | null => {
    return sourceContainerRef.current;
  };
  
  const getSourceIndex = (): number | null => {
    return sourceIndexRef.current;
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
        getSourceContainer,
        getSourceIndex,
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
