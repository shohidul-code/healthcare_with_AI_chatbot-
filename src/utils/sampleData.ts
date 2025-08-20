// Sample data to populate Firebase database
// This file contains sample data that matches your Firebase schema

export const sampleDoctors = {
  "doctor_001": {
    "profile": {
      "name": "Dr. John Smith",
      "email": "john.smith@medicare.com",
      "specialty": "Cardiologist",
      "experience": "15 years experience",
      "licenseNumber": "MD123456",
      "phoneNumber": "+1555123456",
      "department": "cardiology",
      "status": "available",
      "avatar": "https://example.com/avatar1.jpg",
      "qualification": "MBBS, MD Cardiology",
      "bio": "Experienced cardiologist specializing in heart disease prevention and treatment",
      "createdAt": "2025-01-01T00:00:00Z",
      "isActive": true
    },
    "schedule": {
      "monday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "breakTime": {
          "start": "12:00",
          "end": "13:00"
        },
        "timeSlots": {
          "slot1": {
            "time": "09:00 AM",
            "available": true,
            "duration": 30
          },
          "slot2": {
            "time": "10:30 AM",
            "available": true,
            "duration": 30
          },
          "slot3": {
            "time": "11:00 AM",
            "available": false,
            "duration": 30,
            "bookedBy": "user_001"
          },
          "slot4": {
            "time": "02:00 PM",
            "available": true,
            "duration": 30
          },
          "slot5": {
            "time": "03:30 PM",
            "available": true,
            "duration": 30
          },
          "slot6": {
            "time": "04:00 PM",
            "available": false,
            "duration": 30,
            "bookedBy": "user_002"
          }
        }
      },
      "tuesday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "17:00",
        "timeSlots": {
          "slot1": {
            "time": "09:00 AM",
            "available": true,
            "duration": 30
          },
          "slot2": {
            "time": "10:30 AM",
            "available": true,
            "duration": 30
          }
        }
      }
    },
    "stats": {
      "totalAppointments": 245,
      "totalPatients": 189,
      "rating": 4.8,
      "reviewCount": 67
    }
  },
  "doctor_002": {
    "profile": {
      "name": "Dr. Sarah Johnson",
      "email": "sarah.johnson@medicare.com",
      "specialty": "Neurologist",
      "experience": "12 years experience",
      "licenseNumber": "MD789012",
      "phoneNumber": "+1555123457",
      "department": "neurology",
      "status": "available",
      "avatar": "https://example.com/avatar2.jpg",
      "qualification": "MBBS, MD Neurology",
      "bio": "Specialized neurologist focusing on brain and nervous system disorders",
      "createdAt": "2025-01-01T00:00:00Z",
      "isActive": true
    },
    "schedule": {
      "monday": {
        "isAvailable": true,
        "startTime": "08:30",
        "endTime": "16:30",
        "timeSlots": {
          "slot1": {
            "time": "08:30 AM",
            "available": true,
            "duration": 30
          },
          "slot2": {
            "time": "10:00 AM",
            "available": true,
            "duration": 30
          },
          "slot3": {
            "time": "11:30 AM",
            "available": true,
            "duration": 30
          },
          "slot4": {
            "time": "01:00 PM",
            "available": false,
            "duration": 30,
            "bookedBy": "user_003"
          },
          "slot5": {
            "time": "03:00 PM",
            "available": true,
            "duration": 30
          },
          "slot6": {
            "time": "04:30 PM",
            "available": true,
            "duration": 30
          }
        }
      }
    },
    "stats": {
      "totalAppointments": 189,
      "totalPatients": 145,
      "rating": 4.9,
      "reviewCount": 52
    }
  },
  "doctor_003": {
    "profile": {
      "name": "Dr. Michael Brown",
      "email": "michael.brown@medicare.com",
      "specialty": "Orthopedic Surgeon",
      "experience": "18 years experience",
      "licenseNumber": "MD345678",
      "phoneNumber": "+1555123458",
      "department": "orthopedics",
      "status": "busy",
      "avatar": "https://example.com/avatar3.jpg",
      "qualification": "MBBS, MS Orthopedics",
      "bio": "Expert orthopedic surgeon specializing in joint replacement and sports injuries",
      "createdAt": "2025-01-01T00:00:00Z",
      "isActive": true
    },
    "schedule": {
      "monday": {
        "isAvailable": true,
        "startTime": "09:00",
        "endTime": "15:00",
        "timeSlots": {
          "slot1": {
            "time": "09:00 AM",
            "available": false,
            "duration": 30,
            "bookedBy": "user_004"
          },
          "slot2": {
            "time": "10:30 AM",
            "available": true,
            "duration": 30
          },
          "slot3": {
            "time": "11:00 AM",
            "available": true,
            "duration": 30
          }
        }
      }
    },
    "stats": {
      "totalAppointments": 312,
      "totalPatients": 267,
      "rating": 4.7,
      "reviewCount": 89
    }
  },
  "doctor_004": {
    "profile": {
      "name": "Dr. Emily Davis",
      "email": "emily.davis@medicare.com",
      "specialty": "Pediatrician",
      "experience": "10 years experience",
      "licenseNumber": "MD901234",
      "phoneNumber": "+1555123459",
      "department": "pediatrics",
      "status": "available",
      "avatar": "https://example.com/avatar4.jpg",
      "qualification": "MBBS, MD Pediatrics",
      "bio": "Caring pediatrician dedicated to children's health and development",
      "createdAt": "2025-01-01T00:00:00Z",
      "isActive": true
    },
    "schedule": {
      "monday": {
        "isAvailable": true,
        "startTime": "09:30",
        "endTime": "17:30",
        "timeSlots": {
          "slot1": {
            "time": "09:30 AM",
            "available": true,
            "duration": 30
          },
          "slot2": {
            "time": "11:00 AM",
            "available": true,
            "duration": 30
          },
          "slot3": {
            "time": "12:30 PM",
            "available": true,
            "duration": 30
          }
        }
      }
    },
    "stats": {
      "totalAppointments": 178,
      "totalPatients": 134,
      "rating": 4.9,
      "reviewCount": 45
    }
  }
};

