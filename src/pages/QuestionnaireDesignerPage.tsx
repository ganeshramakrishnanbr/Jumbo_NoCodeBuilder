import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Settings, MoreVertical } from 'lucide-react';
import DesignerTabs from '../components/designer/DesignerTabs';
import { QuestionnaireProvider } from '../contexts/QuestionnaireContext';
import { api } from '../services/api';

const QuestionnaireDesignerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('New Questionnaire');
  const [isSaving, setIsSaving] = useState(false);

  const handleGoBack = () => {
    navigate('/questionnaires');
  };

  const handleSave = async () => {
    setIsSaving(true);
    // In a real implementation, this would save to the database via the provider
    // For now, we'll just simulate a save
    setTimeout(() => {
      setIsSaving(false);
      alert('Questionnaire saved successfully!');
    }, 1000);
  };

  return (
    <QuestionnaireProvider>
      <div className="h-full flex flex-col">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleGoBack}
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-medium border-0 focus:ring-0 focus:outline-none"
                placeholder="Questionnaire Title"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-white ${
                isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <Settings size={20} className="text-gray-600" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-hidden">
          <DesignerTabs />
        </div>
      </div>
    </QuestionnaireProvider>
  );
};

export default QuestionnaireDesignerPage;