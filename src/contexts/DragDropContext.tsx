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
    if (!draggedItem) {
      return false;
    }

    // Enhanced logging for reordering operations
    if (!draggedItem.isNew) {
      console.log('[DragDropContext] Reordering check:', {
        draggedType: draggedItem.controlType,
        targetType,
        sourceId: draggedItem.sourceId,
        sourceIndex: draggedItem.sourceIndex
      });
    }

    // Always allow reordering existing controls on canvas
    if (targetType === 'canvas' && !draggedItem.isNew) {
      console.log('[DragDropContext] ✓ Allowing canvas reordering');
      return true;
    }

    // Allow existing controls to be reordered within their containers
    if (!draggedItem.isNew && ['tab', 'accordion', 'column'].includes(targetType)) {
      console.log(`[DragDropContext] ✓ Allowing reorder of existing control in ${targetType}`);
      return true;
    }

    // Explicitly allow ColumnLayout to be dropped into Accordion
    if (draggedItem.controlType === ControlType.ColumnLayout && targetType === 'accordion') {
      console.log('[DragDropContext] ✓ PRIORITY: Allowing ColumnLayout to be dropped into Accordion');
      return true;
    }

    // Container controls can be dropped in canvas (when new), tabs, or other containers
    if ([ControlType.Tab, ControlType.GroupBox, ControlType.Accordion, ControlType.ColumnLayout].includes(draggedItem.controlType)) {
      const canDrop = (draggedItem.isNew ? ['canvas'] : []).concat(['tab', 'column', 'accordion']).includes(targetType);
      if (targetType === 'accordion' || targetType === 'tab' || !canDrop) {
        console.log(`[DragDropContext] Container control ${draggedItem.controlType} -> ${targetType}: ${canDrop ? '✓ allowed' : '✗ not allowed'}`);
      }
      return canDrop;
    }

    // Basic and specialized controls can be dropped anywhere except directly on the canvas when new
    if (targetType === 'canvas' && draggedItem.isNew) {
      return false;
    }

    // Allow dropping in any container
    const canDrop = ['tab', 'column', 'accordion', 'groupbox'].includes(targetType);
    // Only log accordion-related events or errors to reduce noise
    if (targetType === 'accordion' || !canDrop) {
      console.log(`[DragDropContext] Basic control ${draggedItem.controlType} -> ${targetType}: ${canDrop ? '✓ allowed' : '✗ not allowed'}`);
    }
    return canDrop;
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
