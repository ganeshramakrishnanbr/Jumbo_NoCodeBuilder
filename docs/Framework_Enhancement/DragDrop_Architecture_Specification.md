# Drag and Drop Architecture Specification

## Architecture Overview

This document provides a detailed specification of the enhanced drag and drop architecture for parent-child control relationships in the reflexive_Gen2Testing framework. Properties management is integrated directly within parent controls in the design tab for improved user experience.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                           │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Components &   │  │   React Hooks    │  │  Control       │  │
│  │  UI Controllers │  │  (useDragDrop)   │  │  Management    │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│               │               │                   │             │
└───────────────┼───────────────┼───────────────────┼─────────────┘
                │               │                   │
┌───────────────┼───────────────┼───────────────────┼─────────────┐
│                     Service Layer                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Enhanced Drag Drop Context                │     │
│  └────────────────────────────────────────────────────────┘     │
│     │                  │                   │          │         │
│  ┌──┴────────┐  ┌──────┴─────┐  ┌─────────┴────┐  ┌──┴─────┐   │
│  │Preview    │  │Dependency  │  │Properties    │  │Control  │   │
│  │Manager    │  │Tracker     │  │Manager       │  │Registry │   │
│  └───────────┘  └────────────┘  └──────────────┘  └────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                │               │                   │
┌───────────────┼───────────────┼───────────────────┼─────────────┐
│                     Core Layer                                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                  DragDropCore                          │     │
│  └────────────────────────────────────────────────────────┘     │
│                          │                                      │
│  ┌─────────────────┐     │     ┌─────────────────────────────┐  │
│  │Strategy Pattern │◄────┴────►│ Composite Drop Target System │  │
│  └─────────────────┘           └─────────────────────────────┘  │
│         │                                   │                   │
│  ┌──────┴──────────┐     ┌─────────────────┴────────────┐      │
│  │Strategy Registry │     │ CompositeDropTargetFactory   │      │
│  └─────────────────┘     └──────────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. DragDropCore

The abstract base class for all drag and drop functionality.

**Responsibilities:**
- Provide base drag and drop event handling
- Manage ghost element creation and positioning
- Support the strategy pattern for control-specific behavior

**Key Methods:**
```typescript
abstract class DragDropCore {
  // Lifecycle methods
  protected abstract onDragStart(event: DragEvent): void;
  protected abstract onDragOver(event: DragEvent): void;
  protected abstract onDragEnd(event: DragEvent): void;
  
  // Helper methods
  protected createGhostElement(element: HTMLElement, label: string, type: string): HTMLElement;
  protected updateGhostPosition(clientX: number, clientY: number): void;
  protected removeGhostElement(): void;
  protected isDragOperationValid(): boolean;
  
  // Strategy support
  public setStrategy(strategy: DragDropStrategy): void;
  public getStrategy(): DragDropStrategy;
}
```

### 2. Strategy Pattern

Provides flexibility for different control types to define their own drag and drop behavior.

**Strategy Interface:**
```typescript
interface DragDropStrategy {
  canAcceptChild(childType: ControlType): boolean;
  getValidDropPositions(childType: ControlType): DropIndicatorPosition[];
  validateDrop(
    draggedControl: Control, 
    targetControl: Control, 
    position: DropIndicatorPosition
  ): boolean;
  calculateDropIndex(
    position: DropIndicatorPosition, 
    targetIndex: number, 
    parentChildCount: number
  ): number;
  getLayoutDirection(): 'vertical' | 'horizontal' | 'grid';
}
```

**Default Strategy:**
```typescript
class DefaultDragDropStrategy implements DragDropStrategy {
  canAcceptChild(childType: ControlType): boolean {
    // Default implementation
    return false;
  }
  
  // Other implementations...
}
```

### 3. Registry System

Manages control-specific strategies and provides access to them.

**Implementation:**
```typescript
class ControlDragDropRegistry {
  private static instance: ControlDragDropRegistry;
  private strategies: Map<ControlType, DragDropStrategy> = new Map();
  private defaultStrategy = new DefaultDragDropStrategy();
  
  public static getInstance(): ControlDragDropRegistry;
  public registerStrategy(controlType: ControlType, strategy: DragDropStrategy): void;
  public getStrategy(controlType: ControlType): DragDropStrategy;
}
```

