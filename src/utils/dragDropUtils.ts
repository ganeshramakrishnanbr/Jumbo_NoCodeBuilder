// Utility functions for drag-and-drop operations

import { Control } from '../types';
import { logControlStructure, validateControlMovement } from './debugUtils';

/**
 * Consistently determines the index of a control in an array of controls
 * @param controls Array of controls to search
 * @param id ID of the control to find
 * @returns The index of the control, or -1 if not found
 */
export const findControlIndex = (controls: Control[], id: string): number => {
  if (!controls || !Array.isArray(controls)) {
    console.error('[DRAG-DEBUG] Invalid controls array in findControlIndex');
    return -1;
  }
  return controls.findIndex(c => c.id === id);
};

/**
 * Creates a deep clone of a control to avoid reference issues
 * @param control The control to clone
 * @returns A deep clone of the control
 */
export const cloneControl = (control: Control): Control => {
  try {
    return JSON.parse(JSON.stringify(control));
  } catch (error) {
    console.error('[DRAG-DEBUG] Error cloning control:', error);
    return { ...control };
  }
};

/**
 * Forces a UI refresh for an element
 * @param element The DOM element to refresh
 */
export const forceUIRefresh = (element: HTMLElement | null): void => {
  if (!element) return;
  
  // Trigger a reflow
  void element.offsetHeight;
  
  // Add and remove a class to force a repaint
  element.classList.add('refresh-trigger');
  setTimeout(() => {
    if (element) {
      element.classList.remove('refresh-trigger');
    }
  }, 0);
};

/**
 * Handles special movement of the first control in a list
 * @param controls The array of controls
 * @param targetIndex The target index for the moved control
 * @returns A new array with the control moved to the target position
 */
export const moveFirstControl = (controls: Control[], targetIndex: number): Control[] => {
  if (!controls || !Array.isArray(controls) || controls.length === 0) {
    console.error('[DRAG-DEBUG] Invalid controls array in moveFirstControl');
    return controls;
  }
  
  console.log('[DRAG-DEBUG] Moving first control to target index:', targetIndex, {
    controlCount: controls.length,
    firstControlType: controls[0].type,
    firstControlId: controls[0].id
  });
  
  // Clone the array to avoid modifying the original
  const updatedControls = JSON.parse(JSON.stringify(controls));
  
  // Remove the first control
  const [controlToMove] = updatedControls.splice(0, 1);
  
  // The target index needs to be adjusted since we removed an item
  // If targetIndex is 0, keep it at 0 (moving back to first position)
  // Otherwise, adjust it because we removed the first element
  const adjustedIndex = targetIndex === 0 ? 0 : Math.max(0, targetIndex - 1);
  
  console.log('[DRAG-DEBUG] Adjusted target index:', adjustedIndex);
  
  // Insert at the target position
  updatedControls.splice(adjustedIndex, 0, controlToMove);
    // Log the new order
  console.log('[DRAG-DEBUG] Control order after move:', 
    updatedControls.map((c: Control, i: number) => `${i}: ${c.type} (${c.id.substr(0, 6)})`));
  return updatedControls;
};

/**
 * Generic function to move any control within an array of controls
 * @param controls The array of controls
 * @param controlId The ID of the control to move
 * @param targetIndex The target index for the moved control
 * @returns A new array with the control moved to the target position
 */
export const moveControlInArray = (controls: Control[], controlId: string, targetIndex: number): Control[] => {
  if (!controls || !Array.isArray(controls) || controls.length === 0) {
    console.error('[DRAG-DEBUG] Invalid controls array in moveControlInArray');
    return controls;
  }
  
  // Clone the array to avoid modifying the original
  const updatedControls = JSON.parse(JSON.stringify(controls));
  
  // Find the control's current index
  const currentIndex = updatedControls.findIndex((c: Control) => c.id === controlId);
  
  if (currentIndex === -1) {
    console.error('[DRAG-DEBUG] Control not found in moveControlInArray:', controlId);
    return updatedControls;
  }
  
  console.log('[DRAG-DEBUG] Moving control from index', currentIndex, 'to', targetIndex, {
    controlId: controlId,
    controlType: updatedControls[currentIndex].type,
  });
  
  // Remove the control from its current position
  const [controlToMove] = updatedControls.splice(currentIndex, 1);
  
  // Adjust the target index if needed (if the target is after the current position)
  const adjustedIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
  
  // Insert at the target position
  updatedControls.splice(adjustedIndex, 0, controlToMove);
  
  return updatedControls;
};

/**
 * Specifically handles movement of parent controls (Tab, Accordion, ColumnLayout)
 * @param controls The array of controls
 * @param controlId The ID of the parent control to move
 * @param targetIndex The target index for the moved control
 * @returns A new array with the parent control moved to the target position
 */
export const moveParentControl = (controls: Control[], controlId: string, targetIndex: number): Control[] => {
  if (!controls || !Array.isArray(controls) || controls.length === 0) {
    console.error('[DRAG-DEBUG] Invalid controls array in moveParentControl');
    return controls;
  }
  
  // Store original controls for validation
  const originalControls = JSON.parse(JSON.stringify(controls));
  
  // Clone the array to avoid modifying the original
  const updatedControls = JSON.parse(JSON.stringify(controls));
  
  // Find the control's current index
  const currentIndex = updatedControls.findIndex((c: Control) => c.id === controlId);
  
  if (currentIndex === -1) {
    console.error('[DRAG-DEBUG] Parent control not found in moveParentControl:', controlId);
    return updatedControls;
  }
  
  // Get the control type
  const controlType = updatedControls[currentIndex].type;
  
  console.log('[DRAG-DEBUG] Moving parent control from index', currentIndex, 'to', targetIndex, {
    controlId: controlId,
    controlType: controlType,
  });
  
  // Log the control structure before movement
  logControlStructure(originalControls, 'Control structure before parent control move:');
  
  // Remove the control from its current position
  const [controlToMove] = updatedControls.splice(currentIndex, 1);
  
  // Adjust the target index if needed (if the target is after the current position)
  const adjustedIndex = targetIndex > currentIndex ? targetIndex - 1 : targetIndex;
  
  // Insert at the target position
  updatedControls.splice(adjustedIndex, 0, controlToMove);
  
  // Log the control structure after movement
  logControlStructure(updatedControls, 'Control structure after parent control move:');
  
  // Validate the movement
  const validation = validateControlMovement(originalControls, updatedControls, controlId, targetIndex);
  if (!validation.success) {
    console.warn('[DRAG-DEBUG] Parent control movement validation issues:', validation.messages);
  } else {
    console.log('[DRAG-DEBUG] Parent control movement validated successfully:', validation.messages);
  }
  
  return updatedControls;
};

/**
 * Logs the current questionnaire state
 * @param controls Array of controls to log
 */
export const logQuestionnaireState = (controls: Control[]): void => {
  console.log('[DRAG-DEBUG] Current controls structure:', {
    count: controls.length,
    controlIds: controls.map((c: Control) => c.id),
    types: controls.map((c: Control) => c.type),
    labels: controls.map((c: Control) => c.label)
  });
};
