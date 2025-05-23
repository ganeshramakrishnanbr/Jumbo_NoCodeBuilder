# Drag and Drop Architecture Implementation Plan

This document provides a detailed implementation plan for the architectural improvements outlined in the architecture review document. It includes concrete steps, code examples, and a phased approach to implementing the enhanced drag and drop system.

## Phase 1: Foundation Improvements (2-3 weeks)

### 1. Create DragDropStrategy Interface

```typescript
// src/utils/dragDrop/strategies/DragDropStrategy.ts

import { Control, ControlType } from '../../../types';
import { DropIndicatorPosition } from '../drag-drop-enums';

export interface DragDropStrategy {
  /**
   * Check if this control type can accept the specified child type
   */
  canAcceptChild(childType: ControlType): boolean;
  
  /**
   * Get all valid drop positions for the control when dragging the specified child type
   */
  getValidDropPositions(childType: ControlType): DropIndicatorPosition[];
  
  /**
   * Validate if a drop operation is valid
   */
  validateDrop(
    draggedControl: Control, 
    targetControl: Control, 
    position: DropIndicatorPosition
  ): boolean;
  
  /**
   * Calculate the final index where the control should be placed based on drop position
   */
  calculateDropIndex(
    position: DropIndicatorPosition, 
    targetIndex: number, 
    parentChildCount: number
  ): number;
  
  /**
   * Get the layout direction for this control type
   */
  getLayoutDirection(): 'vertical' | 'horizontal' | 'grid';
}
```

### 2. Refactor DragDropCore to Support Strategy Pattern

```typescript
// src/utils/dragDrop/DragDropCore.ts

import { DragDropStrategy } from './strategies/DragDropStrategy';
import { DefaultDragDropStrategy } from './strategies/DefaultDragDropStrategy';

export abstract class DragDropCore {
  // Existing properties
  protected static readonly edgeHeight = 20;
  protected static readonly ghostOffset = 15;
  
  protected isDragging: boolean = false;
  protected startX: number = 0;
  protected startY: number = 0;
  protected draggedElement: HTMLElement | null = null;
  protected ghostElement: HTMLElement | null = null;
  
  // New property for strategy
  protected strategy: DragDropStrategy;

  /**
   * Constructor
   */
  constructor(strategy?: DragDropStrategy) {
    this.strategy = strategy || new DefaultDragDropStrategy();
    
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  /**
   * Set a new strategy at runtime
   */
  public setStrategy(strategy: DragDropStrategy): void {
    this.strategy = strategy;
  }
  
  /**
   * Get current strategy
   */
  public getStrategy(): DragDropStrategy {
    return this.strategy;
  }
  
  // Rest of the existing methods...
}
```

### 3. Implement Control Registry System

```typescript
// src/utils/dragDrop/ControlDragDropRegistry.ts

import { ControlType } from '../../types';
import { DragDropStrategy } from './strategies/DragDropStrategy';
import { DefaultDragDropStrategy } from './strategies/DefaultDragDropStrategy';
import { TabDragDropStrategy } from './strategies/TabDragDropStrategy';
import { AccordionDragDropStrategy } from './strategies/AccordionDragDropStrategy';
import { ColumnLayoutDragDropStrategy } from './strategies/ColumnLayoutDragDropStrategy';

export class ControlDragDropRegistry {
  private static instance: ControlDragDropRegistry;
  private strategies: Map<ControlType, DragDropStrategy> = new Map();
  private defaultStrategy = new DefaultDragDropStrategy();
  
  constructor() {
    this.registerDefaultStrategies();
  }
  
  public static getInstance(): ControlDragDropRegistry {
    if (!ControlDragDropRegistry.instance) {
      ControlDragDropRegistry.instance = new ControlDragDropRegistry();
    }
    return ControlDragDropRegistry.instance;
  }
  
  private registerDefaultStrategies(): void {
    this.registerStrategy(ControlType.Tab, new TabDragDropStrategy());
    this.registerStrategy(ControlType.Accordion, new AccordionDragDropStrategy());
    this.registerStrategy(ControlType.ColumnLayout, new ColumnLayoutDragDropStrategy());
  }
  
  public registerStrategy(controlType: ControlType, strategy: DragDropStrategy): void {
    this.strategies.set(controlType, strategy);
  }
  
  public getStrategy(controlType: ControlType): DragDropStrategy {
    return this.strategies.get(controlType) || this.defaultStrategy;
  }
}
```