### 4. Composite Drop Target System

Handles complex parent controls with multiple drop regions.

**Interface:**
```typescript
interface CompositeDropTarget {
  getDropRegions(): DropRegion[];
  getRegionAtPosition(x: number, y: number): DropRegion | null;
  validateDropInRegion(region: DropRegion, controlType: ControlType): boolean;
  showDropIndicatorForRegion(region: DropRegion): void;
  clearDropIndicators(): void;
}
```

**Factory:**
```typescript
class CompositeDropTargetFactory {
  public static create(
    element: HTMLElement, 
    controlType: ControlType
  ): CompositeDropTarget | null;
}
```

## Service Layer

### 1. Preview Management System

Manages preview rendering during drag operations.

**Implementation:**
```typescript
class DragPreviewManager {
  private registry = ControlDragDropRegistry.getInstance();
  private activePreview: HTMLElement | null = null;
  
  public createPreview(
    control: Control, 
    position: DropPosition, 
    options: Partial<DragPreviewOptions>
  ): HTMLElement;
  
  public updatePreviewPosition(clientX: number, clientY: number): void;
  private getPreviewContent(control: Control): string;
  public validatePreview(control: Control, position: DropPosition): ValidationResult;
  public removePreview(): void;
}
```

### 2. Dependency Tracking System

Manages and validates dependencies between controls during drag operations.

**Implementation:**
```typescript
class DependencyTracker {
  private dependencyMap: Map<string, Set<string>> = new Map();
  private reverseDependencyMap: Map<string, Set<string>> = new Map();
  
  public buildDependencyMaps(controls: Control[]): void;
  public getDependentControls(controlId: string): string[];
  public getDependencyChain(controlId: string): string[];
  public validateDependenciesAfterMove(
    controlId: string, 
    newParentId: string
  ): { valid: boolean; issues: string[] };
  public visualizeDependencies(controlId: string): void;
}
```

### 3. Properties Management System

Manages control properties and provides validation and UI generation.

**Implementation:**
```typescript
interface PropertyDefinition {
  name: string;
  type: string;
  defaultValue?: any;
  category: string;
  options?: any[];
  validation?: ValidationRule[];
}

class ControlPropertiesManager {
  private propertyDefinitions: Map<ControlType, PropertyDefinition[]> = new Map();
  
  public registerProperties(controlType: ControlType, properties: PropertyDefinition[]): void;
  public getProperties(controlType: ControlType): PropertyDefinition[];
  public validateProperty(control: Control, propertyName: string, value: any): ValidationResult;
  public applyProperty(control: Control, propertyName: string, value: any): void;
  public getInheritedProperties(control: Control): PropertyDefinition[];
}
```

### 4. Control Registry

Provides a centralized registry for control types and their factories.

**Implementation:**
```typescript
interface ControlFactory<T extends Control> {
  create(props: Partial<T>): T;
  getDefaultProperties(): Partial<T>;
}

class ControlRegistry {
  private static instance: ControlRegistry;
  private factories: Map<ControlType, ControlFactory<any>> = new Map();
  
  public static getInstance(): ControlRegistry;
  public registerFactory<T extends Control>(
    controlType: ControlType, 
    factory: ControlFactory<T>
  ): void;
  public createControl<T extends Control>(
    controlType: ControlType, 
    props?: Partial<T>
  ): T;
}
```

## Application Layer

### 1. Enhanced Drag Drop Hook

Provides a React hook for using the enhanced drag and drop functionality.

**Implementation:**
```typescript
export function useDragDrop({
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  allowDragInto,
  disallowDragInto,
  disableParentDrag = false,
  containerRef,
  previewOptions = { enabled: true, showDependencies: true, previewStyle: 'ghost' },
  dependencyTracking = false,
  controls = [],
  ...rest
}: UseDragDropProps): UseDragDropResult {
  // Implementation details...
}
```

### 2. Enhanced Drag Drop Context

Provides a React context for shared drag and drop state.

