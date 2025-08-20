import React from 'react';
import { Calendar, FileText, MessageCircle, User, Pill, Stethoscope } from 'lucide-react';

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export default function Dashboard({ onTabChange }: DashboardProps) {
  const stats = [
    { number: '150+', label: 'Doctors Available' },
    { number: '24/7', label: 'Emergency Service' },
    { number: '10k+', label: 'Patients Served' },
  ];

  const quickActions = [
    {
      icon: Calendar,
      title: 'Doctor Timing',
      description: 'View doctor schedules and availability',
      buttonText: 'View Schedules',
      action: () => onTabChange('doctor-timing'),
      color: 'text-blue-500'
    },
    {
      icon: FileText,
      title: 'Upload Prescription',
      description: 'Upload and manage your prescriptions',
      buttonText: 'Upload Now',
      action: () => onTabChange('prescriptions'),
      color: 'text-orange-500'
    },
    {
      icon: MessageCircle,
      title: 'Chat Support',
      description: 'Get instant help from our support team',
      buttonText: 'Start Chat',
      action: () => onTabChange('chat-support'),
      color: 'text-purple-500'
    },
  ];

  const recentActivities = [
    {
      icon: User,
      title: 'Appointment with Dr. Smith',
      description: 'Scheduled for tomorrow at 10:00 AM',
      time: '2 hours ago',
      color: 'text-yellow-500'
    },
    {
      icon: FileText,
      title: 'Prescription Uploaded',
      description: 'Blood test results have been uploaded',
      time: '1 day ago',
      color: 'text-blue-500'
    },
    {
      icon: Pill,
      title: 'Medication Reminder',
      description: 'Take your evening medication',
      time: '2 days ago',
      color: 'text-red-500'
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to MediCare Hospital Analysis System
          </h1>
          <p className="text-xl text-blue-100 mb-12">
            Comprehensive healthcare management platform for patients and medical staff
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {quickActions.map((action, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="mb-6">
                <action.icon className={`w-16 h-16 mx-auto ${action.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{action.title}</h3>
              <p className="text-gray-600 mb-6">{action.description}</p>
              <button
                onClick={action.action}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                {action.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Recent Activities</h3>
          
          <div className="space-y-6">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`p-2 rounded-full bg-gray-100`}>
                  <activity.icon className={`w-6 h-6 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediCare Hospital</h3>
              <p className="text-gray-300">
                Providing quality healthcare services with advanced technology and compassionate care.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p>📞 +880-1799-725100</p>
                <p>✉️ info@medicare.com</p>
                <p>📍 469 Health St, Medical City</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Emergency</h4>
              <div className="space-y-2 text-gray-300">
                <p>🚨 24/7 Emergency Line</p>
                <p>📞 999-HELP</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            © 2025 MediCare Hospital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