### 4. Create Default Strategy Implementation

```typescript
// src/utils/dragDrop/strategies/DefaultDragDropStrategy.ts

import { Control, ControlType } from '../../../types';
import { DragDropStrategy } from './DragDropStrategy';
import { DropIndicatorPosition } from '../drag-drop-enums';

export class DefaultDragDropStrategy implements DragDropStrategy {
  canAcceptChild(childType: ControlType): boolean {
    // By default, only container controls can accept children
    return false;
  }
  
  getValidDropPositions(childType: ControlType): DropIndicatorPosition[] {
    // Default, allow positioning above or below
    return [DropIndicatorPosition.Top, DropIndicatorPosition.Bottom];
  }
  
  validateDrop(draggedControl: Control, targetControl: Control, position: DropIndicatorPosition): boolean {
    // No dropping inside by default
    if (position === DropIndicatorPosition.Inside) return false;
    return true;
  }
  
  calculateDropIndex(position: DropIndicatorPosition, targetIndex: number, parentChildCount: number): number {
    switch (position) {
      case DropIndicatorPosition.Top:
        return targetIndex;
      case DropIndicatorPosition.Bottom:
        return targetIndex + 1;
      case DropIndicatorPosition.Inside:
        return 0; // First child
      default:
        return targetIndex;
    }
  }
  
  getLayoutDirection(): 'vertical' | 'horizontal' | 'grid' {
    return 'vertical';
  }
}
```

### 5. Update DragDropSurveyElements to Use Registry

```typescript
// src/utils/dragDrop/DragDropSurveyElements.ts

import { DragDropCore } from './DragDropCore';
import { ControlDragDropRegistry } from './ControlDragDropRegistry';
import { Control, ControlType } from '../../types';
import { DropIndicatorPosition } from './drag-drop-enums';

// Existing interfaces (DragElementData, DragDropOptions)...

export class DragDropSurveyElements extends DragDropCore {
  private dropTargetElement: HTMLElement | null = null;
  private dropPosition: DropIndicatorPosition = DropIndicatorPosition.None;
  private dropTargetIndex: number = -1;
  private options: DragDropOptions;
  private dragData: DragElementData | null = null;
  private registry = ControlDragDropRegistry.getInstance();

  constructor(options: DragDropOptions = {}) {
    super();
    this.options = {
      allowDragInto: undefined,
      disallowDragInto: undefined,
      disableParentDrag: false,
      maxDepth: 5,
      ...options
    };
  }

  // Update methods to use strategy pattern
  public calculateDragOverLocation(
    clientX: number, 
    clientY: number, 
    rect: DOMRect, 
    controlType: ControlType
  ): DropIndicatorPosition {
    const strategy = this.registry.getStrategy(controlType);
    const direction = strategy.getLayoutDirection();
    
    // Existing calculation based on direction...
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

  // Update validation method to use strategy
  public isDropTargetValid(
    draggedControlType: ControlType, 
    targetControlType: ControlType, 
    position: DropIndicatorPosition
  ): boolean {
    const strategy = this.registry.getStrategy(targetControlType);
    
    // Use strategy for validation
    if (position === DropIndicatorPosition.Inside) {
      return strategy.canAcceptChild(draggedControlType);
    }
    
    // Other validations from options...
    
    // Check if the position is valid for this control type
    const validPositions = strategy.getValidDropPositions(draggedControlType);
    return validPositions.includes(position);
  }
  
  // Rest of the existing methods updated to use strategies...
}
```

## Phase 2: Preview and Dependency System (3-4 weeks)

### 1. Create Drag Preview Manager

