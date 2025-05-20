# Parent Control Properties - User Guide

## Overview

This guide explains how to effectively work with parent controls (Tab, Accordion, and ColumnLayout) in the questionnaire designer, including selecting and configuring their properties.

## Parent Control Types

### Tab Control

Tabs organize content into multiple tabbed sections, making it easy for users to navigate between different parts of a form.

### Accordion Control

Accordions display content in collapsible sections, allowing users to focus on one section at a time while reducing overall visual complexity.

### Column Layout Control

Column Layouts organize content into multiple columns, optimizing screen space and improving form layout.

## Working with Parent Controls

### Adding Parent Controls to the Questionnaire

1. From the **Controls** panel, select the desired parent control (Tab, Accordion, or ColumnLayout)
2. Drag the control onto the design canvas
3. The control will be added to the questionnaire at the drop location

### Selecting Parent Controls

To edit a parent control's properties, you need to select it first:

1. **Direct Selection**: Click directly on the parent control in the design canvas
2. **Dropdown Selection**: Use the "Selected Control" dropdown in the Properties Panel

> **Note**: For Tab and Accordion controls, make sure to click on the header/tab bar area rather than inside a tab or section to select the entire control.

### Editing Parent Control Properties

Once selected, the Properties Panel will display specific settings for each parent control type:

#### Tab Control Properties

- **Label**: The display name for the entire Tab control
- **Tab Position**: Where tabs appear (top, bottom, left, right)
- **Tab Management**: Add, remove, rename, and reorder tabs
- **Visibility**: Control when the Tab control is visible
- **Validation**: Set validation rules for the Tab control

#### Accordion Control Properties

- **Label**: The display name for the Accordion
- **Sections**: Add, remove, rename, and reorder accordion sections
- **Layout**: Choose vertical or horizontal orientation
- **Allow Multiple Expanded**: Toggle whether multiple sections can be expanded simultaneously
- **Section Styling**: Configure headers, content padding, and animations

#### Column Layout Properties

- **Label**: The display name for the Column Layout
- **Columns**: Configure the number of columns and their relative widths
- **Responsive Behavior**: Set column behavior on different screen sizes
- **Spacing**: Adjust spacing between columns

### Adding Child Controls

To add controls within a parent control:

1. Select the parent control to see its structure
2. For Tab controls: Select the tab where you want to add controls
3. For Accordion controls: Select the section where you want to add controls
4. For Column Layout controls: Select the column where you want to add controls
5. Drag and drop the desired controls from the Controls panel

### Selecting and Editing Child Controls

1. Click directly on any child control within a parent control
2. The Properties Panel will update to show that control's specific properties
3. Make your changes in the Properties Panel
4. Changes take effect immediately

## Tips for Working with Parent Controls

- **Control Selection**: When working with deeply nested structures, use the "Selected Control" dropdown in the Properties Panel to select specific controls
- **Nesting**: You can nest parent controls inside each other (e.g., a Tab inside an Accordion section)
- **Moving Controls**: You can drag and drop controls between different parent containers
- **Reordering**: Use the drag handles to reorder tabs, accordion sections, or controls within columns
- **Visibility Logic**: Parent controls can have visibility conditions that affect all their child controls

## Troubleshooting

### Control Not Appearing in Properties Panel

If you've selected a control but its properties aren't showing:

1. Try clicking directly on the header/title area of the control
2. Use the "Selected Control" dropdown in the Properties Panel
3. If nested deeply, click multiple times to navigate up to the parent control

### Child Controls Not Selectable

If you're unable to select a child control:

1. Make sure the tab or accordion section containing it is expanded/visible
2. Try using the "Selected Control" dropdown in the Properties Panel
3. Check if the control has visibility conditions making it inactive

### Changes Not Saving

If your property changes don't seem to be saving:

1. Click outside the property field after making changes
2. Check if the control has validation errors (indicated by red outlines)
3. Make sure you're editing the correct control (verify in the Selected Control dropdown)

## Best Practices

1. **Organize Logically**: Group related questions in the same tab or accordion section
2. **Label Clearly**: Use descriptive labels for tabs and accordion sections
3. **Balance Complexity**: Avoid nesting too many levels of parent controls
4. **Test Navigation**: Ensure users can easily navigate through your form structure
5. **Use Validation**: Set appropriate validation rules on parent containers
