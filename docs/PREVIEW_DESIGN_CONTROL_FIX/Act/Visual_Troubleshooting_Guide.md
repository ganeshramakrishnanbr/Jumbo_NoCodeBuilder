# Visual Troubleshooting Guide: Parent Control Properties

## Common Issues and Solutions

This guide provides visual examples of common issues with parent controls in the Properties Panel and Preview mode, along with their solutions.

## 1. Properties Panel Shows "Select a control to edit its properties"

### Issue:
When selecting a parent control, the Properties Panel shows "Select a control to edit its properties" instead of showing the control's properties.

### Visual Indicator:
![Properties Panel Issue](../images/properties_panel_issue.png)

### Possible Causes:
- The `flattenControls` function isn't properly handling the parent control type
- The control selection mechanism isn't registering the parent control
- There's a mismatch between the control's type and its expected structure

### Solution:
Ensure the `flattenControls` function in `PropertiesPanel.tsx` correctly handles all parent control types:

```typescript
// Check for proper handling of all parent control types
if (control.type === ControlType.Tab) {
  // Tab control handling
}

if (control.type === ControlType.Accordion) {
  // Accordion control handling
}

if (control.type === ControlType.ColumnLayout) {
  // ColumnLayout control handling with columnControls property
}
```

## 2. ColumnLayout Error: "columns.forEach is not a function"

### Issue:
Console shows error: "TypeError: columns.forEach is not a function" when working with ColumnLayout controls.

### Visual Indicator:
![Console Error](../images/columns_foreach_error.png)

### Possible Causes:
- Code is trying to use the `columns` property (a number) as an array
- Type mismatch between interface definition and code implementation

### Solution:
Update code to use the correct `columnControls` property for accessing column content:

```typescript
// Incorrect:
columnControl.columns?.forEach((column: any) => {
  // This will fail because columns is a number
});

// Correct:
if (Array.isArray(columnControl.columnControls)) {
  columnControl.columnControls.forEach((columnControlArray: any) => {
    // Process each column's controls
  });
}
```

## 3. Preview Rendering Issues for Parent Controls

### Issue:
Parent controls don't render correctly in Preview mode even though they appear fine in Design mode.

### Visual Indicator:
![Preview Rendering Issue](../images/preview_rendering_issue.png)

### Possible Causes:
- Different rendering logic between Design and Preview modes
- Missing style application in Preview mode
- Incomplete state transfer between design and preview components

### Solution:
Ensure preview components handle parent controls correctly:

```typescript
// In preview rendering component
const renderControl = (control: Control) => {
  switch (control.type) {
    case ControlType.Tab:
      return <TabPreviewComponent control={control} />;
    case ControlType.Accordion:
      return <AccordionPreviewComponent control={control} />;
    case ControlType.ColumnLayout:
      return <ColumnLayoutPreviewComponent control={control} />;
    // Other control types...
  }
};
```

## 4. Nested Controls Not Selectable

### Issue:
Cannot select child controls nested within parent controls.

### Visual Indicator:
![Nested Selection Issue](../images/nested_selection_issue.png)

### Possible Causes:
- Event propagation issues in the control hierarchy
- Improper z-index management
- Click handlers not properly reaching nested elements

### Solution:
Ensure proper event handling for nested controls:

```typescript
// In the control rendering component
const handleControlClick = (e: React.MouseEvent, controlId: string) => {
  e.stopPropagation(); // Prevent bubbling to parent controls
  setSelectedControlId(controlId);
};

// Apply to each control element
<div 
  onClick={(e) => handleControlClick(e, control.id)}
  className="control-container"
>
  {/* Control content */}
</div>
```

## 5. Parent Control Properties Not Updating

### Issue:
Changes made to parent control properties don't reflect in the Design or Preview.

### Visual Indicator:
![Properties Not Updating](../images/properties_not_updating.png)

### Possible Causes:
- Update function not handling parent control types
- State management issues in the questionnaire context
- Re-rendering not triggered after property changes

### Solution:
Verify the update function handles parent control types:

```typescript
const updateControl = (controlId: string, updates: Partial<Control>) => {
  setQuestionnaire(prev => {
    const newQuestionnaire = { ...prev };
    
    // Create a function to find and update the control in any nested structure
    const updateControlRecursively = (controls: Control[]): boolean => {
      for (let i = 0; i < controls.length; i++) {
        if (controls[i].id === controlId) {
          controls[i] = { ...controls[i], ...updates };
          return true;
        }
        
        // Check in Tab controls
        if (controls[i].type === ControlType.Tab) {
          // Check through each tab's controls
          // Similar for Accordion and ColumnLayout
        }
      }
      return false;
    };
    
    updateControlRecursively(newQuestionnaire.controls);
    return newQuestionnaire;
  });
};
```

## Additional Troubleshooting Tips

1. **Use the React DevTools** to inspect component hierarchy and props
2. **Check browser console** for JavaScript errors
3. **Verify control state** after selection by logging `selectedControl`
4. **Test with simple control structures** first, then add complexity
5. **Isolate parent control types** to identify type-specific issues

If issues persist after trying these solutions, please consult the Developer Reference or contact the development team for further assistance.