**Implementation:**
```typescript
interface EnhancedDragDropContextType {
  // State
  draggedItem: EnhancedDragItem | null;
  isDragging: boolean;
  dragPosition: DropPosition | null;
  ghostElement: HTMLElement | null;
  
  // Methods
  startDrag: (item: EnhancedDragItem) => void;
  endDrag: () => void;
  setDragPosition: (position: DropPosition | null) => void;
  updateGhostPosition: (clientX: number, clientY: number) => void;
  isValidDrop: (controlId: string, targetId: string) => boolean;
  canDropIn: (targetType: string) => boolean;
}

export const EnhancedDragDropProvider: React.FC<{ 
  children: ReactNode,
  controls: Control[] 
}>;
```

## Data Structures

### 1. Control Interface

The base interface for all controls in the system.

```typescript
export interface Control {
  id: string;
  type: ControlType;
  label?: string;
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  styles?: Record<string, string>;
  properties?: Record<string, any>;
  children?: Control[];
  parent?: string;
  conditions?: Condition[];
  dependencies?: Dependency[];
}
```

### 2. Parent Control Interfaces

Specialized interfaces for parent controls.

```typescript
export interface TabControl extends Control {
  type: ControlType.Tab;
  position?: "top" | "bottom" | "left" | "right";
  tabs: TabItem[];
}

export interface AccordionControl extends Control {
  type: ControlType.Accordion;
  sections: AccordionSection[];
  expandedSections?: string[];
  layout: 'vertical' | 'horizontal';
  maxSections: number;
}

export interface ColumnLayoutControl extends Control {
  type: ControlType.ColumnLayout;
  columns: number;
  columnRatio?: string;
  columnControls: Control[][];
}
```

### 3. Dependency Interface

Defines relationships between controls.

```typescript
export interface Dependency {
  id: string;
  targetControlId: string;
  property: "visible" | "enabled" | "required";
  condition: DependencyCondition;
}

export interface DependencyCondition {
  type: "equals" | "notEquals" | "contains" | "notContains" | "greaterThan" | 
        "lessThan" | "between" | "checked" | "unchecked" | "filled" | "empty";
  value: string[];
  secondaryValue?: any; // For "between" condition
}
```

### 4. Drag and Drop Enums

Enums for drop positions and element types.

```typescript
export enum DropIndicatorPosition {
  Inside = "inside",
  Top = "top",
  Bottom = "bottom",
  Right = "right",
  Left = "left",
  None = "none"
}

export enum ElementType {
  Control = "control",
  Container = "container",
  Tab = "tab",
  Accordion = "accordion",
  ColumnLayout = "columnLayout",
  EmptyCanvas = "empty-canvas"
}
```

## Communication Flow

### 1. Drag Start Flow

```
Component calls useDragDrop.makeElementDraggable
└── On drag start:
    ├── Create ghost element using DragDropCore
    ├── Set dragged item data in EnhancedDragDropContext
    ├── Update state isDragging = true
    └── Call onDragStart callback if provided
```

### 2. Drag Over Flow

```
Component with useDragDrop
└── On drag over:
    ├── Find drop target element
    ├── If composite target:
    │   ├── Use CompositeDropTargetFactory to create target
    │   ├── Find region at position
    │   └── Validate drop in region
    ├── If standard target:
    │   ├── Get strategy from registry
    │   ├── Calculate drop position
    │   └── Validate drop
    ├── Update drop indicators
    ├── If preview enabled:
    │   └── Update preview position
    └── Call onDragOver callback if provided
```

### 3. Drop Flow

```
Component with useDragDrop
└── On drop:
    ├── Validate final drop position
    ├── If dependency tracking enabled:
    │   └── Validate dependencies after move
    ├── If valid:
    │   ├── Apply the drop action
    │   └── Update control hierarchy
    ├── Remove ghost element
    ├── Remove preview element
    ├── Clear drop indicators
    ├── Reset drag state
    └── Call onDrop callback if provided
```

## Performance Considerations

### 1. Virtualization

For large control sets, virtualization minimizes DOM elements:

