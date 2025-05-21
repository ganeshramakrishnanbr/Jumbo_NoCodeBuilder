import React, { useRef, useState, useEffect } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { Control, ControlType } from '../../../types';
import CanvasControl from './CanvasControl';
import { nanoid } from 'nanoid';
import { forceUIRefresh, moveFirstControl, moveParentControl, logQuestionnaireState } from '../../../utils/dragDropUtils';

const DesignCanvas: React.FC = () => {
  const { questionnaire, addControl, moveControl, updateQuestionnaireControls } = useQuestionnaire();
  const { draggedItem, canDropIn, startDrag, endDrag, getSourceContainer, getSourceIndex } = useDragDrop();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedControlIndex, setDraggedControlIndex] = useState<number | null>(null);
    // Enhanced logging to track drag operations
  useEffect(() => {
    console.log('[DRAG-DEBUG] Current questionnaire state:', {
      controlCount: questionnaire.controls.length,
      controls: questionnaire.controls.map((c: Control) => ({ id: c.id, type: c.type, label: c.label }))
    });
  }, [questionnaire.controls]);

  // Reset draggedControlIndex when draggedItem changes
  useEffect(() => {
    if (!draggedItem) {
      setDraggedControlIndex(null);
    } else {
      console.log('[DRAG-DEBUG] Drag item changed:', {
        id: draggedItem.id,
        type: draggedItem.type,
        controlType: draggedItem.controlType,
        sourceIndex: draggedItem.sourceIndex
      });
    }
  }, [draggedItem]);
    // Force UI refresh when questionnaire structure changes
  useEffect(() => {
    // Log the current questionnaire state
    logQuestionnaireState(questionnaire.controls);
    
    // Force UI refresh using utility function
    forceUIRefresh(canvasRef.current);
  }, [questionnaire.controls]);

  // Helper function to determine drag position based on mouse position
  const determineDragPosition = (e: React.DragEvent<HTMLDivElement>, controlRect: DOMRect) => {
    const mouseY = e.clientY;
    const relativeY = mouseY - controlRect.top;
    const isTopHalf = relativeY < controlRect.height / 2;
    return isTopHalf ? 'before' : 'after';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggedItem && canDropIn('canvas')) {
      e.preventDefault();
      
      // If we're dragging an existing control (not a new one from the palette)
      // determine where it should be placed based on mouse position
      if (!draggedItem.isNew) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {          const mouseY = e.clientY;
          
          // Find the closest control to the mouse position
          let minDistance = Number.MAX_VALUE;
          
          const controlElements = Array.from(
            canvasRef.current?.querySelectorAll('.canvas-control-wrapper') || []
          );
          
          // If there are no controls or mouse is below all controls, place at the end
          if (controlElements.length === 0 || mouseY > canvasRect.bottom - 20) {
            setDragOverIndex(questionnaire.controls.length);
            
            // Clear existing indicators when dropping at the end
            clearVisualIndicators();
            return;
          }
          
          controlElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const elementMiddle = rect.top + rect.height / 2;
            const distance = Math.abs(mouseY - elementMiddle);
            
            if (distance < minDistance) {
              minDistance = distance;
              
              // Determine if we should place before or after this control
              const position = determineDragPosition(e, rect);
              if (position === 'before') {
                setDragOverIndex(index);
              } else {
                setDragOverIndex(index + 1);
              }
            }
          });
          
          // Add visual indicators based on dragOverIndex
          updateVisualIndicators(controlElements);
          
          console.log('[DesignCanvas] Drag over index:', dragOverIndex, 'Dragged control index:', draggedControlIndex);
        }
      }
    }
  };

  // Update visual indicators for all controls
  const updateVisualIndicators = (elements: Element[]) => {
    if (dragOverIndex === null) return;
    
    // Clear existing indicators
    elements.forEach((el, index) => {
      if (el instanceof HTMLElement) {
        el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
        
        // Add indicator based on drop position
        if (index === dragOverIndex) {
          el.classList.add('border-t-2', 'border-blue-500');
        } else if (index === dragOverIndex - 1) {
          el.classList.add('border-b-2', 'border-blue-500');
        }
      }
    });
  };

  // Modified handleDrop method to use moveParentControl utility
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[DesignCanvas] Drop event triggered', { 
      draggedItem, 
      canDrop: draggedItem && canDropIn('canvas'),
      dragOverIndex,
      draggedControlIndex,
      sourceContainer: getSourceContainer(),
      sourceIndex: getSourceIndex()
    });

    if (draggedItem && canDropIn('canvas')) {
      try {
        if (draggedItem.isNew) {
          const label = `New ${draggedItem.controlType}`;
          let controlData: any = {
            type: draggedItem.controlType,
            label,
            required: false,
            visible: true,
            enabled: true,
          };

          // For ColumnLayout, set default columns
          if (draggedItem.controlType === ControlType.ColumnLayout) {
            Object.assign(controlData, {
              columns: 2,
              columnControls: [[], []],
              columnRatio: 'equal'
            });
          }

          // Add default fields for Address control
          if (draggedItem.controlType === ControlType.Address) {
            controlData = {
              ...controlData,
              label: 'Address',
              properties: {
                fields: [
                  {
                    id: nanoid(),
                    type: 'textBox',
                    label: 'Address Line 1',
                    required: true,
                    validation: {
                      minLength: 5,
                      maxLength: 100,
                    }
                  },
                  {
                    id: nanoid(),
                    type: 'textBox',
                    label: 'Address Line 2',
                    required: false,
                    validation: {
                      maxLength: 100,
                    }
                  },
                  {
                    id: nanoid(),
                    type: 'textBox',
                    label: 'City',
                    required: true,
                    validation: {
                      minLength: 2,
                      maxLength: 50,
                    }
                  },
                  {
                    id: nanoid(),
                    type: 'dropdown',
                    label: 'State',
                    required: true,
                    options: [
                      { value: 'AL', label: 'Alabama' },
                      { value: 'AK', label: 'Alaska' },
                      // Add all US states here
                    ]
                  },
                  {
                    id: nanoid(),
                    type: 'textBox',
                    label: 'ZIP Code',
                    required: true,
                    validation: {
                      pattern: '^\\d{5}(-\\d{4})?$',
                      message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                    }
                  },
                  {
                    id: nanoid(),
                    type: 'dropdown',
                    label: 'Country',
                    required: true,
                    defaultValue: 'US',
                    options: [
                      { value: 'US', label: 'United States' },
                      { value: 'CA', label: 'Canada' },
                      // Add more countries as needed
                    ]
                  }
                ]
              }
            };
          }
          
          // If we have a dragOverIndex, add the control at that position
          if (typeof dragOverIndex === 'number') {
            console.log('[DesignCanvas] Adding new control at index:', dragOverIndex);
            // We need to add the control first, then move it to the correct position
            addControl(controlData);
            // The new control will be at the end, so we need to move it to the dragOverIndex
            const newControlId = questionnaire.controls[questionnaire.controls.length - 1].id;
            moveControl(newControlId, 'canvas', 'canvas', dragOverIndex);
          } else {
            // Just add to the end if no specific position
            addControl(controlData);
          }        } else {
          // We're reordering an existing control
          console.log('[DRAG-DEBUG] Reordering existing control, source container:', getSourceContainer());
          
          if (typeof dragOverIndex === 'number') {
            // Skip if trying to drop at the same position
            if (draggedControlIndex !== null && dragOverIndex === draggedControlIndex) {
              console.log('[DesignCanvas] Skipping move - same position');
            } 
            // Skip if trying to drop right after the dragged control
            else if (draggedControlIndex !== null && 
                     dragOverIndex === draggedControlIndex + 1 &&
                     // Allow moving the first control to the second position
                     !(draggedControlIndex === 0 && dragOverIndex === 1)) {
              console.log('[DesignCanvas] Skipping move - adjacent position');
            }
            else {
              console.log('[DRAG-DEBUG] Moving control to index:', dragOverIndex, {
                controlId: draggedItem.id,
                controlType: draggedItem.controlType,
                draggedControlIndex,
                sourceIndex: getSourceIndex()
              });
                
              // Special handling for first position controls
              if (draggedControlIndex === 0) {
                console.log('[DRAG-DEBUG] Special handling for first control movement');
                const updatedControls = moveFirstControl(questionnaire.controls, dragOverIndex);
                updateQuestionnaireControls(updatedControls);
              }
              // Special handling for parent controls (Tab, Accordion, ColumnLayout)
              else if ([ControlType.Tab, ControlType.Accordion, ControlType.ColumnLayout].includes(draggedItem.controlType)) {
                console.log('[DRAG-DEBUG] Using moveParentControl utility for:', draggedItem.controlType);
                const updatedControls = moveParentControl(questionnaire.controls, draggedItem.id, dragOverIndex);
                updateQuestionnaireControls(updatedControls);
              }
              else {
                // Normal handling for other controls
                moveControl(draggedItem.id, 'canvas', 'canvas', dragOverIndex);
              }
            }
          } else {
            console.log('[DesignCanvas] No dragOverIndex, appending to end');
            const targetPosition = questionnaire.controls.length;
            moveControl(draggedItem.id, 'canvas', 'canvas', targetPosition);
          }
        }
        
        // Clear the drag state
        setDragOverIndex(null);
        setDraggedControlIndex(null);
        endDrag();
        
        // Remove any lingering visual indicators
        clearVisualIndicators();
      } catch (error) {
        console.error('[DesignCanvas] Error in canvas drop:', error);
      }
    }
  };
  // Helper function to clear visual indicators
  const clearVisualIndicators = () => {
    const highlightedElements = document.querySelectorAll('.drag-over-highlight, .border-t-2, .border-b-2');
    highlightedElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.classList.remove('drag-over-highlight', 'border-t-2', 'border-b-2', 'border-blue-500');
      }
    });
  };const groupControls = () => {
    const groups: {
      columnLayouts: Control[];
      tabControls: Control[];  // Add tabs specifically
      otherControls: Control[];
    } = {
      columnLayouts: [],
      tabControls: [],   // Add tabs specifically
      otherControls: [],
    };

    // First, preserve the original order for index tracking
    const originalOrderMap = new Map<string, number>();
    questionnaire.controls.forEach((control, index) => {
      originalOrderMap.set(control.id, index);
    });

    questionnaire.controls.forEach(control => {
      if (control.type === ControlType.ColumnLayout) {
        groups.columnLayouts.push(control);
      } else if (control.type === ControlType.Tab) {
        groups.tabControls.push(control);  // Handle tabs specifically
      } else {
        groups.otherControls.push(control);
      }
    });

    return { ...groups, originalOrderMap };
  };
  const { columnLayouts, tabControls, otherControls, originalOrderMap } = groupControls();

  // Get the flat list of all controls in order
  const allControls = [...columnLayouts, ...tabControls, ...otherControls];
  const renderDraggableControl = (control: Control, index: number, isColumn = false) => {
    // Calculate the actual index in the full controls array
    const actualIndex = control.type === ControlType.Tab && originalOrderMap.has(control.id)
      ? originalOrderMap.get(control.id)! // Use original position for Tab controls
      : allControls.findIndex(c => c.id === control.id);
    
    console.log(`[DesignCanvas] Rendering control: ${control.type} with index ${index}, actualIndex: ${actualIndex}`);
    
    const controlWrapper = (
      <div 
        key={control.id}
        className={`relative canvas-control-wrapper ${isColumn ? 'flex-1' : ''} ${
          dragOverIndex === actualIndex 
            ? 'border-t-2 border-blue-500' 
            : dragOverIndex === actualIndex + 1 
              ? 'border-b-2 border-blue-500' 
              : ''
        }`}
        style={isColumn ? { minWidth: '300px' } : undefined}
        draggable        onDragStart={(e) => {
          // Set dragged element data
          e.dataTransfer.setData('text/plain', control.id);
          e.dataTransfer.effectAllowed = 'move';

          // Always use the index in questionnaire.controls for sourceIndex
          const sourceIndex = questionnaire.controls.findIndex(c => c.id === control.id);

          // Store the index of the control being dragged
          setDraggedControlIndex(sourceIndex);

          // Start the drag operation
          startDrag({
            id: control.id,
            type: 'existing',
            controlType: control.type,
            isNew: false,
            sourceIndex: sourceIndex
          });

          console.log('[DesignCanvas] Started dragging control:', control.id, control.type, 'at index:', sourceIndex);

          // Add a slight delay to allow the drag image to be set
          setTimeout(() => {
            if (e.currentTarget instanceof HTMLElement) {
              e.currentTarget.classList.add('opacity-50');
            }
          }, 0);
        }}
        onDragEnd={(e) => {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.remove('opacity-50');
          }
          // Clear the dragged control index
          setDraggedControlIndex(null);
        }}
        onDragOver={(e) => {
          if (draggedItem && canDropIn('canvas')) {
            e.preventDefault();
            e.stopPropagation();
            
            // Determine if we're dragging over the top or bottom half of the control
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY;
            const relativeY = y - rect.top;
            const isTopHalf = relativeY < rect.height / 2;
              // Set the position where the dragged item should be inserted
            const newIndex = isTopHalf ? actualIndex : actualIndex + 1;
              // Skip if trying to drop at the same position or right after the dragged control
            if (draggedControlIndex !== null && 
                (newIndex === draggedControlIndex || 
                 (newIndex === draggedControlIndex + 1 && 
                  // Allow moving the first control to the second position
                  // Also special handling for Tab controls - always allow them to move regardless of position
                  !(draggedControlIndex === 0 && newIndex === 1) &&
                  !(draggedItem.controlType === ControlType.Tab)
                 ))) {
              return;
            }
            
            if (dragOverIndex !== newIndex) {
              setDragOverIndex(newIndex);
              
              // Remove any existing highlights
              const highlightedElements = document.querySelectorAll('.border-t-2, .border-b-2');
              highlightedElements.forEach(el => {
                if (el instanceof HTMLElement && el !== e.currentTarget) {
                  el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
                }
              });
              
              // Add visual indicator
              e.currentTarget.classList.remove('border-t-2', 'border-b-2');
              e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
              
              console.log(`[DesignCanvas] Drag over position: ${newIndex}, dragged from: ${draggedControlIndex}`);
            }
          }
        }}
        onDragLeave={(e) => {
          if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
          }
        }}        onDrop={(e) => childControlDropHandler(e, actualIndex)}
      >
        <CanvasControl control={control} />
      </div>
    );

    return controlWrapper;
  };

  // Modified onDrop handler for child controls
  const childControlDropHandler = (e: React.DragEvent<HTMLDivElement>, actualIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[DesignCanvas] Dropping on control at index:', actualIndex, {
      dragOverIndex,
      draggedControlIndex,
      sourceContainer: getSourceContainer(),
      sourceIndex: getSourceIndex()
    });
    
    if (draggedItem && canDropIn('canvas')) {
      try {
        // Skip if trying to drop at the same position
        if (draggedControlIndex !== null && dragOverIndex === draggedControlIndex) {
          console.log('[DesignCanvas] Skipping move - same position');
        } 
        // Skip if trying to drop right after the dragged control
        else if (draggedControlIndex !== null && 
                 dragOverIndex === draggedControlIndex + 1 &&
                 // Allow moving the first control to the second position
                 !(draggedControlIndex === 0 && dragOverIndex === 1)) {
          console.log('[DesignCanvas] Skipping move - adjacent position');
        }
        else if (typeof dragOverIndex === 'number') {
          console.log('[DRAG-DEBUG] Control drop with valid target index:', {
            dragOverIndex,
            draggedControlIndex,
            controlType: draggedItem.controlType,
            controlId: draggedItem.id
          });
          
          // Special handling for first position controls
          if (draggedControlIndex === 0) {
            console.log('[DRAG-DEBUG] First position control being moved in onDrop');
            const updatedControls = moveFirstControl(questionnaire.controls, dragOverIndex);
            updateQuestionnaireControls(updatedControls);
          }
          // Special handling for parent controls (Tab, Accordion, ColumnLayout)
          else if ([ControlType.Tab, ControlType.Accordion, ControlType.ColumnLayout].includes(draggedItem.controlType)) {
            console.log('[DRAG-DEBUG] Using moveParentControl utility in child drop handler');
            const updatedControls = moveParentControl(questionnaire.controls, draggedItem.id, dragOverIndex);
            updateQuestionnaireControls(updatedControls);
          }
          else {
            // Standard movement for other controls
            moveControl(draggedItem.id, 'canvas', 'canvas', dragOverIndex);
          }
          console.log(`[DesignCanvas] Moved control to position ${dragOverIndex} on canvas`);
        } else {
          // If no position is set, append to the end
          const targetPosition = questionnaire.controls.length;
          moveControl(draggedItem.id, 'canvas', 'canvas', targetPosition);
          console.log(`[DesignCanvas] Appended control to end of canvas`);
        }
        
        setDragOverIndex(null);
        setDraggedControlIndex(null);
        endDrag();
      } catch (error) {
        console.error('[DesignCanvas] Error in canvas drop:', error);
      }
    }
    
    // Remove visual indicators
    clearVisualIndicators();
  };

  return (
    <div 
      ref={canvasRef}
      className={`
        h-full border-2 rounded-lg p-4 overflow-auto
        ${draggedItem && canDropIn('canvas') ? 'border-blue-400 bg-blue-50' : 'border-dashed border-gray-300'}
      `}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setDragOverIndex(null)}
    >
      {questionnaire.controls.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <p className="text-lg mb-2">Drag controls here to start designing</p>
          <p className="text-sm">Drag controls from the palette on the left to add them to your questionnaire</p>
        </div>
      ) : (        <div className="space-y-4">
          {/* Render column layouts in a flex container */}
          {columnLayouts.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {columnLayouts.map((control, index) => 
                renderDraggableControl(control, index, true)
              )}
            </div>
          )}
          
          {/* Render Tab controls */}
          {tabControls.length > 0 && (
            <div className="space-y-4">
              {tabControls.map((control, index) =>
                renderDraggableControl(control, columnLayouts.length + index, false)
              )}
            </div>
          )}

          {/* Render other controls vertically */}
          {otherControls.map((control, index) => 
            renderDraggableControl(control, columnLayouts.length + tabControls.length + index, false)
          )}
        </div>
      )}
    </div>
  );
};

export default DesignCanvas;
