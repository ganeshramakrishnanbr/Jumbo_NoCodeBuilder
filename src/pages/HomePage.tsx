import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Settings, HelpCircle, Flame } from 'lucide-react';

const HomePage: React.FC = () => {
  const quickLinks = [
    { name: 'New Questionnaire', icon: <FileText size={20} />, description: 'Create a new questionnaire from scratch', path: '/questionnaires/new' },
    { name: 'All Questionnaires', icon: <FileText size={20} />, description: 'View all your questionnaires', path: '/questionnaires' },
    { name: 'Settings', icon: <Settings size={20} />, description: 'Configure application settings', path: '/settings' },
    { name: 'Help & Documentation', icon: <HelpCircle size={20} />, description: 'Learn how to use the application', path: '/help' },
  ];

  const recentQuestionnaires = [
    { id: '1', title: 'Employee Onboarding Form', updatedAt: '2023-05-15T10:30:00Z' },
    { id: '2', title: 'Customer Feedback Survey', updatedAt: '2023-05-14T16:45:00Z' },
    { id: '3', title: 'Product Registration Form', updatedAt: '2023-05-12T09:15:00Z' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Reflexive Questionnaires</h1>
        <p className="text-gray-600">Design dynamic questionnaires with conditional logic and advanced layout options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Links</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="group flex items-start p-4 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white group-hover:bg-blue-700">
                      {link.icon}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900 group-hover:text-blue-800">
                        {link.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Questionnaires</h3>
            </div>
            <div className="px-6 py-4">
              <ul className="divide-y divide-gray-200">
                {recentQuestionnaires.map((questionnaire) => (
                  <li key={questionnaire.id} className="py-3">
                    <Link
                      to={`/questionnaires/${questionnaire.id}`}
                      className="flex items-center group"
                    >
                      <div className="flex-shrink-0">
                        <FileText size={20} className="text-gray-400 group-hover:text-blue-600" />
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {questionnaire.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(questionnaire.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  to="/questionnaires"
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View all questionnaires
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg shadow-sm overflow-hidden text-white">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Flame size={24} className="text-yellow-300" />
                <h3 className="ml-2 text-lg font-medium">Pro Tips</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    1
                  </span>
                  <p className="ml-2 text-sm text-blue-100">
                    Use the Preview tab to test your questionnaire's conditional logic in real-time.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    2
                  </span>
                  <p className="ml-2 text-sm text-blue-100">
                    Column layouts help create responsive forms that look great on all devices.
                  </p>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                    3
                  </span>
                  <p className="ml-2 text-sm text-blue-100">
                    Use the JSON tab to export your questionnaire for integration with other systems.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;