export const sampleUsers = {
  "demo_patient_123": {
    "profile": {
      "email": "patient@example.com",
      "displayName": "John Doe",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-01",
      "gender": "male",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "emergencyContact": {
        "name": "Jane Doe",
        "phoneNumber": "+1234567891",
        "relationship": "spouse"
      },
      "createdAt": "2025-01-15T10:30:00Z",
      "lastLoginAt": "2025-01-18T14:20:00Z",
      "isActive": true
    }
  }
};

export const sampleDepartments = {
  "dept_001": {
    "name": "Cardiology",
    "description": "Heart and cardiovascular care",
    "head": "doctor_001",
    "location": {
      "building": "Main Building",
      "floor": "2nd Floor",
      "wing": "East Wing"
    },
    "contactInfo": {
      "phone": "+1555123456",
      "email": "cardiology@medicare.com",
      "emergencyPhone": "+1555911911"
    },
    "services": [
      "ECG",
      "Echocardiogram",
      "Stress Testing",
      "Cardiac Catheterization"
    ],
    "doctors": ["doctor_001"],
    "isActive": true
  },
  "dept_002": {
    "name": "Neurology",
    "description": "Brain and nervous system care",
    "head": "doctor_002",
    "location": {
      "building": "Main Building",
      "floor": "3rd Floor",
      "wing": "West Wing"
    },
    "contactInfo": {
      "phone": "+1555123457",
      "email": "neurology@medicare.com",
      "emergencyPhone": "+1555911912"
    },
    "services": [
      "EEG",
      "MRI",
      "CT Scan",
      "Neurological Examination"
    ],
    "doctors": ["doctor_002"],
    "isActive": true
  },
  "dept_003": {
    "name": "Orthopedics",
    "description": "Bone and joint care",
    "head": "doctor_003",
    "location": {
      "building": "Surgical Building",
      "floor": "1st Floor",
      "wing": "North Wing"
    },
    "contactInfo": {
      "phone": "+1555123458",
      "email": "orthopedics@medicare.com",
      "emergencyPhone": "+1555911913"
    },
    "services": [
      "X-Ray",
      "Joint Replacement",
      "Arthroscopy",
      "Physical Therapy"
    ],
    "doctors": ["doctor_003"],
    "isActive": true
  },
  "dept_004": {
    "name": "Pediatrics",
    "description": "Children's healthcare",
    "head": "doctor_004",
    "location": {
      "building": "Children's Wing",
      "floor": "1st Floor",
      "wing": "South Wing"
    },
    "contactInfo": {
      "phone": "+1555123459",
      "email": "pediatrics@medicare.com",
      "emergencyPhone": "+1555911914"
    },
    "services": [
      "Vaccinations",
      "Growth Monitoring",
      "Developmental Assessment",
      "Pediatric Emergency Care"
    ],
    "doctors": ["doctor_004"],
    "isActive": true
  }
};

