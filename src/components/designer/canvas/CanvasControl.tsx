import React, { useState, useEffect } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { useDragDrop } from '../../../contexts/DragDropContext';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';
import { Trash2, Settings, Move, Star, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { nanoid } from 'nanoid';

interface CanvasControlProps {
  control: Control;
}

const CanvasControl: React.FC<CanvasControlProps> = ({ control }) => {
  const { updateControl, deleteControl, selectedControlId, setSelectedControlId } = useQuestionnaire();
  const { draggedItem, canDropIn, endDrag } = useDragDrop();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Initialize expanded sections when the control is mounted
  useEffect(() => {
    if (control.type === ControlType.Accordion) {
      const accordionControl = control as AccordionControl;
      if (accordionControl.sections && Array.isArray(accordionControl.sections)) {
        setExpandedSections(accordionControl.sections.map(section => section.id));
      }
    }
  }, [control]);

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

  const handleAddSection = (accordionControl: AccordionControl) => {
    if (!accordionControl.sections || !Array.isArray(accordionControl.sections)) {
      return;
    }

    if (accordionControl.sections.length >= (accordionControl.maxSections || 3)) {
      alert('Maximum number of sections reached');
      return;
    }

    const newSection = {
      id: nanoid(),
      label: `Section ${accordionControl.sections.length + 1}`,
      controls: []
    };

    const updatedSections = [...accordionControl.sections, newSection];
    updateControl(control.id, { sections: updatedSections });
    setExpandedSections(prev => [...prev, newSection.id]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetType: string) => {
    if (draggedItem && canDropIn(targetType)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const toggleSection = (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent section toggle from selecting the accordion
    setExpandedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetType: string, tabIndex?: number, columnIndex?: number, sectionId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedItem && canDropIn(targetType)) {
      if (draggedItem.isNew) {
        const newControl = {
          id: nanoid(),
          type: draggedItem.controlType,
          label: `New ${draggedItem.controlType}`,
          required: false,
          visible: true,
          enabled: true,
          properties: draggedItem.controlType === ControlType.Checkbox ? { options: [] } : {}
        };

        if (targetType === 'accordion' && control.type === ControlType.Accordion) {
          const accordionControl = control as AccordionControl;
          if (!accordionControl.sections || !Array.isArray(accordionControl.sections)) {
            return;
          }

          const updatedSections = [...accordionControl.sections];
          const targetSection = updatedSections.find(section => section.id === sectionId);
          
          if (targetSection) {
            targetSection.controls = [...(targetSection.controls || []), newControl];
            updateControl(control.id, { sections: updatedSections });
            
            // Ensure the section is expanded when a control is dropped
            if (!expandedSections.includes(targetSection.id)) {
              setExpandedSections(prev => [...prev, targetSection.id]);
            }

            // Select the newly added control
            setSelectedControlId(newControl.id);
          }
        }
      }
      
      endDrag();
    }
  };

  const handleChildControlClick = (childControl: Control, e: React.MouseEvent) => {
    e.stopPropagation();
    if (childControl.type === ControlType.Checkbox) {
      if (confirm('You clicked a checkbox control. Click OK to view its properties.')) {
        setSelectedControlId(childControl.id);
      }
    } else {
      setSelectedControlId(childControl.id);
    }
  };

  const renderAccordionControl = (accordionControl: AccordionControl) => {
    if (!accordionControl.sections || !Array.isArray(accordionControl.sections)) {
      const defaultSection = {
        id: nanoid(),
        label: 'New Section',
        controls: []
      };
      updateControl(control.id, { 
        sections: [defaultSection],
        layout: 'horizontal',
        maxSections: 3
      });
      return null;
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Sections</h3>
          <button
            onClick={() => handleAddSection(accordionControl)}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
            disabled={accordionControl.sections.length >= (accordionControl.maxSections || 3)}
          >
            <Plus size={16} className="mr-1" />
            Add Section
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accordionControl.sections.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            return (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={(e) => toggleSection(section.id, e)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-900">{section.label}</span>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                
                {isExpanded && (
                  <div
                    className="p-4 bg-white"
                    onDragOver={(e) => handleDragOver(e, 'accordion')}
                    onDrop={(e) => handleDrop(e, 'accordion', undefined, undefined, section.id)}
                  >
                    {!section.controls || section.controls.length === 0 ? (
                      <div className="text-gray-400 text-center p-6 border-2 border-dashed rounded-lg">
                        Drop controls here to add to this section
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {section.controls.map((childControl) => (
                          <div
                            key={childControl.id}
                            onClick={(e) => handleChildControlClick(childControl, e)}
                          >
                            <CanvasControl control={childControl} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`border rounded-lg p-4 bg-white shadow-sm hover:shadow transition-all duration-200 ${
        selectedControlId === control.id ? 'ring-2 ring-blue-500' : ''
      }`}
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
              updateControl(control.id, { required: !control.required });
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
      
      {control.type === ControlType.Accordion && renderAccordionControl(control as AccordionControl)}
    </div>
  );
};

export default CanvasControl;