import React, { useState, useEffect } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';
import { Trash2, Settings, Move, Star } from 'lucide-react';
import { nanoid } from 'nanoid';

interface CanvasControlProps {
  control: Control;
}

const CanvasControl: React.FC<CanvasControlProps> = ({ control }) => {
  const { updateControl, deleteControl, selectedControlId, setSelectedControlId } = useQuestionnaire();
  const { draggedItem, canDropIn, endDrag } = useDragDrop();
  const [activeTabIndex, setActiveTabIndex] = useState(0);

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

        if (targetType === 'accordion' && control.type === ControlType.Accordion && sectionId) {
          const accordionControl = control as AccordionControl;
          const updatedSections = accordionControl.sections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                controls: [...section.controls, newControlBase]
              };
            }
            return section;
          });
          
          updateControl(control.id, { sections: updatedSections });
          console.log('[CanvasControl] Added new control to accordion section:', sectionId);
        }
        else if (targetType === 'tab' && control.type === ControlType.Tab) {
          const tabControl = control as TabControl;
          const updatedTabs = [...tabControl.tabs];
          if (updatedTabs[tabIndex || activeTabIndex]) {
            updatedTabs[tabIndex || activeTabIndex].controls.push(newControlBase);
            updateControl(control.id, { tabs: updatedTabs });
          }
        }
        else if (targetType === 'column' && control.type === ControlType.ColumnLayout) {
          const columnControl = control as ColumnLayoutControl;
          const updatedColumns = [...columnControl.columnControls];
          if (updatedColumns[columnIndex || 0]) {
            updatedColumns[columnIndex || 0].push(newControlBase);
            updateControl(control.id, { columnControls: updatedColumns });
          }
        }
      }
      
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
      updateControl(control.id, { tabs: [defaultTab] });
      return null;
    }

    const position = tabControl.position || 'top';
    const isVertical = position === 'left' || position === 'right';
    
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
      updateControl(control.id, { columnControls: defaultColumns });
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
      updateControl(control.id, { sections: [defaultSection] });
      return null;
    }

    return (
      <div className="space-y-4">
        {accordionControl.sections.map((section) => (
          <div key={section.id} className="border rounded-lg overflow-hidden bg-white">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-sm font-medium text-gray-900">{section.label}</h3>
            </div>
            <div 
              className="p-4"
              onDragOver={(e) => handleDragOver(e, 'accordion')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
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