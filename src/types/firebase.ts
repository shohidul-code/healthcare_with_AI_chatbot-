// Firebase Schema Types

// User Profile Types
export interface UserProfile {
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phoneNumber: string;
    relationship: string;
  };
  role: 'admin' | 'user'; // User role
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
  emailVerified: boolean;
}

// System Settings Types
export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  prescriptionReminders: boolean;
  marketingEmails: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'private' | 'friends' | 'public';
  shareDataForResearch: boolean;
  allowCommunicationFromDoctors: boolean;
}

export interface UserSystemSettings {
  preferences: UserPreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

// Chat Support Types (Simplified)
export interface UserConversation {
  id: string;
  conversationInfo: {
    category: 'general' | 'appointment' | 'billing' | 'medical' | 'technical' | 'other';
    language: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'active' | 'resolved' | 'waiting' | 'escalated';
    subject: string;
    type: 'general' | 'medical' | 'technical' | 'emergency';
  };
  metadata: {
    escalated: boolean;
    tags: string[];
  };
  participants: {
    supportAgent?: string;
  };
  timestamps: {
    createdAt: string;
    lastMessageAt: string;
    updatedAt: string;
    resolvedAt?: string;
  };
}

export interface UserChatSupport {
  conversations: Record<string, UserConversation>;
  messages: Record<string, Record<string, Message>>;
}

// Complete User Structure
export interface User {
  profile: UserProfile;
  appointments: Record<string, Appointment>;
  prescriptions: Record<string, Prescription>;
  systemSettings: UserSystemSettings;
  chatSupport: UserChatSupport;
  notifications: Record<string, Notification>;
}

// Auth Types
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  role: 'admin' | 'user';
}

// Doctor Types
export interface DoctorProfile {
  name: string;
  email: string;
  specialty: string;
  experience: string;
  licenseNumber: string;
  phoneNumber: string;
  department: string;
  status: 'available' | 'busy' | 'offline';
  avatar?: string;
  qualification: string;
  bio: string;
  createdAt: string;
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  duration: number; // minutes
  bookedBy?: string;
}

export interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
  breakTime?: {
    start: string;
    end: string;
  };
  timeSlots: Record<string, TimeSlot>;
}

export interface DoctorSchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export interface DoctorStats {
  totalAppointments: number;
  totalPatients: number;
  rating: number;
  reviewCount: number;
}

export interface Doctor {
  profile: DoctorProfile;
  schedule: DoctorSchedule;
  stats: DoctorStats;
}

// Appointment Types
export interface AppointmentDetails {
  date: string;
  timeSlot: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled';
  location: string;
  roomNumber: string;
}

export interface PatientInfo {
  name: string;
  phoneNumber: string;
  email: string;
  reasonForVisit: string;
  symptoms?: string[];
  priority: 'low' | 'normal' | 'high' | 'emergency';
}

export interface AppointmentTimestamps {
  createdAt: string;
  scheduledAt: string;
  updatedAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
}

export interface AppointmentNotes {
  patientNotes: string;
  doctorNotes: string;
  adminNotes: string;
}

export interface AppointmentReminders {
  sent24h: boolean;
  sent2h: boolean;
  smsReminder: boolean;
  emailReminder: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  appointmentDetails: AppointmentDetails;
  patientInfo: PatientInfo;
  timestamps: AppointmentTimestamps;
  notes: AppointmentNotes;
  reminders: AppointmentReminders;
}

// Prescription Types
export interface PrescriptionDetails {
  title: string;
  type: 'medication' | 'lab-report' | 'x-ray' | 'blood-test' | 'other';
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  prescribedDate: string;
  expiryDate: string;
  instructions: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: string;
}

export interface PrescriptionDocument {
  fileName: string;
  fileUrl: string; // For backward compatibility, will be deprecated
  fileContent?: string; // Base64 encoded file content
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  uploadedBy: string; // User ID who uploaded the file
}

export interface PrescriptionTimestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  appointmentId: string;
  prescriptionDetails: PrescriptionDetails;
  medications?: Record<string, Medication>;
  documents: Record<string, PrescriptionDocument>;
  timestamps: PrescriptionTimestamps;
  notes: string;
}

// Chat Support Types
export interface ConversationParticipants {
  patient: string;
  supportAgent?: string;
  doctor?: string; // optional, for medical queries
}

export interface ConversationInfo {
  type: 'general' | 'medical' | 'technical' | 'emergency';
  status: 'active' | 'resolved' | 'waiting' | 'escalated';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'appointment' | 'billing' | 'medical' | 'technical' | 'other';
  subject: string;
  language: string;
}

