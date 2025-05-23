# Drag and Drop Architecture Diagrams

## Current Architecture

```
┌─────────────────┐
│  DragDropCore   │
│  (Abstract)     │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ DragDropSurvey  │
│ Elements        │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐            ┌──────────────────┐
│  useDragDrop    │◄───────────┤ EnhancedDragDrop │
│  (React Hook)   │            │ Context          │
└─────────────────┘            └──────────────────┘
        │
        ▼
┌─────────────────┐
│ React Components│
│ (Consumers)     │
└─────────────────┘
```

## Proposed Enhanced Architecture

```
┌─────────────────┐      ┌───────────────────┐
│  DragDropCore   │◄─────┤ DragDropStrategy  │
│  (Abstract)     │      │ (Interface)       │
└───────┬─────────┘      └───────────────────┘
        │                          ▲
        │                          │
        ▼                          │
┌─────────────────┐      ┌─────────┴───────────┐
│ DragDropSurvey  │      │ ControlDragDrop     │
│ Elements        │◄─────┤ Registry            │
└───────┬─────────┘      └───────┬─────────────┘
        │                        │
        │                        ▼
        │               ┌─────────────────────┐
        │               │ Concrete Strategies  │
        │               ├─────────────────────┤
        │               │ - TabStrategy       │
        │               │ - ColumnStrategy    │
        │               │ - AccordionStrategy │
        │               └─────────────────────┘
        │
        ▼
┌─────────────────┐            ┌──────────────────┐
│  useDragDrop    │◄───────────┤ EnhancedDragDrop │
│  (React Hook)   │            │ Context          │
└─────────────────┘            └────────┬─────────┘
        │                               │
        │                               ▼
        │                      ┌──────────────────┐
        │                      │ DragPreview      │
        │                      │ Manager          │
        │                      └────────┬─────────┘
        │                               │
        │                               ▼
        │                      ┌──────────────────┐
        │                      │ DependencyTracker│
        │                      └──────────────────┘
        │
        ▼
┌─────────────────┐
│ React Components│
│ (Consumers)     │
└─────────────────┘
```

## Composite Drop Target System

```
┌───────────────────────────────────────────────┐
│ CompositeDropTarget                           │
├───────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│ │ HeaderRegion│ │ContentRegion│ │FooterRegion│ │
│ └─────────────┘ └─────────────┘ └───────────┘ │
│                                               │
│ - getDropRegions()                            │
│ - getRegionAtPosition(x, y)                   │
│ - validateDropInRegion(region, control)       │
└───────────────────────────────────────────────┘
```

## Preview System for Drag Operations

```
┌─────────────────────────────────────────────┐
│ DragPreviewManager                          │
├─────────────────────────────────────────────┤
│ - createPreview(control, position, options) │
│ - updatePreviewPosition(preview, position)  │
│ - validatePreview(control, target, position)│
└─────────────────────────────────────────┬───┘
                                          │
                                          ▼
┌─────────────────────────────────────────────┐
│ PreviewOptions                              │
├─────────────────────────────────────────────┤
│ - showDependencies: boolean                 │
│ - previewStyle: 'ghost'|'solid'|'outline'   │
│ - showValidationErrors: boolean             │
└─────────────────────────────────────────────┘
```

## Dependency Tracking System

```
┌───────────────────────────────────────────┐
│ DependencyTracker                         │
├───────────────────────────────────────────┤
│ - getDependentControls(controlId)         │
│ - getDependencyChain(controlId)           │
│ - validateDependenciesAfterMove(...)      │
│ - visualizeDependencies(controlId)        │
└───────────────────────┬───────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────┐
│ DependencyGraph                           │
├───────────────────────────────────────────┤
│ ┌─────────────┐      ┌─────────────┐      │
│ │ Control A   │─────▶│ Control B   │      │
│ └─────────────┘      └─────────────┘      │
│        │                                  │
│        │              ┌─────────────┐     │
│        └─────────────▶│ Control C   │     │
│                       └─────────────┘     │
└───────────────────────────────────────────┘
```