```typescript
// src/utils/dragDrop/preview/DragPreviewManager.ts

import { Control, ControlType } from '../../../types';
import { DropPosition } from '../useDragDrop';
import { ControlDragDropRegistry } from '../ControlDragDropRegistry';

export interface DragPreviewOptions {
  showDependencies: boolean;
  previewStyle: 'ghost' | 'solid' | 'outline';
  showValidationErrors: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class DragPreviewManager {
  private registry = ControlDragDropRegistry.getInstance();
  private activePreview: HTMLElement | null = null;
  private defaultOptions: DragPreviewOptions = {
    showDependencies: true,
    previewStyle: 'ghost',
    showValidationErrors: true
  };
  
  /**
   * Create a preview element for the dragged control
   */
  public createPreview(
    control: Control, 
    position: DropPosition, 
    options: Partial<DragPreviewOptions> = {}
  ): HTMLElement {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Create base preview element
    const preview = document.createElement('div');
    preview.className = `drag-preview ${mergedOptions.previewStyle}`;
    preview.dataset.controlType = control.type;
    
    // Create preview content based on control type
    const label = control.label || 'Unnamed control';
    preview.innerHTML = `
      <div class="drag-preview-inner">
        <div class="drag-preview-header">${label}</div>
        <div class="drag-preview-body">${this.getPreviewContent(control)}</div>
      </div>
    `;
    
    // Add validation styles if needed
    if (mergedOptions.showValidationErrors) {
      const validationResult = this.validatePreview(control, position);
      if (!validationResult.valid) {
        preview.classList.add('invalid-drop');
        
        // Add error messages
        const errorContainer = document.createElement('div');
        errorContainer.className = 'drag-preview-errors';
        errorContainer.innerHTML = validationResult.errors
          .map(err => `<div class="error">${err}</div>`)
          .join('');
        
        preview.appendChild(errorContainer);
      }
    }
    
    // Add to DOM
    document.body.appendChild(preview);
    this.activePreview = preview;
    
    return preview;
  }
  
  /**
   * Update position of the active preview
   */
  public updatePreviewPosition(clientX: number, clientY: number): void {
    if (!this.activePreview) return;
    
    const previewRect = this.activePreview.getBoundingClientRect();
    
    // Center the preview on cursor
    this.activePreview.style.left = `${clientX - previewRect.width / 2}px`;
    this.activePreview.style.top = `${clientY - 20}px`; // Slightly above cursor
  }
  
  /**
   * Generate preview content based on control type
   */
  private getPreviewContent(control: Control): string {
    // Generate simple content based on control type
    switch (control.type) {
      case ControlType.TextBox:
        return '<div class="preview-text-input"></div>';
      case ControlType.Checkbox:
        return '<div class="preview-checkbox"></div>';
      case ControlType.Tab:
        return '<div class="preview-tabs"><div class="tab">Tab 1</div><div class="tab">Tab 2</div></div>';
      // Add more control types...
      default:
        return '';
    }
  }
  
  /**
   * Validate if the preview is in a valid position
   */
  public validatePreview(control: Control, position: DropPosition): ValidationResult {
    // Placeholder implementation
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }
  
  /**
   * Remove active preview from DOM
   */
  public removePreview(): void {
    if (this.activePreview && this.activePreview.parentElement) {
      this.activePreview.parentElement.removeChild(this.activePreview);
      this.activePreview = null;
    }
  }
}
```

### 2. Create Dependency Tracker System

