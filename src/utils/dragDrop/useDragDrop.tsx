import { useEffect, useRef, useState } from 'react';
import { ControlType } from '../../types';
import { DragDropSurveyElements, DragElementData } from './DragDropSurveyElements';
import { DropIndicatorPosition } from './drag-drop-enums';

/**
 * Interface for drop position information
 */
export interface DropPosition {
  index: number;
  position: DropIndicatorPosition;
}

/**
 * Props for the useDragDrop hook
 */
export interface UseDragDropProps {
  onDragStart?: (data: DragElementData) => void;
  onDragOver?: (element: HTMLElement | null, position: DropPosition) => void;
  onDrop?: (data: DragElementData, position: DropPosition) => void;
  onDragEnd?: () => void;
  allowDragInto?: ControlType[];
  disallowDragInto?: ControlType[];
  disableParentDrag?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  maxDepth?: number;
}

/**
 * The return type for the useDragDrop hook
 */
export interface UseDragDropResult {
  isDragging: boolean;
  draggedItemData: DragElementData | null;
  dropPosition: DropPosition | null;
  dropTargetElement: HTMLElement | null;
  makeElementDraggable: (props: MakeDraggableProps) => DraggableAttributes;
  makeElementDropTarget: (props: MakeDropTargetProps) => DropTargetAttributes;
}

/**
 * Props for making an element draggable
 */
export interface MakeDraggableProps {
  id: string;
  controlType: ControlType;
  sourceId?: string;
  parentId?: string;
  index?: number;
  isNew?: boolean;
  label?: string;
  disabled?: boolean;
}

/**
 * Props for making an element a drop target
 */
export interface MakeDropTargetProps {
  id: string;
  controlType: ControlType;
  index?: number;
  disabled?: boolean;
}

/**
 * Attributes to apply to draggable elements
 */
export interface DraggableAttributes {
  draggable: boolean;
  'data-id': string;
  'data-control-type': string;
  'data-source-id'?: string;
  'data-parent-id'?: string;
  'data-index'?: number;
  'data-is-new'?: string;
  'data-label'?: string;
  className: string;
}

/**
 * Attributes to apply to drop target elements
 */
export interface DropTargetAttributes {
  'data-id': string;
  'data-control-type': string;
  'data-index'?: number;
  className: string;
}

/**
 * Custom hook to use the DragDropSurveyElements class in React components
 */
export function useDragDrop({
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  allowDragInto,
  disallowDragInto,
  disableParentDrag = false,
  containerRef,
  maxDepth = 5
}: UseDragDropProps = {}): UseDragDropResult {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItemData, setDraggedItemData] = useState<DragElementData | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [dropTargetElement, setDropTargetElement] = useState<HTMLElement | null>(null);

  // Create a ref to hold our DragDropSurveyElements instance
  const dragDropInstanceRef = useRef<DragDropSurveyElements | null>(null);

  // Initialize the drag drop system
  useEffect(() => {
    // Create the DragDropSurveyElements instance
    dragDropInstanceRef.current = new DragDropSurveyElements({
      allowDragInto,
      disallowDragInto,
      disableParentDrag,
      maxDepth
    });

    // Get the container to attach event listeners to
    const container = containerRef?.current || document;

    // Define event handlers
    const handleDragStart = (event: Event) => {
      if (!(event instanceof DragEvent) || !dragDropInstanceRef.current) return;

      const dragData = dragDropInstanceRef.current.getDragData();
      if (dragData) {
        setIsDragging(true);
        setDraggedItemData(dragData);

        // Call the onDragStart callback if provided
        if (onDragStart) {
          onDragStart(dragData);
        }
      }
    };

    const handleDragOver = (event: Event) => {
      if (!(event instanceof DragEvent) || !dragDropInstanceRef.current) return;
      
      const dropInfo = dragDropInstanceRef.current.getDropPosition();
      
      // Update state if we have valid drop info
      if (dropInfo.element && dropInfo.position !== DropIndicatorPosition.None) {
        const newDropPosition: DropPosition = {
          index: dropInfo.index,
          position: dropInfo.position
        };
        
        setDropPosition(newDropPosition);
        setDropTargetElement(dropInfo.element);
        
        // Call the onDragOver callback if provided
        if (onDragOver) {
          onDragOver(dropInfo.element, newDropPosition);
        }
      }
    };

    const handleDrop = (event: Event) => {
      if (!(event instanceof DragEvent) || !dragDropInstanceRef.current) return;
      event.preventDefault();

      const dragData = dragDropInstanceRef.current.getDragData();
      const dropInfo = dragDropInstanceRef.current.getDropPosition();

      // Only process drop if we have valid data and position
      if (dragData && dropInfo.element && dropInfo.position !== DropIndicatorPosition.None) {
        const finalDropPosition: DropPosition = {
          index: dropInfo.index,
          position: dropInfo.position
        };
        
        // Call the onDrop callback if provided
        if (onDrop) {
          onDrop(dragData, finalDropPosition);
        }
      }

      // Reset state
      setIsDragging(false);
      setDraggedItemData(null);
      setDropPosition(null);
      setDropTargetElement(null);
      
      // Call the onDragEnd callback if provided
      if (onDragEnd) {
        onDragEnd();
      }
    };

    const handleDragEnd = (event: Event) => {
      if (!dragDropInstanceRef.current) return;

      // Reset state
      setIsDragging(false);
      setDraggedItemData(null);
      setDropPosition(null);
      setDropTargetElement(null);
      
      // Call the onDragEnd callback if provided
      if (onDragEnd) {
        onDragEnd();
      }
    };

    // Attach our event listeners
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragend', handleDragEnd);
    
    // Also attach the event handlers from our class
    dragDropInstanceRef.current.attachEventHandlers(container);

    // Clean up event listeners on unmount
    return () => {
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
      container.removeEventListener('dragend', handleDragEnd);
      
      if (dragDropInstanceRef.current) {
        dragDropInstanceRef.current.detachEventHandlers(container);
      }
    };
  }, [
    allowDragInto,
    disallowDragInto,
    disableParentDrag,
    maxDepth,
    containerRef,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd
  ]);

  // Function to make an element draggable
  const makeElementDraggable = ({
    id,
    controlType,
    sourceId,
    parentId,
    index,
    isNew = false,
    label,
    disabled = false
  }: MakeDraggableProps): DraggableAttributes => {
    return {
      draggable: !disabled,
      'data-id': id,
      'data-control-type': controlType,
      ...(sourceId ? { 'data-source-id': sourceId } : {}),
      ...(parentId ? { 'data-parent-id': parentId } : {}),
      ...(index !== undefined ? { 'data-index': index } : {}),
      ...(isNew ? { 'data-is-new': 'true' } : {}),
      ...(label ? { 'data-label': label } : {}),
      className: `draggable ${disabled ? 'draggable-disabled' : ''}`
    };
  };

  // Function to make an element a drop target
  const makeElementDropTarget = ({
    id,
    controlType,
    index,
    disabled = false
  }: MakeDropTargetProps): DropTargetAttributes => {
    return {
      'data-id': id,
      'data-control-type': controlType,
      ...(index !== undefined ? { 'data-index': index } : {}),
      className: `drop-target ${disabled ? 'drop-target-disabled' : ''}`
    };
  };

  return {
    isDragging,
    draggedItemData,
    dropPosition,
    dropTargetElement,
    makeElementDraggable,
    makeElementDropTarget
  };
}
