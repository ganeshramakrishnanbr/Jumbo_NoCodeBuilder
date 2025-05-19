import React, { useState, useEffect } from 'react';
import { Control, AccordionControl } from '../../../types';
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Edit2, Move, Layout } from 'lucide-react';
import { nanoid } from 'nanoid';

interface AccordionPropertiesProps {
  control: Control;
  onChange: (updates: Partial<AccordionControl>) => void;
}

const AccordionProperties: React.FC<AccordionPropertiesProps> = ({ control, onChange }) => {
  const accordionControl = control as AccordionControl;
  const MAX_SECTIONS = accordionControl.maxSections || 3;
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  // Handle adding a new section
  const handleAddSection = () => {
    if ((accordionControl.sections || []).length >= MAX_SECTIONS) {
      return;
    }

    const newSection = {
      id: nanoid(),
      label: `Section ${(accordionControl.sections || []).length + 1}`,
      controls: [],
    };
    
    // Track start time for performance measurement
    const startTime = performance.now();
    
    onChange({
      sections: [...(accordionControl.sections || []), newSection],
    });
    
    // Log performance metric
    const endTime = performance.now();
    console.log(`[AccordionProperties] Section added in ${endTime - startTime}ms`);
    
    // Auto-enter edit mode for the new section
    setEditingSectionId(newSection.id);
  };

  // Handle removing a section
  const handleRemoveSection = (sectionId: string) => {
    if ((accordionControl.sections || []).length <= 1) {
      alert("You must have at least one section");
      return;
    }
    
    // Confirm deletion with the user
    if (!confirm("Are you sure you want to remove this section? All controls inside it will be deleted.")) {
      return;
    }
    
    const startTime = performance.now();
    
    onChange({
      sections: (accordionControl.sections || []).filter(section => section.id !== sectionId),
      // If this section was expanded, remove it from expanded sections
      expandedSections: (accordionControl.expandedSections || []).filter(id => id !== sectionId)
    });
    
    const endTime = performance.now();
    console.log(`[AccordionProperties] Section removed in ${endTime - startTime}ms`);
  };

  // Handle changing section label
  const handleSectionLabelChange = (sectionId: string, newLabel: string) => {
    onChange({
      sections: (accordionControl.sections || []).map(section =>
        section.id === sectionId ? { ...section, label: newLabel } : section
      ),
    });
  };

  // Toggle section editing mode
  const toggleEditMode = (sectionId: string) => {
    setEditingSectionId(editingSectionId === sectionId ? null : sectionId);
  };

  // Handle section order changes (move up)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const startTime = performance.now();
    const sections = [...(accordionControl.sections || [])];
    [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
    
    onChange({ sections });
    
    const endTime = performance.now();
    console.log(`[AccordionProperties] Section reordered in ${endTime - startTime}ms`);
  };

  // Handle section order changes (move down)
  const handleMoveDown = (index: number) => {
    if (index === (accordionControl.sections || []).length - 1) return;
    
    const startTime = performance.now();
    const sections = [...(accordionControl.sections || [])];
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    
    onChange({ sections });
    
    const endTime = performance.now();
    console.log(`[AccordionProperties] Section reordered in ${endTime - startTime}ms`);
  };

  // Handle layout toggle
  const handleLayoutChange = (layout: 'vertical' | 'horizontal') => {
    onChange({ layout });
  };

  // Initialize with a default section and properties if none exist
  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
      
      // Initialize sections
      if (!accordionControl.sections || accordionControl.sections.length === 0) {
        const defaultSection = {
          id: nanoid(),
          label: 'Section 1',
          controls: [],
        };
        onChange({ 
          sections: [defaultSection],
          layout: accordionControl.layout || 'vertical',
          maxSections: accordionControl.maxSections || 3,
          expandedSections: []
        });
      }
      
      // Ensure other properties are initialized
      const updates: Partial<AccordionControl> = {};
      
      if (accordionControl.layout === undefined) {
        updates.layout = 'vertical';
      }
      
      if (accordionControl.maxSections === undefined) {
        updates.maxSections = 3;
      }
      
      if (accordionControl.expandedSections === undefined) {
        updates.expandedSections = [];
      }
      
      if (Object.keys(updates).length > 0) {
        onChange(updates);
      }
    }
  }, []);

  // Set up keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingSectionId && e.key === 'Escape') {
        setEditingSectionId(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editingSectionId]);

  // Get header style options based on current section configuration
  const getHeaderStyleOptions = () => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Header Style
        </label>
        <select
          value={accordionControl.sectionConfiguration?.headerStyle || 'default'}
          onChange={(e) => onChange({ 
            sectionConfiguration: {
              ...(accordionControl.sectionConfiguration || {}),
              headerStyle: e.target.value as 'default' | 'bordered' | 'gradient'
            } 
          })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="default">Default</option>
          <option value="bordered">Bordered</option>
          <option value="gradient">Gradient</option>
        </select>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Accordion Properties</h3>
      
      <div className="space-y-4">
        {/* Layout options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layout
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleLayoutChange('vertical')}
              className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm ${
                accordionControl.layout === 'vertical' 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={accordionControl.layout === 'vertical'}
            >
              <Layout size={16} className="mr-1" />
              Vertical
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('horizontal')}
              className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm ${
                accordionControl.layout === 'horizontal' 
                  ? 'bg-blue-50 border-blue-500 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              aria-pressed={accordionControl.layout === 'horizontal'}
            >
              <Layout size={16} className="mr-1" />
              Horizontal
            </button>
          </div>
        </div>
        
        {/* Section management */}
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
              aria-label="Add section"
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
              <div 
                key={section.id} 
                className={`border rounded-md overflow-hidden ${
                  editingSectionId === section.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <Move size={16} className="text-gray-400 mr-2 cursor-move" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => toggleEditMode(section.id)}
                      className="p-1 text-gray-500 hover:text-blue-600 rounded-md hover:bg-gray-100"
                      aria-label="Edit section"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={`p-1 rounded-md hover:bg-gray-100 ${
                        index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600'
                      }`}
                      aria-label="Move section up"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === (accordionControl.sections || []).length - 1}
                      className={`p-1 rounded-md hover:bg-gray-100 ${
                        index === (accordionControl.sections || []).length - 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-blue-600'
                      }`}
                      aria-label="Move section down"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section.id)}
                      disabled={(accordionControl.sections || []).length <= 1}
                      className={`p-1 rounded-md hover:bg-gray-100 ${
                        (accordionControl.sections || []).length <= 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-red-500 hover:text-red-700'
                      }`}
                      aria-label="Remove section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {editingSectionId === section.id && (
                  <div className="p-3 bg-white">
                    <div className="mb-2">
                      <label className="block text-xs text-gray-500 mb-1">
                        Section Name
                      </label>
                      <input
                        type="text"
                        value={section.label}
                        onChange={(e) => handleSectionLabelChange(section.id, e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Section ${index + 1}`}
                        autoFocus
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="mr-1">{section.controls.length}</span>
                      {section.controls.length === 1 ? 'control' : 'controls'} in this section
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Expansion behavior */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowMultipleExpanded"
            checked={accordionControl.allowMultipleExpanded || false}
            onChange={(e) => onChange({
              allowMultipleExpanded: e.target.checked,
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allowMultipleExpanded" className="ml-2 block text-sm text-gray-700">
            Allow multiple sections open
          </label>
        </div>
        
        {/* Section appearance */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Section Appearance</h4>
          
          <div className="space-y-3">
            {/* Header style */}
            {getHeaderStyleOptions()}
            
            {/* Content padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Padding
              </label>
              <select
                value={accordionControl.sectionConfiguration?.contentPadding || 'medium'}
                onChange={(e) => onChange({ 
                  sectionConfiguration: {
                    ...(accordionControl.sectionConfiguration || {}),
                    contentPadding: e.target.value as 'small' | 'medium' | 'large'
                  } 
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            {/* Animation duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation Duration (ms)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                step="50"
                value={accordionControl.sectionConfiguration?.animationDuration || 300}
                onChange={(e) => onChange({ 
                  sectionConfiguration: {
                    ...(accordionControl.sectionConfiguration || {}),
                    animationDuration: parseInt(e.target.value)
                  } 
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionProperties;