import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import QuestionnairesPage from './pages/QuestionnairesPage';
import QuestionnaireDesignerPage from './pages/QuestionnaireDesignerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="questionnaires" element={<QuestionnairesPage />} />
          <Route path="questionnaires/new" element={<QuestionnaireDesignerPage />} />
          <Route path="questionnaires/:id" element={<QuestionnaireDesignerPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;