```typescript
// src/utils/dragDrop/dependencies/DependencyTracker.ts

import { Control, Dependency } from '../../../types';

export class DependencyTracker {
  private dependencyMap: Map<string, Set<string>> = new Map();
  private reverseDependencyMap: Map<string, Set<string>> = new Map();
  
  /**
   * Build dependency maps from controls
   */
  public buildDependencyMaps(controls: Control[]): void {
    // Clear existing maps
    this.dependencyMap.clear();
    this.reverseDependencyMap.clear();
    
    // Recursive function to process controls and their dependencies
    const processControl = (control: Control) => {
      // Process dependencies of this control
      if (control.dependencies && control.dependencies.length > 0) {
        // Get or create entry in dependency map
        if (!this.dependencyMap.has(control.id)) {
          this.dependencyMap.set(control.id, new Set<string>());
        }
        
        // Add each dependency
        for (const dependency of control.dependencies) {
          const targetId = dependency.targetControlId;
          this.dependencyMap.get(control.id)!.add(targetId);
          
          // Create reverse dependency mapping
          if (!this.reverseDependencyMap.has(targetId)) {
            this.reverseDependencyMap.set(targetId, new Set<string>());
          }
          this.reverseDependencyMap.get(targetId)!.add(control.id);
        }
      }
      
      // Process children recursively
      if (control.children && control.children.length > 0) {
        control.children.forEach(processControl);
      }
    };
    
    // Process all controls
    controls.forEach(processControl);
  }
  
  /**
   * Get all controls that depend on the specified control
   */
  public getDependentControls(controlId: string): string[] {
    const dependents = this.reverseDependencyMap.get(controlId);
    return dependents ? Array.from(dependents) : [];
  }
  
  /**
   * Get the complete dependency chain for a control
   */
  public getDependencyChain(controlId: string): string[] {
    const dependencies = this.dependencyMap.get(controlId);
    return dependencies ? Array.from(dependencies) : [];
  }
  
  /**
   * Validate dependencies after a control move
   */
  public validateDependenciesAfterMove(
    controlId: string, 
    newParentId: string
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check if control has dependencies on elements outside new parent
    const dependencies = this.getDependencyChain(controlId);
    if (dependencies.length > 0) {
      // The dependency validation logic would go here
      // For now, we'll just return a placeholder result
    }
    
    // Check if anything depending on this control would be broken
    const dependents = this.getDependentControls(controlId);
    if (dependents.length > 0) {
      // The dependent validation logic would go here
      // For now, we'll just return a placeholder result
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }
  
  /**
   * Create visual indicators for dependencies
   */
  public visualizeDependencies(controlId: string): void {
    // Implementation to create visual indicators...
  }
}
```

### 3. Enhance useDragDrop Hook to Use New Systems

```typescript
// src/utils/dragDrop/useDragDrop.tsx

import { useEffect, useRef, useState } from 'react';
import { ControlType, Control } from '../../types';
import { DragDropSurveyElements, DragElementData } from './DragDropSurveyElements';
import { DropIndicatorPosition } from './drag-drop-enums';
import { DragPreviewManager } from './preview/DragPreviewManager';
import { DependencyTracker } from './dependencies/DependencyTracker';

// Existing interfaces...

export interface UseDragDropProps {
  // Existing props...
  previewOptions?: {
    enabled: boolean;
    showDependencies: boolean;
    previewStyle: 'ghost' | 'solid' | 'outline';
  };
  dependencyTracking?: boolean;
  controls?: Control[]; // For dependency tracking
}

export function useDragDrop({
  // Existing params...
  previewOptions = { enabled: true, showDependencies: true, previewStyle: 'ghost' },
  dependencyTracking = false,
  controls = [],
  ...rest
}: UseDragDropProps): UseDragDropResult {
  // Existing state...
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemData, setDraggedItemData] = useState<DragElementData | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [dropTargetElement, setDropTargetElement] = useState<HTMLElement | null>(null);
  
  // New state for enhanced functionality
  const previewManager = useRef<DragPreviewManager>(new DragPreviewManager());
  const dependencyTracker = useRef<DependencyTracker>(new DependencyTracker());
  
  // Initialize dependency tracker if enabled
  useEffect(() => {
    if (dependencyTracking && controls.length > 0) {
      dependencyTracker.current.buildDependencyMaps(controls);
    }
  }, [dependencyTracking, controls]);
  
  // Rest of the existing implementation updated to use previewManager and dependencyTracker
  
  // Return the enhanced result...
  return {
    // Existing returns...
    isDragging,
    draggedItemData,
    dropPosition,
    dropTargetElement,
    makeElementDraggable,
    makeElementDropTarget,
    
    // New enhanced methods
    validateDependencies: (controlId: string, newParentId: string) => 
      dependencyTracker.current.validateDependenciesAfterMove(controlId, newParentId),
    showDependencyVisualization: (controlId: string) => 
      dependencyTracker.current.visualizeDependencies(controlId)
  };
}
```

## Phase 3: Advanced Drop Target System (3-4 weeks)

### 1. Create Composite Drop Target Interface

