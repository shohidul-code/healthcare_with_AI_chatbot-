import React, { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import { DoctorService, AppointmentService } from '../services/firebase';
import { Doctor } from '../types/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorTiming() {
  const { currentUser } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<{doctorId: string, day: string, slotId: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{doctor: Doctor, doctorId: string} | null>(null);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('today');
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    email: '',
    reasonForVisit: ''
  });

  // Pre-populate form with current user data when available
  useEffect(() => {
    if (currentUser && isModalOpen) {
      setFormData(prev => ({
        ...prev,
        patientName: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser, isModalOpen]);

  // Load doctors from Firebase
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const doctorsData = await DoctorService.getAllDoctors();
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Error loading doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();

    // Set up real-time listener
    const unsubscribe = DoctorService.onDoctorsChange((doctorsData) => {
      if (doctorsData) {
        setDoctors(doctorsData);
      }
    });

    return unsubscribe;
  }, []);

  const handleSlotClick = (doctorId: string, day: string, slotId: string, slot: any) => {
    if (slot.available) {
      setSelectedSlot({ doctorId, day, slotId });
    }
  };

  const handleBookAppointment = (doctor: Doctor, doctorId: string) => {
    setSelectedDoctor({ doctor, doctorId });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setFormData({
      patientName: '',
      phoneNumber: '',
      email: '',
      reasonForVisit: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConfirmBooking = async () => {
    if (!currentUser) {
      alert('Please log in to book an appointment');
      return;
    }

    if (!selectedDoctor || !selectedSlot) {
      alert('Please select a doctor and time slot');
      return;
    }

    if (!formData.patientName || !formData.phoneNumber || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const selectedSlotData = getSelectedSlotData();
      
      // Create appointment object for Firebase (without patientId - it's implicit in the user path)
      const appointment = {
        doctorId: selectedDoctor.doctorId,
        appointmentDetails: {
          date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          }),
          timeSlot: selectedSlotData?.time || 'Unknown',
          duration: 30,
          type: 'consultation' as const,
          status: 'upcoming' as const,
          location: 'MediCare Hospital, Main Building',
          roomNumber: 'A-101'
        },
        patientInfo: {
          name: formData.patientName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          reasonForVisit: formData.reasonForVisit,
          priority: 'normal' as const
        },
        timestamps: {
          createdAt: new Date().toISOString(),
          scheduledAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          completedAt: null,
          cancelledAt: null
        },
        notes: {
          patientNotes: formData.reasonForVisit,
          doctorNotes: '',
          adminNotes: ''
        },
        reminders: {
          sent24h: false,
          sent2h: false,
          smsReminder: true,
          emailReminder: true
        }
      };

      // Save appointment to Firebase using the new user-centric method
      await AppointmentService.createAppointment(currentUser.uid, appointment);
      
      // Update doctor's time slot availability
      await DoctorService.updateTimeSlot(
        selectedSlot.doctorId,
        selectedSlot.day,
        selectedSlot.slotId,
        false,
        currentUser.uid
      );

      alert('Appointment booked successfully!');
      handleCloseModal();
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  const getSelectedTimeSlot = () => {
    const slotData = getSelectedSlotData();
    return slotData?.time || 'No time selected';
  };

  const getSelectedSlotData = () => {
    if (selectedSlot && selectedDoctor) {
      const doctor = doctors[selectedSlot.doctorId];
      const daySchedule = doctor?.schedule?.[selectedSlot.day as keyof typeof doctor.schedule];
      return daySchedule?.timeSlots?.[selectedSlot.slotId] || null;
    }
    return null;
  };

  const getCurrentDayTimeSlots = (doctor: Doctor) => {
    // For demo purposes, using Monday's schedule
    // In a real app, you'd determine the current day or selected day
    const daySchedule = doctor.schedule?.monday;
    return daySchedule?.timeSlots || {};
  };

  // Filter doctors based on selected department
  const filteredDoctors = Object.entries(doctors)
    .map(([id, doctor]) => ({ id, ...doctor }))
    .filter(doctor => {
      if (selectedDepartment === 'all') return true;
      return doctor.profile.specialty.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
             doctor.profile.department?.toLowerCase().includes(selectedDepartment.toLowerCase());
    });

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeFilter(e.target.value);
  };

  const applyFilters = () => {
    // Filters are applied automatically through state changes
    console.log('Filters applied:', { selectedDepartment, selectedTimeFilter });
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Doctor Timing & Schedules</h1>
          <p className="text-xl text-blue-100">View doctor availability and book appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <select 
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="dermatology">Dermatology</option>
            <option value="general">General Medicine</option>
          </select>
          
          <select 
            value={selectedTimeFilter}
            onChange={handleTimeFilterChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
          </select>
          
          <button 
            onClick={applyFilters}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Apply Filters
          </button>
          
          {(selectedDepartment !== 'all' || selectedTimeFilter !== 'today') && (
            <button
              onClick={() => {
                setSelectedDepartment('all');
                setSelectedTimeFilter('today');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading doctors...</p>
          </div>
        )}

        {/* Doctor Cards */}
        {!loading && (
          <>
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No doctors found</h3>
                <p className="text-gray-500">
                  {selectedDepartment !== 'all' 
                    ? `No doctors available in ${selectedDepartment} department.` 
                    : 'No doctors match your current filters.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredDoctors.map((doctor) => {
              const timeSlots = getCurrentDayTimeSlots(doctor);
              return (
                <div key={doctor.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{doctor.profile.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.profile.specialty}</p>
                        <p className="text-gray-600 text-sm">{doctor.profile.experience}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      doctor.profile.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : doctor.profile.status === 'busy'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {doctor.profile.status.charAt(0).toUpperCase() + doctor.profile.status.slice(1)}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Available Time Slots</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(timeSlots).map(([slotId, slot]) => {
                        const isSelected = selectedSlot?.doctorId === doctor.id && selectedSlot?.slotId === slotId;
                        return (
                          <div
                            key={slotId}
                            onClick={() => handleSlotClick(doctor.id, 'monday', slotId, slot)}
                            className={`p-2 text-center text-sm rounded-lg border transition-all duration-200 ${
                              slot.available
                                ? isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white cursor-pointer'
                                  : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 hover:border-green-300 cursor-pointer'
                                : 'bg-red-50 border-red-200 text-red-800 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBookAppointment(doctor, doctor.id)}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    disabled={doctor.profile.status === 'busy' || doctor.profile.status === 'offline'}
                  >
                    Book Appointment
                  </button>
                </div>
              );
            })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name:
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number:
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Visit:
                </label>
                <textarea
                  name="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe the reason for your visit"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">
                  <strong>Doctor:</strong> {selectedDoctor?.doctor.profile.name}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Time Slot:</strong> {getSelectedTimeSlot()}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}