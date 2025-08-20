import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail, FileText, X } from 'lucide-react';
import { AppointmentService, DoctorService, generateUserId } from '../services/firebase';
import { Appointment, Doctor } from '../types/firebase';
import { useAuth } from '../contexts/AuthContext';

interface AppointmentWithDoctor extends Appointment {
  id: string;
  doctorDetails?: Doctor;
}

export default function MyAppointments() {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDoctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointments = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading appointments for patient:', currentUser.uid);
        const appointmentsData = await AppointmentService.getUserAppointments(currentUser.uid);
        console.log('Appointments data received:', appointmentsData);
        
        // Convert to array and add doctor details
        const appointmentsArray = await Promise.all(
          Object.entries(appointmentsData || {}).map(async ([id, appointment]) => {
            try {
              const doctorDetails = await DoctorService.getDoctor(appointment.doctorId);
              return {
                id,
                ...appointment,
                doctorDetails: doctorDetails || undefined
              };
            } catch (error) {
              console.error('Error loading doctor details:', error);
              return {
                id,
                ...appointment
              };
            }
          })
        );

        console.log('Processed appointments:', appointmentsArray);
        setAppointments(appointmentsArray);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();

    // Set up real-time listener
    const unsubscribe = AppointmentService.onUserAppointmentsChange(currentUser.uid, async (appointmentsData) => {
      console.log('Real-time appointments update:', appointmentsData);
      if (appointmentsData) {
        const appointmentsArray = await Promise.all(
          Object.entries(appointmentsData).map(async ([id, appointment]) => {
            try {
              const doctorDetails = await DoctorService.getDoctor(appointment.doctorId);
              return {
                id,
                ...appointment,
                doctorDetails: doctorDetails || undefined
              };
            } catch (error) {
              return {
                id,
                ...appointment
              };
            }
          })
        );
        setAppointments(appointmentsArray);
      } else {
        setAppointments([]);
      }
    });

    return unsubscribe;
  }, [currentUser]);

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.appointmentDetails.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (appointment: AppointmentWithDoctor) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!currentUser) {
      alert('Please log in to cancel appointments');
      return;
    }

    try {
      await AppointmentService.updateAppointmentStatus(currentUser.uid, appointmentId, 'cancelled');
      
      // Update local state immediately for better UX
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, appointmentDetails: { ...apt.appointmentDetails, status: 'cancelled' as const } }
            : apt
        )
      );
      
      handleCloseModal();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">My Appointments</h1>
          <p className="text-xl text-blue-100">View and manage your scheduled appointments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Appointments' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        )}

        {/* Appointments List */}
        {!loading && filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No appointments found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You haven't booked any appointments yet." 
                : `No ${filter} appointments found.`}
            </p>
          </div>
        ) : !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {appointment.doctorDetails?.profile.name || 'Doctor Name'}
                      </h3>
                      <p className="text-blue-600 text-sm">
                        {appointment.doctorDetails?.profile.specialty || 'Specialty'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.appointmentDetails.status)}`}>
                    {appointment.appointmentDetails.status.charAt(0).toUpperCase() + appointment.appointmentDetails.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(appointment.appointmentDetails.date)}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {appointment.appointmentDetails.timeSlot}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {appointment.appointmentDetails.location}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(appointment)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    View Details
                  </button>
                  {appointment.appointmentDetails.status === 'upcoming' && (
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Doctor Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Doctor Information</h3>
                
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedAppointment.doctorDetails?.profile.name || 'Doctor Name'}
                    </p>
                    <p className="text-blue-600">
                      {selectedAppointment.doctorDetails?.profile.specialty || 'Specialty'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(selectedAppointment.appointmentDetails.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{selectedAppointment.appointmentDetails.timeSlot}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{selectedAppointment.appointmentDetails.location}</span>
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Patient Information</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{selectedAppointment.patientInfo.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{selectedAppointment.patientInfo.phoneNumber}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{selectedAppointment.patientInfo.email}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-start text-gray-600 mb-2">
                    <FileText className="w-4 h-4 mr-2 mt-1" />
                    <span className="font-medium">Reason for Visit:</span>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg ml-6">
                    {selectedAppointment.patientInfo.reasonForVisit}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.appointmentDetails.status)}`}>
                Status: {selectedAppointment.appointmentDetails.status.charAt(0).toUpperCase() + selectedAppointment.appointmentDetails.status.slice(1)}
              </span>
              
              <div className="flex space-x-3">
                {selectedAppointment.appointmentDetails.status === 'upcoming' && (
                  <button
                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Cancel Appointment
                  </button>
                )}
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}