```typescript
// src/utils/dragDrop/compositeDrop/CompositeDropTarget.ts

import { ControlType } from '../../../types';

export interface DropRegion {
  id: string;
  rect: DOMRect;
  type: 'header' | 'content' | 'footer' | 'column' | 'tab' | 'custom';
  acceptedTypes: ControlType[];
  index: number;
}

export interface CompositeDropTarget {
  /**
   * Get all drop regions for this target
   */
  getDropRegions(): DropRegion[];
  
  /**
   * Find the region at the specified position
   */
  getRegionAtPosition(x: number, y: number): DropRegion | null;
  
  /**
   * Check if dropping the control in the region is valid
   */
  validateDropInRegion(region: DropRegion, controlType: ControlType): boolean;
  
  /**
   * Show drop indicators for the specified region
   */
  showDropIndicatorForRegion(region: DropRegion): void;
  
  /**
   * Hide all drop indicators
   */
  clearDropIndicators(): void;
}
```

### 2. Implement Tab Control Composite Drop Target

```typescript
// src/utils/dragDrop/compositeDrop/TabCompositeDropTarget.ts

import { ControlType } from '../../../types';
import { CompositeDropTarget, DropRegion } from './CompositeDropTarget';

export class TabCompositeDropTarget implements CompositeDropTarget {
  private element: HTMLElement;
  private tabElements: HTMLElement[] = [];
  private contentElement: HTMLElement | null = null;
  private regions: DropRegion[] = [];
  
  constructor(element: HTMLElement) {
    this.element = element;
    this.initializeRegions();
  }
  
  /**
   * Initialize regions from the DOM element
   */
  private initializeRegions(): void {
    // Find tab elements
    this.tabElements = Array.from(
      this.element.querySelectorAll('.tab-header')
    ) as HTMLElement[];
    
    // Find content element
    this.contentElement = this.element.querySelector('.tab-content') as HTMLElement;
    
    // Create regions for tabs
    this.regions = [];
    
    // Add regions for each tab
    this.tabElements.forEach((tab, index) => {
      const rect = tab.getBoundingClientRect();
      this.regions.push({
        id: `tab-${index}`,
        rect,
        type: 'tab',
        acceptedTypes: [ControlType.TextBox, ControlType.Checkbox, ControlType.RadioButton],
        index
      });
    });
    
    // Add region for content area
    if (this.contentElement) {
      const rect = this.contentElement.getBoundingClientRect();
      this.regions.push({
        id: 'content',
        rect,
        type: 'content',
        acceptedTypes: [
          ControlType.TextBox, 
          ControlType.Checkbox, 
          ControlType.RadioButton,
          ControlType.GroupBox
        ],
        index: 0
      });
    }
  }
  
  /**
   * Get all drop regions
   */
  public getDropRegions(): DropRegion[] {
    return this.regions;
  }
  
  /**
   * Find which region contains the point
   */
  public getRegionAtPosition(x: number, y: number): DropRegion | null {
    // Update regions in case elements have moved
    this.initializeRegions();
    
    // Find the first region containing the point
    return this.regions.find(region => {
      const { rect } = region;
      return (
        x >= rect.left && 
        x <= rect.right && 
        y >= rect.top && 
        y <= rect.bottom
      );
    }) || null;
  }
  
  /**
   * Validate drop in region
   */
  public validateDropInRegion(region: DropRegion, controlType: ControlType): boolean {
    return region.acceptedTypes.includes(controlType);
  }
  
  /**
   * Show drop indicator for a region
   */
  public showDropIndicatorForRegion(region: DropRegion): void {
    // Clear existing indicators first
    this.clearDropIndicators();
    
    if (region.type === 'tab') {
      // Highlight the tab
      const tabElement = this.tabElements[region.index];
      if (tabElement) {
        tabElement.classList.add('drop-target-active');
      }
    } else if (region.type === 'content') {
      // Highlight the content area
      if (this.contentElement) {
        this.contentElement.classList.add('drop-target-active');
      }
    }
  }
  
  /**
   * Clear all drop indicators
   */
  public clearDropIndicators(): void {
    // Remove highlighting from tabs
    this.tabElements.forEach(tab => {
      tab.classList.remove('drop-target-active');
    });
    
    // Remove highlighting from content
    if (this.contentElement) {
      this.contentElement.classList.remove('drop-target-active');
    }
  }
}
```

### 3. Create Composite Drop Target Factory

