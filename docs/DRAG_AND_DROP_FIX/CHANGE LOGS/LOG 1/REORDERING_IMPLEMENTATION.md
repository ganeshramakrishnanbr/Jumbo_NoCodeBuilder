# Container Drag and Drop Reordering Implementation

## Overview
This change implements the ability to reorder controls within container controls (Tab, Accordion, Column Layout) using drag and drop functionality. Users can now select and drag child controls within these containers to rearrange them, with visual feedback during the drag operation.

## Files Modified
- `src/components/designer/canvas/CanvasControl.tsx`

## Implementation Details

### 1. Position Tracking

Added state variable to track drag positions within container controls:
```tsx
const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
```

### 2. Container-Specific Drag Handlers

Implemented specialized drag handlers for each container type:

```tsx
// For tabs
const handleTabContentDragOver = (e: React.DragEvent<HTMLDivElement>, controlIndex: number) => {
  // Determine if dragging over top/bottom half and provide visual feedback
};

// For accordion sections
const handleAccordionContentDragOver = (e: React.DragEvent<HTMLDivElement>, controlIndex: number) => {
  // Similar position tracking logic for accordion sections
};

// For column layouts
const handleColumnContentDragOver = (e: React.DragEvent<HTMLDivElement>, controlIndex: number) => {
  // Similar position tracking logic for column layouts
};
```

### 3. Enhanced Drag Leave Handler

Updated to clear visual indicators:
```tsx
const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
  if (e.currentTarget instanceof HTMLElement) {
    e.currentTarget.classList.remove('drag-over-highlight', 'border-t-2', 'border-b-2', 'border-blue-500');
  }
  setDragOverPosition(null);
};
```

### 4. Improved Drop Handler

Enhanced with position-specific insertion for both new controls and reordering of existing controls:
```tsx
const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: string, tabIndex?: number, columnIndex?: number, sectionId?: string) => {
  // Uses dragOverPosition to:
  // 1. Insert new controls at the specific position
  // 2. Move existing controls to the specific position
  // 3. Pass position information to the QuestionnaireContext's moveControl function
}
```

### 5. Updated Container Child Rendering

Added position-tracking wrappers for all container types:

#### Tab Control
```tsx
<div 
  key={childControl.id} 
  className="relative"
  onDragOver={(e) => handleTabContentDragOver(e, index)}
  onDragLeave={handleDragLeave}
>
  <CanvasControl control={childControl} />
</div>
```

#### Accordion Control
```tsx
<div 
  key={childControl.id} 
  className="relative"
  onDragOver={(e) => handleAccordionContentDragOver(e, childIndex)}
  onDragLeave={handleDragLeave}
  onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
>
  <CanvasControl control={childControl} />
</div>
```

#### Column Layout Control
```tsx
<div 
  key={childControl.id} 
  className="relative"
  onDragOver={(e) => handleColumnContentDragOver(e, columnItemIndex)}
  onDragLeave={handleDragLeave}
>
  <CanvasControl control={childControl} />
</div>
```

### 6. Added Empty Drop Areas

Added empty drop areas at the end of container content sections to make it easier to append new items:

```tsx
{/* Empty drop area at the end of the accordion section */}
<div 
  className="border-2 border-dashed border-gray-200 rounded-md h-8 mt-2 bg-gray-50 opacity-75"
  onDragOver={(e) => {
    if (draggedItem && canDropIn('accordion')) {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
      setDragOverPosition(section.controls.length);
    }
  }}
  onDragLeave={(e) => {
    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
    setDragOverPosition(null);
  }}
  onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
/>
```

### 7. Draggable Control Elements

Enhanced controls to be draggable for reordering:

```tsx
<span 
  className="cursor-move mr-2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50"
  draggable
  onDragStart={handleDragStart}
>
  <Move size={16} />
</span>
```

With supporting drag start handler:

```tsx
const handleDragStart = (e: React.DragEvent<HTMLSpanElement>) => {
  e.stopPropagation();
  
  // Set data transfer for HTML5 drag and drop compatibility
  e.dataTransfer.setData('text/plain', control.id);
  e.dataTransfer.effectAllowed = 'move';
  
  // Start drag operation in DragDropContext
  startDrag({
    id: control.id,
    type: 'control',
    controlType: control.type,
    isNew: false,
    sourceId: control.id
  });
  
  console.log('[CanvasControl] Started dragging control:', control.id, control.type);
};
```

## Visual Indications During Drag

1. **Drag Over Position:**
   - Top half: Blue border on top of the target control
   - Bottom half: Blue border on bottom of the target control

2. **Empty Containers:**
   - Blue border and background highlight when dragging over

3. **Append Zones:**
   - Specialized drop areas at the end of each container to easily append items

## Benefits

1. **Improved UX:** Users can now easily rearrange controls within container controls
2. **Intuitive Visual Feedback:** Clear visual indicators show where items will be placed
3. **Position-Specific Insertion:** Controls are inserted at the exact position indicated by the drag operation
4. **Cross-Container Support:** Controls can be moved between different container types
