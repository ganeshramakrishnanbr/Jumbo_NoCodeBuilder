# Container Drag and Drop Framework - Implementation Summary

## Overview

This document summarizes the implementation of fixes for the Container Drag and Drop Framework in the Reflexive Questionnaire Designer application. The implementation addresses two primary issues:

1. **Parent Control Reordering**: Improved the ability to reorder top-level controls in the design canvas
2. **Child Control Reordering**: Enhanced the functionality to reorder child controls within container controls (Tab, Accordion, and Column Layout)

Both issues are now fixed in both the Design Canvas and Preview tab.

## Implementation Date

May 19, 2025

## Files Modified

The following files were modified to implement the fixes:

1. `src/components/designer/canvas/DesignCanvas.tsx`
2. `src/components/designer/canvas/CanvasControl.tsx` 
3. `src/contexts/DragDropContext.tsx`

## Key Changes

### 1. DragDropContext.tsx

#### Source Tracking Improvements

```typescript
// Improved source tracking
sourceContainerRef.current = item.sourceId || 'canvas';
sourceIndexRef.current = item.sourceIndex !== undefined ? item.sourceIndex : null;
```

#### Enhanced Drop Validation Logic

```typescript
const canDropIn = (targetType: string): boolean => {
  if (!draggedItem) return false;
  
  // Enhanced drop validation logic
  
  // Allow dropping in accordion sections
  if (targetType === 'accordion') {
    // Allow almost everything to be dropped in accordion sections
    return draggedItem.controlType !== ControlType.Accordion;
  }

  // Container controls can be dropped in canvas only
  if ([ControlType.Tab, ControlType.Accordion, ControlType.ColumnLayout].includes(draggedItem.controlType)) {
    return targetType === 'canvas';
  }

  // Basic and specialized controls can be dropped in any container
  return ['tab', 'column', 'accordion', 'canvas'].includes(targetType);
};
```

### 2. DesignCanvas.tsx

#### Added Position Tracking and Helper Functions

```typescript
// Helper function to determine drag position based on mouse position
const determineDragPosition = (e: React.DragEvent<HTMLDivElement>, controlRect: DOMRect) => {
  const mouseY = e.clientY;
  const relativeY = mouseY - controlRect.top;
  const isTopHalf = relativeY < controlRect.height / 2;
  return isTopHalf ? 'before' : 'after';
};
```

#### Improved Drag Over Handling

```typescript
if (!draggedItem.isNew) {
  const canvasRect = canvasRef.current?.getBoundingClientRect();
  if (canvasRect) {
    const mouseY = e.clientY;
    
    // Find the closest control to the mouse position
    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;
    
    const controlElements = Array.from(
      canvasRef.current?.querySelectorAll('.canvas-control-wrapper') || []
    );
    
    // If there are no controls or mouse is below all controls, place at the end
    if (controlElements.length === 0 || mouseY > canvasRect.bottom - 20) {
      setDragOverIndex(questionnaire.controls.length);
    }
    // Otherwise, find the closest control
    else {
      controlElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(mouseY - elementMiddle);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
          
          // Determine if we should insert before or after this control
          const position = determineDragPosition(e, rect);
          setDragOverIndex(position === 'before' ? closestIndex : closestIndex + 1);
        }
      });
    }
  }
}
```

#### Visual Feedback During Drag

```typescript
// Add visual drop indicator
controlElements.forEach((element, index) => {
  if (index === dragOverIndex) {
    element.classList.add('drop-target-top');
  } 
  else if (index === dragOverIndex - 1) {
    element.classList.add('drop-target-bottom');
  }
  else {
    element.classList.remove('drop-target-top', 'drop-target-bottom');
  }
});

// Add an empty drop area at the end if needed
if (dragOverIndex === questionnaire.controls.length) {
  const emptyDropArea = document.getElementById('empty-drop-area');
  if (emptyDropArea) {
    emptyDropArea.classList.add('drop-target-active');
  }
}
```

### 3. CanvasControl.tsx

#### Enhanced Drag Start Handler with Better Source Tracking

```typescript
// Enhanced drag handlers for controls
const handleDragStart = (e: React.DragEvent<HTMLSpanElement>) => {
  e.stopPropagation();
  
  // Set data transfer for compatibility
  e.dataTransfer.setData('text/plain', control.id);
  e.dataTransfer.effectAllowed = 'move';
  
  // Start drag operation with better source tracking
  startDrag({
    id: control.id,
    type: 'control',
    controlType: control.type,
    isNew: false,
    sourceId: control.id
  });
  
  // Add visual feedback during drag
  if (e.currentTarget.parentElement instanceof HTMLElement) {
    setTimeout(() => {
      e.currentTarget.parentElement?.classList.add('opacity-50');
    }, 0);
  }
};
```

#### Unified Container Content Drag Over Handler

```typescript
// Improved container content drag handlers that share logic
const handleContainerContentDragOver = (e: React.DragEvent<HTMLDivElement>, controlIndex: number, containerType: string) => {
  if (draggedItem && canDropIn(containerType)) {
    e.preventDefault();
    e.stopPropagation();
    
    // Determine if we're dragging over the top or bottom half of the control
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY;
    const relativeY = y - rect.top;
    const isTopHalf = relativeY < rect.height / 2;
    
    // Set the position where the dragged item should be inserted
    const newPosition = isTopHalf ? controlIndex : controlIndex + 1;
    
    if (dragOverPosition !== newPosition) {
      setDragOverPosition(newPosition);
      
      // Remove visual indicators from all controls
      const highlightedElements = document.querySelectorAll('.border-t-2, .border-b-2');
      highlightedElements.forEach(el => {
        if (el instanceof HTMLElement && el !== e.currentTarget) {
          el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
        }
      });
      
      // Add visual indicator
      e.currentTarget.classList.remove('border-t-2', 'border-b-2');
      e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
      
      console.log(`[CanvasControl] Container drag over: ${containerType}, position: ${newPosition}`);
    }
  }
};
```

#### Added Empty Drop Zones in Containers

```typescript
{/* Add an empty drop area at the end for appending items easily */}
<div 
  className="border-2 border-dashed border-gray-200 rounded-md h-8 mt-3 bg-gray-50 opacity-75"
  onDragOver={(e) => {
    if (draggedItem && canDropIn('tab')) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
      setDragOverPosition(tabControl.tabs[activeTabIndex]?.controls?.length || 0);
    }
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
    setDragOverPosition(null);
  }}
  onDrop={(e) => handleDrop(e, 'tab', activeTabIndex)}
/>
```

## Testing Results

Testing shows that all primary objectives have been met:

1. ✅ Parent controls can be reordered correctly in the design canvas
2. ✅ Child controls can be reordered within their container controls
3. ✅ Both reordering capabilities work properly in the Preview tab
4. ✅ Visual feedback during drag operations is clear and intuitive

For detailed test results, please refer to the [Testing Documentation](./Testing%20Documentation.md).

## Future Improvements

While the current implementation resolves the reported issues, the following future improvements could enhance the user experience:

1. Keyboard accessibility for drag and drop operations
2. Animation during drag operations to make transitions smoother
3. More extensive error handling for edge cases
4. Performance optimizations for questionnaires with large numbers of controls
5. Adding automated tests to prevent regression

## Conclusion

The Container Drag and Drop Framework improvements successfully address the reordering issues in both parent controls and child controls. The implementation provides clear visual feedback during drag operations and ensures that controls are positioned accurately according to the user's intent.