```typescript
// src/utils/dragDrop/compositeDrop/CompositeDropTargetFactory.ts

import { ControlType } from '../../../types';
import { CompositeDropTarget } from './CompositeDropTarget';
import { TabCompositeDropTarget } from './TabCompositeDropTarget';
import { AccordionCompositeDropTarget } from './AccordionCompositeDropTarget';
import { ColumnLayoutCompositeDropTarget } from './ColumnLayoutCompositeDropTarget';

export class CompositeDropTargetFactory {
  /**
   * Create a composite drop target for the element based on control type
   */
  public static create(element: HTMLElement, controlType: ControlType): CompositeDropTarget | null {
    switch (controlType) {
      case ControlType.Tab:
        return new TabCompositeDropTarget(element);
      case ControlType.Accordion:
        return new AccordionCompositeDropTarget(element);
      case ControlType.ColumnLayout:
        return new ColumnLayoutCompositeDropTarget(element);
      default:
        return null;
    }
  }
}
```

### 4. Enhance DragDropSurveyElements to Use Composite Drop Targets

```typescript
// src/utils/dragDrop/DragDropSurveyElements.ts

import { CompositeDropTargetFactory } from './compositeDrop/CompositeDropTargetFactory';
import { DropRegion } from './compositeDrop/CompositeDropTarget';

// Add to existing class
export class DragDropSurveyElements extends DragDropCore {
  // Add new properties
  private activeCompositeTarget: CompositeDropTarget | null = null;
  private activeDropRegion: DropRegion | null = null;

  // Add to existing methods
  protected onDragOver(event: DragEvent): void {
    // Existing code...
    
    if (!this.isDragOperationValid()) return;
    
    const { clientX, clientY } = event;
    let element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    
    // Find closest drop target
    while (element && !element.classList.contains('drop-target')) {
      element = element.parentElement;
    }
    
    if (!element) {
      // Not over a drop target
      if (this.activeCompositeTarget) {
        this.activeCompositeTarget.clearDropIndicators();
        this.activeCompositeTarget = null;
      }
      return;
    }
    
    // Check for composite drop target
    const controlType = element.dataset.controlType as ControlType;
    const isCompositeTarget = [
      ControlType.Tab, 
      ControlType.Accordion, 
      ControlType.ColumnLayout
    ].includes(controlType);
    
    if (isCompositeTarget) {
      // Handle as composite drop target
      const compositeTarget = CompositeDropTargetFactory.create(element, controlType);
      if (compositeTarget) {
        this.activeCompositeTarget = compositeTarget;
        const region = compositeTarget.getRegionAtPosition(clientX, clientY);
        
        if (region && this.dragData) {
          const isValid = compositeTarget.validateDropInRegion(region, this.dragData.controlType);
          
          if (isValid) {
            this.activeDropRegion = region;
            compositeTarget.showDropIndicatorForRegion(region);
            this.dropPosition = this.mapRegionTypeToPosition(region.type);
            this.dropTargetIndex = region.index;
            this.dropTargetElement = element;
          } else {
            // Invalid drop region
            compositeTarget.clearDropIndicators();
            this.activeDropRegion = null;
          }
        }
      }
    } else {
      // Handle as standard drop target using existing logic
      if (this.activeCompositeTarget) {
        this.activeCompositeTarget.clearDropIndicators();
        this.activeCompositeTarget = null;
      }
      
      // Existing standard drop logic...
    }
  }
  
  /**
   * Map region type to drop indicator position
   */
  private mapRegionTypeToPosition(regionType: string): DropIndicatorPosition {
    switch (regionType) {
      case 'header':
        return DropIndicatorPosition.Top;
      case 'footer':
        return DropIndicatorPosition.Bottom;
      case 'tab':
        return DropIndicatorPosition.Inside;
      case 'column':
        return DropIndicatorPosition.Inside;
      case 'content':
        return DropIndicatorPosition.Inside;
      default:
        return DropIndicatorPosition.None;
    }
  }
  
  // Additional methods...
}
```

## Phase 4: Performance Optimization (2-3 weeks)

### 1. Implement Virtualization for Large Control Structures

