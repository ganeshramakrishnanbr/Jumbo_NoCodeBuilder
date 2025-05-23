import { DragDropCore } from './DragDropCore';
import { DropIndicatorPosition, ElementType } from './drag-drop-enums';
import { Control, ControlType } from '../../types';
import { ControlDragDropRegistry } from './strategy/ControlDragDropRegistry';
import { DragDropStrategy } from './strategy/DragDropStrategy';

/**
 * Data structure for drag events
 */
export interface DragElementData {
  id: string;
  controlType: ControlType;
  sourceId?: string;
  parentId?: string;
  index?: number;
  isNew?: boolean;
}

/**
 * Options for configuring the drag drop behavior
 */
export interface DragDropOptions {
  allowDragInto?: ControlType[];
  disallowDragInto?: ControlType[];
  disableParentDrag?: boolean;
  maxDepth?: number;
  useStrategies?: boolean; // New option to enable/disable strategy pattern
}

/**
 * Main class for handling drag and drop of survey elements
 */
export class DragDropSurveyElements extends DragDropCore {
  private dropTargetElement: HTMLElement | null = null;
  private dropPosition: DropIndicatorPosition = DropIndicatorPosition.None;
  private dropTargetIndex: number = -1;
  private options: DragDropOptions;
  private dragData: DragElementData | null = null;
  private registry = ControlDragDropRegistry.getInstance();
  /**
   * Creates a new instance of DragDropSurveyElements
   * @param options Options for configuring the drag drop behavior
   */
  constructor(options: DragDropOptions = {}) {
    super();
    this.options = {
      allowDragInto: undefined,
      disallowDragInto: undefined,
      disableParentDrag: false,
      maxDepth: 5,
      useStrategies: true, // Enable strategies by default
      ...options
    };
    
    // If strategies are enabled, set the default strategy from registry
    if (this.options.useStrategies !== false) {
      const defaultStrategy = this.registry.getStrategyForControlType(ControlType.TextBox);
      this.setStrategy(defaultStrategy);
    }
  }
  /**
   * Calculates drop location based on cursor position
   * If a strategy is available for the control type, it will be used.
   */
  public calculateDragOverLocation(
    clientX: number, 
    clientY: number, 
    rect: DOMRect, 
    direction: "vertical" | "horizontal" = "vertical",
    controlType?: ControlType,
    element?: HTMLElement
  ): DropIndicatorPosition {
    // If we have a control type and element, try to use a strategy
    if (controlType && element && this.hasStrategy()) {
      const dragData = this.dragData || {
        id: '',
        controlType: ControlType.TextBox, // default fallback
      };
      
      try {
        const result = this.getStrategy()!.calculateDropPosition(
          element, 
          clientX, 
          clientY, 
          dragData
        );
        
        if (result && result.position) {
          return result.position;
        }
      } catch (error) {
        console.error('Error using strategy for drop position calculation:', error);
        // Fall through to default implementation
      }
    }
    
    // Default implementation
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
  }

