import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { Control, ControlType } from '../../types';
import { DragDropSurveyElements, DragElementData } from '../dragDrop/DragDropSurveyElements';
import { DropIndicatorPosition } from '../dragDrop/drag-drop-enums';
import { useDragDrop, DropPosition } from '../dragDrop/useDragDrop';
import { isDragInsideItself, calculateTargetIndex } from '../dragDrop/dragDropPositionUtils';

/**
 * Enhanced interface for drag items
 */
export interface EnhancedDragItem {
  id: string;
  type: string;
  controlType: ControlType;
  sourceId?: string;
  parentId?: string;
  isNew?: boolean;
  sourceIndex?: number;
  isParentControl?: boolean;
}

/**
 * Context interface providing enhanced drag and drop operations
 */
interface EnhancedDragDropContextType {
  // Original properties
  draggedItem: EnhancedDragItem | null;
  setDraggedItem: (item: EnhancedDragItem | null) => void;
  isDragging: boolean;
  startDrag: (item: EnhancedDragItem) => void;
  endDrag: () => void;
  canDropIn: (targetType: string) => boolean;
  getSourceContainer: () => string | null;
  getSourceIndex: () => number | null;
  
  // Enhanced properties
  dragPosition: DropPosition | null;
  setDragPosition: (position: DropPosition | null) => void;
  ghostElement: HTMLElement | null;
  setGhostElement: (element: HTMLElement | null) => void;
  updateGhostPosition: (clientX: number, clientY: number) => void;
  dragDropInstance: DragDropSurveyElements | null;
  isValidDrop: (controlId: string, targetId: string) => boolean;
}

/**
 * Create the Enhanced Drag Drop Context
 */
const EnhancedDragDropContext = createContext<EnhancedDragDropContextType | undefined>(undefined);

/**
 * Provider component for Enhanced Drag Drop Context
 */
export const EnhancedDragDropProvider: React.FC<{ 
  children: ReactNode,
  controls: Control[] 
}> = ({ children, controls }) => {
  // Original state
  const [draggedItem, setDraggedItem] = useState<EnhancedDragItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const sourceContainerRef = useRef<string | null>(null);
  const sourceIndexRef = useRef<number | null>(null);
  
  // Enhanced state
  const [dragPosition, setDragPosition] = useState<DropPosition | null>(null);
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);
  const dragDropInstanceRef = useRef<DragDropSurveyElements | null>(null);

  // Initialize DragDropSurveyElements instance
  useEffect(() => {
    dragDropInstanceRef.current = new DragDropSurveyElements({
      disableParentDrag: false,
      maxDepth: 5
    });
  }, []);
  
  // Traditional start drag function
  const startDrag = (item: EnhancedDragItem) => {
    console.log('[DRAG-DEBUG] Starting enhanced drag operation:', item);
    setDraggedItem(item);
    setIsDragging(true);
    
    // Set source tracking
    sourceContainerRef.current = item.sourceId || 'canvas';
    sourceIndexRef.current = item.sourceIndex !== undefined ? item.sourceIndex : null;
    
    // Create ghost element for parent controls
    if (item.isParentControl || [
      ControlType.Tab, 
      ControlType.Accordion, 
      ControlType.ColumnLayout
    ].includes(item.controlType)) {
      const ghost = document.createElement('div');
      ghost.className = 'drag-ghost-element';
      ghost.innerHTML = `
        <div class="drag-ghost-inner">
          <span class="drag-ghost-type">${item.controlType}</span>
          <span class="drag-ghost-label">${item.type}</span>
        </div>
      `;
      
      document.body.appendChild(ghost);
      setGhostElement(ghost);
    }
  };

  // Traditional end drag function
  const endDrag = () => {
    console.log('[DRAG-DEBUG] Ending enhanced drag operation', {
      wasFirstItem: sourceIndexRef.current === 0,
      sourceContainer: sourceContainerRef.current,
      lastDraggedItem: draggedItem
    });
    
    // Clean up ghost element
    if (ghostElement) {
      if (ghostElement.parentElement) {
        ghostElement.parentElement.removeChild(ghostElement);
      }
      setGhostElement(null);
    }
    
    // Reset all state
    setDraggedItem(null);
    setIsDragging(false);
    setDragPosition(null);
    sourceContainerRef.current = null;
    sourceIndexRef.current = null;
  };
  
  // Enhanced ghost position update
  const updateGhostPosition = (clientX: number, clientY: number) => {
    if (ghostElement) {
      ghostElement.style.left = `${clientX + 15}px`;
      ghostElement.style.top = `${clientY + 15}px`;
    }
  };
  
  // Get original source container
  const getSourceContainer = (): string | null => {
    return sourceContainerRef.current;
  };
  
  // Get original source index
  const getSourceIndex = (): number | null => {
    return sourceIndexRef.current;
  };
  
  // Original canDropIn function
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
  
  // New function to validate drops using DragDropSurveyElements methods
  const isValidDrop = (draggedId: string, targetId: string): boolean => {
    // Check for circular references
    if (isDragInsideItself(controls, draggedId, targetId)) {
      console.log('[DRAG-DEBUG] Invalid drop: would create circular reference');
      return false;
    }
    
    // Additional validation can be done here
    
    return true;
  };

  return (
    <EnhancedDragDropContext.Provider
      value={{
        // Original values
        draggedItem,
        setDraggedItem,
        isDragging,
        startDrag,
        endDrag,
        canDropIn,
        getSourceContainer,
        getSourceIndex,
        
        // Enhanced values
        dragPosition,
        setDragPosition,
        ghostElement,
        setGhostElement,
        updateGhostPosition,
        dragDropInstance: dragDropInstanceRef.current,
        isValidDrop
      }}
    >
      {children}
    </EnhancedDragDropContext.Provider>
  );
};

/**
 * Hook to use the Enhanced Drag Drop Context
 */
export const useEnhancedDragDrop = () => {
  const context = useContext(EnhancedDragDropContext);
  if (context === undefined) {
    throw new Error('useEnhancedDragDrop must be used within a EnhancedDragDropProvider');
  }
  return context;
};
