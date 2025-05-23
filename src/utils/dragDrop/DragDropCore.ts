import { DragDropStrategy } from './strategy/DragDropStrategy';

/**
 * DragDropCore
 * Base class for drag and drop functionality in the application
 */
export abstract class DragDropCore {
  // Static configuration
  protected static readonly edgeHeight = 20; // pixels from edge to consider as edge
  protected static readonly ghostOffset = 15; // pixels to offset ghost element from cursor

  // Protected properties for derived classes
  protected isDragging: boolean = false;
  protected startX: number = 0;
  protected startY: number = 0;
  protected draggedElement: HTMLElement | null = null;
  protected ghostElement: HTMLElement | null = null;
  
  // Strategy pattern property
  protected strategy: DragDropStrategy | null = null;

  /**
   * Constructor
   */
  constructor(strategy?: DragDropStrategy) {
    this.strategy = strategy || null;
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  /**
   * Basic validation for drag operations
   */
  protected isDragOperationValid(): boolean {
    return this.isDragging && !!this.draggedElement;
  }  /**
   * Creates a ghost element for drag feedback
   * If a strategy is available and provides a custom ghost element, it will be used.
   * Otherwise, falls back to the default implementation.
   */
  protected createGhostElement(element: HTMLElement, label: string, type: string): HTMLElement {
    // If we have a strategy that can create a preview, use it
    if (this.hasStrategy()) {
      const dragData = {
        id: element.getAttribute('data-id') || '',
        controlType: element.getAttribute('data-control-type') as any, // Cast to appropriate type in derived class
        sourceId: element.getAttribute('data-source-id') || undefined,
        parentId: element.getAttribute('data-parent-id') || undefined,
        index: element.getAttribute('data-index') ? parseInt(element.getAttribute('data-index')!, 10) : undefined,
        isNew: element.getAttribute('data-is-new') === 'true'
      };
      
      try {
        const customGhost = this.strategy!.createPreview(dragData);
        if (customGhost) {
          document.body.appendChild(customGhost);
          return customGhost;
        }
      } catch (error) {
        console.error('Error creating custom ghost element:', error);
        // Fall through to default implementation
      }
    }
    
    // Default implementation
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
  }
  /**
   * Updates ghost element position during drag
   * If a strategy is available with a custom positioning method, it will be used.
   * Otherwise, falls back to the default positioning.
   */
  protected updateGhostPosition(clientX: number, clientY: number): void {
    if (!this.ghostElement) return;
    
    // If we have a strategy that can position the ghost, use it
    if (this.hasStrategy()) {
      try {
        this.strategy!.positionGhostElement(this.ghostElement, clientX, clientY);
        return;
      } catch (error) {
        console.error('Error in custom ghost positioning:', error);
        // Fall through to default implementation
      }
    }
    
    // Default positioning behavior
    this.ghostElement.style.left = `${clientX + DragDropCore.ghostOffset}px`;
    this.ghostElement.style.top = `${clientY + DragDropCore.ghostOffset}px`;
  }

  /**
   * Removes ghost element from DOM
   */
  protected removeGhostElement(): void {
    if (this.ghostElement && this.ghostElement.parentElement) {
      this.ghostElement.parentElement.removeChild(this.ghostElement);
      this.ghostElement = null;
    }
  }
  /**
   * Set a strategy at runtime
   * @param strategy The strategy to use
   */
  public setStrategy(strategy: DragDropStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get the current strategy
   * @returns The current strategy or null if none is set
   */
  public getStrategy(): DragDropStrategy | null {
    return this.strategy;
  }

  /**
   * Checks if a strategy is set and available
   * @returns Boolean indicating if a strategy is available
   */
  protected hasStrategy(): boolean {
    return this.strategy !== null;
  }

  /**
   * Abstract methods to be implemented by derived classes
   */
  protected abstract onDragStart(event: DragEvent): void;
  protected abstract onDragOver(event: DragEvent): void;
  protected abstract onDragEnd(event: DragEvent): void;
}
