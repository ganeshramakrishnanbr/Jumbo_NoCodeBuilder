# User Guide: Working with Parent Controls

## Overview

This guide explains how to work with parent controls (Tab, Accordion, ColumnLayout) in the Questionnaire Designer after the recent fix to the Properties Panel functionality.

## Parent Control Types

### Tab Control
- **Purpose**: Organizes content into tabbed sections
- **Properties**:
  - Position: top, bottom, left, or right
  - Tabs: Add, remove, or rename tabs
  - Styling options for the tab container

### Accordion Control
- **Purpose**: Creates collapsible content sections
- **Properties**:
  - Sections: Add, remove, or rename sections
  - Layout: Vertical or horizontal
  - Max Sections: Limit the number of sections
  - Allow Multiple Expanded: Toggle whether multiple sections can be expanded simultaneously
  - Section Configuration: Header style, content padding, and animation options

### ColumnLayout Control
- **Purpose**: Arranges content in multiple columns
- **Properties**:
  - Columns: Number of columns (numeric value)
  - Column Ratio: Distribution of width across columns
  - Controls: Add content to each column

## Working with Parent Controls

### 1. Adding Parent Controls

1. Drag a parent control (Tab, Accordion, or ColumnLayout) from the Control Palette to the Canvas
2. The parent control will appear with default settings

### 2. Configuring Parent Controls

1. Click on the parent control in the Canvas to select it
2. The Properties Panel will display the control's properties
3. Adjust settings as needed:
   - For Tab controls: Add tabs, change position, etc.
   - For Accordion controls: Add sections, change layout, etc.
   - For ColumnLayout controls: Change number of columns, adjust column ratio, etc.
4. Changes apply immediately to the preview

### 3. Adding Child Controls

1. Select a parent control or subcontainer within it:
   - For Tab controls: Select a specific tab
   - For Accordion controls: Select a section
   - For ColumnLayout controls: Select a column
2. Drag child controls from the Control Palette into the selected container
3. Child controls will be properly nested within the parent

### 4. Selecting Nested Controls

1. Click directly on a nested control to select it
2. The Properties Panel will update to show the selected control's properties
3. Alternatively, use the control dropdown in the Properties Panel to select any control

## Troubleshooting

If parent control properties are not displaying:

1. Check that you have the latest version of the application
2. Ensure you've clicked directly on the parent control (not a child element)
3. Try refreshing the page if the Properties Panel doesn't update
4. If problems persist, check the browser console for any errors

## Tips for Working with Parent Controls

- **Tab Control**: Add all tabs first before adding content to keep organized
- **Accordion Control**: Use the "Allow Multiple Expanded" option for better user experience with complex content
- **ColumnLayout Control**: Start with fewer columns and add more as needed rather than starting with many empty columns
