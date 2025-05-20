/**
 * Debug utilities for tracking and validating control operations
 */

import { Control, ControlType } from '../types';

/**
 * Logs the current control structure in a human-readable format
 * @param controls Array of controls to log
 * @param message Optional message to preface the log
 */
export const logControlStructure = (controls: Control[], message?: string): void => {
  if (message) {
    console.log(`[DEBUG] ${message}`);
  }
  
  if (!controls || !Array.isArray(controls) || controls.length === 0) {
    console.log('[DEBUG] Empty control array');
    return;
  }
  
  const controlSummary = controls.map((control, index) => {
    const isParent = [ControlType.Tab, ControlType.Accordion, ControlType.ColumnLayout].includes(control.type);
    const childCount = getChildCount(control);
    
    return {
      position: index,
      id: control.id.substring(0, 8),
      type: control.type,
      isParentControl: isParent,
      childCount: childCount,
      label: control.label || '[No Label]',
    };
  });
  
  console.table(controlSummary);
};

/**
 * Gets the number of child controls for a parent control
 * @param control The control to check
 * @returns The number of child controls
 */
const getChildCount = (control: Control): number => {
  switch (control.type) {
    case ControlType.Tab:
      // @ts-ignore - Assuming TabControl has tabs property
      return control.tabs ? control.tabs.reduce((sum, tab) => sum + (tab.controls?.length || 0), 0) : 0;
    case ControlType.Accordion:
      // @ts-ignore - Assuming AccordionControl has sections property
      return control.sections ? control.sections.reduce((sum, section) => sum + (section.controls?.length || 0), 0) : 0;    case ControlType.ColumnLayout:
      // @ts-ignore - Assuming ColumnLayoutControl has columnControls property
      return control.columnControls ? control.columnControls.reduce((sum, column) => sum + (column.length || 0), 0) : 0;
    default:
      return 0;
  }
};

/**
 * Validates the position of controls after a drag-and-drop operation
 * @param beforeControls Control array before the operation
 * @param afterControls Control array after the operation
 * @param movedControlId ID of the control that was moved
 * @param targetIndex Target index for the moved control
 * @returns Object containing validation results and messages
 */
export const validateControlMovement = (
  beforeControls: Control[], 
  afterControls: Control[], 
  movedControlId: string, 
  targetIndex: number
): { success: boolean; messages: string[] } => {
  const result = { success: true, messages: [] as string[] };
  
  // Check array lengths
  if (beforeControls.length !== afterControls.length) {
    result.success = false;
    result.messages.push(`Control count mismatch: before=${beforeControls.length}, after=${afterControls.length}`);
  }
  
  // Find original position
  const originalIndex = beforeControls.findIndex(c => c.id === movedControlId);
  if (originalIndex === -1) {
    result.success = false;
    result.messages.push(`Control ${movedControlId} not found in original controls`);
    return result;
  }
  
  // Find new position
  const newIndex = afterControls.findIndex(c => c.id === movedControlId);
  if (newIndex === -1) {
    result.success = false;
    result.messages.push(`Control ${movedControlId} not found in updated controls`);
    return result;
  }
  
  // Verify the control is at the expected position
  const adjustedTarget = targetIndex > originalIndex ? targetIndex - 1 : targetIndex;
  if (newIndex !== adjustedTarget) {
    result.success = false;
    result.messages.push(`Control not at expected position: expected=${adjustedTarget}, actual=${newIndex}`);
  }
  
  // Verify each control exists and has the same properties
  const controlsById = new Map<string, Control>();
  beforeControls.forEach(c => controlsById.set(c.id, c));
  
  for (const afterControl of afterControls) {
    const beforeControl = controlsById.get(afterControl.id);
    if (!beforeControl) {
      result.success = false;
      result.messages.push(`Control ${afterControl.id} exists after but not before`);
      continue;
    }
    
    // Check if important properties are preserved
    if (beforeControl.type !== afterControl.type) {
      result.success = false;
      result.messages.push(`Control ${afterControl.id} changed type: before=${beforeControl.type}, after=${afterControl.type}`);
    }
    
    if (beforeControl.label !== afterControl.label) {
      result.success = false;
      result.messages.push(`Control ${afterControl.id} changed label: before=${beforeControl.label}, after=${afterControl.label}`);
    }
  }
  
  if (result.success) {
    result.messages.push(`Control ${movedControlId} successfully moved from ${originalIndex} to ${newIndex}`);
  }
  
  return result;
};
