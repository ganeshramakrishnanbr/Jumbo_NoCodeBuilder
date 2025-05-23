/**
 * Index file for drag and drop utilities
 * Exports all drag and drop related classes, hooks, and utilities
 */

// Core classes
export { DragDropCore } from './DragDropCore';
export { DragDropSurveyElements, type DragElementData, type DragDropOptions } from './DragDropSurveyElements';

// Enums
export { DropIndicatorPosition, ElementType } from './drag-drop-enums';

// Hooks
export { 
  useDragDrop, 
  type UseDragDropProps, 
  type UseDragDropResult,
  type DropPosition,
  type DraggableAttributes,
  type DropTargetAttributes,
  type MakeDraggableProps,
  type MakeDropTargetProps
} from './useDragDrop';

// Utilities
export {
  calculateDragOverPosition,
  isNearEdge,
  createDragGhost,
  updateDragGhostPosition,
  removeDragGhost,
  calculateTargetIndex,
  canDropInside,
  isDragInsideItself,
  updateDropIndicators
} from './dragDropPositionUtils';
