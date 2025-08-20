import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  off, 
  query, 
  orderByChild, 
  equalTo,
  limitToLast,
  DataSnapshot
} from 'firebase/database';
import { database } from '../firebase/config';
import {
  Doctor,
  Appointment,
  Prescription,
  Conversation,
  Message,
  Department,
  Notification,
  User
} from '../types/firebase';

// Generic Firebase CRUD operations
export class FirebaseService {
  // Generic create operation
  static async create<T>(path: string, data: T): Promise<string> {
    try {
      const dbRef = ref(database, path);
      const newRef = push(dbRef);
      await set(newRef, {
        ...data,
        id: newRef.key
      });
      return newRef.key!;
    } catch (error) {
      console.error(`Error creating data at ${path}:`, error);
      throw error;
    }
  }

  // Generic read operation
  static async read<T>(path: string): Promise<T | null> {
    try {
      const dbRef = ref(database, path);
      const snapshot = await get(dbRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error reading data from ${path}:`, error);
      throw error;
    }
  }

  // Generic update operation
  static async update(path: string, updates: any): Promise<void> {
    try {
      const dbRef = ref(database, path);
      await update(dbRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      throw error;
    }
  }

  // Generic delete operation
  static async delete(path: string): Promise<void> {
    try {
      const dbRef = ref(database, path);
      await remove(dbRef);
    } catch (error) {
      console.error(`Error deleting data at ${path}:`, error);
      throw error;
    }
  }

  // Generic list operation
  static async list<T>(path: string): Promise<Record<string, T>> {
    try {
      const dbRef = ref(database, path);
      const snapshot = await get(dbRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error(`Error listing data from ${path}:`, error);
      throw error;
    }
  }

  // Real-time listener
  static onValue<T>(path: string, callback: (data: T | null) => void): () => void {
    const dbRef = ref(database, path);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });
    
    return () => off(dbRef, 'value', unsubscribe);
  }

  // Query with filters
  static async queryByChild<T>(
    path: string, 
    childKey: string, 
    value: any, 
    limit?: number
  ): Promise<Record<string, T>> {
    try {
      let queryRef = query(ref(database, path), orderByChild(childKey), equalTo(value));
      
      if (limit) {
        queryRef = query(queryRef, limitToLast(limit));
      }

      const snapshot = await get(queryRef);
      return snapshot.exists() ? snapshot.val() : {};
    } catch (error) {
      console.error(`Error querying data from ${path}:`, error);
      throw error;
    }
  }
}

// Doctor Service
export class DoctorService {
  private static readonly path = 'doctors';

  static async getAllDoctors(): Promise<Record<string, Doctor>> {
    return FirebaseService.list<Doctor>(this.path);
  }

  static async getDoctor(doctorId: string): Promise<Doctor | null> {
    return FirebaseService.read<Doctor>(`${this.path}/${doctorId}`);
  }

  static async getDoctorsByDepartment(department: string): Promise<Record<string, Doctor>> {
    return FirebaseService.queryByChild<Doctor>(this.path, 'profile/department', department);
  }

  static async updateDoctorStatus(doctorId: string, status: 'available' | 'busy' | 'offline'): Promise<void> {
    return FirebaseService.update(`${this.path}/${doctorId}/profile`, { status });
  }

  static async updateTimeSlot(
    doctorId: string, 
    day: string, 
    slotId: string, 
    available: boolean, 
    bookedBy?: string
  ): Promise<void> {
    const updates: any = { available };
    if (bookedBy) {
      updates.bookedBy = bookedBy;
    }
    return FirebaseService.update(`${this.path}/${doctorId}/schedule/${day}/timeSlots/${slotId}`, updates);
  }

  static onDoctorsChange(callback: (doctors: Record<string, Doctor> | null) => void): () => void {
    return FirebaseService.onValue<Record<string, Doctor>>(this.path, callback);
  }
}

// Appointment Service - User-centric approach
export class AppointmentService {
  static async createAppointment(userId: string, appointment: Omit<Appointment, 'id'>): Promise<string> {
    const appointmentData = {
      ...appointment,
      timestamps: {
        ...(appointment.timestamps || {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    const path = `users/${userId}/appointments`;
    return FirebaseService.create<Appointment>(path, appointmentData as Appointment);
  }

  static async getAppointment(userId: string, appointmentId: string): Promise<Appointment | null> {
    return FirebaseService.read<Appointment>(`users/${userId}/appointments/${appointmentId}`);
  }

  static async getUserAppointments(userId: string): Promise<Record<string, Appointment>> {
    return FirebaseService.list<Appointment>(`users/${userId}/appointments`);
  }

  static async updateAppointmentStatus(
    userId: string,
    appointmentId: string, 
    status: 'upcoming' | 'completed' | 'cancelled' | 'rescheduled'
  ): Promise<void> {
    const updates: any = {
      'appointmentDetails/status': status,
      'timestamps/updatedAt': new Date().toISOString()
    };

    if (status === 'completed') {
      updates['timestamps/completedAt'] = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates['timestamps/cancelledAt'] = new Date().toISOString();
    }

    return FirebaseService.update(`users/${userId}/appointments/${appointmentId}`, updates);
  }

  static async rescheduleAppointment(
    userId: string,
    appointmentId: string, 
    newDate: string, 
    newTimeSlot: string
  ): Promise<void> {
    return FirebaseService.update(`users/${userId}/appointments/${appointmentId}`, {
      'appointmentDetails/date': newDate,
      'appointmentDetails/timeSlot': newTimeSlot,
      'appointmentDetails/status': 'upcoming',
      'timestamps/updatedAt': new Date().toISOString()
    });
  }

  static onUserAppointmentsChange(
    userId: string, 
    callback: (appointments: Record<string, Appointment> | null) => void
  ): () => void {
    return FirebaseService.onValue<Record<string, Appointment>>(
      `users/${userId}/appointments`, 
      callback
    );
  }

  // Helper method to get appointments by doctor across all users (for admin/doctor view)
  static async getAppointmentsByDoctor(doctorId: string): Promise<Array<Appointment & { userId: string }>> {
    try {
      // Get all users
      const users = await FirebaseService.list<User>('users');
      const doctorAppointments: Array<Appointment & { userId: string }> = [];

      // Search through each user's appointments
      for (const [userId, user] of Object.entries(users)) {
        if (user.appointments) {
          for (const [appointmentId, appointment] of Object.entries(user.appointments)) {
            if (appointment.doctorId === doctorId) {
              doctorAppointments.push({ ...appointment, userId });
            }
          }
        }
      }

      return doctorAppointments;
    } catch (error) {
      console.error('Error getting appointments by doctor:', error);
      return [];
    }
  }
}

// Prescription Service - User-centric approach
export class PrescriptionService {
  static async createPrescription(userId: string, prescription: Omit<Prescription, 'id'>): Promise<string> {
    const prescriptionData = {
      ...prescription,
      timestamps: {
        ...(prescription.timestamps || {}),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    const path = `users/${userId}/prescriptions`;
    return FirebaseService.create<Prescription>(path, prescriptionData as Prescription);
  }

  static async getPrescription(userId: string, prescriptionId: string): Promise<Prescription | null> {
    return FirebaseService.read<Prescription>(`users/${userId}/prescriptions/${prescriptionId}`);
  }

  static async getUserPrescriptions(userId: string): Promise<Record<string, Prescription>> {
    return FirebaseService.list<Prescription>(`users/${userId}/prescriptions`);
  }

  static async updatePrescriptionStatus(
    userId: string,
    prescriptionId: string, 
    status: 'active' | 'completed' | 'expired' | 'cancelled'
  ): Promise<void> {
    return FirebaseService.update(`users/${userId}/prescriptions/${prescriptionId}`, {
      'prescriptionDetails/status': status,
      'timestamps/updatedAt': new Date().toISOString()
    });
  }

  static onUserPrescriptionsChange(
    userId: string, 
    callback: (prescriptions: Record<string, Prescription> | null) => void
  ): () => void {
    return FirebaseService.onValue<Record<string, Prescription>>(
      `users/${userId}/prescriptions`, 
      callback
    );
  }
}

// Chat Support Service - User-centric approach
export class ChatService {
  static async createConversation(userId: string, conversation: Omit<UserConversation, 'id'>): Promise<string> {
    const conversationData = {
      ...conversation,
      timestamps: {
        ...conversation.timestamps,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    const path = `users/${userId}/chatSupport/conversations`;
    return FirebaseService.create<UserConversation>(path, conversationData as UserConversation);
  }

  static async sendMessage(userId: string, conversationId: string, message: Omit<Message, 'id'>): Promise<string> {
    const messageData = {
      ...message,
      timestamps: {
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString()
      },
      status: 'delivered' as const
    };

    const messageId = await FirebaseService.create<Message>(
      `users/${userId}/chatSupport/messages/${conversationId}`, 
      messageData as Message
    );

    // Update conversation's last message timestamp
    await FirebaseService.update(`users/${userId}/chatSupport/conversations/${conversationId}/timestamps`, {
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return messageId;
  }

  static async getConversation(userId: string, conversationId: string): Promise<UserConversation | null> {
    return FirebaseService.read<UserConversation>(`users/${userId}/chatSupport/conversations/${conversationId}`);
  }

  static async getMessages(userId: string, conversationId: string): Promise<Record<string, Message>> {
    return FirebaseService.list<Message>(`users/${userId}/chatSupport/messages/${conversationId}`);
  }

  static async getUserConversations(userId: string): Promise<Record<string, UserConversation>> {
    return FirebaseService.list<UserConversation>(`users/${userId}/chatSupport/conversations`);
  }

  static async updateConversationStatus(
    userId: string,
    conversationId: string, 
    status: 'active' | 'resolved' | 'waiting' | 'escalated'
  ): Promise<void> {
    const updates: any = {
      'conversationInfo/status': status,
      'timestamps/updatedAt': new Date().toISOString()
    };

    if (status === 'resolved') {
      updates['timestamps/resolvedAt'] = new Date().toISOString();
    }

    return FirebaseService.update(`users/${userId}/chatSupport/conversations/${conversationId}`, updates);
  }

  static onUserMessagesChange(
    userId: string,
    conversationId: string, 
    callback: (messages: Record<string, Message> | null) => void
  ): () => void {
    return FirebaseService.onValue<Record<string, Message>>(
      `users/${userId}/chatSupport/messages/${conversationId}`, 
      callback
    );
  }
}

// User Service - Enhanced for new schema
export class UserService {
  private static readonly path = 'users';

  static async createUser(userId: string, userProfile: UserProfile): Promise<void> {
    // Create default user structure with all required collections
    const defaultSystemSettings: UserSystemSettings = {
      preferences: {
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        appointmentReminders: true,
        prescriptionReminders: true,
        marketingEmails: false
      },
      privacy: {
        profileVisibility: 'private',
        shareDataForResearch: false,
        allowCommunicationFromDoctors: true
      }
    };

    const defaultChatSupport: UserChatSupport = {
      conversations: {},
      messages: {}
    };

    const userData: User = {
      profile: {
        ...userProfile,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      },
      appointments: {},
      prescriptions: {},
      systemSettings: defaultSystemSettings,
      chatSupport: defaultChatSupport,
      notifications: {}
    };

    const dbRef = ref(database, `${this.path}/${userId}`);
    await set(dbRef, userData);
  }

  static async getUser(userId: string): Promise<User | null> {
    return FirebaseService.read<User>(`${this.path}/${userId}`);
  }

  static async updateUserProfile(userId: string, profileUpdates: Partial<UserProfile>): Promise<void> {
    return FirebaseService.update(`${this.path}/${userId}/profile`, {
      ...profileUpdates,
      lastLoginAt: new Date().toISOString()
    });
  }

  static async updateLastLogin(userId: string): Promise<void> {
    return FirebaseService.update(`${this.path}/${userId}/profile`, {
      lastLoginAt: new Date().toISOString()
    });
  }

  // System Settings Management
  static async getUserSystemSettings(userId: string): Promise<UserSystemSettings | null> {
    return FirebaseService.read<UserSystemSettings>(`${this.path}/${userId}/systemSettings`);
  }

  static async updateUserSystemSettings(userId: string, settings: Partial<UserSystemSettings>): Promise<void> {
    return FirebaseService.update(`${this.path}/${userId}/systemSettings`, settings);
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    return FirebaseService.update(`${this.path}/${userId}/systemSettings/preferences`, preferences);
  }

  static async updateNotificationSettings(userId: string, notifications: Partial<NotificationSettings>): Promise<void> {
    return FirebaseService.update(`${this.path}/${userId}/systemSettings/notifications`, notifications);
  }

  static async updatePrivacySettings(userId: string, privacy: Partial<PrivacySettings>): Promise<void> {
    return FirebaseService.update(`${this.path}/${userId}/systemSettings/privacy`, privacy);
  }
}

// Notification Service - User-centric approach
export class NotificationService {
  static async createNotification(userId: string, notification: Omit<Notification, 'id'>): Promise<string> {
    const notificationData = {
      ...notification,
      timestamps: {
        ...notification.timestamps,
        createdAt: new Date().toISOString()
      }
    };
    const path = `users/${userId}/notifications`;
    return FirebaseService.create<Notification>(path, notificationData as Notification);
  }

  static async getUserNotifications(userId: string): Promise<Record<string, Notification>> {
    return FirebaseService.list<Notification>(`users/${userId}/notifications`);
  }

  static async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    return FirebaseService.update(`users/${userId}/notifications/${notificationId}`, {
      status: 'read',
      'timestamps/readAt': new Date().toISOString()
    });
  }

  static async markNotificationAsDismissed(userId: string, notificationId: string): Promise<void> {
    return FirebaseService.update(`users/${userId}/notifications/${notificationId}`, {
      status: 'dismissed',
      'timestamps/dismissedAt': new Date().toISOString()
    });
  }

  static onUserNotificationsChange(
    userId: string, 
    callback: (notifications: Record<string, Notification> | null) => void
  ): () => void {
    return FirebaseService.onValue<Record<string, Notification>>(
      `users/${userId}/notifications`, 
      callback
    );
  }
}

// Department Service
export class DepartmentService {
  private static readonly path = 'departments';

  static async getAllDepartments(): Promise<Record<string, Department>> {
    return FirebaseService.list<Department>(this.path);
  }

  static async getDepartment(departmentId: string): Promise<Department | null> {
    return FirebaseService.read<Department>(`${this.path}/${departmentId}`);
  }
}

// Global Settings Service
export class GlobalSettingsService {
  private static readonly path = 'globalSettings';

  static async getGlobalSettings(): Promise<GlobalSettings | null> {
    return FirebaseService.read<GlobalSettings>(this.path);
  }

  static async updateHospitalInfo(hospitalInfo: Partial<HospitalInfo>): Promise<void> {
    return FirebaseService.update(`${this.path}/hospitalInfo`, hospitalInfo);
  }

  static async updateChatSettings(chatSettings: Partial<ChatSettings>): Promise<void> {
    return FirebaseService.update(`${this.path}/chatSettings`, chatSettings);
  }

  static async updateAppointmentSettings(appointmentSettings: Partial<AppointmentSettings>): Promise<void> {
    return FirebaseService.update(`${this.path}/appointmentSettings`, appointmentSettings);
  }
}

// Utility functions
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatFirebaseDate = (date: Date): string => {
  return date.toISOString();
};

export const parseFirebaseDate = (dateString: string): Date => {
  return new Date(dateString);
};

