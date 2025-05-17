import React from 'react';
import { useQuestionnaire } from '../../contexts/QuestionnaireContext';
import DesignTab from './tabs/DesignTab';
import PreviewTab from './tabs/PreviewTab';
import JsonTab from './tabs/JsonTab';
import StylesTab from './tabs/StylesTab';

const DesignerTabs: React.FC = () => {
  const { activeTabIndex, setActiveTabIndex } = useQuestionnaire();

  const tabs = [
    { name: 'Design', component: <DesignTab /> },
    { name: 'Preview', component: <PreviewTab /> },
    { name: 'Styles', component: <StylesTab /> },
    { name: 'JSON', component: <JsonTab /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              onClick={() => setActiveTabIndex(index)}
              className={`
                py-4 px-6 text-center border-b-2 font-medium text-sm;
                ${
                  index === activeTabIndex
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
              aria-current={index === activeTabIndex ? 'page' : undefined}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-auto">
        {tabs[activeTabIndex].component}
      </div>
    </div>
  );
};

export default DesignerTabs;