```typescript
class VirtualizedDragDrop {
  private controls: Control[] = [];
  private options: VirtualizationOptions;
  private visibleControls: Control[] = [];
  
  public setScrollTop(scrollTop: number): void;
  public getVisibleControls(): Control[];
  public getControlOffset(index: number): number;
  private calculateVisibleControls(scrollTop: number): void;
  public handleDragOver(clientY: number): number;
}
```

### 2. Validation Caching

Cache validation results to reduce redundant operations:

```typescript
class ValidationCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  
  public get(
    key: CacheKey, 
    computeFn: () => T, 
    ttl: number = this.defaultTtl
  ): T;
  public invalidate(key: CacheKey): void;
  public clear(): void;
}
```

### 3. DOM Operation Optimization

Batch and optimize DOM operations:

```typescript
class DomOperationOptimizer {
  private options: Required<ElementOperationOptions>;
  private pendingClassChanges: Map<HTMLElement, Set<string>> = new Map();
  private pendingClassRemovals: Map<HTMLElement, Set<string>> = new Map();
  
  public addClasses(element: HTMLElement, ...classNames: string[]): void;
  public removeClasses(element: HTMLElement, ...classNames: string[]): void;
  private applyUpdates(): void;
  private scheduleUpdates(): void;
  public clear(): void;
}
```

## CSS Architecture

```
src/
  styles/
    base/                 # Base styles
      variables.css       # Global variables
      reset.css           # Reset styles
      typography.css      # Typography styles
    controls/             # Control-specific styles
      parent/             # Styles for parent controls
        tab.css
        accordion.css
        column-layout.css
      child/              # Styles for child controls
        text-box.css
        checkbox.css
      common/             # Shared control styles
        control-base.css
    themes/               # Theme-specific styles
      default/
        control-theme.css
    drag-drop/            # Drag and drop specific styles
      indicators.css      # Drop indicators
      preview.css         # Preview styling
      ghost.css           # Ghost elements
    animations/           # Animation styles
      drag-drop.css
    utils/                # Utility styles
      spacing.css
```

## JSON Serialization

### 1. Serialization Interface

```typescript
class ControlSerializer {
  private serializers: Map<ControlType, ControlTypeSerializer<any>> = new Map();
  
  public registerControlSerializer<T extends Control>(
    controlType: ControlType,
    serializer: ControlTypeSerializer<T>
  ): void;
  
  public serialize(controls: Control[]): string;
  public deserialize(json: string): Control[];
  public validateSchema(json: string): ValidationResult;
  public migrateFromVersion(json: string, fromVersion: string): string;
}
```

### 2. Example JSON Output

```json
{
  "version": "1.0",
  "controls": [
    {
      "id": "tab1",
      "type": "tab",
      "label": "Personal Information",
      "position": "top",
      "tabs": [
        {
          "id": "tab1-1",
          "label": "Basic Info",
          "controls": [
            {
              "id": "txt1",
              "type": "textBox",
              "label": "Full Name",
              "required": true
            },
            {
              "id": "txt2",
              "type": "textBox",
              "label": "Email",
              "required": true,
              "dependencies": [
                {
                  "id": "dep1",
                  "targetControlId": "txt1",
                  "property": "visible",
                  "condition": {
                    "type": "filled",
                    "value": []
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Accessibility Considerations

1. **Keyboard Navigation**
   - All drag operations have keyboard equivalents
   - Focus management during drag operations
   - ARIA attributes for drag state

2. **Screen Reader Support**
   - ARIA live regions for drag status updates
   - Role attributes for drag and drop elements
   - Descriptive labels for drag actions

3. **Visual Indicators**
   - High contrast drag indicators
   - Multiple visual cues (not just color-dependent)
   - Clear focus states during operations

## Browser Compatibility

The architecture is designed to work across all modern browsers:

1. **Event Handling**
   - Standard drag and drop events with polyfills
   - Touch support for mobile browsers

2. **CSS Support**
   - Progressive enhancement approach
   - Fallbacks for advanced CSS features

3. **Testing Strategy**
   - Cross-browser test matrix
   - Visual regression testing across browsers

## Conclusion

This architecture specification provides a comprehensive blueprint for implementing an enhanced drag and drop system with first-class support for parent-child relationships, dependencies, and preview functionality. The layered approach with clear separation of concerns allows for maintainable code that can scale as the application grows.
