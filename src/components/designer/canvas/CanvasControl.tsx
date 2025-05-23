import React, { useState, useEffect, useRef } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';
import { Trash2, Settings, Move, Star } from 'lucide-react';
import { nanoid } from 'nanoid';
import './AccordionStyles.css';
import './AccordionFixes.css'; // Import the fixes for accordion rendering

interface CanvasControlProps {
  control: Control;
}

const CanvasControl: React.FC<CanvasControlProps> = ({ control }) => {
  const { updateControl, deleteControl, selectedControlId, setSelectedControlId, moveControl } = useQuestionnaire();
  const { draggedItem, canDropIn, endDrag, startDrag } = useDragDrop();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  // Track expanded sections for accordions in design mode
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  // Initialize expanded sections based on control's configuration
  useEffect(() => {
    if (control.type === ControlType.Accordion) {
      const accordionControl = control as AccordionControl;
      if (accordionControl.expandedSections && accordionControl.expandedSections.length > 0) {
        const sectionState: Record<string, boolean> = {};
        accordionControl.expandedSections.forEach(sectionId => {
          sectionState[sectionId] = true;
        });
        setExpandedSections(sectionState);
      } else if (accordionControl.sections && accordionControl.sections.length > 0) {
        // Check if it's in horizontal layout
        const isHorizontal = accordionControl.layout === 'horizontal';
        
        if (isHorizontal) {
          // In horizontal layout mode, expand all sections by default
          const allExpandedState: Record<string, boolean> = {};
          accordionControl.sections.forEach(section => {
            allExpandedState[section.id] = true;
          });
          setExpandedSections(allExpandedState);
          
          // Save this expanded state
          updateControl(accordionControl.id, {
            expandedSections: accordionControl.sections.map(section => section.id)
          } as Partial<AccordionControl>);
        } else {
          // In vertical layout, just expand the first section (default behavior)
          setExpandedSections({ [accordionControl.sections[0].id]: true });
        }
      }
    }
  }, [control.id]);

  // Toggle section expansion with state persistence
  const toggleSection = (accordionControl: AccordionControl, sectionId: string) => {
    setExpandedSections(prev => {
      const newState = {...prev};
      // If multiple sections are allowed to be expanded
      if (accordionControl.allowMultipleExpanded) {
        newState[sectionId] = !prev[sectionId];
      } else {
        // Close all sections
        Object.keys(newState).forEach(key => {
          newState[key] = false;
        });
        // Toggle the clicked section
        newState[sectionId] = !prev[sectionId];
      }
      
      // Save expanded sections to the control for persistence
      const expandedSectionIds = Object.entries(newState)
        .filter(([, isExpanded]) => isExpanded)
        .map(([id]) => id);
      
      updateControl(accordionControl.id, { 
        expandedSections: expandedSectionIds 
      } as Partial<AccordionControl>);
      
      return newState;
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
  };
  
  // Enhanced drag start handler for child controls
  const handleDragStart = (e: React.DragEvent<HTMLSpanElement>, controlId: string, sourceIndex?: number) => {
    e.stopPropagation();
    
    // Set data transfer for compatibility
    e.dataTransfer.setData('text/plain', controlId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Start drag operation with better source tracking
    startDrag({
      id: controlId,
      type: 'control',
      controlType: control.type,
      isNew: false,
      sourceId: control.id,
      sourceIndex: sourceIndex
    });
    
    console.log('[CanvasControl] Started dragging control:', controlId, 'from container:', control.id, 'at index:', sourceIndex);
    
    // Add visual feedback during drag
    if (e.currentTarget.parentElement instanceof HTMLElement) {
      setTimeout(() => {
        e.currentTarget.parentElement?.classList.add('opacity-50');
      }, 0);
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLSpanElement>) => {
    if (e.currentTarget.parentElement instanceof HTMLElement) {
      e.currentTarget.parentElement.classList.remove('opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetType: string) => {
    if (draggedItem && canDropIn(targetType)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Add visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.add('drag-over-highlight');
      }
    }
  };

  // Improved position tracking for container content
  const handleContainerContentDragOver = (e: React.DragEvent<HTMLDivElement>, controlIndex: number, containerType: string) => {
    if (draggedItem && canDropIn(containerType)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Determine if we're dragging over the top or bottom half of the control
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY;
      const relativeY = y - rect.top;
      const isTopHalf = relativeY < rect.height / 2;
      
      // Set the position where the dragged item should be inserted
      const newPosition = isTopHalf ? controlIndex : controlIndex + 1;
      
      if (dragOverPosition !== newPosition) {
        setDragOverPosition(newPosition);
        
        // Remove visual indicators from all controls
        const highlightedElements = document.querySelectorAll('.border-t-2, .border-b-2');
        highlightedElements.forEach(el => {
          if (el instanceof HTMLElement && el !== e.currentTarget) {
            el.classList.remove('border-t-2', 'border-b-2', 'border-blue-500');
          }
        });
        
        // Add visual indicator
        e.currentTarget.classList.remove('border-t-2', 'border-b-2');
        e.currentTarget.classList.add(isTopHalf ? 'border-t-2' : 'border-b-2', 'border-blue-500');
        
        console.log(`[CanvasControl] Container drag over: ${containerType}, position: ${newPosition}`);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over-highlight', 'border-t-2', 'border-b-2', 'border-blue-500');
    }
    setDragOverPosition(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: string, tabIndex?: number, columnIndex?: number, sectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over-highlight', 'border-t-2', 'border-b-2', 'border-blue-500');
    }

    console.log('[CanvasControl] handleDrop triggered', { 
      draggedItem, 
      targetType, 
      tabIndex, 
      columnIndex,
      sectionId,
      parentControlId: control.id,
      parentControlType: control.type,
      insertPosition: dragOverPosition
    });

    if (draggedItem && canDropIn(targetType)) {
      if (draggedItem.isNew) {
        const newControlBase = {
          id: nanoid(),
          type: draggedItem.controlType,
          label: `New ${draggedItem.controlType}`,
          required: false,
          visible: true,
          enabled: true,
        };

        if (targetType === 'accordion' && control.type === ControlType.Accordion && sectionId) {
          const accordionControl = control as AccordionControl;
          const updatedSections = accordionControl.sections.map(section => {
            if (section.id === sectionId) {
              // If we have a drag position, insert at that position
              if (dragOverPosition !== null) {
                const newControls = [...section.controls];
                newControls.splice(dragOverPosition, 0, newControlBase);
                return {
                  ...section,
                  controls: newControls
                };
              } else {
                return {
                  ...section,
                  controls: [...section.controls, newControlBase]
                };
              }
            }
            return section;
          });
          
          updateControl(control.id, { sections: updatedSections } as Partial<AccordionControl>);
          console.log('[CanvasControl] Added new control to accordion section:', sectionId);
        }
        else if (targetType === 'tab' && control.type === ControlType.Tab) {
          const tabControl = control as TabControl;
          const updatedTabs = [...tabControl.tabs];
          if (updatedTabs[tabIndex || activeTabIndex]) {
            // If we have a drag position, insert at that position
            if (dragOverPosition !== null) {
              const newControls = [...updatedTabs[tabIndex || activeTabIndex].controls];
              newControls.splice(dragOverPosition, 0, newControlBase);
              updatedTabs[tabIndex || activeTabIndex].controls = newControls;
            } else {
              updatedTabs[tabIndex || activeTabIndex].controls.push(newControlBase);
            }
            updateControl(control.id, { tabs: updatedTabs } as Partial<TabControl>);
          }
        }
        else if (targetType === 'column' && control.type === ControlType.ColumnLayout) {
          const columnControl = control as ColumnLayoutControl;
          const updatedColumns = [...columnControl.columnControls];
          if (updatedColumns[columnIndex || 0]) {
            // If we have a drag position, insert at that position
            if (dragOverPosition !== null) {
              const newControls = [...updatedColumns[columnIndex || 0]];
              newControls.splice(dragOverPosition, 0, newControlBase);
              updatedColumns[columnIndex || 0] = newControls;
            } else {
              updatedColumns[columnIndex || 0].push(newControlBase);
            }
            updateControl(control.id, { columnControls: updatedColumns } as Partial<ColumnLayoutControl>);
          }
        }
        
        // Select the newly added control
        setTimeout(() => setSelectedControlId(newControlBase.id), 0);
      }
      // Enhanced handling for moving existing controls
      else if (draggedItem.id && !draggedItem.isNew) {
        // Handle via the QuestionnaireContext moveControl function with proper position tracking
        if (targetType === 'tab' && control.type === ControlType.Tab) {
          moveControl(
            draggedItem.id,
            control.id,
            targetType,
            dragOverPosition !== null ? dragOverPosition : undefined,
            undefined,
            tabIndex || activeTabIndex
          );
          console.log(`[CanvasControl] Moved control to tab at position ${dragOverPosition}`);
        } 
        else if (targetType === 'accordion' && control.type === ControlType.Accordion && sectionId) {
          moveControl(
            draggedItem.id,
            control.id,
            targetType,
            dragOverPosition !== null ? dragOverPosition : undefined,
            sectionId
          );
          console.log(`[CanvasControl] Moved control to accordion section at position ${dragOverPosition}`);
        }
        else if (targetType === 'column' && control.type === ControlType.ColumnLayout && typeof columnIndex === 'number') {
          moveControl(
            draggedItem.id,
            control.id,
            targetType,
            dragOverPosition !== null ? dragOverPosition : undefined,
            undefined,
            undefined,
            columnIndex
          );
          console.log(`[CanvasControl] Moved control to column at position ${dragOverPosition}`);
        }
      }
      
      // Reset drag state
      setDragOverPosition(null);
      endDrag();
    }
  };

  const renderTabControl = (tabControl: TabControl) => {    
    if (!tabControl.tabs || !Array.isArray(tabControl.tabs) || tabControl.tabs.length === 0) {
      const defaultTab = {
        id: nanoid(),
        label: 'New Tab',
        controls: []
      };
      updateControl(control.id, { tabs: [defaultTab] } as Partial<TabControl>);
      return null;
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
      const baseClasses = 'px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out';
      const activeClasses = 'text-blue-600 bg-white shadow-sm';
      const inactiveClasses = 'text-gray-600 hover:text-gray-800 hover:bg-gray-100';
      
      const positionClasses = {
        top: `${isActive ? 'border-b-2 border-blue-500 -mb-px' : ''}`,
        bottom: `${isActive ? 'border-t-2 border-blue-500 -mt-px' : ''}`,
        left: `${isActive ? 'border-r-2 border-blue-500 -mr-px' : ''}`,
        right: `${isActive ? 'border-l-2 border-blue-500 -ml-px' : ''}`
      }[position];

      return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${positionClasses}`;
    };

    return (
      <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className={containerClasses}>
          <div className={tabListClasses}>
            {tabControl.tabs.map((tab, index) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabIndex(index)}
                className={tabClasses(index)}
              >
                {tab.label}
              </div>
            ))}
          </div>
            <div 
            className="flex-1 p-4 bg-white"
            onDragOver={(e) => handleDragOver(e, 'tab')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'tab', activeTabIndex)}
          >
            {tabControl.tabs[activeTabIndex]?.controls?.length === 0 ? (
              <div className="text-gray-400 text-center p-6 border-2 border-dashed rounded-lg">
                Drop controls here to add to this tab
              </div>
            ) : (
              <div className="space-y-3">
                {tabControl.tabs[activeTabIndex]?.controls?.map((childControl, index) => (
                  <div 
                    key={childControl.id} 
                    className={`relative ${
                      dragOverPosition === index 
                        ? 'border-t-2 border-blue-500' 
                        : dragOverPosition === index + 1 
                          ? 'border-b-2 border-blue-500' 
                          : ''
                    }`}
                    onDragOver={(e) => handleContainerContentDragOver(e, index, 'tab')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'tab', activeTabIndex)}
                  >
                    <div className="flex items-start">
                      <span 
                        className="cursor-move mt-4 mr-2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50"
                        draggable
                        onDragStart={(e) => handleDragStart(e, childControl.id, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <Move size={16} />
                      </span>
                      <div className="flex-1">
                        <CanvasControl control={childControl} />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Add an empty drop area at the end for appending items easily */}
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-md h-8 mt-3 bg-gray-50 opacity-75"
                  onDragOver={(e) => {
                    if (draggedItem && canDropIn('tab')) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
                      setDragOverPosition(tabControl.tabs[activeTabIndex]?.controls?.length || 0);
                    }
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
                    setDragOverPosition(null);
                  }}
                  onDrop={(e) => handleDrop(e, 'tab', activeTabIndex)}
                >
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Drop here to add to the end</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const renderColumnLayoutControl = (columnControl: ColumnLayoutControl) => {
    if (!columnControl.columnControls || !Array.isArray(columnControl.columnControls)) {
      const defaultColumns = Array(columnControl.columns || 2).fill([]);
      updateControl(control.id, { columnControls: defaultColumns } as Partial<ColumnLayoutControl>);
      return null;
    }

    const columnWidth = `${100 / (columnControl.columns || 2)}%`;

    return (
      <div className="flex flex-row gap-4">
        {Array.from({ length: columnControl.columns || 2 }).map((_, columnIdx) => (
          <div 
            key={columnIdx} 
            className="border rounded-md p-4 bg-white"
            style={{ width: columnWidth }}
            onDragOver={(e) => handleDragOver(e, 'column')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'column', undefined, columnIdx)}
          >
            <div className="text-sm text-gray-500 mb-2">Column {columnIdx + 1}</div>
            {columnControl.columnControls[columnIdx]?.length > 0 ? (
              <div className="space-y-2">
                {columnControl.columnControls[columnIdx].map((childControl, index) => (
                  <div 
                    key={childControl.id} 
                    className={`relative ${
                      dragOverPosition === index 
                        ? 'border-t-2 border-blue-500' 
                        : dragOverPosition === index + 1 
                          ? 'border-b-2 border-blue-500' 
                          : ''
                    }`}
                    onDragOver={(e) => handleContainerContentDragOver(e, index, 'column')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'column', undefined, columnIdx)}
                  >
                    <div className="flex items-start">
                      <span 
                        className="cursor-move mt-4 mr-2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50"
                        draggable
                        onDragStart={(e) => handleDragStart(e, childControl.id, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <Move size={16} />
                      </span>
                      <div className="flex-1">
                        <CanvasControl control={childControl} />
                      </div>
                    </div>
                  </div>
                ))}
                {/* Add empty drop area for appending */}
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-md h-8 mt-2 bg-gray-50 opacity-75"
                  onDragOver={(e) => {
                    if (draggedItem && canDropIn('column')) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
                      setDragOverPosition(columnControl.columnControls[columnIdx].length);
                    }
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
                    setDragOverPosition(null);
                  }}
                  onDrop={(e) => handleDrop(e, 'column', undefined, columnIdx)}
                >
                  <div className="h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Drop here</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center p-4 border-2 border-dashed rounded-lg">
                Drop controls here
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  const renderAccordionControl = (accordionControl: AccordionControl) => {
    if (!accordionControl.sections || !Array.isArray(accordionControl.sections) || accordionControl.sections.length === 0) {
      const defaultSection = {
        id: nanoid(),
        label: 'Section 1',
        controls: []
      };
      updateControl(control.id, { sections: [defaultSection] } as Partial<AccordionControl>);
      return null;
    }

    // Determine if it's in design mode (we're in CanvasControl so it is)
    const isDesignMode = true;

    // Get layout configuration
    const layout = accordionControl.layout || 'vertical';
    const isHorizontal = layout === 'horizontal';
    
    // Get section configuration options
    const sectionConfig = accordionControl.sectionConfiguration || {};
    const headerStyle = sectionConfig.headerStyle || 'default';
    
    // Apply header styling based on configuration
    const getHeaderClasses = () => {
      const baseClasses = "px-4 py-3 flex items-center justify-between";
      switch (headerStyle) {
        case 'bordered':
          return `${baseClasses} bg-white border-b-2 border-gray-300`;
        case 'gradient':
          return `${baseClasses} bg-gradient-to-r from-gray-50 to-white border-b`;
        default: // default style
          return `${baseClasses} bg-gray-50 border-b`;
      }
    };    // Return the appropriate layout container classes
    const getContainerClasses = () => {
      if (isHorizontal) {
        // Enhanced horizontal container with better drag and drop support
        return "flex flex-row gap-6 overflow-x-auto pb-4 relative min-h-[320px] w-full accordion-horizontal-container";
      } else {
        return "space-y-4";
      }
    };
      // Return the section classes based on layout
    const getSectionClasses = () => {
      const baseClasses = "border rounded-lg overflow-hidden bg-white";
      if (isHorizontal) {
        return `${baseClasses} flex-shrink-0`;
      } else {
        return baseClasses;
      }
    };    // Set min-height if specified
    const getSectionStyles = () => {
      const styles: React.CSSProperties = {};
      
      if (isHorizontal) {
        // In horizontal mode, use fixed width for better layout control
        styles.minWidth = '350px'; 
        styles.width = '350px';     // Fixed width ensures consistency
        styles.flexShrink = 0;
        styles.flexGrow = 0;
        
        // Ensure sections have a minimum height in horizontal layout
        const minHeight = sectionConfig.minHeight || '300px'; // Increase minimum height
        styles.minHeight = minHeight;
        styles.maxHeight = '600px'; // Set maximum height to prevent excessive stretching
      } else if (sectionConfig.minHeight) {
        // For vertical layout, only set min-height if specified in config
        styles.minHeight = sectionConfig.minHeight;
      }
      
      return styles;
    };
    
    // Get content padding class based on config
    const getContentPaddingClass = () => {
      switch (sectionConfig.contentPadding) {
        case 'small': return 'p-2';
        case 'large': return 'p-6';
        default: return 'p-4'; // medium padding (default)
      }
    };

    return (      <div 
        className={getContainerClasses()}
        data-accordion-layout={isHorizontal ? 'horizontal' : 'vertical'}
      >
        {accordionControl.sections.map((section) => (
          <div 
            key={section.id} 
            className={getSectionClasses()}
            style={getSectionStyles()}
            data-layout={isHorizontal ? 'horizontal' : 'vertical'}
            data-section-id={section.id}
          >
            <div className={getHeaderClasses()} onClick={() => toggleSection(accordionControl, section.id)}>
              <h3 className="text-sm font-medium text-gray-900">{section.label}</h3>
              
              {isDesignMode && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">
                    {section.controls?.length || 0} control{section.controls?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>            {/* Always render section content in horizontal layout, but use conditional visibility in vertical */}
            {(isHorizontal || expandedSections[section.id]) && (
              <div 
                className={`accordion-section-content ${getContentPaddingClass()}`}
                data-droppable="true"
                data-section-expanded={expandedSections[section.id] ? "true" : "false"}
                data-section-id={section.id}
                onDragOver={(e) => handleDragOver(e, 'accordion')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
              >                {section.controls?.length > 0 ? (
                  <>
                    <div className={`section-controls-container ${isHorizontal ? 'horizontal-controls' : 'space-y-3'}`}>
                      {section.controls.map((childControl, index) => (
                        <div 
                          key={childControl.id} 
                          className={`relative section-control-item ${
                            dragOverPosition === index 
                              ? 'border-t-2 border-blue-500' 
                              : dragOverPosition === index + 1 
                                ? 'border-b-2 border-blue-500' 
                                : ''
                          }`}
                          onDragOver={(e) => handleContainerContentDragOver(e, index, 'accordion')}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
                        >
                          <div className="flex items-start w-full">
                            <span 
                              className="cursor-move mt-4 mr-2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50 flex-shrink-0"
                              draggable
                              onDragStart={(e) => handleDragStart(e, childControl.id, index)}
                              onDragEnd={handleDragEnd}
                            >
                              <Move size={16} />
                            </span>                          <div className="flex-1 min-w-0 w-full overflow-visible">
                              <div className="canvas-control-wrapper w-full overflow-visible">
                                <CanvasControl control={childControl} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>                    {/* Add an empty drop area at the end for appending items easily */}                    <div 
                      className={`border-2 border-dashed border-gray-200 rounded-md mt-auto bg-gray-50 drop-area ${isHorizontal ? 'h-16' : 'h-12'}`}
                      data-droppable="true"
                      data-section-id={section.id}
                      data-drop-area="section-footer"
                      onDragOver={(e) => {
                        if (draggedItem && canDropIn('accordion')) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.currentTarget.classList.add('border-blue-300', 'bg-blue-50');
                          setDragOverPosition(section.controls.length);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-blue-300', 'bg-blue-50');
                        setDragOverPosition(null);
                      }}
                      onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
                    >
                      <div className="h-full flex items-center justify-center w-full">
                        <div className="flex flex-col items-center">
                          <span className={`${isHorizontal ? 'text-blue-500 font-medium mb-1' : 'text-gray-400'} text-sm`}>
                            {isHorizontal ? `${section.label}` : ''}
                          </span>
                          <span className="text-gray-400 text-sm font-medium">Drop here</span>
                        </div>
                      </div>
                    </div>
                  </>                ) : (                  <div 
                    className={`text-gray-400 text-center p-6 border-2 border-dashed rounded-lg flex-1 flex items-center justify-center empty-section-drop ${isHorizontal ? 'min-h-[140px]' : ''}`}
                    data-droppable="true"
                    data-section-id={section.id}
                    data-empty-section="true"
                    onDragOver={(e) => {
                      if (draggedItem && canDropIn('accordion')) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
                        setDragOverPosition(0);
                      }
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                      setDragOverPosition(null);
                    }}
                    onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
                  >
                    <div className="w-full">
                      <div className="mb-2">
                        {isHorizontal ? (
                          <div className="flex flex-col items-center">
                            <span className="text-blue-500 font-medium mb-2 text-base">{section.label}</span>
                            <span className="font-medium">Drag controls here</span>
                          </div>
                        ) : (
                          <span>Drop controls here</span>
                        )}
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
          <span 
            className="cursor-move mr-2 text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50"
            draggable
            onDragStart={(e) => handleDragStart(e, control.id)}
            onDragEnd={handleDragEnd}
          >
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
              updateControl(control.id, { required: !control.required } as Partial<Control>);
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
