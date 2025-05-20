# Parent Control Properties Selection Issue - Investigation Plan

## Issue Description

**Issue ID**: ISSUE-001  
**Type**: UI Bug  
**Severity**: Medium  
**Reported Date**: May 20, 2025  
**Status**: Identified  

### Summary
When parent controls (Tab, Accordion, ColumnLayout) are placed in the questionnaire designer, their properties do not display in the Properties Panel. Instead, the message "Select a control to edit its properties" continues to show even when the parent control is selected.

### Expected Behavior
When a parent control is selected in the questionnaire designer, its specific properties should be displayed in the Properties Panel, allowing editing of the control's configuration.

### Current Behavior
The Properties Panel shows "Select a control to edit its properties" even when a parent control is selected. This prevents users from configuring parent controls after they are added to the questionnaire.

## Investigation Approach

### 1. Code Review

I will examine the following files:

1. `src/components/designer/properties/PropertiesPanel.tsx` - Main component responsible for displaying control properties
2. `src/components/designer/canvas/CanvasControl.tsx` - Component that renders controls and handles selection
3. `src/contexts/QuestionnaireContext.tsx` - Context managing the questionnaire state and control selection
4. `src/types/index.ts` - Type definitions for controls

### 2. Component Flow Analysis

Trace the flow from:
- Control selection in the designer canvas
- State updates in the questionnaire context
- Properties panel rendering logic

### 3. Parent Control Structure Analysis

Analyze how parent controls are structured:
- Tab control and its tabs array
- Accordion control and its sections array
- ColumnLayout control and its columns array

### 4. Debugging Steps

1. Add console logs to track control selection events
2. Verify that selected control IDs are properly set in the context
3. Check if the flattening algorithm in the Properties Panel correctly processes all parent control types
4. Validate the rendering logic in the Properties Panel

## Success Criteria

- The Properties Panel correctly displays properties for all parent control types
- Tab, Accordion, and ColumnLayout controls can be fully configured
- No visual glitches or error messages appear
- Control selection works consistently

## Expected Fix

Based on initial analysis, the likely issue is in the control flattening algorithm in the PropertiesPanel component. The algorithm appears to handle Tab and ColumnLayout controls but may be missing handling for Accordion controls or using incorrect property names for accessing child controls.