export const sampleSystemSettings = {
  "hospitalInfo": {
    "name": "MediCare Hospital",
    "address": "123 Health St, Medical City",
    "phone": "+1555123456",
    "email": "info@medicare.com",
    "emergencyPhone": "+1555911911",
    "website": "https://medicare.com",
    "operatingHours": {
      "monday": { "open": "06:00", "close": "22:00" },
      "tuesday": { "open": "06:00", "close": "22:00" },
      "wednesday": { "open": "06:00", "close": "22:00" },
      "thursday": { "open": "06:00", "close": "22:00" },
      "friday": { "open": "06:00", "close": "22:00" },
      "saturday": { "open": "08:00", "close": "20:00" },
      "sunday": { "open": "08:00", "close": "18:00" }
    }
  },
  "chatSettings": {
    "maxConcurrentChats": 5,
    "autoResponseEnabled": true,
    "autoResponseMessage": "Hello! Welcome to MediCare Hospital support. How can I help you today?",
    "autoResponseDelay": 1000,
    "operatingHours": {
      "monday": { "start": "08:00", "end": "20:00" },
      "tuesday": { "start": "08:00", "end": "20:00" },
      "wednesday": { "start": "08:00", "end": "20:00" },
      "thursday": { "start": "08:00", "end": "20:00" },
      "friday": { "start": "08:00", "end": "20:00" },
      "saturday": { "start": "09:00", "end": "18:00" },
      "sunday": { "start": "10:00", "end": "16:00" }
    },
    "offlineMessage": "Our support team is currently offline. Please leave a message and we'll get back to you soon.",
    "escalationRules": {
      "responseTimeThreshold": 300,
      "maxWaitTime": 900,
      "keywords": ["emergency", "urgent", "pain", "bleeding"]
    }
  },
  "appointmentSettings": {
    "maxAdvanceBooking": 90,
    "minAdvanceBooking": 1,
    "slotDuration": 30,
    "bufferTime": 15,
    "cancellationPolicy": {
      "minNoticeHours": 24,
      "penaltyFee": 25
    }
  }
};

// Function to populate Firebase with sample data
export const populateFirebaseWithSampleData = async () => {
  try {
    const { FirebaseService } = await import('../services/firebase');
    
    // Populate doctors
    console.log('Populating doctors...');
    for (const [doctorId, doctorData] of Object.entries(sampleDoctors)) {
      await FirebaseService.update(`doctors/${doctorId}`, doctorData);
    }
    
    // Populate users
    console.log('Populating users...');
    for (const [userId, userData] of Object.entries(sampleUsers)) {
      await FirebaseService.update(`users/${userId}`, userData);
    }
    
    // Populate departments
    console.log('Populating departments...');
    for (const [deptId, deptData] of Object.entries(sampleDepartments)) {
      await FirebaseService.update(`departments/${deptId}`, deptData);
    }
    
    // Populate system settings
    console.log('Populating system settings...');
    await FirebaseService.update('systemSettings', sampleSystemSettings);
    
    console.log('Sample data populated successfully!');
  } catch (error) {
    console.error('Error populating sample data:', error);
  }
};

