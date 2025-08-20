import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import DoctorTiming from './components/DoctorTiming';
import MyAppointments from './components/MyAppointments';
import Prescriptions from './components/Prescriptions';
import ChatSupport from './components/ChatSupport';
import Login from './components/Login';
import Profile from './components/Profile';
import { autoInitializeDatabase } from './services/databaseInit';

// Main App Content Component
function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await autoInitializeDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'doctor-timing':
        return <DoctorTiming />;
      case 'my-appointments':
        return <MyAppointments />;
      case 'prescriptions':
        return <Prescriptions />;
      case 'chat-support':
        return <ChatSupport />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing MediCare Hospital</h2>
          <p className="text-gray-600">Setting up your healthcare platform...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!currentUser) {
    return (
      <Login 
        onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
        isRegisterMode={isRegisterMode}
      />
    );
  }

  // Show main app if user is authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
}

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;