// Utility to initialize Firebase with sample data
// Run this once to populate your Firebase database with sample data

import { populateFirebaseWithSampleData } from './sampleData';

export const initializeFirebaseData = async () => {
  try {
    console.log('🔄 Initializing Firebase with sample data...');
    await populateFirebaseWithSampleData();
    console.log('✅ Firebase initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
  }
};

// Uncomment the line below and run this file to populate Firebase with sample data
// initializeFirebaseData();

