// filepath: src/utils/dragDrop/strategy/DragDropStrategy.ts
import { ControlType, Control } from '../../../types';
import { DragElementData } from '../DragDropSurveyElements';
import { DropIndicatorPosition, ElementType } from '../drag-drop-enums';

/**
 * Interface for drag-drop strategy implementations.
 * Following the Strategy pattern, this interface defines the contract for
 * control-specific drag and drop behavior.
 */
export interface DragDropStrategy {
  /**
   * Gets the unique identifier for this strategy
   */
  getId(): string;
  
  /**
   * Gets the control types this strategy applies to
   */
  getApplicableControlTypes(): ControlType[];

  /**
   * Handles the start of a drag operation
   * @param element The element being dragged
   * @param data The data associated with the dragged element
   * @param event The drag event
   * @returns A boolean indicating if this strategy handled the event
   */
  handleDragStart(
    element: HTMLElement, 
    data: DragElementData, 
    event?: DragEvent
  ): boolean;

  /**
   * Validates if a drop is allowed in the target
   * @param draggedData Data about the element being dragged
   * @param targetElement The potential drop target element
   * @param position The position within the target where the drop would occur
   * @returns Boolean indicating if the drop is valid
   */
  validateDrop(
    draggedData: DragElementData, 
    targetElement: HTMLElement, 
    position: DropIndicatorPosition
  ): boolean;

  /**
   * Creates a preview representation of the dragged item
   * @param draggedData Data about the element being dragged
   * @returns An HTMLElement to use as preview during drag
   */
  createPreview(draggedData: DragElementData): HTMLElement;
  
  /**
   * Handles the drop action when an element is dropped
   * @param draggedData Data about the element being dragged
   * @param targetElement The element receiving the drop
   * @param position The position where the element was dropped
   * @returns A boolean indicating if this strategy handled the event
   */
  handleDrop(
    draggedData: DragElementData, 
    targetElement: HTMLElement, 
    position: DropIndicatorPosition
  ): boolean;

  /**
   * Calculates and returns the appropriate drop position based on the current mouse position
   * @param targetElement The potential drop target element
   * @param clientX The X coordinate of the mouse
   * @param clientY The Y coordinate of the mouse
   * @param draggedData Data about the element being dragged
   * @returns The appropriate drop position
   */
  calculateDropPosition(
    targetElement: HTMLElement, 
    clientX: number, 
    clientY: number, 
    draggedData: DragElementData
  ): { position: DropIndicatorPosition, index: number };

  /**
   * Handles any special positioning requirements for the ghost element during drag
   * @param ghostElement The ghost element to position
   * @param clientX The X coordinate of the mouse
   * @param clientY The Y coordinate of the mouse
   */
  positionGhostElement(ghostElement: HTMLElement, clientX: number, clientY: number): void;

  /**
   * Determines if this strategy should be used for the given control types
   * @param draggedType The type of the dragged element
   * @param targetType The type of the target element
   * @returns Boolean indicating if this strategy applies
   */
  appliesTo(draggedType: ControlType, targetType: ControlType): boolean;
}
