import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { currentUser, signOut } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'doctor-timing', label: 'Doctor Timing' },
    { id: 'my-appointments', label: 'My Appointments' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'chat-support', label: 'Chat Support' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
    onTabChange('profile');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileDropdown(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">
          MediCare Hospital
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Navigation Items */}
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-white/20 font-medium'
                    : 'hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Profile Dropdown */}
          {currentUser && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">
                  {currentUser.displayName || 'User'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${
                  showProfileDropdown ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser.displayName}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}