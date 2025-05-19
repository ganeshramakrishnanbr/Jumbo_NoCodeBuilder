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
  const { updateControl, deleteControl, selectedControlId, setSelectedControlId } = useQuestionnaire();
  const { draggedItem, canDropIn, endDrag } = useDragDrop();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
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
        // By default, expand the first section
        setExpandedSections({ [accordionControl.sections[0].id]: true });
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

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over-highlight');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: string, tabIndex?: number, columnIndex?: number, sectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove('drag-over-highlight');
    }

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
          enabled: true,
        };

        if (targetType === 'accordion' && control.type === ControlType.Accordion && sectionId) {          const accordionControl = control as AccordionControl;
          const updatedSections = accordionControl.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                controls: [...section.controls, newControlBase]
              };
            }
            return section;
          });
          
          updateControl(control.id, { sections: updatedSections } as Partial<AccordionControl>);
          console.log('[CanvasControl] Added new control to accordion section:', sectionId);
        }        else if (targetType === 'tab' && control.type === ControlType.Tab) {
          const tabControl = control as TabControl;
          const updatedTabs = [...tabControl.tabs];
          if (updatedTabs[tabIndex || activeTabIndex]) {
            updatedTabs[tabIndex || activeTabIndex].controls.push(newControlBase);
            updateControl(control.id, { tabs: updatedTabs } as Partial<TabControl>);
          }
        }
        else if (targetType === 'column' && control.type === ControlType.ColumnLayout) {
          const columnControl = control as ColumnLayoutControl;
          const updatedColumns = [...columnControl.columnControls];
          if (updatedColumns[columnIndex || 0]) {
            updatedColumns[columnIndex || 0].push(newControlBase);
            updateControl(control.id, { columnControls: updatedColumns } as Partial<ColumnLayoutControl>);
          }
        }
      }
      
      endDrag();
    }
  };

  const renderTabControl = (tabControl: TabControl) => {    if (!tabControl.tabs || !Array.isArray(tabControl.tabs) || tabControl.tabs.length === 0) {
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
                {tabControl.tabs[activeTabIndex]?.controls?.map((childControl) => (
                  <CanvasControl key={childControl.id} control={childControl} />
                ))}
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
        {Array.from({ length: columnControl.columns || 2 }).map((_, index) => (
          <div 
            key={index} 
            className="border rounded-md p-4 bg-white"
            style={{ width: columnWidth }}
            onDragOver={(e) => handleDragOver(e, 'column')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'column', undefined, index)}
          >
            <div className="text-sm text-gray-500 mb-2">Column {index + 1}</div>
            {columnControl.columnControls[index]?.length > 0 ? (
              <div className="space-y-2">
                {columnControl.columnControls[index].map((childControl) => (
                  <CanvasControl key={childControl.id} control={childControl} />
                ))}
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
    };
    
    // Return the appropriate layout container classes
    const getContainerClasses = () => {
      if (isHorizontal) {
        return "flex flex-row gap-4 overflow-x-auto pb-2";
      } else {
        return "space-y-4";
      }
    };
    
    // Return the section classes based on layout
    const getSectionClasses = () => {
      if (isHorizontal) {
        return "border rounded-lg overflow-hidden bg-white flex-shrink-0";
      } else {
        return "border rounded-lg overflow-hidden bg-white";
      }
    };

    // Set min-height if specified
    const getSectionStyles = () => {
      const styles: React.CSSProperties = {};
      
      if (isHorizontal) {
        // In horizontal mode, set the width based on number of sections
        const width = `${Math.max(300, 100 / Math.min(accordionControl.sections.length, 3))}px`;
        styles.minWidth = width;
        styles.width = width;
      }
      
      if (sectionConfig.minHeight) {
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

    // Handle drag events for accordion controls with proper nested structure
    const handleAccordionDragOver = (e: React.DragEvent<HTMLDivElement>, _section: AccordionSection) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Add visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.add('drag-over-highlight');
      }
    };

    const handleAccordionDrop = (e: React.DragEvent<HTMLDivElement>, accordionControl: AccordionControl, section: AccordionSection) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Remove visual feedback
      if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.remove('drag-over-highlight');
      }
      
      if (!draggedItem) return;

      // Handle dropping a new control
      if (draggedItem.isNew) {
        const newControlBase = {
          id: nanoid(),
          type: draggedItem.controlType,
          label: `New ${draggedItem.controlType}`,
          required: false,
          visible: true,
          enabled: true,
        };
        
        // Add the new control to this specific section
        const updatedSections = accordionControl.sections.map(sec => {
          if (sec.id === section.id) {
            return {
              ...sec,
              controls: [...sec.controls, newControlBase]
            };
          }
          return sec;
        });
        
        // Update the accordion control with the new sections
        updateControl(accordionControl.id, { 
          sections: updatedSections 
        } as Partial<AccordionControl>);
        
        console.log(`Added new control to accordion section: ${section.id}`);
        
        // Select the newly added control
        setTimeout(() => setSelectedControlId(newControlBase.id), 0);
      } 
      // Handle moving an existing control
      else if (draggedItem.id && !draggedItem.isNew) {
        // Handle via the QuestionnaireContext moveControl function
        // which will handle all the complex logic of removing from
        // source and adding to destination
        console.log(`Moving control ${draggedItem.id} to accordion section ${section.id}`);
      }
      
      // End drag operation
      endDrag();
    };

    return (
      <div className={getContainerClasses()}>
        {accordionControl.sections.map((section) => (
          <div 
            key={section.id} 
            className={getSectionClasses()}
            style={getSectionStyles()}
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
            </div>
            {expandedSections[section.id] && (
              <div 
                className={getContentPaddingClass()}
                onDragOver={(e) => handleAccordionDragOver(e, section)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleAccordionDrop(e, control as AccordionControl, section)}
              >
                {section.controls?.length > 0 ? (
                  <div className="space-y-3">
                    {section.controls.map((control) => (
                      <CanvasControl key={control.id} control={control} />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center p-6 border-2 border-dashed rounded-lg">
                    Drop controls here to add to this section
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