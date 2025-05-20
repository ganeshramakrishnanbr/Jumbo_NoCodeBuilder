# Preview Design Control Fix - Verification Instructions

## Overview
This document provides step-by-step instructions for verifying that the parent control properties fix is working correctly in the Preview mode. Follow these steps to confirm that Tab, Accordion, and ColumnLayout controls are displaying properly both in the design canvas and preview pane.

## Prerequisites
1. The application is running on your local development server
2. You have the latest version (0.2.0 or later) installed
3. You're logged in with appropriate permissions

## Test Case 1: Tab Control in Preview

### Steps:
1. Create a new questionnaire or open an existing one
2. Add a Tab control to the canvas
3. Select the Tab control to view its properties in the Properties Panel
4. Verify that the tab properties are displayed (position, tabs, etc.)
5. Add at least 2 tabs to the Tab control
6. Add some child controls (e.g., TextBox, RadioButton) to each tab
7. Click the "Preview" tab at the top of the designer
8. Verify the Tab control renders correctly in the preview:
   - All tabs are visible
   - Clicking tabs switches between content
   - Child controls display correctly within each tab

### Expected Result:
- Properties Panel should show Tab control properties when selected
- Preview should match the design canvas appearance
- Tab navigation should work correctly in preview mode

## Test Case 2: Accordion Control in Preview

### Steps:
1. Add an Accordion control to the canvas
2. Select the Accordion control to view its properties
3. Verify accordion properties are displayed (sections, layout, etc.)
4. Add at least 2 sections to the Accordion
5. Add some child controls to each section
6. Click the "Preview" tab
7. Verify the Accordion control renders correctly:
   - All sections are visible
   - Clicking sections expands/collapses them
   - Child controls display correctly within each section

### Expected Result:
- Properties Panel should show Accordion control properties when selected
- Preview should match the design canvas appearance
- Section expansion/collapse should work correctly in preview mode

## Test Case 3: ColumnLayout Control in Preview

### Steps:
1. Add a ColumnLayout control to the canvas
2. Select the ColumnLayout control to view its properties
3. Verify column properties are displayed (number of columns, ratio, etc.)
4. Configure the ColumnLayout to have 2-3 columns
5. Add different child controls to each column
6. Click the "Preview" tab
7. Verify the ColumnLayout control renders correctly:
   - All columns are displayed with correct proportions
   - Child controls are arranged properly within columns
   - Responsive layout works in different device views

### Expected Result:
- Properties Panel should show ColumnLayout control properties when selected
- Preview should display columns with correct spacing and proportions
- Child controls should align correctly within the columns

## Test Case 4: Nested Parent Controls in Preview

### Steps:
1. Create a complex nested structure:
   - Add a Tab control
   - Inside one tab, add an Accordion control
   - Inside one accordion section, add a ColumnLayout control
2. Add child controls at various levels of nesting
3. Configure properties for all parent controls
4. Click the "Preview" tab
5. Verify the entire nested structure renders correctly:
   - Navigation (tabs, accordion sections) works at all levels
   - Child controls display correctly at all nesting levels
   - Layout is preserved in preview mode

### Expected Result:
- Properties Panel should show properties for any selected control at any nesting level
- Preview should correctly render the entire nested structure
- All navigation elements should work correctly

## Reporting Issues
If you encounter any problems during verification, please:
1. Take a screenshot of the issue
2. Note which test case and specific step you were on
3. Check the browser console for any errors
4. Report the issue with all collected information