```typescript
// src/utils/dragDrop/virtualization/VirtualizedDragDrop.ts

import { Control } from '../../../types';

export interface VirtualizationOptions {
  rowHeight: number;
  overscan: number;
  containerHeight: number;
}

export class VirtualizedDragDrop {
  private controls: Control[] = [];
  private options: VirtualizationOptions;
  private scrollTop: number = 0;
  private visibleControls: Control[] = [];
  private visibleIndices: [number, number] = [0, 0];
  
  constructor(controls: Control[], options: VirtualizationOptions) {
    this.controls = controls;
    this.options = options;
    this.calculateVisibleControls(0);
  }
  
  /**
   * Set new scroll position and recalculate visible controls
   */
  public setScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
    this.calculateVisibleControls(scrollTop);
  }
  
  /**
   * Get controls that should be rendered
   */
  public getVisibleControls(): Control[] {
    return this.visibleControls;
  }
  
  /**
   * Get the relative position to render a control
   */
  public getControlOffset(index: number): number {
    return index * this.options.rowHeight;
  }
  
  /**
   * Calculate which controls are currently visible
   */
  private calculateVisibleControls(scrollTop: number): void {
    const { rowHeight, overscan, containerHeight } = this.options;
    const totalCount = this.controls.length;
    
    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const endIndex = Math.min(
      totalCount - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
    );
    
    // Get slice of controls
    this.visibleControls = this.controls.slice(startIndex, endIndex + 1);
    this.visibleIndices = [startIndex, endIndex];
  }
  
  /**
   * Handle drag over event with virtualization
   */
  public handleDragOver(clientY: number): number {
    const { rowHeight } = this.options;
    
    // Calculate index based on client position
    const relativeY = clientY - this.options.containerHeight;
    const targetIndex = Math.floor(relativeY / rowHeight);
    
    // Adjust for virtualization offset
    const adjustedIndex = this.visibleIndices[0] + targetIndex;
    return Math.max(0, Math.min(this.controls.length - 1, adjustedIndex));
  }
}
```

### 2. Add Caching for Validation Operations

```typescript
// src/utils/dragDrop/cache/ValidationCache.ts

interface CacheKey {
  draggedId: string;
  targetId: string;
  position: string;
}

interface CacheEntry<T> {
  result: T;
  timestamp: number;
  ttl: number;
}

export class ValidationCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTtl: number = 5000; // 5 seconds by default
  
  /**
   * Get a cached validation result or compute it if not found
   */
  public get(
    key: CacheKey, 
    computeFn: () => T, 
    ttl: number = this.defaultTtl
  ): T {
    const cacheKey = this.serializeKey(key);
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    
    // Return cached value if still valid
    if (cached && (now - cached.timestamp < cached.ttl)) {
      return cached.result;
    }
    
    // Compute new value
    const result = computeFn();
    
    // Cache result
    this.cache.set(cacheKey, {
      result,
      timestamp: now,
      ttl
    });
    
    return result;
  }
  
  /**
   * Invalidate a specific cache entry
   */
  public invalidate(key: CacheKey): void {
    const cacheKey = this.serializeKey(key);
    this.cache.delete(cacheKey);
  }
  
  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Convert key to string for cache lookup
   */
  private serializeKey(key: CacheKey): string {
    return `${key.draggedId}:${key.targetId}:${key.position}`;
  }
}
```

### 3. Optimize DOM Operations

