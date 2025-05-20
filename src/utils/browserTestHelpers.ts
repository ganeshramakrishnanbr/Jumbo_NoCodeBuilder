/**
 * Helper functions for testing in the browser console
 * These can be copied into the browser console for manual testing
 */

/**
 * Identifies parent controls in the current questionnaire
 * @returns Object with information about parent controls
 */
export const identifyParentControls = (): void => {
  // This will be executed in the browser console
  const code = `
    (function() {
      // Get the questionnaire context from React DevTools
      const questionnaireHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!questionnaireHook) {
        console.error('React DevTools not found. Install React DevTools extension.');
        return;
      }
      
      // Try to find the questionnaire state
      let questionnaire = null;
      try {
        // This approach may need to be adjusted based on your app structure
        const fiberNodes = Array.from(questionnaireHook.getFiberRoots(1));
        for (const root of fiberNodes) {
          const node = root.current;
          if (node && node.memoizedState && node.memoizedState.memoizedState) {
            questionnaire = node.memoizedState.memoizedState.questionnaire;
            if (questionnaire && questionnaire.controls) {
              break;
            }
          }
        }
      } catch (e) {
        console.error('Error accessing questionnaire data:', e);
        return;
      }
      
      if (!questionnaire || !questionnaire.controls) {
        console.error('Questionnaire not found in React state');
        return;
      }
      
      // Find parent controls
      const parentTypes = ['Tab', 'Accordion', 'ColumnLayout'];
      const parentControls = questionnaire.controls.filter(c => parentTypes.includes(c.type));
      
      console.log('=== Parent Controls in Current Questionnaire ===');
      console.table(parentControls.map((control, index) => ({
        index: questionnaire.controls.findIndex(c => c.id === control.id),
        id: control.id,
        type: control.type,
        label: control.label || '[No Label]',
        children: getChildCountForControl(control)
      })));
      
      // Helper to get child count
      function getChildCountForControl(control) {
        if (control.type === 'Tab' && control.tabs) {
          return control.tabs.reduce((sum, tab) => sum + (tab.controls?.length || 0), 0);
        }
        if (control.type === 'Accordion' && control.sections) {
          return control.sections.reduce((sum, section) => sum + (section.controls?.length || 0), 0);
        }
        if (control.type === 'ColumnLayout' && control.columns) {
          return control.columns.reduce((sum, column) => sum + (column.controls?.length || 0), 0);
        }
        return 0;
      }
    })();
  `;
  
  console.log('Copy and paste this code into your browser console:');
  console.log(code);
};

/**
 * Monitors drag and drop events in the browser
 * @returns Code to paste in browser console
 */
export const monitorDragDropEvents = (): void => {
  const code = `
    (function() {
      // Track drag events
      const dragEvents = [];
      let isDragging = false;
      let startElement = null;
      let currentParentControl = null;
      
      // Helper to get control info from element
      function getControlInfo(element) {
        if (!element) return null;
        
        // Try to find control ID from data attribute
        let controlElement = element;
        while (controlElement && !controlElement.dataset.controlId) {
          controlElement = controlElement.parentElement;
          if (!controlElement) break;
        }
        
        return controlElement ? {
          controlId: controlElement.dataset.controlId,
          controlType: controlElement.dataset.controlType,
          element: controlElement
        } : null;
      }
      
      // Monitor dragstart events
      document.addEventListener('dragstart', (e) => {
        isDragging = true;
        startElement = e.target;
        
        const controlInfo = getControlInfo(e.target);
        if (controlInfo) {
          console.log('%c➡️ Drag Started', 'color: blue; font-weight: bold', {
            controlId: controlInfo.controlId,
            controlType: controlInfo.controlType,
            targetElement: e.target
          });
          
          if (['Tab', 'Accordion', 'ColumnLayout'].includes(controlInfo.controlType)) {
            currentParentControl = controlInfo;
            console.log('%c🔄 Parent Control Being Dragged', 'color: purple; font-weight: bold', currentParentControl);
          }
        }
      });
      
      // Monitor drop events
      document.addEventListener('drop', (e) => {
        if (!isDragging) return;
        
        const dropTarget = e.target;
        const controlInfo = getControlInfo(dropTarget);
        
        console.log('%c⬇️ Drop Detected', 'color: green; font-weight: bold', {
          dropTarget,
          controlInfo,
          currentParentControl
        });
        
        isDragging = false;
      });
      
      // Monitor dragend events
      document.addEventListener('dragend', (e) => {
        if (currentParentControl) {
          console.log('%c🔚 Parent Control Drag Ended', 'color: purple; font-weight: bold', currentParentControl);
          currentParentControl = null;
        }
        isDragging = false;
      });
      
      console.log('%c✅ Drag and Drop Monitor Activated', 'color: green; font-weight: bold');
      console.log('Try dragging parent controls and observe the events in this console');
    })();
  `;
  
  console.log('Copy and paste this code into your browser console to monitor drag and drop events:');
  console.log(code);
};

/**
 * Logs the current control structure in the browser console
 * @returns Code to paste in browser console
 */
export const logControlStructureInBrowser = (): void => {
  const code = `
    (function() {
      // Try to find the questionnaire state in various ways
      let questionnaire = null;
      
      // Method 1: Check for globally exposed state (if you have a debug mode)
      if (window.__QUESTIONNAIRE_STATE__) {
        questionnaire = window.__QUESTIONNAIRE_STATE__;
      } 
      
      // Method 2: Use React DevTools hook
      if (!questionnaire) {
        try {
          const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (hook) {
            const roots = Array.from(hook.getFiberRoots(1));
            for (const root of roots) {
              // This is a simplified approach that might need adjustments
              const node = root.current;
              if (node && node.memoizedState && node.memoizedState.memoizedState) {
                questionnaire = node.memoizedState.memoizedState.questionnaire;
                if (questionnaire && questionnaire.controls) {
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.error('Error accessing React state:', e);
        }
      }
      
      if (!questionnaire || !questionnaire.controls) {
        console.error('Could not find questionnaire state');
        return;
      }
      
      console.log('%c📋 Current Questionnaire Controls', 'color: blue; font-weight: bold');
      
      const controlSummary = questionnaire.controls.map((control, index) => {
        const isParent = ['Tab', 'Accordion', 'ColumnLayout'].includes(control.type);
        let childCount = 0;
        
        if (control.type === 'Tab' && control.tabs) {
          childCount = control.tabs.reduce((sum, tab) => sum + (tab.controls?.length || 0), 0);
        } else if (control.type === 'Accordion' && control.sections) {
          childCount = control.sections.reduce((sum, section) => sum + (section.controls?.length || 0), 0);
        } else if (control.type === 'ColumnLayout' && control.columns) {
          childCount = control.columns.reduce((sum, column) => sum + (column.controls?.length || 0), 0);
        }
        
        return {
          position: index,
          id: control.id?.substring(0, 8),
          type: control.type,
          isParentControl: isParent,
          childCount: childCount,
          label: control.label || '[No Label]'
        };
      });
      
      console.table(controlSummary);
    })();
  `;
  
  console.log('Copy and paste this code into your browser console to view the control structure:');
  console.log(code);
};

// Export all helper functions
export const getBrowserTestHelpers = (): void => {
  console.log('Available Browser Test Helpers:');
  console.log('1. identifyParentControls() - Identifies parent controls in the questionnaire');
  console.log('2. monitorDragDropEvents() - Monitors drag and drop events in the browser');
  console.log('3. logControlStructureInBrowser() - Logs the current control structure');
};

// Execute this when the file is run directly
if (require.main === module) {
  getBrowserTestHelpers();
}
