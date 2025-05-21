/**
 * Questionnaire Context
 * 
 * Provides state management and operations for the questionnaire designer.
 * This context handles all questionnaire-related operations including:
 * - Adding, updating, and deleting controls
 * - Moving controls between different sections and layouts
 * - Managing the active tab and selected control states
 * - Saving and loading questionnaires
 * 
 * @example
 * // Wrap your app with the provider:
 * <QuestionnaireProvider>
 *   <App />
 * </QuestionnaireProvider>
 * 
 * // Use the context in components:
 * const { questionnaire, addControl } = useQuestionnaire();
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Control, Questionnaire, ControlType, AccordionControl, AccordionSection, ColumnLayoutControl, TabControl } from '../types'; 
import { nanoid } from 'nanoid';

/**
 * Interface defining the shape of the Questionnaire context
 * Includes all operations and state that can be accessed by components
 */
interface QuestionnaireContextType {
  questionnaire: Questionnaire;
  activeTabIndex: number;
  selectedControlId: string | null;
  setActiveTabIndex: (index: number) => void;
  setSelectedControlId: (id: string | null) => void;
  addControl: (control: Partial<Control>) => void;
  updateControl: (id: string, updates: Partial<Control>) => void;
  deleteControl: (id: string) => void;
  moveControl: (draggedControlId: string, targetParentId: string, targetType: string, targetIndex?: number, sectionId?: string, tabIndex?: number, columnIndex?: number) => void;
  saveQuestionnaire: () => Promise<void>;
  loadQuestionnaire: (id: string) => Promise<void>;
  // New function to directly update all controls
  updateQuestionnaireControls: (controls: Control[]) => void;
}

const defaultQuestionnaire: Questionnaire = {
  id: nanoid(),
  title: 'New Questionnaire',
  createdAt: new Date(),
  updatedAt: new Date(),
  controls: [],
  styles: {
    global: {
      fontFamily: 'Inter, system-ui, sans-serif',
      primaryColor: '#0047AB',
      secondaryColor: '#4B9CD3',
      borderRadius: '4px',
      spacing: '16px',
    },
  },
};

const QuestionnaireContext = createContext<QuestionnaireContextType | undefined>(undefined);

