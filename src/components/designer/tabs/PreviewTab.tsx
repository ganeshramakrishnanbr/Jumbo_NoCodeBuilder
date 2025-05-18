import React, { useState } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { Control, ControlType, TabControl, ColumnLayoutControl, AccordionControl } from '../../../types';

const PreviewTab: React.FC = () => {
  const { questionnaire } = useQuestionnaire();
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const handleInputChange = (controlId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [controlId]: value
    }));
  };

  const toggleAccordionSection = (accordionId: string, sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${accordionId}_${sectionId}`]: !prev[`${accordionId}_${sectionId}`]
    }));
  };

  const renderTextBox = (control: Control) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={control.properties?.placeholder}
          required={control.required}
        />
      </div>
    );
  };

  const renderCheckbox = (control: Control) => {
    const options = control.properties?.options || [];
    const values = formValues[control.id] || [];

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                checked={values.includes(option.value)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...values, option.value]
                    : values.filter((v: string) => v !== option.value);
                  handleInputChange(control.id, newValues);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadioButton = (control: Control) => {
    const options = control.properties?.options || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                name={control.id}
                value={option.value}
                checked={formValues[control.id] === option.value}
                onChange={(e) => handleInputChange(control.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDropdown = (control: Control) => {
    const options = control.properties?.options || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select an option</option>
          {options.map((option: any) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderAccordionControl = (control: AccordionControl) => {
    if (!control.sections) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {control.sections.map((section) => {
          const isExpanded = expandedSections[`${control.id}_${section.id}`];
          return (
            <div key={section.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleAccordionSection(control.id, section.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-900">{section.label}</span>
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

  const renderControl = (control: Control) => {
    if (!control.visible) return null;

    switch (control.type) {
      case ControlType.TextBox:
        return renderTextBox(control);
      case ControlType.Checkbox:
        return renderCheckbox(control);
      case ControlType.RadioButton:
        return renderRadioButton(control);
      case ControlType.Dropdown:
        return renderDropdown(control);
      case ControlType.Accordion:
        return renderAccordionControl(control as AccordionControl);
      default:
        return (
          <div className="p-4 border rounded-md">
            <p className="font-medium">{control.label || control.type}</p>
            <p className="text-sm text-gray-500">Type: {control.type}</p>
          </div>
        );
    }
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
        return 'w-full';
    }
  };

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