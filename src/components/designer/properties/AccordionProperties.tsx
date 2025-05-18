import React from 'react';
import { Control, AccordionControl } from '../../../types';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { nanoid } from 'nanoid';

interface AccordionPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const AccordionProperties: React.FC<AccordionPropertiesProps> = ({ control, onChange }) => {
  const accordionControl = control as AccordionControl;
  const MAX_SECTIONS = 3;

  const handleAddSection = () => {
    if ((accordionControl.sections || []).length >= MAX_SECTIONS) {
      return;
    }

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
    if ((accordionControl.sections || []).length <= 1) {
      alert("You must have at least one section");
      return;
    }
    
    onChange({
      sections: (accordionControl.sections || []).filter(section => section.id !== sectionId),
    });
  };

  const handleSectionLabelChange = (sectionId: string, newLabel: string) => {
    onChange({
      sections: (accordionControl.sections || []).map(section =>
        section.id === sectionId ? { ...section, label: newLabel } : section
      ),
    });
  };

  // Initialize with a default section if none exist
  React.useEffect(() => {
    if (!accordionControl.sections || accordionControl.sections.length === 0) {
      const defaultSection = {
        id: nanoid(),
        label: 'Section 1',
        controls: [],
      };
      onChange({ sections: [defaultSection] });
    }
  }, []);

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Accordion Properties</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Sections ({(accordionControl.sections || []).length}/{MAX_SECTIONS})
            </label>
            <button
              type="button"
              onClick={handleAddSection}
              disabled={(accordionControl.sections || []).length >= MAX_SECTIONS}
              className={`flex items-center text-sm ${
                (accordionControl.sections || []).length >= MAX_SECTIONS
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              <Plus size={16} className="mr-1" />
              Add Section
            </button>
          </div>
          
          {(accordionControl.sections || []).length >= MAX_SECTIONS && (
            <div className="flex items-center text-amber-600 text-sm mb-2">
              <AlertCircle size={16} className="mr-1" />
              Maximum number of sections reached
            </div>
          )}
          
          <div className="space-y-2">
            {(accordionControl.sections || []).map((section, index) => (
              <div key={section.id} className="flex items-center border rounded-md p-2 bg-white">
                <div className="flex-1">
                  <input
                    type="text"
                    value={section.label}
                    onChange={(e) => handleSectionLabelChange(section.id, e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Section ${index + 1}`}
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveSection(section.id)}
                  className="ml-2 text-red-500 hover:text-red-700 disabled:text-gray-400"
                  disabled={(accordionControl.sections || []).length <= 1}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <select
            value={accordionControl.layout || 'vertical'}
            onChange={(e) => onChange({ layout: e.target.value as 'vertical' | 'horizontal' })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AccordionProperties;