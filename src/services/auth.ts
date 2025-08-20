import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { auth, database } from '../firebase/config';
import { AuthUser, User, UserProfile } from '../types/firebase';

export class AuthService {
  // Register new user
  static async register(
    email: string, 
    password: string, 
    displayName: string,
    role: 'admin' | 'user' = 'user'
  ): Promise<{ user: AuthUser; needsVerification: boolean }> {
    try {
      // Create Firebase Auth user
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, { displayName });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user profile in database with new schema
      const userProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true,
        emailVerified: false
      };

      // Use UserService to create complete user structure
      const { UserService } = await import('./firebase');
      await UserService.createUser(firebaseUser.uid, userProfile);

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: displayName,
        emailVerified: firebaseUser.emailVerified,
        role: role
      };

      return { user: authUser, needsVerification: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from database
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        throw new Error('User profile not found');
      }

      const userData: User = snapshot.val();
      
      // Update last login time
      await set(ref(database, `users/${firebaseUser.uid}/profile/lastLoginAt`), new Date().toISOString());

      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.profile.displayName,
        emailVerified: firebaseUser.emailVerified,
        role: userData.profile.role
      };

      return authUser;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Sign out user
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Get current auth user with role
  static async getCurrentAuthUser(): Promise<AuthUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      // Get user data from database
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const userData: User = snapshot.val();

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || userData.profile.displayName,
        emailVerified: firebaseUser.emailVerified,
        role: userData.profile.role
      };
    } catch (error) {
      console.error('Error getting current auth user:', error);
      return null;
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const authUser = await this.getCurrentAuthUser();
          callback(authUser);
        } catch (error) {
          console.error('Error in auth state change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = ref(database, `users/${uid}/profile`);
      await set(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Get user profile by UID
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Check if user is admin
  static async isAdmin(uid: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(uid);
      return userProfile?.profile.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Send email verification
  static async sendEmailVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No user signed in');
    
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Get friendly error messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email address is already registered';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  }
}

// Auth context hook for React components
export const useAuth = () => {
  return {
    signIn: AuthService.signIn,
    register: AuthService.register,
    signOut: AuthService.signOut,
    getCurrentUser: AuthService.getCurrentUser,
    getCurrentAuthUser: AuthService.getCurrentAuthUser,
    onAuthStateChanged: AuthService.onAuthStateChanged,
    updateUserProfile: AuthService.updateUserProfile,
    getUserProfile: AuthService.getUserProfile,
    isAdmin: AuthService.isAdmin,
    sendEmailVerification: AuthService.sendEmailVerification
  };
};