```typescript
// src/utils/dragDrop/dom/DomOperationOptimizer.ts

export interface ElementOperationOptions {
  throttleMs?: number;
  batchClassChanges?: boolean;
  useRequestAnimationFrame?: boolean;
}

export class DomOperationOptimizer {
  private options: Required<ElementOperationOptions>;
  private pendingClassChanges: Map<HTMLElement, Set<string>> = new Map();
  private pendingClassRemovals: Map<HTMLElement, Set<string>> = new Map();
  private lastOperationTime: number = 0;
  private animationFrameRequestId: number | null = null;
  
  constructor(options: ElementOperationOptions = {}) {
    this.options = {
      throttleMs: options.throttleMs ?? 16, // ~60fps
      batchClassChanges: options.batchClassChanges ?? true,
      useRequestAnimationFrame: options.useRequestAnimationFrame ?? true
    };
  }
  
  /**
   * Add classes to an element with optimizations
   */
  public addClasses(element: HTMLElement, ...classNames: string[]): void {
    if (this.options.batchClassChanges) {
      // Batch class additions
      if (!this.pendingClassChanges.has(element)) {
        this.pendingClassChanges.set(element, new Set());
      }
      
      classNames.forEach(className => {
        this.pendingClassChanges.get(element)!.add(className);
        
        // Remove from removals if present
        const removals = this.pendingClassRemovals.get(element);
        if (removals && removals.has(className)) {
          removals.delete(className);
        }
      });
      
      this.scheduleUpdates();
    } else {
      // Direct application
      element.classList.add(...classNames);
    }
  }
  
  /**
   * Remove classes from an element with optimizations
   */
  public removeClasses(element: HTMLElement, ...classNames: string[]): void {
    if (this.options.batchClassChanges) {
      // Batch class removals
      if (!this.pendingClassRemovals.has(element)) {
        this.pendingClassRemovals.set(element, new Set());
      }
      
      classNames.forEach(className => {
        this.pendingClassRemovals.get(element)!.add(className);
        
        // Remove from additions if present
        const additions = this.pendingClassChanges.get(element);
        if (additions && additions.has(className)) {
          additions.delete(className);
        }
      });
      
      this.scheduleUpdates();
    } else {
      // Direct application
      element.classList.remove(...classNames);
    }
  }
  
  /**
   * Apply all pending changes
   */
  private applyUpdates(): void {
    // Process additions
    this.pendingClassChanges.forEach((classNames, element) => {
      if (classNames.size > 0) {
        element.classList.add(...Array.from(classNames));
      }
    });
    this.pendingClassChanges.clear();
    
    // Process removals
    this.pendingClassRemovals.forEach((classNames, element) => {
      if (classNames.size > 0) {
        element.classList.remove(...Array.from(classNames));
      }
    });
    this.pendingClassRemovals.clear();
    
    // Update timestamp
    this.lastOperationTime = performance.now();
    this.animationFrameRequestId = null;
  }
  
  /**
   * Schedule updates based on configuration
   */
  private scheduleUpdates(): void {
    if (this.animationFrameRequestId !== null) {
      return; // Already scheduled
    }
    
    const now = performance.now();
    const timeSinceLastOperation = now - this.lastOperationTime;
    
    if (this.options.useRequestAnimationFrame) {
      // Use RAF for smoother updates
      this.animationFrameRequestId = requestAnimationFrame(() => this.applyUpdates());
    } else if (timeSinceLastOperation >= this.options.throttleMs) {
      // Apply immediately if enough time has passed
      this.applyUpdates();
    } else {
      // Schedule for later with setTimeout
      this.animationFrameRequestId = window.setTimeout(
        () => this.applyUpdates(),
        this.options.throttleMs - timeSinceLastOperation
      ) as unknown as number;
    }
  }
  
  /**
   * Clear all pending operations
   */
  public clear(): void {
    this.pendingClassChanges.clear();
    this.pendingClassRemovals.clear();
    
    if (this.animationFrameRequestId !== null) {
      if (this.options.useRequestAnimationFrame) {
        cancelAnimationFrame(this.animationFrameRequestId);
      } else {
        clearTimeout(this.animationFrameRequestId);
      }
      this.animationFrameRequestId = null;
    }
  }
}
```

## Integration Plan

To implement these enhancements, follow this sequence:

1. **Week 1-2:** Implement the strategy pattern and registry system
   - Start with `DragDropStrategy` interface
   - Create the registry
   - Modify `DragDropCore` and `DragDropSurveyElements`

2. **Week 3-5:** Implement preview and dependency systems
   - Create the preview manager
   - Implement dependency tracking
   - Update `useDragDrop` hook to use these systems

3. **Week 6-8:** Implement composite drop targets
   - Create interfaces and implementations for different control types
   - Update drag and drop logic to use composite targets
   - Test with complex layouts

4. **Week 9-10:** Performance optimizations
   - Add virtualization support for large control lists
   - Implement caching for validation operations
   - Optimize DOM operations

5. **Week 11-12:** Testing and refinement
   - Test with complex layouts and nested controls
   - Test performance with large numbers of controls
   - Fix any bugs and refine the implementation

## Conclusion

This implementation plan provides a path to significantly enhance the drag and drop system:

1. The strategy pattern and registry system will make it easier to add new control types
2. The preview and dependency systems will improve user experience during drag operations
3. The composite drop target system will provide better support for complex layouts
4. The performance optimizations will ensure good performance even with large control structures

By implementing these improvements in phases, we can deliver incremental value while maintaining compatibility with the existing system.
