import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/config';
import { 
  GlobalSettings, 
  Doctor, 
  Department,
  HospitalOperatingHours
} from '../types/firebase';

// Check if database is initialized
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const dbRef = ref(database, '/');
    const snapshot = await get(dbRef);
    
    // Check if essential collections exist
    const data = snapshot.val();
    return !!(data && data.doctors && data.globalSettings);
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
};

// Initialize database with new schema and demo data
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing Firebase database with new user-centric schema...');

    // Create sample doctors
    const sampleDoctors: Record<string, Doctor> = {
      doctor_001: {
        profile: {
          name: "Dr. John Smith",
          email: "john.smith@medicare.com",
          specialty: "Cardiologist",
          experience: "15 years experience",
          licenseNumber: "MD123456",
          phoneNumber: "+1555123456",
          department: "cardiology",
          status: "available",
          avatar: "https://example.com/avatar1.jpg",
          qualification: "MBBS, MD Cardiology",
          bio: "Experienced cardiologist specializing in heart disease prevention and treatment",
          createdAt: "2025-01-01T00:00:00Z",
          isActive: true
        },
        schedule: {
          monday: {
            isAvailable: true,
            startTime: "09:00",
            endTime: "17:00",
            breakTime: { start: "12:00", end: "13:00" },
            timeSlots: {
              slot1: { available: true, duration: 30, time: "09:00 AM" },
              slot2: { available: true, duration: 30, time: "10:30 AM" },
              slot3: { available: true, duration: 30, time: "11:00 AM" },
              slot4: { available: true, duration: 30, time: "02:00 PM" },
              slot5: { available: true, duration: 30, time: "03:30 PM" },
              slot6: { available: true, duration: 30, time: "04:00 PM" }
            }
          }
        },
        stats: {
          rating: 4.8,
          reviewCount: 67,
          totalAppointments: 245,
          totalPatients: 189
        }
      },
      doctor_002: {
        profile: {
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@medicare.com",
          specialty: "Neurologist",
          experience: "12 years experience",
          licenseNumber: "MD789012",
          phoneNumber: "+1555123457",
          department: "neurology",
          status: "available",
          avatar: "https://example.com/avatar2.jpg",
          qualification: "MBBS, MD Neurology",
          bio: "Specialized neurologist focusing on brain and nervous system disorders",
          createdAt: "2025-01-01T00:00:00Z",
          isActive: true
        },
        schedule: {
          monday: {
            isAvailable: true,
            startTime: "08:30",
            endTime: "16:30",
            timeSlots: {
              slot1: { available: true, duration: 30, time: "08:30 AM" },
              slot2: { available: true, duration: 30, time: "10:00 AM" },
              slot3: { available: true, duration: 30, time: "11:30 AM" },
              slot4: { available: true, duration: 30, time: "01:00 PM" },
              slot5: { available: true, duration: 30, time: "03:00 PM" },
              slot6: { available: true, duration: 30, time: "04:30 PM" }
            }
          }
        },
        stats: {
          rating: 4.9,
          reviewCount: 52,
          totalAppointments: 189,
          totalPatients: 145
        }
      }
    };

    // Create sample departments
    const sampleDepartments: Record<string, Department> = {
      dept_001: {
        name: "Cardiology",
        description: "Heart and cardiovascular care",
        head: "doctor_001",
        location: {
          building: "Main Building",
          floor: "2nd Floor",
          wing: "East Wing"
        },
        contactInfo: {
          phone: "+1555123456",
          email: "cardiology@medicare.com",
          emergencyPhone: "+1555911911"
        },
        services: ["ECG", "Echocardiogram", "Stress Testing", "Cardiac Catheterization"],
        doctors: ["doctor_001"],
        isActive: true
      },
      dept_002: {
        name: "Neurology",
        description: "Brain and nervous system care",
        head: "doctor_002",
        location: {
          building: "Main Building",
          floor: "3rd Floor",
          wing: "West Wing"
        },
        contactInfo: {
          phone: "+1555123457",
          email: "neurology@medicare.com",
          emergencyPhone: "+1555911912"
        },
        services: ["EEG", "MRI", "CT Scan", "Neurological Examination"],
        doctors: ["doctor_002"],
        isActive: true
      }
    };

    // Create global settings
    const operatingHours: HospitalOperatingHours = {
      monday: { open: "06:00", close: "22:00" },
      tuesday: { open: "06:00", close: "22:00" },
      wednesday: { open: "06:00", close: "22:00" },
      thursday: { open: "06:00", close: "22:00" },
      friday: { open: "06:00", close: "22:00" },
      saturday: { open: "08:00", close: "20:00" },
      sunday: { open: "08:00", close: "18:00" }
    };

    const globalSettings: GlobalSettings = {
      hospitalInfo: {
        name: "MediCare Hospital",
        address: "123 Health St, Medical City",
        phone: "+1555123456",
        email: "info@medicare.com",
        emergencyPhone: "+1555911911",
        website: "https://medicare.com",
        operatingHours: operatingHours
      },
      appointmentSettings: {
        maxAdvanceBooking: 90,
        minAdvanceBooking: 1,
        slotDuration: 30,
        bufferTime: 15,
        cancellationPolicy: {
          minNoticeHours: 24,
          penaltyFee: 25
        }
      },
      chatSettings: {
        maxConcurrentChats: 5,
        autoResponseEnabled: true,
        autoResponseMessage: "Hello! Welcome to MediCare Hospital support. How can I help you today?",
        autoResponseDelay: 1000,
        operatingHours: {
          monday: { start: "08:00", end: "20:00" },
          tuesday: { start: "08:00", end: "20:00" },
          wednesday: { start: "08:00", end: "20:00" },
          thursday: { start: "08:00", end: "20:00" },
          friday: { start: "08:00", end: "20:00" },
          saturday: { start: "09:00", end: "18:00" },
          sunday: { start: "10:00", end: "16:00" }
        },
        offlineMessage: "Our support team is currently offline. Please leave a message and we'll get back to you soon.",
        escalationRules: {
          responseTimeThreshold: 300,
          maxWaitTime: 900,
          keywords: ["emergency", "urgent", "pain", "bleeding"]
        }
      }
    };

    // Create analytics with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const analytics = {
      dailyStats: {
        [currentDate]: {
          appointments: {
            total: 0,
            completed: 0,
            cancelled: 0,
            noShow: 0
          },
          chatSupport: {
            totalChats: 0,
            resolved: 0,
            escalated: 0,
            avgResponseTime: 0
          },
          userRegistrations: 0,
          prescriptionsUploaded: 0
        }
      }
    };

    // Create the complete database structure
    const initialData = {
      doctors: sampleDoctors,
      departments: sampleDepartments,
      globalSettings: globalSettings,
      analytics: analytics,
      users: {} // Users will be created when they register
    };

    // Set the data in Firebase
    const dbRef = ref(database, '/');
    await set(dbRef, initialData);

    console.log('✅ Database initialized successfully with new user-centric schema!');
    console.log('📊 Created collections: doctors, departments, globalSettings, analytics');
    console.log('👥 User collections will be created automatically when users register');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Auto-initialize database if not already initialized
export const autoInitializeDatabase = async (): Promise<void> => {
  try {
    const isInitialized = await isDatabaseInitialized();
    
    if (!isInitialized) {
      console.log('📊 Database not initialized. Starting initialization...');
      await initializeDatabase();
    } else {
      console.log('✅ Database already initialized');
    }
  } catch (error) {
    console.error('❌ Error in auto-initialization:', error);
    throw error;
  }
};