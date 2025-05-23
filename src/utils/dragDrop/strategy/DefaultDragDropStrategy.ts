// filepath: src/utils/dragDrop/strategy/DefaultDragDropStrategy.ts
import { ControlType } from '../../../types';
import { DragElementData } from '../DragDropSurveyElements';
import { DragDropStrategy } from './DragDropStrategy';
import { DropIndicatorPosition } from '../drag-drop-enums';

/**
 * Default implementation of the DragDropStrategy interface.
 * Provides basic behavior for controls that don't have a specific strategy.
 */
export class DefaultDragDropStrategy implements DragDropStrategy {
  /**
   * Gets the unique identifier for this strategy
   */
  getId(): string {
    return 'default-strategy';
  }
  
  /**
   * Gets the control types this strategy applies to
   */
  getApplicableControlTypes(): ControlType[] {
    // This is a fallback strategy for any control type
    return [];
  }

  /**
   * Handles the start of a drag operation
   */
  handleDragStart(
    element: HTMLElement, 
    data: DragElementData, 
    event?: DragEvent
  ): boolean {
    // Default implementation: assume the standard drag start behavior is fine
    return false; // Return false to indicate default behavior should be used
  }

  /**
   * Validates if a drop is allowed in the target
   */
  validateDrop(
    draggedData: DragElementData, 
    targetElement: HTMLElement, 
    position: DropIndicatorPosition
  ): boolean {
    // Default implementation: only allow dropping above or below, not inside
    return position === DropIndicatorPosition.Top || 
           position === DropIndicatorPosition.Bottom ||
           position === DropIndicatorPosition.Left ||
           position === DropIndicatorPosition.Right;
  }

  /**
   * Creates a preview representation of the dragged item
   */
  createPreview(draggedData: DragElementData): HTMLElement {
    // Create a basic preview element
    const preview = document.createElement('div');
    preview.className = 'default-drag-preview';
    
    // Add some content based on the drag data
    const label = document.createElement('div');
    label.className = 'preview-label';
    label.textContent = draggedData.controlType || 'Unknown';
    
    preview.appendChild(label);
    return preview;
  }
  
  /**
   * Handles the drop action when an element is dropped
   */
  handleDrop(
    draggedData: DragElementData, 
    targetElement: HTMLElement, 
    position: DropIndicatorPosition
  ): boolean {
    // Default implementation doesn't handle the drop
    return false;
  }

  /**
   * Calculates and returns the appropriate drop position based on the current mouse position
   */
  calculateDropPosition(
    targetElement: HTMLElement, 
    clientX: number, 
    clientY: number, 
    draggedData: DragElementData
  ): { position: DropIndicatorPosition, index: number } {
    // Get element bounds
    const rect = targetElement.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const relativeX = clientX - rect.left;
    
    // Default vertical calculation
    let position: DropIndicatorPosition;
    if (relativeY < rect.height / 3) {
      position = DropIndicatorPosition.Top;
    } else if (relativeY > rect.height * 2/3) {
      position = DropIndicatorPosition.Bottom;
    } else {
      position = DropIndicatorPosition.Inside;
    }
    
    // Get current index if available
    let index = -1;
    const indexAttr = targetElement.getAttribute('data-index');
    if (indexAttr) {
      index = parseInt(indexAttr, 10);
    }
    
    return { position, index };
  }

  /**
   * Handles any special positioning requirements for the ghost element during drag
   */
  positionGhostElement(ghostElement: HTMLElement, clientX: number, clientY: number): void {
    // Default positioning with offset
    const offset = 15; // pixels to offset the ghost from the cursor
    ghostElement.style.left = `${clientX + offset}px`;
    ghostElement.style.top = `${clientY + offset}px`;
  }

  /**
   * Determines if this strategy should be used for the given control types
   */
  appliesTo(draggedType: ControlType, targetType: ControlType): boolean {
    // Default strategy applies to all combinations not handled by other strategies
    return false;
  }
}