  /**
   * Validates if dropping into itself or its children (prevents circular nesting)
   */
  public isDragInsideItself(draggedId: string, targetId: string, controls: Control[]): boolean {
    if (draggedId === targetId) return true;
    
    const findControlById = (id: string): Control | undefined => {
      // Recursively search through controls and their children
      const search = (items: Control[]): Control | undefined => {
        for (const item of items) {
          if (item.id === id) return item;
          if (item.children) {
            const found = search(item.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      
      return search(controls);
    };
    
    const draggedControl = findControlById(draggedId);
    const targetControl = findControlById(targetId);
    
    // Can't find either control
    if (!draggedControl || !targetControl) return false;
    
    // Check if target is inside dragged (recursive)
    const isTargetInsideDragged = (parent: Control, targetId: string): boolean => {
      if (!parent.children) return false;
      
      for (const child of parent.children) {
        if (child.id === targetId) return true;
        if (isTargetInsideDragged(child, targetId)) return true;
      }
      
      return false;
    };
    
    return isTargetInsideDragged(draggedControl, targetId);
  }
    /**
   * Determines if the drop target is valid based on control types
   * If strategies are enabled and a strategy exists for the target control type,
   * it will be used for validation.
   */
  public isDropTargetValid(
    draggedControlType: ControlType, 
    targetControlType: ControlType, 
    position: DropIndicatorPosition,
    targetElement?: HTMLElement
  ): boolean {
    // If strategies are enabled and we have a target element
    if (this.options.useStrategies !== false && targetElement) {
      try {
        // Try to get strategy for the target control type
        const strategy = this.registry.getBestStrategyForInteraction(
          draggedControlType,
          targetControlType
        );
        
        if (strategy) {
          // Create minimal drag data for validation
          const draggedData = {
            id: '',
            controlType: draggedControlType,
            isNew: this.dragData?.isNew || false
          };
          
          return strategy.validateDrop(draggedData, targetElement, position);
        }
      } catch (error) {
        console.error('Error using strategy for drop validation:', error);
        // Fall back to default implementation
      }
    }
    
    // Default implementation
    // Inside position has special validation rules
    if (position === DropIndicatorPosition.Inside) {
      // Container controls can have children
      const isTargetContainer = [
        ControlType.Tab, 
        ControlType.Accordion, 
        ControlType.ColumnLayout, 
        ControlType.GroupBox
      ].includes(targetControlType);
      
      if (!isTargetContainer) return false;
      
      // Prevent parent controls from being dropped inside other parent controls
      const isDraggedParent = [
        ControlType.Tab, 
        ControlType.Accordion, 
        ControlType.ColumnLayout
      ].includes(draggedControlType);
      
      if (isDraggedParent) {
        // Only allow parents in canvas, not inside other parents
        return false;
      }
      
      // If we have allowed controls specified, check against them
      if (this.options.allowDragInto && this.options.allowDragInto.length > 0) {
        return this.options.allowDragInto.includes(targetControlType);
      }
      
      // If we have disallowed controls specified, check against them
      if (this.options.disallowDragInto && this.options.disallowDragInto.length > 0) {
        return !this.options.disallowDragInto.includes(targetControlType);
      }
      
      // Default: Allow dropping in containers
      return true;
    }
    
    // For position outside the target (Top, Bottom, Left, Right)
    return true;
  }
  
  /**
   * Finds the deepest child element at the specified coordinates
   */
  public findDeepestDropTargetChild(
    element: HTMLElement, 
    clientX: number, 
    clientY: number, 
    maxDepth: number = this.options.maxDepth || 5
  ): HTMLElement {
    if (maxDepth <= 0) return element;
    
    // Get all potential drop targets inside the element
    const children = Array.from(
      element.querySelectorAll('.drop-target:not(.drag-source)')
    ) as HTMLElement[];
    
    // Filter for elements under the cursor
    const childrenUnderCursor = children.filter(child => {
      const rect = child.getBoundingClientRect();
      return (
        clientX >= rect.left && 
        clientX <= rect.right && 
        clientY >= rect.top && 
        clientY <= rect.bottom
      );
    });
    
    // If no children under cursor, return current element
    if (childrenUnderCursor.length === 0) return element;
    
    // Find the smallest (most deeply nested) element
    let smallestElement = childrenUnderCursor[0];
    let smallestArea = Number.MAX_SAFE_INTEGER;
    
    childrenUnderCursor.forEach(child => {
      const rect = child.getBoundingClientRect();
      const area = rect.width * rect.height;
      
      if (area < smallestArea) {
        smallestArea = area;
        smallestElement = child;
      }
    });
    
    // Recursively look for even deeper children
    return this.findDeepestDropTargetChild(
      smallestElement, 
      clientX, 
      clientY, 
      maxDepth - 1
    );
  }
  
  /**
   * Updates visual drag indicators
   */
  public updateDropIndicator(
    element: HTMLElement, 
    position: DropIndicatorPosition
  ): void {
    // Remove existing indicators
    element.classList.remove(
      'drop-indicator-top', 
      'drop-indicator-bottom', 
      'drop-indicator-left', 
      'drop-indicator-right', 
      'drop-indicator-inside'
    );
    
    // Add the appropriate indicator class
    if (position !== DropIndicatorPosition.None) {
      element.classList.add(`drop-indicator-${position}`);
    }
  }

  /**
   * Handles the drag start event
   */
  protected onDragStart(event: DragEvent): void {
    if (!event.dataTransfer || !(event.target instanceof HTMLElement)) return;
    
    this.draggedElement = event.target.closest('.draggable') as HTMLElement;
    if (!this.draggedElement) return;
    
    // Get drag data from element
    const id = this.draggedElement.getAttribute('data-id') || '';
    const controlType = this.draggedElement.getAttribute('data-control-type') as ControlType;
    const sourceId = this.draggedElement.getAttribute('data-source-id') || undefined;
    const parentId = this.draggedElement.getAttribute('data-parent-id') || undefined;
    const indexAttr = this.draggedElement.getAttribute('data-index');
    const index = indexAttr ? parseInt(indexAttr, 10) : undefined;
    const isNewAttr = this.draggedElement.getAttribute('data-is-new');
    const isNew = isNewAttr ? isNewAttr === 'true' : false;
    
    // Store the drag data
    this.dragData = {
      id,
      controlType,
      sourceId,
      parentId,
      index,
      isNew
    };
    
    // Set dragging state
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    
    // Create ghost element for larger controls
    if ([ControlType.Tab, ControlType.Accordion, ControlType.ColumnLayout].includes(controlType)) {
      const label = this.draggedElement.getAttribute('data-label') || controlType;
      this.ghostElement = this.createGhostElement(
        this.draggedElement, 
        label, 
        controlType
      );
      this.updateGhostPosition(event.clientX, event.clientY);
    }
    
    // Set drag image - if we have a ghost use that, otherwise use the element
    if (this.ghostElement) {
      // Use a transparent element as the drag image since we have our own ghost
      const transparent = document.createElement('div');
      transparent.style.opacity = '0';
      document.body.appendChild(transparent);
      event.dataTransfer.setDragImage(transparent, 0, 0);
      setTimeout(() => {
        document.body.removeChild(transparent);
      }, 0);
    } else {
      // Use the actual element as the drag image
      event.dataTransfer.setDragImage(this.draggedElement, 10, 10);
    }
    
    // Add dragging classes
    this.draggedElement.classList.add('dragging');
    document.body.classList.add('drag-active');
    
    // Set data transfer
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', JSON.stringify(this.dragData));
  }
  /**
   * Handles the drag over event
   */
  protected onDragOver(event: DragEvent): void {
    if (!this.isDragOperationValid() || !event.dataTransfer) return;
    
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    // Update ghost element position
    if (this.ghostElement) {
      this.updateGhostPosition(event.clientX, event.clientY);
    }
    
    // Find the drop target element
    const target = event.target as HTMLElement;
    const dropTarget = target.closest('.drop-target') as HTMLElement;
    
    if (!dropTarget) {
      this.clearDropTargetIndicators();
      return;
    }
    
    // Look for the deepest valid drop target
    const deepestTarget = this.findDeepestDropTargetChild(
      dropTarget, 
      event.clientX, 
      event.clientY
    );
    
    // If we changed drop targets, clear previous indicators
    if (this.dropTargetElement !== deepestTarget) {
      this.clearDropTargetIndicators();
      this.dropTargetElement = deepestTarget;
    }
    
    if (!this.dropTargetElement) return;
    
    // Get target information
    const targetControlType = this.dropTargetElement.getAttribute('data-control-type') as ControlType;
    const targetId = this.dropTargetElement.getAttribute('data-id') || '';
    const indexAttr = this.dropTargetElement.getAttribute('data-index');
    const targetIndex = indexAttr ? parseInt(indexAttr, 10) : 0;
    
    // Skip if we don't have drag data
    if (!this.dragData || !this.dragData.controlType) return;
    
    // Check if dragging into itself (prevent circular references)
    if (
      this.dragData.id &&
      targetId &&
      this.dragData.id === targetId
    ) {
      this.clearDropTargetIndicators();
      return;
    }

    // Calculate the drop position relative to the target
    const rect = this.dropTargetElement.getBoundingClientRect();
    
    let position: DropIndicatorPosition;
    
    // If using strategy pattern and we have a valid strategy
    if (this.options.useStrategies !== false && this.hasStrategy()) {
      // Try to use strategy for position calculation
      try {
        const result = this.getStrategy()!.calculateDropPosition(
          this.dropTargetElement,
          event.clientX,
          event.clientY,
          this.dragData
        );
        position = result.position;
        
        // If the strategy also provided an index, use it
        if (result.index !== -1) {
          this.dropTargetIndex = result.index;
        }
      } catch (error) {
        console.error('Error using strategy for position calculation:', error);
        
        // Fall back to default calculation
        const isHorizontal = targetControlType === ControlType.ColumnLayout;
        position = this.calculateDragOverLocation(
          event.clientX,
          event.clientY,
          rect,
          isHorizontal ? "horizontal" : "vertical"
        );
      }
    } else {
      // Use default calculation
      const isHorizontal = targetControlType === ControlType.ColumnLayout;
      position = this.calculateDragOverLocation(
        event.clientX,
        event.clientY,
        rect,
        isHorizontal ? "horizontal" : "vertical"
      );
    }
    
    // Validate the drop target based on control types
    const isValid = this.isDropTargetValid(
      this.dragData.controlType,
      targetControlType,
      position,
      this.dropTargetElement
    );
    
    if (!isValid) {
      this.clearDropTargetIndicators();
      return;
    }
    
    // Store position information
    this.dropPosition = position;
    if (targetIndex !== undefined) {
      this.dropTargetIndex = targetIndex;
    }
    
    // Update the indicator visually
    this.updateDropIndicator(this.dropTargetElement, position);
  }

  /**
   * Handles the drag end event
   */
  protected onDragEnd(event: DragEvent): void {
    // Clean up
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }
    
    document.body.classList.remove('drag-active');
    this.clearDropTargetIndicators();
    this.removeGhostElement();
    
    // Reset state
    this.isDragging = false;
    this.draggedElement = null;
    this.dropTargetElement = null;
    this.dropPosition = DropIndicatorPosition.None;
    this.dropTargetIndex = -1;
    this.dragData = null;
  }

  /**
   * Clears all drop indicators from the document
   */
  private clearDropTargetIndicators(): void {
    if (this.dropTargetElement) {
      this.updateDropIndicator(this.dropTargetElement, DropIndicatorPosition.None);
      this.dropTargetElement = null;
    }
    
    // Also clear any other indicators that might be active
    document.querySelectorAll('.drop-indicator-top, .drop-indicator-bottom, .drop-indicator-left, .drop-indicator-right, .drop-indicator-inside')
      .forEach(el => {
        ['drop-indicator-top', 'drop-indicator-bottom', 'drop-indicator-left', 'drop-indicator-right', 'drop-indicator-inside']
          .forEach(cls => (el as HTMLElement).classList.remove(cls));
      });
  }

  /**
   * Public method to get the current drag data
   */
  public getDragData(): DragElementData | null {
    return this.dragData;
  }

  /**
   * Public method to get the current drop position
   */
  public getDropPosition(): { 
    element: HTMLElement | null, 
    position: DropIndicatorPosition, 
    index: number 
  } {
    return {
      element: this.dropTargetElement,
      position: this.dropPosition,
      index: this.dropTargetIndex
    };
  }
  /**
   * Attach event handlers to the document or specific container
   */
  public attachEventHandlers(container: HTMLElement | Document = document): void {
    container.addEventListener('dragstart', this.onDragStart as unknown as EventListener);
    container.addEventListener('dragover', this.onDragOver as unknown as EventListener);
    container.addEventListener('dragend', this.onDragEnd as unknown as EventListener);
    container.addEventListener('drop', this.onDragEnd as unknown as EventListener); // Treat drop like dragend for cleanup
  }

  /**
   * Detach event handlers
   */
  public detachEventHandlers(container: HTMLElement | Document = document): void {
    container.removeEventListener('dragstart', this.onDragStart as unknown as EventListener);
    container.removeEventListener('dragover', this.onDragOver as unknown as EventListener);
    container.removeEventListener('dragend', this.onDragEnd as unknown as EventListener);
    container.removeEventListener('drop', this.onDragEnd as unknown as EventListener);
  }

  /**
   * Initialize strategies for specific control types
   * This method should be called after constructing the DragDropSurveyElements instance
   * if you want to set up control-specific strategies
   */
  public initializeStrategies(): void {
    // Only proceed if strategies are enabled
    if (this.options.useStrategies === false) return;

    // Register the TabDragDropStrategy for Tab controls
    // Import and register other strategies as needed
    try {
      const { TabDragDropStrategy } = require('./strategy/TabDragDropStrategy');
      const tabStrategy = new TabDragDropStrategy();
      this.registry.registerStrategy(tabStrategy);
            
      // For logging purposes
      console.log('Initialized drag drop strategies successfully');
    } catch (error) {
      console.error('Failed to initialize drag drop strategies:', error);
    }
  }

  /**
   * Gets the strategy for a specific control type
   * @param controlType The control type to get a strategy for
   * @returns The strategy for the specified control type
   */
  public getStrategyForControlType(controlType: ControlType): DragDropStrategy {
    if (this.options.useStrategies === false) {
      throw new Error('Strategies are disabled in this instance');
    }
    
    return this.registry.getStrategyForControlType(controlType);
  }
}