export const QuestionnaireProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(defaultQuestionnaire);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  const addControl = (controlData: Partial<Control>) => {
    const newControl = {
      id: nanoid(),
      ...controlData,
    } as Control;

    setQuestionnaire((prev) => ({
      ...prev,
      controls: [...prev.controls, newControl],
      updatedAt: new Date(),
    }));

    // Automatically select the new control
    setSelectedControlId(newControl.id);
  };

  const updateControl = (id: string, updates: Partial<Control>) => {
    setQuestionnaire((prev) => {
      const updatedControls = updateControlInArray(prev.controls, id, updates);
      return {
        ...prev,
        controls: updatedControls,
        updatedAt: new Date(),
      };
    });
  };

  const updateControlInArray = (controls: Control[], id: string, updates: Partial<Control>): Control[] => {
    return controls.map((control) => {
      if (control.id === id) {
        console.log('[QuestionnaireContext] Updating control:', id, updates);
        return { ...control, ...updates };
      }
      
      if (control.type === ControlType.Tab) {
        const tabControl = control as any;
        if (tabControl.tabs) {
          return {
            ...tabControl,
            tabs: tabControl.tabs.map((tab: any) => ({
              ...tab,
              controls: updateControlInArray(tab.controls, id, updates),
            })),
          };
        }
      }
      
      if (control.type === ControlType.ColumnLayout) {
        const columnControl = control as ColumnLayoutControl; // Type assertion
        if (columnControl.columnControls) {
          return {
            ...columnControl,
            columnControls: columnControl.columnControls.map((column: Control[]) => 
              updateControlInArray(column, id, updates)
            ),
          };
        }
      }

      if (control.type === ControlType.Accordion) {
        const accordionControl = control as AccordionControl; // Type assertion
        if (accordionControl.sections) {
          return {
            ...accordionControl,
            sections: accordionControl.sections.map((section: AccordionSection) => ({
              ...section,
              controls: updateControlInArray(section.controls, id, updates),
            })),
          };
        }
      }
      
      return control;
    });
  };

  const deleteControl = (id: string) => {
    setQuestionnaire((prev) => {
      const updatedControls = deleteControlFromArray(prev.controls, id);
      return {
        ...prev,
        controls: updatedControls,
        updatedAt: new Date(),
      };
    });

    // Clear selection if the deleted control was selected
    if (selectedControlId === id) {
      setSelectedControlId(null);
    }
  };
  const deleteControlFromArray = (controls: Control[], id: string, alreadyDeleted = false): Control[] => {
    return controls.filter((control) => {
      // If we find the control and haven't deleted it yet, log and delete it
      if (control.id === id && !alreadyDeleted) {
        console.log('[QuestionnaireContext] Deleting control:', id);
        return false; // Remove the control
      }
      
      // If this is the control but we've already deleted it once, just return false without logging
      if (control.id === id) {
        return false;
      }
      
      // For nested structures, pass the alreadyDeleted flag once we've found and deleted the control
      let isDeletedInThisBranch = alreadyDeleted;
      
      if (control.type === ControlType.Tab) {
        const tabControl = control as TabControl;
        if (tabControl.tabs) {
          tabControl.tabs = tabControl.tabs.map((tab) => {
            const newControls = deleteControlFromArray(tab.controls, id, isDeletedInThisBranch);
            // If the number of controls changed, we found and deleted it in this branch
            if (newControls.length < tab.controls.length) {
              isDeletedInThisBranch = true;
            }
            return { ...tab, controls: newControls };
          });
        }
      }
      
      if (control.type === ControlType.ColumnLayout) {
        const columnControl = control as ColumnLayoutControl;
        if (columnControl.columnControls) {
          columnControl.columnControls = columnControl.columnControls.map((column) => {
            const newControls = deleteControlFromArray(column, id, isDeletedInThisBranch);
            // If the number of controls changed, we found and deleted it in this branch
            if (newControls.length < column.length) {
              isDeletedInThisBranch = true;
            }
            return newControls;
          });
        }
      }

      if (control.type === ControlType.Accordion) {
        const accordionControl = control as AccordionControl;
        if (accordionControl.sections) {
          accordionControl.sections = accordionControl.sections.map((section) => {
            const newControls = deleteControlFromArray(section.controls, id, isDeletedInThisBranch);
            // If the number of controls changed, we found and deleted it in this branch
            if (newControls.length < section.controls.length) {
              isDeletedInThisBranch = true;
            }
            return { ...section, controls: newControls };
          });
        }
      }
      
      return true;
    });
  };

  const moveControl = (draggedControlId: string, targetParentId: string, targetType: string, targetIndex?: number, sectionId?: string, tabIndex?: number, columnIndex?: number) => {
    console.log('[QuestionnaireContext] Moving control:', {
      draggedControlId, targetParentId, targetType, targetIndex, sectionId, columnIndex, tabIndex
    });

    setQuestionnaire((prev) => {
      if (!prev || !prev.controls) {
        console.warn('[QuestionnaireContext] Invalid questionnaire state');
        return prev;
      }

      let foundControl: Control | null = null;

      // Deep clone the controls to avoid mutating state directly
      const findAndRemoveControl = (controls: Control[]): Control[] => {
        if (!controls || !Array.isArray(controls)) {
          console.warn('[QuestionnaireContext] Invalid controls array:', controls);
          return [];
        }

        return controls.reduce((acc: Control[], control: Control) => {
          if (control.id === draggedControlId) {
            // Create a deep clone of the control to avoid reference issues
            // This is especially important for complex controls like ColumnLayout
            try {
              foundControl = JSON.parse(JSON.stringify(control));
            } catch (error) {
              console.error('[QuestionnaireContext] Error cloning control:', error);
              foundControl = {...control};
            }
            return acc;
          }

          // Handle nested structures with null checks
          if (control.type === ControlType.Tab) {
            const tabCtrl = control as TabControl;
            if (tabCtrl.tabs && Array.isArray(tabCtrl.tabs)) {
              const newTabs = tabCtrl.tabs.map(tab => ({
                ...tab,
                controls: findAndRemoveControl(tab.controls || [])
              }));
              acc.push({ ...control, type: ControlType.Tab, tabs: newTabs } as TabControl);
            } else {
              acc.push(control);
            }
          } 
          else if (control.type === ControlType.Accordion) {
            const accCtrl = control as AccordionControl;
            if (accCtrl.sections && Array.isArray(accCtrl.sections)) {
              const newSections = accCtrl.sections.map(sec => ({
                ...sec,
                controls: findAndRemoveControl(sec.controls || [])
              }));
              acc.push({ ...control, type: ControlType.Accordion, sections: newSections } as AccordionControl);
            } else {
              acc.push(control);
            }
          } 
          else if (control.type === ControlType.ColumnLayout) {
            const colCtrl = control as ColumnLayoutControl;
            if (colCtrl.columnControls && Array.isArray(colCtrl.columnControls)) {
              const newColumnControls = colCtrl.columnControls.map(col => findAndRemoveControl(col || []));
              acc.push({ ...control, type: ControlType.ColumnLayout, columnControls: newColumnControls } as ColumnLayoutControl);
            } else {
              acc.push(control);
            }
          } 
          else {
            acc.push(control);
          }
          return acc;
        }, [] as Control[]);
      };

      // Remove the control from its current location
      let updatedControls = findAndRemoveControl(prev.controls);

      // Error handling for control not found
      if (!foundControl) {
        console.warn('[QuestionnaireContext] Control not found:', draggedControlId);
        return prev;
      }

      // At this point, foundControl is guaranteed to be non-null
      const controlToMove = foundControl as Control;

      // Special handling for ColumnLayout controls
      if (controlToMove.type === ControlType.ColumnLayout) {
        const colLayout = controlToMove as ColumnLayoutControl;
        
        // Ensure columnControls is properly initialized
        if (!colLayout.columnControls || !Array.isArray(colLayout.columnControls)) {
          console.log('[QuestionnaireContext] Initializing columnControls for moved ColumnLayout');
          colLayout.columnControls = Array(colLayout.columns || 2).fill(null).map(() => []);
        }
        
        // Ensure each column is an array
        colLayout.columnControls = colLayout.columnControls.map(col => 
          Array.isArray(col) ? col : []
        );
        
        // Ensure column count matches
        if (colLayout.columnControls.length !== (colLayout.columns || 2)) {
          const columnsNeeded = colLayout.columns || 2;
          let newColumnControls;
          
          if (colLayout.columnControls.length < columnsNeeded) {
            // Add missing columns
            const additionalColumns = Array(columnsNeeded - colLayout.columnControls.length)
              .fill(null).map(() => []);
            newColumnControls = [...colLayout.columnControls, ...additionalColumns];
          } else {
            // Remove excess columns
            newColumnControls = colLayout.columnControls.slice(0, columnsNeeded);
          }
          
          colLayout.columnControls = newColumnControls;
        }
      }

      // Add the control to its new location
      if (targetParentId === 'canvas') {
        // For canvas, insert at the specified index or append to the end
        const insertIndex = typeof targetIndex === 'number' ? targetIndex : updatedControls.length;
        console.log(`[QuestionnaireContext] Inserting control at canvas index: ${insertIndex}`);
        updatedControls.splice(insertIndex, 0, controlToMove);
      } else {
        // For container controls, find the target container and insert the control
        updatedControls = updatedControls.map(control => {
          if (control.id === targetParentId) {
            // Handle Tab containers
            if (control.type === ControlType.Tab && targetType === 'tab') {
              const tabCtrl = control as TabControl;
              const targetTabIndex = tabIndex ?? 0;
              
              console.log(`[QuestionnaireContext] Inserting into tab ${targetTabIndex} at position ${targetIndex}`);
              
              return {
                ...tabCtrl,
                tabs: tabCtrl.tabs.map((tab, idx) => {
                  if (idx === targetTabIndex) {
                    // If targetIndex is provided, insert at that position, otherwise append to the end
                    if (typeof targetIndex === 'number') {
                      const newControls = [...(tab.controls || [])];
                      newControls.splice(targetIndex, 0, controlToMove);
                      return { ...tab, controls: newControls };
                    } else {
                      return { ...tab, controls: [...(tab.controls || []), controlToMove] };
                    }
                  }
                  return tab;
                })
              } as TabControl;
            }
            
            // Handle Accordion containers
            if (control.type === ControlType.Accordion && targetType === 'accordion' && sectionId) {
              const accCtrl = control as AccordionControl;
              
              console.log(`[QuestionnaireContext] Inserting into accordion section ${sectionId} at position ${targetIndex}`);
              
              return {
                ...accCtrl,
                sections: accCtrl.sections.map(sec => {
                  if (sec.id === sectionId) {
                    // If targetIndex is provided, insert at that position, otherwise append to the end
                    if (typeof targetIndex === 'number') {
                      const newControls = [...(sec.controls || [])];
                      newControls.splice(targetIndex, 0, controlToMove);
                      return { ...sec, controls: newControls };
                    } else {
                      return { ...sec, controls: [...(sec.controls || []), controlToMove] };
                    }
                  }
                  return sec;
                })
              } as AccordionControl;
            }
            
            // Handle ColumnLayout containers
            if (control.type === ControlType.ColumnLayout && targetType === 'column' && typeof columnIndex === 'number') {
              const colCtrl = control as ColumnLayoutControl;
              
              console.log(`[QuestionnaireContext] Inserting into column ${columnIndex} at position ${targetIndex}`);
              
              return {
                ...colCtrl,
                columnControls: colCtrl.columnControls.map((col, idx) => {
                  if (idx === columnIndex) {
                    // If targetIndex is provided, insert at that position, otherwise append to the end
                    if (typeof targetIndex === 'number') {
                      const newControls = [...(col || [])];
                      newControls.splice(targetIndex, 0, controlToMove);
                      return newControls;
                    } else {
                      return [...(col || []), controlToMove];
                    }
                  }
                  return col;
                })
              } as ColumnLayoutControl;
            }
          }
          return control;
        });
      }

      console.log('[QuestionnaireContext] Control moved successfully');
      
      return {
        ...prev,
        controls: updatedControls,
        updatedAt: new Date()
      };
    });
  };

  const saveQuestionnaire = async () => {
    try {
      console.log("Saving questionnaire to database", questionnaire);
      localStorage.setItem('questionnaire', JSON.stringify(questionnaire));
    } catch (error) {
      console.error("Error saving questionnaire:", error);
    }
  };
  const loadQuestionnaire = async (id: string) => {
    try {
      console.log("Loading questionnaire", id);
      const saved = localStorage.getItem('questionnaire');
      if (saved) {
        setQuestionnaire(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading questionnaire:", error);
    }
  };
  
  // Function to directly update all controls in the questionnaire
  const updateQuestionnaireControls = (controls: Control[]) => {
    console.log('[DRAG-DEBUG] Direct update of questionnaire controls:', {
      before: questionnaire.controls.map(c => ({ id: c.id, type: c.type })),
      after: controls.map(c => ({ id: c.id, type: c.type }))
    });
    
    setQuestionnaire(prev => ({
      ...prev,
      controls: controls,
      updatedAt: new Date()
    }));
  };

  return (
    <QuestionnaireContext.Provider
      value={{
        questionnaire,
        activeTabIndex,
        selectedControlId,
        setActiveTabIndex,
        setSelectedControlId,
        addControl,
        updateControl,
        deleteControl,
        moveControl,
        saveQuestionnaire,
        loadQuestionnaire,
        updateQuestionnaireControls,
      }}
    >
      {children}
    </QuestionnaireContext.Provider>
  );
};

export const useQuestionnaire = () => {
  const context = useContext(QuestionnaireContext);
  if (!context) { 
    throw new Error('useQuestionnaire must be used within a QuestionnaireProvider');
  }
  return context; 
};
