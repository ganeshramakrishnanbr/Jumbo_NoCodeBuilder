# Investigation Plan: Parent Control Properties Not Displaying

## Issue Description
Parent controls (Tab, Accordion, ColumnLayout) properties are not appearing in the Properties Panel when selected. Instead, the message "Select a control to edit its properties" is shown even when a parent control is selected.

## Investigation Approach

### 1. Functionality Review
- Examine how the Properties Panel identifies and displays selected controls
- Review the control selection mechanism in QuestionnaireContext
- Understand the flow from selecting a control to displaying its properties

### 2. Code Inspection
- Examine the `flattenControls` function in PropertiesPanel.tsx
- Analyze how parent controls (Tab, Accordion, ColumnLayout) are handled in the flattening process
- Check the interfaces for Tab, Accordion, and ColumnLayout controls
- Verify correct property names are used for accessing nested controls

### 3. Error Analysis
- Check browser console for any errors related to property access
- Look for undefined or null property errors
- Identify any type mismatches or property name mismatches

### 4. Test Plan
- Create test scenarios that trigger the issue
- Test each parent control type (Tab, Accordion, ColumnLayout) individually
- Check if the issue occurs with specific control configurations

## Expected Outcomes
- Identify the specific cause of parent control properties not appearing
- Determine if the issue is in control selection or properties display
- Check for any type mismatches or property access errors
- Develop a clear plan to fix the issue
