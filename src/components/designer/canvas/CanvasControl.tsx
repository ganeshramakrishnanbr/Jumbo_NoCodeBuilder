import React, { useState, useEffect } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl, AccordionSection } from '../../../types';
import { Trash2, Settings, Move, Star } from 'lucide-react';
import { nanoid } from 'nanoid';

interface CanvasControlProps {
  control: Control;
}

const CanvasControl: React.FC<CanvasControlProps> = ({ control }) => {
  const { updateControl, deleteControl, selectedControlId, setSelectedControlId, moveControl } = useQuestionnaire();
  const { draggedItem, canDropIn, endDrag, startDrag, getSourceContainer, getSourceIndex } = useDragDrop();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [dragOverContainer, setDragOverContainer] = useState<string | null>(null);

  // useEffect to handle initialization of TabControl tabs
  useEffect(() => {
    if (control.type === ControlType.Tab) {
      const tabControl = control as TabControl;
      if (!tabControl.tabs || !Array.isArray(tabControl.tabs) || tabControl.tabs.length === 0) {
        const defaultTab = {
          id: nanoid(),
          label: 'New Tab',
          controls: []
        };
        // Check if control still exists before updating
        if (document.getElementById(control.id)) { 
            updateControl(control.id, { tabs: [defaultTab] } as Partial<TabControl>);
        }
      }
    }
  }, [control, updateControl]);

  // useEffect to handle initialization of ColumnLayoutControl columnControls
  useEffect(() => {
    if (control.type === ControlType.ColumnLayout) {
      const columnControl = control as ColumnLayoutControl;
      if (!columnControl.columnControls || !Array.isArray(columnControl.columnControls)) {
        const defaultColumns = Array(columnControl.columns || 2).fill(null).map(() => []);
         if (document.getElementById(control.id)) { 
            updateControl(control.id, { columnControls: defaultColumns } as Partial<ColumnLayoutControl>);
         }
      } else if (columnControl.columnControls.length !== (columnControl.columns || 2)) {
        const newColumnControls = Array(columnControl.columns || 2)
          .fill(null)
          .map((_, i) => columnControl.columnControls[i] || []);
        if (document.getElementById(control.id)) { 
            updateControl(control.id, { columnControls: newColumnControls } as Partial<ColumnLayoutControl>);
        }
      }
    }
  }, [control, updateControl]);

  // useEffect to handle initialization of AccordionControl sections
  useEffect(() => {
    if (control.type === ControlType.Accordion) {
      const accordionControl = control as AccordionControl;
      if (!accordionControl.sections || accordionControl.sections.length === 0) {
        const defaultSection: AccordionSection = {
          id: nanoid(),
          label: 'New Section',
          controls: []
        };
        if (document.getElementById(control.id)) { 
            updateControl(accordionControl.id, { sections: [defaultSection] } as Partial<AccordionControl>);
        }
      }
    }
  }, [control, updateControl]);

  // Helper function to clear drag indicators
  const clearDragIndicators = () => {
    const highlightedElements = document.querySelectorAll('.drag-over-highlight, .border-t-2, .border-b-2');
    highlightedElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.classList.remove('drag-over-highlight', 'border-t-2', 'border-b-2', 'border-blue-500');
      }
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedControlId(control.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete this ${control.type}?`)) {
      deleteControl(control.id);
    }
  };  // Track last logged drag event to prevent excessive logging
  const lastDragEventRef = React.useRef<{targetType: string, controlType: string, timestamp: number} | null>(null);
  
  // Enhanced drag over handler with standardized position detection
  const handleDragOver = (e: React.DragEvent, targetType?: string) => {
    e.preventDefault();
    
    // Skip if draggedItem is not defined
    if (!draggedItem) return;

    const now = Date.now();
    const lastEvent = lastDragEventRef.current;
    const currentTarget = e.currentTarget;
    
    // Only add highlight class if the target exists
    if (currentTarget && currentTarget instanceof HTMLElement) {
      currentTarget.classList.add('drag-over-highlight');
      
      // Store a reference to avoid closure issues
      const target = currentTarget;
      setTimeout(() => {
        // Check if element still exists in DOM before removing class
        if (target && document.body.contains(target)) {
          target.classList.remove('drag-over-highlight');
        }
      }, 300);
    }
    
    // Track which container we're dragging over
    if (targetType) {
      setDragOverContainer(targetType);
    }
    
    // Only log for critical special cases
    const isSpecialCase = draggedItem.controlType === ControlType.ColumnLayout;
    const isSignificantTimeElapsed = !lastEvent || now - lastEvent.timestamp > 3000;
    
    if (isSpecialCase && isSignificantTimeElapsed) {
      // Update the last logged event
      lastDragEventRef.current = {
        targetType: targetType || 'canvas',
        controlType: draggedItem.controlType,
        timestamp: now
      };
      
      console.log(`[CanvasControl] Dragging ${draggedItem.controlType} over ${targetType || 'unknown'}`);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: string, tabIndex?: number, columnIndex?: number, sectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[CanvasControl] handleDrop triggered', { 
      draggedItem, 
      targetType, 
      tabIndex, 
      columnIndex, 
      sectionId, 
      parentControlId: control.id,
      parentControlType: control.type 
    });

    if (draggedItem && canDropIn(targetType)) {
      if (draggedItem.isNew) {
        const newControlBase = {
          id: nanoid(),
          type: draggedItem.controlType,
          label: `New ${draggedItem.controlType}`,
          required: false,
          visible: true,
          enabled: true,        };
        
        let newControl: Control | ColumnLayoutControl = newControlBase;
        
        if (draggedItem.controlType === ControlType.ColumnLayout) {
            newControl = {
              ...newControlBase,
              type: ControlType.ColumnLayout, // Explicitly set type
              columns: 2, // Default columns
              columnControls: [[], []], // Initialize columnControls with empty arrays
              columnRatio: 'equal',
            } as ColumnLayoutControl;
            
            // Ensure the columnControls property is properly initialized as a valid array of arrays
            if (!Array.isArray((newControl as ColumnLayoutControl).columnControls) || 
                (newControl as ColumnLayoutControl).columnControls.length !== 2) {
              console.log('[CanvasControl] Ensuring proper columnControls initialization');
              (newControl as ColumnLayoutControl).columnControls = [[], []];
            }
            
            // Verify and fix any column arrays that aren't initialized as arrays
            (newControl as ColumnLayoutControl).columnControls = 
              (newControl as ColumnLayoutControl).columnControls.map(col => 
                Array.isArray(col) ? col : []
              );
              
            console.log('[CanvasControl] Creating new validated ColumnLayout:', {
              id: newControl.id,
              type: newControl.type,
              columns: (newControl as ColumnLayoutControl).columns,
              columnControlsLength: (newControl as ColumnLayoutControl).columnControls.length
            });
        }
        // ... (keep existing Address control specific logic if any)

        if (targetType === 'tab' && control.type === ControlType.Tab) {
          const tabControl = control as TabControl;
          if (!tabControl.tabs) {
            // This case should ideally be handled by the useEffect initialization
            console.warn('[CanvasControl] TabControl tabs not initialized on drop');
            return;
          }
          const updatedTabs = [...tabControl.tabs];
          if (updatedTabs[tabIndex || activeTabIndex]) {
            updatedTabs[tabIndex || activeTabIndex].controls.push(newControl);
            updateControl(control.id, { tabs: updatedTabs } as Partial<TabControl>);
          }
        } else if (targetType === 'column' && control.type === ControlType.ColumnLayout) {
          const columnControl = control as ColumnLayoutControl;
          if (!columnControl.columnControls) {
            // This case should ideally be handled by the useEffect initialization
            console.warn('[CanvasControl] ColumnControl columnControls not initialized on drop');
            return;
          }
          const updatedColumns = [...columnControl.columnControls];
          if (updatedColumns[columnIndex || 0]) {
            updatedColumns[columnIndex || 0].push(newControl);
            updateControl(control.id, { columnControls: updatedColumns } as Partial<ColumnLayoutControl>);
          }        } else if (targetType === 'accordion' && control.type === ControlType.Accordion && sectionId) {
          console.log('[CanvasControl] 🔍 CRITICAL PATH: Dropping NEW control into Accordion section:', sectionId, 'of Accordion:', control.id);
          console.log('[CanvasControl] 🔍 Control type being dropped:', draggedItem.controlType);
          
          const accordionControl = control as AccordionControl;
          
          // Deep log of the current accordion structure
          console.log('[CanvasControl] 🔍 Current accordion structure:', JSON.stringify({
            id: accordionControl.id,
            sections: accordionControl.sections.map(s => ({
              id: s.id,
              label: s.label,
              controlCount: s.controls.length
            }))
          }, null, 2));
          
          const updatedSections = accordionControl.sections.map(section => {
            if (section.id === sectionId) {
              console.log('[CanvasControl] 🔍 Found target section:', section.id);
              return {
                ...section,
                controls: [...section.controls, newControl]
              };
            }
            return section;
          });
          
          console.log('[CanvasControl] 🔍 Updating Accordion with new control in section');
          updateControl(control.id, { sections: updatedSections } as Partial<AccordionControl>);
        }      } else { // Logic for moving existing controls
        console.log('[CanvasControl] 🔍 MOVING EXISTING CONTROL', {
          draggedId: draggedItem.id,
          draggedType: draggedItem.controlType,
          targetType,
          targetId: control.id,
          targetControlType: control.type,
          sectionId
        });
        
        if (draggedItem.id && control.id) {
          // Enhanced logging for ColumnLayout to Accordion drop operation - CRITICAL PATH
          if (draggedItem.controlType === ControlType.ColumnLayout && targetType === 'accordion') {
            console.log('[CanvasControl] 🔍 CRITICAL PATH: Moving ColumnLayout to Accordion section');
            
            if (sectionId) {
              console.log(`[CanvasControl] 🔍 Target section identified: ${sectionId}`);
              
              try {
                // The parent ID for moveControl should be the Accordion control's ID.
                // The sectionId is passed to identify the target section within the accordion.
                console.log(`[CanvasControl] 🔍 CALLING moveControl with:`, {
                  draggedId: draggedItem.id,
                  targetId: control.id,
                  targetType,
                  sectionId
                });
                
                moveControl(draggedItem.id, control.id, targetType, undefined /* newIndex */, sectionId);
                console.log(`[CanvasControl] ✓ moveControl successfully called`);
              } catch (error) {
                console.error(`[CanvasControl] ❌ ERROR in moveControl:`, error);
              }
            } else {
              console.error('[CanvasControl] ❌ ERROR: Missing sectionId for accordion drop target');
            }
          } else if (targetType === 'accordion' && sectionId) {
            // Handling non-ColumnLayout controls to accordion
            console.log(`[CanvasControl] 🔍 Moving ${draggedItem.controlType} to accordion section ${sectionId}`);
            moveControl(draggedItem.id, control.id, targetType, undefined, sectionId);
          } else if (targetType === 'column' && columnIndex !== undefined) {
            console.log(`[CanvasControl] Moving to column ${columnIndex}`);
            moveControl(draggedItem.id, control.id, targetType, undefined, undefined, columnIndex);
          } else {
            console.warn('[CanvasControl] Move condition not met. TargetType:', targetType, 'SectionId:', sectionId, 'ColumnIndex:', columnIndex);
          }
        } else {
          console.warn('[CanvasControl] Missing draggedItem.id or control.id for move operation.');
        }
      }
      
      endDrag();
    }
  };

  const renderTabControl = (tabControl: TabControl) => {
    if (!tabControl.tabs || !Array.isArray(tabControl.tabs)) {
      return (
        <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm p-4">
          <p className="text-sm text-gray-500">Tab configuration is invalid</p>
        </div>
      );
    }

    const position = tabControl.position || 'top';
    
    const containerClasses = {
      top: 'flex flex-col',
      bottom: 'flex flex-col-reverse',
      left: 'flex',
      right: 'flex flex-row-reverse'
    }[position];

    const tabListClasses = {
      top: 'flex border-b bg-gray-50',
      bottom: 'flex border-t bg-gray-50',
      left: 'flex flex-col border-r bg-gray-50 w-48',
      right: 'flex flex-col border-l bg-gray-50 w-48'
    }[position];

    const tabClasses = (index: number) => {
      const isActive = index === activeTabIndex;
      const baseClasses = 'relative px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer';
      const activeClasses = isActive ? 'text-blue-600 bg-white shadow-sm' : '';
      const inactiveClasses = !isActive ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-50' : '';
      const dragClasses = draggedItem && canDropIn('tab') ? 'hover:border-blue-500 hover:bg-blue-50' : '';
      
      const positionClasses = {
        top: isActive ? 'border-b-2 border-blue-500 -mb-px' : '',
        bottom: isActive ? 'border-t-2 border-blue-500 -mt-px' : '',
        left: isActive ? 'border-r-2 border-blue-500 -mr-px' : '',
        right: isActive ? 'border-l-2 border-blue-500 -ml-px' : ''
      }[position];

      return `${baseClasses} ${activeClasses} ${inactiveClasses} ${positionClasses} ${dragClasses}`;
    };

  // Enhanced tab drop handler with better error handling
  const handleTabDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[CanvasControl] Tab drop event triggered', { 
      draggedItem, 
      canDrop: draggedItem && canDropIn('tab'),
      tabIndex: index,
      dragOverPosition
    });
    
    if (draggedItem && canDropIn('tab')) {
      try {
        setActiveTabIndex(index);
        
        // If we have a dragOverPosition, use it as the targetIndex
        if (typeof dragOverPosition === 'number') {
          console.log(`[CanvasControl] Moving control to tab ${index} at position ${dragOverPosition}`);
          moveControl(draggedItem.id, control.id, 'tab', dragOverPosition, undefined, index);
        } else {
          console.log(`[CanvasControl] Appending control to tab ${index}`);
          moveControl(draggedItem.id, control.id, 'tab', undefined, undefined, index);
        }
        
        // Clear state
        setDragOverPosition(null);
        setDragOverContainer(null);
        
        // Remove any lingering visual indicators
        clearDragIndicators();
      } catch (error) {
        console.error('[CanvasControl] Error in handleTabDrop:', error);
      }
    }
  };

    return (
      <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className={containerClasses}>
          <div className={tabListClasses}>
            {tabControl.tabs?.map((tab, index) => (
              <div
                key={tab?.id || index}
                onClick={() => setActiveTabIndex(index)}
                onDragOver={(e) => {
                  if (draggedItem && canDropIn('tab')) {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                  }
                }}
                onDrop={(e) => handleTabDrop(e, index)}
                className={tabClasses(index)}
              >
                <div className="flex items-center justify-between">
                  <span>{tab?.label || `Tab ${index + 1}`}</span>
                  {draggedItem && canDropIn('tab') && (
                    <span className="ml-2 text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      {tab?.controls?.length ?? 0}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex-1 p-4 bg-white">
            {tabControl.tabs[activeTabIndex]?.controls?.map((childControl, index) => (
              <div
                key={childControl.id}
                draggable
                onDragStart={() => startDrag({
                  id: childControl.id,
                  type: 'existing',
                  controlType: childControl.type,
                  sourceId: control.id,
                  sourceIndex: index
                })}
                onDragOver={(e) => {
                  if (draggedItem && canDropIn('tab')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Determine if we're dragging over the top or bottom half of the control
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = e.clientY;
                    const relativeY = y - rect.top;
                    const isTopHalf = relativeY < rect.height / 2;
                    
                    // Set the position where the dragged item should be inserted
                    const newPosition = isTopHalf ? index : index + 1;
                    
                    // Only update if position changed to avoid unnecessary re-renders
                    if (dragOverPosition !== newPosition || dragOverContainer !== 'tab') {
                      // Remove existing highlights first
                      const highlightedElements = document.querySelectorAll('.border-t-2, .border-b-2');
                      highlightedElements.forEach(el => {
                        if (el instanceof HTMLElement && el !== e.currentTarget) {
                          el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                        }
                      });
                      
                      setDragOverPosition(newPosition);
                      setDragOverContainer('tab');
                      
                      // Add visual indicator
                      e.currentTarget.classList.remove('border-t-2', 'border-b-2');
                      e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
                      
                      console.log(`[CanvasControl] Tab content drag over position: ${newPosition}`);
                    }
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  console.log('[CanvasControl] Drop on tab content', {
                    draggedItem,
                    position: dragOverPosition,
                    tabIndex: activeTabIndex,
                    sourceContainer: getSourceContainer(),
                    sourceIndex: getSourceIndex()
                  });
                  
                  if (draggedItem && canDropIn('tab')) {
                    try {
                      // Check if we're reordering within the same tab
                      const isSameTabReordering = 
                        draggedItem.sourceId === control.id && 
                        getSourceContainer() === 'container';
                      
                      if (typeof dragOverPosition === 'number') {
                        moveControl(draggedItem.id, control.id, 'tab', dragOverPosition, undefined, activeTabIndex);
                        console.log(`[CanvasControl] Moved control to position ${dragOverPosition} in tab ${activeTabIndex}`);
                      } else {
                        // If no position is set, append to the end
                        const tabControl = control as TabControl;
                        const targetPosition = tabControl.tabs[activeTabIndex]?.controls?.length || 0;
                        moveControl(draggedItem.id, control.id, 'tab', targetPosition, undefined, activeTabIndex);
                        console.log(`[CanvasControl] Appended control to end of tab ${activeTabIndex}`);
                      }
                      
                      // Clear state
                      setDragOverPosition(null);
                      setDragOverContainer(null);
                      endDrag();
                    } catch (error) {
                      console.error('[CanvasControl] Error in tab content drop:', error);
                    }
                  }
                  
                  // Clear visual indicators
                  clearDragIndicators();
                }}
                className="relative mb-2 last:mb-0"
              >
                <CanvasControl control={childControl} />
              </div>
            ))}
            
            {/* Empty drop area at the end of the tab content */}
            <div 
              className={`mt-4 p-4 border-2 border-dashed rounded-lg ${draggedItem && canDropIn('tab') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={(e) => {
                if (draggedItem && canDropIn('tab')) {
                  e.preventDefault();
                  setDragOverPosition(tabControl.tabs[activeTabIndex]?.controls?.length || 0);
                  e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
                }
              }}
              onDragLeave={(e) => {
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (draggedItem && canDropIn('tab')) {
                  const targetPosition = tabControl.tabs[activeTabIndex]?.controls?.length || 0;
                  moveControl(draggedItem.id, control.id, 'tab', targetPosition, undefined, activeTabIndex);
                  setDragOverPosition(null);
                  endDrag();
                }
                
                if (e.currentTarget instanceof HTMLElement) {
                  e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                }
              }}
            >
              <div className="text-center text-gray-500">
                {tabControl.tabs[activeTabIndex]?.controls?.length ? 'Drop here to add at the end' : 'Drop controls here'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderColumnLayoutControl = (columnControl: ColumnLayoutControl) => {
    if (!columnControl.columnControls || !Array.isArray(columnControl.columnControls) || columnControl.columnControls.length !== (columnControl.columns || 2)) {
      return (
        <div className="text-gray-400 text-center p-6 border-2 border-dashed rounded-lg">
          Initializing columns...
        </div>
      ); 
    }

    const columnWidth = `${100 / (columnControl.columns || 2)}%`;

    return (
      <div className="flex flex-row gap-4">
        {Array.from({ length: columnControl.columns || 2 }).map((_, columnIndex) => (
          <div 
            key={columnIndex} 
            className="border rounded-md p-4 bg-white"
            style={{ width: columnWidth }}
            onDragOver={(e) => handleDragOver(e, 'column')}
            onDrop={(e) => {
              // Handle drops directly on the column (not on a specific position)
              if (draggedItem && !dragOverPosition) {
                handleDrop(e, 'column', undefined, columnIndex);
              }
            }}
          >
            <div className="text-sm text-gray-500 mb-2">Column {columnIndex + 1}</div>
            {columnControl.columnControls[columnIndex]?.length > 0 ? (
              <div className="space-y-2">
                {columnControl.columnControls[columnIndex].map((childControl, controlIndex) => (
                  <div
                    key={childControl.id}
                    draggable
                    onDragStart={() => startDrag({
                      id: childControl.id,
                      type: 'existing',
                      controlType: childControl.type,
                      sourceId: control.id,
                      sourceIndex: controlIndex
                    })}
                    onDragOver={(e) => {
                      if (draggedItem && canDropIn('column')) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Determine if we're dragging over the top or bottom half of the control
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY;
                        const relativeY = y - rect.top;
                        const isTopHalf = relativeY < rect.height / 2;
                        
                        // Set the position where the dragged item should be inserted
                        const newPosition = isTopHalf ? controlIndex : controlIndex + 1;
                        
                        // Only update if position changed to avoid unnecessary re-renders
                        if (dragOverPosition !== newPosition || dragOverContainer !== 'column') {
                          // Remove existing highlights first
                          const highlightedElements = document.querySelectorAll('.border-t-2, .border-b-2');
                          highlightedElements.forEach(el => {
                            if (el instanceof HTMLElement && el !== e.currentTarget) {
                              el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                            }
                          });
                          
                          setDragOverPosition(newPosition);
                          setDragOverContainer('column');
                          
                          // Add visual indicator
                          e.currentTarget.classList.remove('border-t-2', 'border-b-2');
                          e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
                          
                          console.log(`[CanvasControl] Column content drag over position: ${newPosition} in column ${columnIndex}`);
                        }
                      }
                    }}
                    onDragLeave={(e) => {
                      if (e.currentTarget instanceof HTMLElement) {
                        e.currentTarget.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      console.log('[CanvasControl] Drop on column content', {
                        draggedItem,
                        position: dragOverPosition,
                        columnIndex,
                        sourceContainer: getSourceContainer(),
                        sourceIndex: getSourceIndex()
                      });
                      
                      if (draggedItem && canDropIn('column')) {
                        try {
                          // Check if we're reordering within the same column
                          const isSameColumnReordering = 
                            draggedItem.sourceId === control.id && 
                            getSourceContainer() === 'container';
                          
                          if (typeof dragOverPosition === 'number') {
                            moveControl(draggedItem.id, control.id, 'column', dragOverPosition, undefined, undefined, columnIndex);
                            console.log(`[CanvasControl] Moved control to position ${dragOverPosition} in column ${columnIndex}`);
                          } else {
                            // If no position is set, append to the end
                            const columnControl = control as ColumnLayoutControl;
                            const targetPosition = columnControl.columnControls[columnIndex]?.length || 0;
                            moveControl(draggedItem.id, control.id, 'column', targetPosition, undefined, undefined, columnIndex);
                            console.log(`[CanvasControl] Appended control to end of column ${columnIndex}`);
                          }
                          
                          // Clear state
                          setDragOverPosition(null);
                          setDragOverContainer(null);
                          endDrag();
                        } catch (error) {
                          console.error('[CanvasControl] Error in column content drop:', error);
                        }
                      }
                      
                      // Clear visual indicators
                      clearDragIndicators();
                    }}
                    className="relative mb-2 last:mb-0"
                  >
                    <CanvasControl control={childControl} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center p-4 border-2 border-dashed rounded-lg">
                Drop controls here
              </div>
            )}
            
            {/* Empty drop area at the end of the column */}
            {columnControl.columnControls[columnIndex]?.length > 0 && (
              <div 
                className={`mt-4 p-4 border-2 border-dashed rounded-lg ${draggedItem && canDropIn('column') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                onDragOver={(e) => {
                  if (draggedItem && canDropIn('column')) {
                    e.preventDefault();
                    setDragOverPosition(columnControl.columnControls[columnIndex]?.length || 0);
                    e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (draggedItem && canDropIn('column')) {
                    const targetPosition = columnControl.columnControls[columnIndex]?.length || 0;
                    moveControl(draggedItem.id, control.id, 'column', targetPosition, undefined, undefined, columnIndex);
                    setDragOverPosition(null);
                    endDrag();
                  }
                  
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                  }
                }}
              >
                <div className="text-center text-gray-500">
                  Drop here to add at the end
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAddressControl = () => {
    if (control.type !== ControlType.Address || !control.properties?.fields) {
      return null;
    }

    return (
      <div className="space-y-4">
        {control.properties.fields.map((field: any) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === 'textBox' ? (
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={field.label}
              />
            ) : (
              <select className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option value="">Select {field.label}</option>
                {field.options?.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAccordionControl = (accordionControl: AccordionControl) => {
    if (!accordionControl.sections || accordionControl.sections.length === 0) {
      return (
        <div className="text-gray-400 text-center p-6 border-2 border-dashed rounded-lg">
          Initializing sections...
        </div>
      ); 
    }

    return (
      <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm">
        {accordionControl.sections.map((section /*, sectionIndex*/) => ( // sectionIndex marked as unused
          <div key={section.id} className="border-b last:border-b-0">
            <div 
              className="px-4 py-3 bg-gray-50 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              onClick={() => {
                const expandedSections = accordionControl.expandedSections?.includes(section.id)
                  ? accordionControl.expandedSections.filter(id => id !== section.id)
                  : [...(accordionControl.expandedSections || []), section.id];
                updateControl(accordionControl.id, { expandedSections } as Partial<AccordionControl>);
              }}
            >
              {section.label}
              <span>{accordionControl.expandedSections?.includes(section.id) ? '-' : '+'}</span>
            </div>            {accordionControl.expandedSections?.includes(section.id) && (                <div 
                  className="p-4 bg-white"
                  data-section-id={section.id}
                  onDragOver={(e) => {
                    // Enhanced drag-over handling for accordion sections
                    if (draggedItem && canDropIn('accordion')) {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Check if the dragged control is a column layout
                      const isColumnLayout = draggedItem.controlType === ControlType.ColumnLayout;
                      
                      // Apply appropriate visual styles - more prominent for ColumnLayout
                      if (isColumnLayout) {
                        e.currentTarget.classList.add('bg-blue-100', 'border-2', 'border-blue-500', 'border-dashed');
                        
                        // Only log ColumnLayout over accordion section to reduce noise
                        const now = Date.now();
                        const lastEvent = lastDragEventRef.current;
                        
                        if (!lastEvent || now - lastEvent.timestamp > 1000) {
                          lastDragEventRef.current = {
                            targetType: 'accordion',
                            controlType: draggedItem.controlType,
                            timestamp: now
                          };
                          console.log(`[CanvasControl] PRIORITY: ColumnLayout being dragged over accordion section ${section.id}`);
                        }
                      } else {
                        e.currentTarget.classList.add('bg-blue-50', 'border-2', 'border-blue-300', 'border-dashed');
                      }
                    }
                  }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('bg-blue-50', 'bg-blue-100', 'border-2', 'border-blue-300', 'border-blue-500', 'border-dashed');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('bg-blue-50', 'bg-blue-100', 'border-2', 'border-blue-300', 'border-blue-500', 'border-dashed');
                  
                  // Log drop attempt for debugging
                  console.log(`[CanvasControl] DROP ATTEMPT on accordion section ${section.id}`, {
                    draggedItem,
                    controlType: draggedItem?.controlType,
                    targetSectionId: section.id,
                    targetControlId: control.id
                  });
                  
                  // Call handleDrop with the accordion targetType
                  handleDrop(e, 'accordion', undefined, undefined, section.id);
                }}
              >                {section.controls.length === 0 ? (
                  <div className="text-gray-400 text-center p-6 border-2 border-dashed rounded-lg">
                    <p>Drop controls here to add to this section</p>
                    <p className="mt-2 text-sm font-semibold text-blue-500">✓ Column Layouts can be dropped here!</p>
                  </div>
                ) : (                  <div className="space-y-3">
                    {section.controls.map((childControl, controlIndex) => {
                      // Special validation for ColumnLayout controls
                      if (childControl.type === ControlType.ColumnLayout) {
                        const colLayout = childControl as ColumnLayoutControl;
                        
                        // Check if columnControls is properly initialized
                        if (!colLayout.columnControls || !Array.isArray(colLayout.columnControls)) {
                          console.warn(`[CanvasControl] ColumnLayout ${childControl.id} has invalid columnControls in accordion section ${section.id}`);
                          
                          // Auto-fix the structure if possible
                          setTimeout(() => {
                            try {
                              // Initialize with proper empty columns structure
                              const fixedColumnControls = Array(colLayout.columns || 2).fill(null).map(() => []);
                              updateControl(childControl.id, { 
                                columnControls: fixedColumnControls 
                              } as Partial<ColumnLayoutControl>);
                              console.log(`[CanvasControl] Auto-fixed ColumnLayout structure for ${childControl.id}`);
                            } catch (err) {
                              console.error(`[CanvasControl] Failed to auto-fix ColumnLayout: ${err}`);
                            }
                          }, 0);
                          
                          // Show warning message while fixing
                          return (
                            <div key={childControl.id} className="p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
                              <p className="font-medium text-yellow-800">ColumnLayout structure issue</p>
                              <p className="text-xs text-yellow-700">Attempting to repair... please wait</p>
                            </div>
                          );
                        }
                        
                        // Make sure column count matches
                        if (colLayout.columnControls.length !== (colLayout.columns || 2)) {
                          console.warn(`[CanvasControl] ColumnLayout ${childControl.id} has mismatched column count`);
                          
                          // Auto-fix the column count
                          setTimeout(() => {
                            try {
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
                              
                              updateControl(childControl.id, { 
                                columnControls: newColumnControls 
                              } as Partial<ColumnLayoutControl>);
                              console.log(`[CanvasControl] Auto-fixed column count for ColumnLayout ${childControl.id}`);
                            } catch (err) {
                              console.error(`[CanvasControl] Failed to fix column count: ${err}`);
                            }
                          }, 0);
                        }
                        
                        // Make sure each column is an array
                        const hasInvalidColumns = colLayout.columnControls.some(col => !Array.isArray(col));
                        if (hasInvalidColumns) {
                          console.warn(`[CanvasControl] ColumnLayout ${childControl.id} has non-array columns`);
                          
                          // Auto-fix the columns
                          setTimeout(() => {
                            try {
                              const fixedColumns = colLayout.columnControls.map(col => 
                                Array.isArray(col) ? col : []
                              );
                              updateControl(childControl.id, { 
                                columnControls: fixedColumns 
                              } as Partial<ColumnLayoutControl>);
                              console.log(`[CanvasControl] Auto-fixed column arrays for ColumnLayout ${childControl.id}`);
                            } catch (err) {
                              console.error(`[CanvasControl] Failed to fix column arrays: ${err}`);
                            }
                          }, 0);
                        }
                      }
                      
                      // Render the control with drag and drop reordering capabilities
                      return (
                        <div
                          key={childControl.id}
                          draggable
                          onDragStart={() => startDrag({
                            id: childControl.id,
                            type: 'existing',
                            controlType: childControl.type,
                            sourceId: control.id,
                            sourceIndex: controlIndex
                          })}
                          onDragOver={(e) => {
                            if (draggedItem && canDropIn('accordion')) {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              // Determine if we're dragging over the top or bottom half of the control
                              const rect = e.currentTarget.getBoundingClientRect();
                              const y = e.clientY;
                              const relativeY = y - rect.top;
                              const isTopHalf = relativeY < rect.height / 2;
                              
                              // Set the position where the dragged item should be inserted
                              const newPosition = isTopHalf ? controlIndex : controlIndex + 1;
                              
                              // Only update if position changed to avoid unnecessary re-renders
                              if (dragOverPosition !== newPosition || dragOverContainer !== 'accordion') {
                                // Remove existing highlights first
                                const highlightedElements = document.querySelectorAll('.border-t-2, .border-b-2');
                                highlightedElements.forEach(el => {
                                  if (el instanceof HTMLElement && el !== e.currentTarget) {
                                    el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                                  }
                                });
                                
                                setDragOverPosition(newPosition);
                                setDragOverContainer('accordion');
                                
                                // Add visual indicator
                                e.currentTarget.classList.remove('border-t-2', 'border-b-2');
                                e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
                                
                                console.log(`[CanvasControl] Accordion content drag over position: ${newPosition} in section ${section.id}`);
                              }
                            }
                          }}
                          onDragLeave={(e) => {
                            if (e.currentTarget instanceof HTMLElement) {
                              e.currentTarget.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            console.log('[CanvasControl] Drop on accordion content', {
                              draggedItem,
                              position: dragOverPosition,
                              sectionId: section.id,
                              sourceContainer: getSourceContainer(),
                              sourceIndex: getSourceIndex()
                            });
                            
                            if (draggedItem && canDropIn('accordion')) {
                              try {
                                // Check if we're reordering within the same accordion section
                                const isSameAccordionReordering = 
                                  draggedItem.sourceId === control.id && 
                                  getSourceContainer() === 'container';
                                
                                if (typeof dragOverPosition === 'number') {
                                  moveControl(draggedItem.id, control.id, 'accordion', dragOverPosition, section.id);
                                  console.log(`[CanvasControl] Moved control to position ${dragOverPosition} in accordion section ${section.id}`);
                                } else {
                                  // If no position is set, append to the end
                                  const targetPosition = section.controls.length || 0;
                                  moveControl(draggedItem.id, control.id, 'accordion', targetPosition, section.id);
                                  console.log(`[CanvasControl] Appended control to end of accordion section ${section.id}`);
                                }
                                
                                // Clear state
                                setDragOverPosition(null);
                                setDragOverContainer(null);
                                endDrag();
                              } catch (error) {
                                console.error('[CanvasControl] Error in accordion content drop:', error);
                              }
                            }
                            
                            // Clear visual indicators
                            clearDragIndicators();
                          }}
                          className="relative mb-2 last:mb-0"
                        >
                          <CanvasControl control={childControl} />
                        </div>
                      );
                    })}
                    
                    {/* Empty drop area at the end of the accordion section */}
                    <div 
                      className={`mt-4 p-4 border-2 border-dashed rounded-lg ${draggedItem && canDropIn('accordion') ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                      onDragOver={(e) => {
                        if (draggedItem && canDropIn('accordion')) {
                          e.preventDefault();
                          setDragOverPosition(section.controls.length || 0);
                          e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
                        }
                      }}
                      onDragLeave={(e) => {
                        if (e.currentTarget instanceof HTMLElement) {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (draggedItem && canDropIn('accordion')) {
                          const targetPosition = section.controls.length || 0;
                          moveControl(draggedItem.id, control.id, 'accordion', targetPosition, section.id);
                          setDragOverPosition(null);
                          endDrag();
                        }
                        
                        if (e.currentTarget instanceof HTMLElement) {
                          e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
                        }
                      }}
                    >
                      <div className="text-center text-gray-500">
                        Drop here to add at the end
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-all duration-200 relative
        ${selectedControlId === control.id ? 'ring-2 ring-blue-500' : ''} 
        ${draggedItem && canDropIn(control.type === ControlType.Tab ? 'tab' : control.type) ? 'hover:border-blue-500 hover:ring-1 hover:ring-blue-300' : ''}`
      }
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="cursor-move mr-2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50">
            <Move size={16} />
          </span>
          <h3 className="font-medium text-gray-900">{control.label || control.type}</h3>
        </div>
        
        <div className="flex space-x-2">
          <button
            className={`p-1.5 rounded-md ${control.required ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600 hover:bg-gray-50`}
            title={control.required ? 'Required' : 'Optional'}
            onClick={(e) => {
              e.stopPropagation();
              updateControl(control.id, { required: !control.required } as Partial<Control>); // Ensure this is Partial<Control>
            }}
          >
            <Star size={16} />
          </button>
          <button
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
            title="Delete"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-3">Type: {control.type}</div>
      
      {control.type === ControlType.Tab && renderTabControl(control as TabControl)}
      {control.type === ControlType.ColumnLayout && renderColumnLayoutControl(control as ColumnLayoutControl)}
      {control.type === ControlType.Address && renderAddressControl()}
      {control.type === ControlType.Accordion && renderAccordionControl(control as AccordionControl)}
    </div>
  );
};

export default CanvasControl;
