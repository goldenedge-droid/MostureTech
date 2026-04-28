
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './views/Home';
import Calculators from './views/Calculators';
import Academy from './views/Academy';
import Tutor from './views/Tutor';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('moisture_tech_progress');
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load progress");
      }
    }
  }, []);

  // Save progress on change
  useEffect(() => {
    localStorage.setItem('moisture_tech_progress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home setView={setCurrentView} completedLessons={completedLessons} />;
      case AppView.CALCULATORS:
        return <Calculators />;
      case AppView.ACADEMY:
        return <Academy completedLessons={completedLessons} setCompletedLessons={setCompletedLessons} />;
      case AppView.TUTOR:
        return <Tutor />;
      default:
        return <Home setView={setCurrentView} completedLessons={completedLessons} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
