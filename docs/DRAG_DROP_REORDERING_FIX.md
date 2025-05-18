# Drag and Drop Reordering Fix

## Issue Description [2025-05-18]

**User Issue**: Controls placed in the design tab should be draggable and droppable, and users should be able to change the order of precedence in the user interface. Specifically, when a user places a Tab control and adds a column layout control in it, they were unable to swap the order of controls within the tab.

**Analysis**:
After examining the codebase, we identified the following issues that prevented proper reordering of controls:

1. The `moveControl` function in `QuestionnaireContext.tsx` always appended dragged controls to the end of a container's controls array, rather than inserting them at a specific position.
2. The drag and drop handlers in `CanvasControl.tsx` didn't track or pass the target position when reordering controls within the same container.
3. While the application had fixes for dragging ColumnLayout controls into Accordion sections, it lacked proper handling for reordering controls within containers.

## Implemented Changes

### 1. Enhanced `moveControl` Function in `QuestionnaireContext.tsx`

- Modified the function signature to accept a `targetIndex` parameter that specifies where in the container's controls array the dragged control should be inserted:
  ```typescript
  moveControl: (
    draggedControlId: string, 
    targetParentId: string, 
    targetType: string, 
    targetIndex?: number, 
    sectionId?: string, 
    tabIndex?: number, 
    columnIndex?: number
  ) => void;
  ```

- Updated the implementation to use the `targetIndex` parameter when inserting controls into containers:
  ```typescript
  // For Tab containers
  if (typeof targetIndex === 'number') {
    const newControls = [...(tab.controls || [])];
    newControls.splice(targetIndex, 0, controlToMove);
    return { ...tab, controls: newControls };
  } else {
    return { ...tab, controls: [...(tab.controls || []), controlToMove] };
  }
  ```

- Applied similar changes for Accordion sections and Column Layout columns to support reordering in all container types.

### 2. Enhanced Drag and Drop Handling in `CanvasControl.tsx`

- Added state to track the drag-over position within containers:
  ```typescript
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  ```

- Updated the tab content rendering to track and visualize drag positions:
  ```typescript
  onDragOver={(e) => {
    if (draggedItem && canDropIn('tab')) {
      e.preventDefault();
      
      // Determine if we're dragging over the top or bottom half of the control
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY;
      const relativeY = y - rect.top;
      const isTopHalf = relativeY < rect.height / 2;
      
      // Set the position where the dragged item should be inserted
      setDragOverPosition(isTopHalf ? index : index + 1);
      
      // Add visual indicator
      e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
    }
  }}
  ```

- Added similar drag position tracking for column layouts and accordion sections.

### 3. Added Visual Feedback During Drag Operations

- Added CSS classes to show where controls will be inserted:
  ```typescript
  e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
  ```

- Added empty drop areas at the end of containers to allow appending controls:
  ```typescript
  {/* Empty drop area at the end of the tab content */}
  <div 
    className={`mt-4 p-4 border-2 border-dashed rounded-lg ${draggedItem && canDropIn('tab') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
    onDragOver={...}
    onDrop={...}
  >
    <div className="text-center text-gray-500">
      {tabControl.tabs[activeTabIndex]?.controls?.length ? 'Drop here to add at the end' : 'Drop controls here'}
    </div>
  </div>
  ```

### 4. Consistent Implementation Across Container Types

- Applied the same reordering approach to all container types:
  - Tab controls
  - Column Layout controls
  - Accordion sections

## Technical Details

### Drag Position Detection

The solution uses the mouse position relative to the control being dragged over to determine whether to insert before or after the control:

```typescript
// Determine if we're dragging over the top or bottom half of the control
const rect = e.currentTarget.getBoundingClientRect();
const y = e.clientY;
const relativeY = y - rect.top;
const isTopHalf = relativeY < rect.height / 2;

// Set the position where the dragged item should be inserted
setDragOverPosition(isTopHalf ? index : index + 1);
```

### Array Splicing for Insertion

When inserting a control at a specific position, we use array splicing to insert the control at the correct index:

```typescript
if (typeof targetIndex === 'number') {
  const newControls = [...(tab.controls || [])];
  newControls.splice(targetIndex, 0, controlToMove);
  return { ...tab, controls: newControls };
} else {
  return { ...tab, controls: [...(tab.controls || []), controlToMove] };
}
```

## Testing Notes

The fix has been tested with the following scenarios:

1. Reordering controls within a Tab control
2. Reordering controls within a Column Layout
3. Reordering controls within an Accordion section
4. Dragging controls between different container types

All scenarios now work correctly with proper visual feedback during drag operations.
