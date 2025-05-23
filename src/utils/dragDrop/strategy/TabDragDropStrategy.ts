// filepath: src/utils/dragDrop/strategy/TabDragDropStrategy.ts
import { ControlType } from '../../../types';
import { DragElementData } from '../DragDropSurveyElements';
import { DropIndicatorPosition } from '../drag-drop-enums';
import { DragDropStrategy } from './DragDropStrategy';
import { ParentControlStrategy } from './ParentControlStrategy';

/**
 * Strategy implementation for handling Tab control drag and drop operations.
 * Tabs are special parent controls with header and content regions.
 */
export class TabDragDropStrategy implements DragDropStrategy, ParentControlStrategy {
  /**
   * Gets the unique identifier for this strategy
   */
  getId(): string {
    return 'tab-strategy';
  }
  
  /**
   * Gets the control types this strategy applies to
   */
  getApplicableControlTypes(): ControlType[] {
    return [ControlType.Tab];
  }

  /**
   * Handles the start of a drag operation
   */
  handleDragStart(
    element: HTMLElement, 
    data: DragElementData, 
    event?: DragEvent
  ): boolean {
    // Add tab-specific drag start behavior if needed
    return false; // Return false to use default behavior
  }

  /**
   * Validates if a drop is allowed in the target
   */
  validateDrop(
    draggedData: DragElementData, 
    targetElement: HTMLElement, 
    position: DropIndicatorPosition
  ): boolean {
    // Define which control types can be dropped into tabs
    const canContain = [
      ControlType.TextBox,
      ControlType.Checkbox,
      ControlType.RadioButton,
      ControlType.Select,
      ControlType.DatePicker,
      ControlType.GroupBox
      // Add other allowed control types
    ];
    
    // Only allow drops inside if the control can be contained by a tab
    if (position === DropIndicatorPosition.Inside) {
      return canContain.includes(draggedData.controlType);
    }
    
    // Allow top/bottom positions for any control type
    return true;
  }

  /**
   * Creates a preview representation of the dragged item
   */
  createPreview(draggedData: DragElementData): HTMLElement {
    // Create a tab-specific preview with tab styling
    const preview = document.createElement('div');
    preview.className = 'tab-drag-preview';
    
    // Add tab-like styling and content
    preview.innerHTML = `
      <div class="preview-tab-header">Tab: ${draggedData.controlType}</div>
      <div class="preview-tab-content">Content Area</div>
    `;
    
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
    // Handle tab-specific drop logic
    return false; // Return false to use default behavior
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
    
    let position: DropIndicatorPosition;
    
    // Get the tab header height (could be dynamic based on the actual component)
    const tabHeaderHeight = 40; // approximate height in pixels
    
    // If in the header area, use top position
    if (relativeY < tabHeaderHeight) {
      position = DropIndicatorPosition.Top;
    } 
    // If in the lower third of the content area, use bottom position
    else if (relativeY > rect.height * 0.8) {
      position = DropIndicatorPosition.Bottom;
    } 
    // Otherwise, it's inside the tab content
    else {
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
    // Position with a larger offset to avoid overlapping the cursor
    ghostElement.style.left = `${clientX + 20}px`;
    ghostElement.style.top = `${clientY + 20}px`;
  }

  /**
   * Determines if this strategy should be used for the given control types
   */
  appliesTo(draggedType: ControlType, targetType: ControlType): boolean {
    // This strategy applies when the target is a tab
    return targetType === ControlType.Tab;
  }
  
  // ParentControlStrategy implementation
  
  /**
   * Determines whether this parent control can accept the given child at the specified position.
   */
  canAcceptChildAtPosition(childId: string, position: string, regionId?: string): boolean {
    // In tabs, we typically only allow drops in the content area
    if (regionId === 'tab-content') {
      return true;
    }
    
    // Don't allow drops in the tab header area except for special cases
    if (regionId === 'tab-header') {
      return false;
    }
    
    // Default behavior based on position
    return position === 'inside';
  }
  
  /**
   * Handles rearrangement of children within this parent control.
   */
  handleChildRearrangement(childId: string, targetPosition: string, targetIndex: number): boolean {
    // Tab-specific rearrangement behavior would go here
    return false; // Return false to use default behavior
  }
  
  /**
   * Gets regions of this parent control that can accept drops.
   */
  getDropRegions(): string[] {
    return ['tab-header', 'tab-content'];
  }
}
