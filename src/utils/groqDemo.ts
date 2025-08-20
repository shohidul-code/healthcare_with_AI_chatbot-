// Demo file to test Groq API integration
// This file can be used to test the API integration manually

import { GroqApiService } from '../services/groqApi';

export async function testGroqIntegration(): Promise<void> {
  console.log('Testing Groq API Integration...');
  
  const testMessages = [
    'Hello, can you tell me about your services?',
    'What are your hospital hours?',
    'How can I book an appointment?',
    'What should I do in case of emergency?'
  ];

  for (const message of testMessages) {
    try {
      console.log(`\nUser: ${message}`);
      const response = await GroqApiService.sendMessage(message);
      console.log(`AI Assistant: ${response}`);
    } catch (error) {
      console.error(`Error with message "${message}":`, error);
    }
  }
}

// Uncomment the line below to run the test when this file is imported
// testGroqIntegration();