export interface ConversationTimestamps {
  createdAt: string;
  lastMessageAt: string;
  resolvedAt?: string | null;
}

export interface ConversationMetadata {
  patientSatisfaction?: number | null; // 1-5 rating after resolution
  tags: string[];
  escalated: boolean;
  escalationReason?: string | null;
}

export interface Conversation {
  participants: ConversationParticipants;
  conversationInfo: ConversationInfo;
  timestamps: ConversationTimestamps;
  metadata: ConversationMetadata;
}

export interface MessageContent {
  text: string;
  type: 'text' | 'image' | 'file' | 'system_message';
  attachments: any[];
}

export interface MessageTimestamps {
  sentAt: string;
  deliveredAt: string;
  readAt?: string;
}

export interface Message {
  senderId: string;
  senderType: 'patient' | 'support' | 'doctor' | 'system';
  content: MessageContent;
  timestamps: MessageTimestamps;
  status: 'sent' | 'delivered' | 'read';
  isEdited: boolean;
  editedAt?: string | null;
  replyTo?: string | null; // messageId if replying to a specific message
}

export interface SupportAgentProfile {
  name: string;
  email: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  avatar?: string;
  languages: string[];
  specializations: string[];
}

export interface SupportAgentStats {
  totalChats: number;
  averageResponseTime: number; // seconds
  satisfactionRating: number;
  activeChats: number;
  maxConcurrentChats: number;
}

export interface SupportAgentAvailability {
  monday?: { start: string; end: string };
  tuesday?: { start: string; end: string };
  wednesday?: { start: string; end: string };
  thursday?: { start: string; end: string };
  friday?: { start: string; end: string };
  saturday?: { start: string; end: string };
  sunday?: { start: string; end: string };
}

export interface SupportAgent {
  profile: SupportAgentProfile;
  stats: SupportAgentStats;
  availability: SupportAgentAvailability;
}

// Department Types
export interface DepartmentLocation {
  building: string;
  floor: string;
  wing: string;
}

export interface DepartmentContact {
  phone: string;
  email: string;
  emergencyPhone: string;
}

export interface Department {
  name: string;
  description: string;
  head: string; // doctorId
  location: DepartmentLocation;
  contactInfo: DepartmentContact;
  services: string[];
  doctors: string[]; // doctorIds
  isActive: boolean;
}

// Notification Types
export interface NotificationData {
  appointmentId?: string;
  doctorName?: string;
  scheduledTime?: string;
  [key: string]: any;
}

export interface NotificationAction {
  type: string;
  label: string;
  url: string;
}

export interface NotificationTimestamps {
  createdAt: string;
  scheduledFor: string;
  sentAt: string;
  readAt?: string | null;
}

export interface Notification {
  type: 'appointment_reminder' | 'prescription_reminder' | 'chat_message' | 'system_update';
  title: string;
  message: string;
  data: NotificationData;
  status: 'unread' | 'read' | 'dismissed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: string[];
  timestamps: NotificationTimestamps;
  actions: NotificationAction[];
}

// Global System Settings Types
export interface HospitalOperatingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface HospitalInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  emergencyPhone: string;
  website: string;
  operatingHours: HospitalOperatingHours;
}

export interface ChatSettings {
  maxConcurrentChats: number;
  autoResponseEnabled: boolean;
  autoResponseMessage: string;
  autoResponseDelay: number; // milliseconds
  operatingHours: HospitalOperatingHours;
  offlineMessage: string;
  escalationRules: {
    responseTimeThreshold: number; // seconds
    maxWaitTime: number; // seconds
    keywords: string[];
  };
}

export interface AppointmentSettings {
  maxAdvanceBooking: number; // days
  minAdvanceBooking: number; // hours
  slotDuration: number; // minutes
  bufferTime: number; // minutes between appointments
  cancellationPolicy: {
    minNoticeHours: number;
    penaltyFee: number;
  };
}

export interface GlobalSettings {
  hospitalInfo: HospitalInfo;
  chatSettings: ChatSettings;
  appointmentSettings: AppointmentSettings;
}

// Analytics Types
export interface DailyAppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export interface DailyChatStats {
  totalChats: number;
  resolved: number;
  escalated: number;
  avgResponseTime: number;
}

export interface DailyStats {
  appointments: DailyAppointmentStats;
  chatSupport: DailyChatStats;
  userRegistrations: number;
  prescriptionsUploaded: number;
}

export interface Analytics {
  dailyStats: Record<string, DailyStats>;
}

