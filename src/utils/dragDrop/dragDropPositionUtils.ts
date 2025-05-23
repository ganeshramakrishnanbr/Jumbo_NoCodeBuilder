import { DropIndicatorPosition, ElementType } from './drag-drop-enums';
import { Control, ControlType } from '../../types';

/**
 * Calculates the drop location based on cursor position relative to element
 */
export const calculateDragOverPosition = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  direction: "vertical" | "horizontal" = "vertical"
): DropIndicatorPosition => {
  if (direction === "vertical") {
    const relativeY = clientY - rect.top;
    if (relativeY < rect.height / 3) {
      return DropIndicatorPosition.Top;
    } else if (relativeY > rect.height * 2/3) {
      return DropIndicatorPosition.Bottom;
    } else {
      return DropIndicatorPosition.Inside;
    }
  } else {
    // Horizontal direction logic for column layouts
    const relativeX = clientX - rect.left;
    if (relativeX < rect.width / 3) {
      return DropIndicatorPosition.Left;
    } else if (relativeX > rect.width * 2/3) {
      return DropIndicatorPosition.Right;
    } else {
      return DropIndicatorPosition.Inside;
    }
  }
};

/**
 * Determines if the cursor is near the edge of a container
 */
export const isNearEdge = (
  clientY: number,
  rect: DOMRect,
  edgeThreshold: number = 20
): boolean => {
  return (clientY - rect.top <= edgeThreshold) ||
         (rect.bottom - clientY <= edgeThreshold);
};

/**
 * Creates a ghost element for drag feedback
 */
export const createDragGhost = (
  element: HTMLElement,
  label: string,
  type: string
): HTMLElement => {
  const ghost = document.createElement('div');
  ghost.className = 'drag-ghost-element';
  ghost.innerHTML = `
    <div class="drag-ghost-inner">
      <span class="drag-ghost-type">${type}</span>
      <span class="drag-ghost-label">${label}</span>
    </div>
  `;
  
  document.body.appendChild(ghost);
  return ghost;
};

/**
 * Updates the position of a ghost element during drag
 */
export const updateDragGhostPosition = (
  ghost: HTMLElement,
  clientX: number,
  clientY: number
): void => {
  if (!ghost) return;
  
  ghost.style.left = `${clientX + 15}px`;
  ghost.style.top = `${clientY + 15}px`;
};

/**
 * Removes a ghost element from the DOM
 */
export const removeDragGhost = (ghost: HTMLElement): void => {
  if (ghost && ghost.parentElement) {
    ghost.parentElement.removeChild(ghost);
  }
};

/**
 * Calculates the target index based on position
 * @param position The drop position indicator 
 * @param currentIndex The current index of the element being hovered
 * @param adjustForInside Whether to adjust for Inside position (defaults to false)
 */
export const calculateTargetIndex = (
  position: DropIndicatorPosition,
  currentIndex: number,
  adjustForInside: boolean = false
): number => {
  switch (position) {
    case DropIndicatorPosition.Top:
    case DropIndicatorPosition.Left:
      return currentIndex;
    case DropIndicatorPosition.Bottom:
    case DropIndicatorPosition.Right:
      return currentIndex + 1;
    case DropIndicatorPosition.Inside:
      // Inside can mean different things depending on the context
      return adjustForInside ? -1 : currentIndex;
    default:
      return currentIndex;
  }
};

/**
 * Validates if a control can be dropped inside another control
 */
export const canDropInside = (
  draggedControlType: ControlType,
  targetControlType: ControlType
): boolean => {
  // Container controls can have children
  const isTargetContainer = [
    ControlType.Tab,
    ControlType.Accordion,
    ControlType.ColumnLayout,
    ControlType.GroupBox
  ].includes(targetControlType);
  
  if (!isTargetContainer) return false;
  
  // Prevent parent controls from being dropped inside other parents
  const isDraggedParent = [
    ControlType.Tab,
    ControlType.Accordion,
    ControlType.ColumnLayout
  ].includes(draggedControlType);
  
  if (isDraggedParent) {
    // Only allow parents in canvas, not inside other parents
    return false;
  }
  
  // Basic and specialized controls can be dropped in containers
  return true;
};

/**
 * Checks if moving a control will create a circular reference
 * @param controls The array of controls
 * @param draggedId ID of the dragged control
 * @param targetId ID of the target control 
 */
export const isDragInsideItself = (
  controls: Control[],
  draggedId: string,
  targetId: string
): boolean => {
  // Same control - can't drop into itself
  if (draggedId === targetId) return true;
  
  // Recursively find a control by ID
  const findControlById = (controls: Control[], id: string): Control | undefined => {
    for (const control of controls) {
      if (control.id === id) return control;
      
      // Check children recursively
      if (control.children?.length) {
        const found = findControlById(control.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };
  
  const draggedControl = findControlById(controls, draggedId);
  if (!draggedControl) return false; // Can't find dragged control
  
  // Check if target is inside dragged control
  const isInside = (parent: Control, id: string): boolean => {
    if (!parent.children?.length) return false;
    
    for (const child of parent.children) {
      if (child.id === id) return true;
      if (isInside(child, id)) return true;
    }
    
    return false;
  };
  
  // If target is inside dragged control, it would create a cycle
  return isInside(draggedControl, targetId);
};

/**
 * Updates CSS classes on elements to show drop indicators
 */
export const updateDropIndicators = (
  element: HTMLElement | null,
  position: DropIndicatorPosition
): void => {
  if (!element) return;

  // Remove existing indicators from this element
  ['drop-indicator-top', 'drop-indicator-bottom', 'drop-indicator-left', 
   'drop-indicator-right', 'drop-indicator-inside'].forEach(cls => {
    element.classList.remove(cls);
  });
  
  // Add the new position indicator if we have one
  if (position !== DropIndicatorPosition.None) {
    element.classList.add(`drop-indicator-${position}`);
  }
};
