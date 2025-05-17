import React from 'react';
import { Control, AccordionControl } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface AccordionPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const AccordionProperties: React.FC<AccordionPropertiesProps> = ({ control, onChange }) => {
  const accordionControl = control as AccordionControl;

  const handleAddSection = () => {
    const newSection = {
      id: nanoid(),
      label: `Section ${(accordionControl.sections || []).length + 1}`,
      controls: [],
    };
    
    onChange({
      sections: [...(accordionControl.sections || []), newSection],
    });
  };

  const handleRemoveSection = (sectionId: string) => {
    if (accordionControl.sections.length <= 1) {
      alert("You must have at least one section");
      return;
    }
    
    onChange({
      sections: accordionControl.sections.filter(section => section.id !== sectionId),
    });
  };

  const handleSectionLabelChange = (sectionId: string, newLabel: string) => {
    onChange({
      sections: accordionControl.sections.map(section =>
        section.id === sectionId ? { ...section, label: newLabel } : section
      ),
    });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Accordion Properties</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Sections
            </label>
            <button
              type="button"
              onClick={handleAddSection}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Add Section
            </button>
          </div>
          
          <div className="space-y-2">
            {accordionControl.sections?.map((section) => (
              <div key={section.id} className="flex items-center border rounded-md p-2">
                <input
                  type="text"
                  value={section.label}
                  onChange={(e) => handleSectionLabelChange(section.id, e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                />
                
                <button
                  type="button"
                  onClick={() => handleRemoveSection(section.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={accordionControl.sections.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowMultiple"
            checked={accordionControl.properties?.allowMultiple || false}
            onChange={(e) => onChange({
              properties: {
                ...(control.properties || {}),
                allowMultiple: e.target.checked,
              },
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allowMultiple" className="ml-2 block text-sm text-gray-700">
            Allow multiple sections open
          </label>
        </div>
      </div>
    </div>
  );
};

export default AccordionProperties;