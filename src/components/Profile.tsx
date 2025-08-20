import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../services/auth';
import { User as UserType } from '../types/firebase';

const Profile: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editForm, setEditForm] = useState({
    displayName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      phoneNumber: '',
      relationship: ''
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const loadUserProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const profile = await AuthService.getUserProfile(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
        setEditForm({
          displayName: profile.profile.displayName || '',
          phoneNumber: profile.profile.phoneNumber || '',
          dateOfBirth: profile.profile.dateOfBirth || '',
          gender: profile.profile.gender || '',
          address: profile.profile.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          emergencyContact: profile.profile.emergencyContact || {
            name: '',
            phoneNumber: '',
            relationship: ''
          }
        });
      }
    } catch (error) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await AuthService.updateUserProfile(currentUser.uid, {
        ...editForm,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
      await loadUserProfile(); // Reload the profile
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
              <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
              </div>
              <div className="px-6 py-4 space-y-6">
                {/* Name */}
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        name="displayName"
                        value={editForm.displayName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{userProfile.profile.displayName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-gray-900">{userProfile.profile.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editForm.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{userProfile.profile.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    {editing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editForm.dateOfBirth}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">
                        {userProfile.profile.dateOfBirth 
                          ? new Date(userProfile.profile.dateOfBirth).toLocaleDateString()
                          : 'Not provided'
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    {editing ? (
                      <select
                        name="gender"
                        value={editForm.gender}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="mt-1 text-gray-900 capitalize">
                        {userProfile.profile.gender || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {editing && (
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2 inline" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2 inline" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Account Status</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Role</p>
                    <p className="text-sm text-gray-900 capitalize">{userProfile.profile.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Member Since</p>
                    <p className="text-sm text-gray-900">
                      {new Date(userProfile.profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Login</p>
                    <p className="text-sm text-gray-900">
                      {new Date(userProfile.profile.lastLoginAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
