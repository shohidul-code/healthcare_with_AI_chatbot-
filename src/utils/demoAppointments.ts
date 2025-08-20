// Demo appointments and prescriptions to populate after database initialization

export const createDemoAppointments = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    "appointment_demo_001": {
      patientId: "demo_patient_123",
      doctorId: "doctor_001",
      appointmentDetails: {
        date: tomorrow.toISOString().split('T')[0],
        timeSlot: "10:30 AM",
        duration: 30,
        type: "consultation",
        status: "upcoming",
        location: "MediCare Hospital, Main Building",
        roomNumber: "A-201"
      },
      patientInfo: {
        name: "John Doe",
        phoneNumber: "+1234567890",
        email: "patient@example.com",
        reasonForVisit: "Regular heart checkup and blood pressure monitoring",
        symptoms: ["mild chest discomfort", "occasional shortness of breath"],
        priority: "normal"
      },
      timestamps: {
        createdAt: new Date().toISOString(),
        scheduledAt: tomorrow.toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        cancelledAt: null
      },
      notes: {
        patientNotes: "Please check my recent blood pressure readings",
        doctorNotes: "",
        adminNotes: "Patient prefers morning appointments"
      },
      reminders: {
        sent24h: false,
        sent2h: false,
        smsReminder: true,
        emailReminder: true
      }
    },
    "appointment_demo_002": {
      patientId: "demo_patient_123",
      doctorId: "doctor_002",
      appointmentDetails: {
        date: nextWeek.toISOString().split('T')[0],
        timeSlot: "03:00 PM",
        duration: 30,
        type: "follow-up",
        status: "upcoming",
        location: "MediCare Hospital, Main Building",
        roomNumber: "B-305"
      },
      patientInfo: {
        name: "John Doe",
        phoneNumber: "+1234567890",
        email: "patient@example.com",
        reasonForVisit: "Follow-up for neurological assessment",
        symptoms: ["mild headaches", "memory concerns"],
        priority: "normal"
      },
      timestamps: {
        createdAt: new Date().toISOString(),
        scheduledAt: nextWeek.toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null,
        cancelledAt: null
      },
      notes: {
        patientNotes: "Headaches have been more frequent lately",
        doctorNotes: "",
        adminNotes: "Follow-up from previous consultation"
      },
      reminders: {
        sent24h: false,
        sent2h: false,
        smsReminder: true,
        emailReminder: true
      }
    },
    "appointment_demo_003": {
      patientId: "demo_patient_123",
      doctorId: "doctor_001",
      appointmentDetails: {
        date: "2025-01-15",
        timeSlot: "11:00 AM",
        duration: 30,
        type: "consultation",
        status: "completed",
        location: "MediCare Hospital, Main Building",
        roomNumber: "A-201"
      },
      patientInfo: {
        name: "John Doe",
        phoneNumber: "+1234567890",
        email: "patient@example.com",
        reasonForVisit: "Annual cardiac screening",
        symptoms: [],
        priority: "normal"
      },
      timestamps: {
        createdAt: "2025-01-10T10:30:00Z",
        scheduledAt: "2025-01-15T11:00:00Z",
        updatedAt: "2025-01-15T12:00:00Z",
        completedAt: "2025-01-15T11:45:00Z",
        cancelledAt: null
      },
      notes: {
        patientNotes: "Annual checkup",
        doctorNotes: "Patient shows good cardiac health. Recommend regular exercise and follow-up in 6 months.",
        adminNotes: "Completed successfully"
      },
      reminders: {
        sent24h: true,
        sent2h: true,
        smsReminder: true,
        emailReminder: true
      }
    }
  };
};

export const createDemoPrescriptions = () => {
  return {
    "prescription_demo_001": {
      patientId: "demo_patient_123",
      doctorId: "doctor_001",
      appointmentId: "appointment_demo_003",
      prescriptionDetails: {
        title: "Blood Pressure Medication",
        type: "medication",
        status: "active",
        prescribedDate: "2025-01-15",
        expiryDate: "2025-04-15",
        instructions: "Take one tablet daily after breakfast with water"
      },
      medications: {
        med1: {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "once daily",
          duration: "3 months",
          instructions: "Take with food to reduce stomach upset",
          quantity: "90 tablets"
        },
        med2: {
          name: "Aspirin",
          dosage: "81mg",
          frequency: "once daily",
          duration: "3 months",
          instructions: "Take with meal to prevent stomach irritation",
          quantity: "90 tablets"
        }
      },
      documents: {
        doc1: {
          fileName: "prescription_bp_medication_20250115.pdf",
          fileUrl: "https://storage.example.com/prescriptions/prescription_bp_medication_20250115.pdf",
          fileType: "pdf",
          fileSize: "1.2MB",
          uploadedAt: "2025-01-15T14:30:00Z"
        }
      },
      timestamps: {
        createdAt: "2025-01-15T14:30:00Z",
        updatedAt: "2025-01-15T14:30:00Z"
      },
      notes: "Patient should monitor blood pressure daily and maintain a log. Follow-up in 4 weeks."
    },
    "prescription_demo_002": {
      patientId: "demo_patient_123",
      doctorId: "doctor_002",
      appointmentId: "",
      prescriptionDetails: {
        title: "Blood Test Results - Lipid Panel",
        type: "lab-report",
        status: "completed",
        prescribedDate: "2025-01-10",
        expiryDate: "2025-01-10",
        instructions: "Review results with your primary care physician"
      },
      medications: {},
      documents: {
        doc1: {
          fileName: "blood_test_lipid_panel_20250110.pdf",
          fileUrl: "https://storage.example.com/lab-results/blood_test_lipid_panel_20250110.pdf",
          fileType: "pdf",
          fileSize: "856KB",
          uploadedAt: "2025-01-10T16:45:00Z"
        }
      },
      timestamps: {
        createdAt: "2025-01-10T16:45:00Z",
        updatedAt: "2025-01-10T16:45:00Z"
      },
      notes: "All lipid levels within normal range. Continue current diet and exercise regimen."
    },
    "prescription_demo_003": {
      patientId: "demo_patient_123",
      doctorId: "doctor_003",
      appointmentId: "",
      prescriptionDetails: {
        title: "X-Ray Report - Chest",
        type: "x-ray",
        status: "completed",
        prescribedDate: "2025-01-08",
        expiryDate: "2025-01-08",
        instructions: "Chest X-ray shows normal lung fields"
      },
      medications: {},
      documents: {
        doc1: {
          fileName: "chest_xray_20250108.jpg",
          fileUrl: "https://storage.example.com/xrays/chest_xray_20250108.jpg",
          fileType: "jpg",
          fileSize: "3.2MB",
          uploadedAt: "2025-01-08T11:20:00Z"
        }
      },
      timestamps: {
        createdAt: "2025-01-08T11:20:00Z",
        updatedAt: "2025-01-08T11:20:00Z"
      },
      notes: "No abnormalities detected. Lungs appear clear and healthy."
    }
  };
};

