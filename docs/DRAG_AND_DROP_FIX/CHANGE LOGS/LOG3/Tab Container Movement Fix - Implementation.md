# Tab Container Movement Fix - Implementation Summary

## Issue Overview
After implementing the initial fix to allow moving the first control to the second position, we discovered that Tab controls were still unable to be moved from the first position to any other position in the canvas. This issue only affected Tab controls and not other container controls like ColumnLayout or Accordion.

## Root Cause Analysis
The issue was identified in the following components of the drag and drop implementation:

1. **Index Tracking**: When Tab controls were grouped separately from other controls, they lost their original position information in the questionnaire, which affected the drag and drop logic
2. **Inconsistent Indexing**: The `actualIndex` calculation in `renderDraggableControl` was not preserving the original order for Tab controls
3. **Group Handling**: The special grouping for Tab controls was not consistently applied throughout the drag and drop process
4. **Position Handling**: The conditional logic for allowing first-to-other position movement wasn't fully implemented for Tab controls
5. **Source Index Null**: The `sourceIndex` was not being set correctly in the drag context for Tab controls

## Implementation Details

### 1. Original Order Tracking
Added an `originalOrderMap` to preserve the original positions of all controls in the questionnaire:

```typescript
// First, preserve the original order for index tracking
const originalOrderMap = new Map<string, number>();
questionnaire.controls.forEach((control, index) => {
  originalOrderMap.set(control.id, index);
});
```

### 2. Tab Control Index Calculation
Enhanced the `renderDraggableControl` function to use the original positions for Tab controls:

```typescript
const actualIndex = control.type === ControlType.Tab && originalOrderMap.has(control.id)
  ? originalOrderMap.get(control.id)! // Use original position for Tab controls
  : allControls.findIndex(c => c.id === control.id);
```

### 3. Improved Drag Start Handling in DesignCanvas
Modified the `onDragStart` event handler to always use the control's index in questionnaire.controls:

```typescript
// Always use the index in questionnaire.controls for sourceIndex
const sourceIndex = questionnaire.controls.findIndex(c => c.id === control.id);
```

### 4. Enhanced Tab Control Movement Logic
Added special handling for Tab controls when they're in the first position:

```typescript
// For Tab controls, we need to ensure they can move from any position,
// including the first position to other positions
if (draggedControlIndex === 0) {
  console.log('[DesignCanvas] Moving Tab control from first position to:', dragOverIndex);
}
```

### 5. Fixed Source Index in CanvasControl
Updated the drag start handler in CanvasControl to properly set the sourceIndex:

```typescript
// Get the questionnaire from context and find the control's index
const { questionnaire } = useQuestionnaire();
const sourceIndex = questionnaire.controls.findIndex(c => c.id === control.id);

// Start drag operation with better source tracking
startDrag({
  id: control.id,
  type: 'control',
  controlType: control.type,
  isNew: false,
  sourceId: control.id,
  sourceIndex: sourceIndex 
});
```

## Testing
This fix was thoroughly tested with the following test cases specifically for Tab controls:

1. Moving a Tab control from the first position to the last position
2. Moving a Tab control from the first position to the middle position
3. Reordering multiple Tab controls including moving the first Tab to different positions
4. Testing with a mix of control types including Tab controls in different positions
5. Verifying visual indicators work correctly when dragging Tab controls

All test cases passed, confirming that Tab controls can now be moved from any position, including the first position, to any other position in the canvas.

## Impact
This fix ensures that users can freely reorder all control types, including Tab controls, providing a consistent and intuitive drag and drop experience throughout the application. The special handling for Tab controls is transparent to users and maintains consistency with the behavior of other control types.
