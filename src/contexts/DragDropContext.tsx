/**
 * Drag and Drop Context
 * 
 * Manages the drag and drop functionality for the questionnaire designer.
 * Provides state and operations for:
 * - Tracking dragged items
 * - Managing drag sources and targets
 * - Validating drop operations
 * - Maintaining drag state
 * 
 * @example
 * // Wrap your component with the provider:
 * <DragDropProvider>
 *   <DesignerComponent />
 * </DragDropProvider>
 * 
 * // Use in components:
 * const { startDrag, endDrag, isDragging } = useDragDrop();
 */

import React, { createContext, useContext, useState, ReactNode, useRef } from 'react';
import { ControlType } from '../types';

/**
 * Represents an item being dragged in the designer
 */
interface DragItem {
  id: string;
  type: string;
  controlType: ControlType;
  sourceId?: string;
  isNew?: boolean;
  sourceIndex?: number;
}

/**
 * Context interface providing drag and drop operations
 */
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
  const sourceIndexRef = useRef<number | null>(null);  const startDrag = (item: DragItem) => {
    console.log('[DRAG-DEBUG] Starting drag operation:', item);
    setDraggedItem(item);
    setIsDragging(true);
    
    // Improved source tracking
    sourceContainerRef.current = item.sourceId || 'canvas';
    sourceIndexRef.current = item.sourceIndex !== undefined ? item.sourceIndex : null;
    
    console.log('[DRAG-DEBUG] Drag source detailed:', {
      container: sourceContainerRef.current,
      index: sourceIndexRef.current,
      controlType: item.controlType,
      isFirstItem: item.sourceIndex === 0,
      isTab: item.controlType === ControlType.Tab
    });
  };

  const endDrag = () => {
    console.log('[DRAG-DEBUG] Ending drag operation', {
      wasFirstItem: sourceIndexRef.current === 0,
      sourceContainer: sourceContainerRef.current,
      lastDraggedItem: draggedItem
    });
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

    // Enhanced drop validation logic
    
    // Allow dropping in accordion sections
    if (targetType === 'accordion') {
      // Allow almost everything to be dropped in accordion sections
      return draggedItem.controlType !== ControlType.Accordion;
    }

    // Container controls can be dropped in canvas only
    if ([ControlType.Tab, ControlType.Accordion, ControlType.ColumnLayout].includes(draggedItem.controlType)) {
      return targetType === 'canvas';
    }

    // Basic and specialized controls can be dropped in any container
    return ['tab', 'column', 'accordion', 'canvas'].includes(targetType);
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