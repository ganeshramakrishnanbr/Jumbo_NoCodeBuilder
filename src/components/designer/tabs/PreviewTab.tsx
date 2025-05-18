import React, { useState } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from 'lucide-react';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';

const PreviewTab: React.FC = () => {
  const { questionnaire } = useQuestionnaire();
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeTabIndices, setActiveTabIndices] = useState<Record<string, number>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-md mx-auto';
      case 'desktop':
        return 'max-w-4xl mx-auto';
      default:
        return 'max-w-4xl mx-auto';
    }
  };

  const handleInputChange = (controlId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [controlId]: value
    }));
  };

  const toggleMask = (controlId: string) => {
    setShowMasked(prev => ({
      ...prev,
      [controlId]: !prev[controlId]
    }));
  };

  const toggleAccordionSection = (accordionId: string, sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${accordionId}_${sectionId}`]: !prev[`${accordionId}_${sectionId}`]
    }));
  };

  const renderLabel = (label: string, required: boolean = false) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderAccordionControl = (control: AccordionControl) => {
    if (!control.sections) return null;

    return (
      <div className="space-y-2 border rounded-lg overflow-hidden">
        {control.sections.map((section) => {
          const isExpanded = expandedSections[`${control.id}_${section.id}`];
          return (
            <div key={section.id} className="border-b last:border-b-0">
              <button
                onClick={() => toggleAccordionSection(control.id, section.id)}
                className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">{section.label}</span>
                <span className="transform transition-transform">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>
              {isExpanded && (
                <div className="p-4 bg-white space-y-4">
                  {section.controls.map((control) => renderControl(control))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ... (keep all existing render methods like renderTextBox, renderCheckbox, etc.)

  const renderControl = (control: Control) => {
    if (!control.visible) return null;

    switch (control.type) {
      case ControlType.Tab:
        return renderTabControl(control as TabControl);
      case ControlType.Accordion:
        return renderAccordionControl(control as AccordionControl);
      case ControlType.ColumnLayout:
        return renderColumnLayout(control as ColumnLayoutControl);
      case ControlType.Address:
        return renderAddressControl(control);
      case ControlType.TextBox:
        return renderTextBox(control);
      case ControlType.Checkbox:
        return renderCheckbox(control);
      case ControlType.RadioButton:
        return renderRadioButton(control);
      case ControlType.Dropdown:
        return renderDropdown(control);
      case ControlType.Numeric:
        return renderNumeric(control);
      case ControlType.ToggleSlider:
        return renderToggleSlider(control);
      case ControlType.ProtectedNumber:
        return renderProtectedNumber(control);
      default:
        return (
          <div className="p-4 border rounded-md">
            <p className="font-medium">{control.label || control.type}</p>
            <p className="text-sm text-gray-500">Type: {control.type}</p>
          </div>
        );
    }
  };

  // ... (keep all other existing methods)

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Preview: {questionnaire.title}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewportSize('mobile')}
            className={`p-2 rounded-md ${viewportSize === 'mobile' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Mobile View"
          >
            <Smartphone size={20} />
          </button>
          <button
            onClick={() => setViewportSize('tablet')}
            className={`p-2 rounded-md ${viewportSize === 'tablet' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Tablet View"
          >
            <Tablet size={20} />
          </button>
          <button
            onClick={() => setViewportSize('desktop')}
            className={`p-2 rounded-md ${viewportSize === 'desktop' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Desktop View"
          >
            <Monitor size={20} />
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${getViewportClass()}`}>
        <div className="p-4 border rounded-md bg-white">
          <h3 className="text-lg font-medium mb-6">{questionnaire.title}</h3>
          <div className="space-y-6">
            {questionnaire.controls.map((control) => renderControl(control))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;