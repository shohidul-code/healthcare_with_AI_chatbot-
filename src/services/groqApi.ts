interface GroqResponse {
  id: string;
  object: string;
  status: string;
  created_at: number;
  output?: Array<{
    type: string;
    id: string;
    status: string;
    role: string;
    content: Array<{
      type: string;
      text: string;
      annotations: any[];
    }>;
  }>;
  // Alternative response formats - the API might return different structures
  text?: string;
  choices?: Array<{
    message?: {
      content?: string;
      text?: string;
    };
    text?: string;
  }>;
  message?: {
    content?: string;
    text?: string;
  } | string;
  content?: string | {
    text?: string;
  };
  error?: any;
}

export class GroqApiService {
  private static readonly API_URL = 'https://api.groq.com/openai/v1/responses';
  private static readonly MODEL = 'deepseek-r1-distill-llama-70b';
//   private static readonly PREDEFINED_PROMPT = 'You are Medicare AI chat helper, a professional medical assistant chatbot for MediCare Hospital. You provide helpful, accurate, and empathetic responses to patient inquiries about appointments, medical services, general health questions, and hospital information. Always maintain a professional and caring tone. If asked about serious medical conditions or emergencies, advise patients to consult with healthcare professionals or seek immediate medical attention. ';
  private static readonly PREDEFINED_PROMPT  = `
  You are Medicare AI Chat Helper, a professional, empathetic assistant for MediCare Hospital. You answer questions about hospital info, appointments, services, departments, and doctors. Use only the structured knowledge below:
  
  Hospital Info: MediCare Hospital, 123 Health St, Medical City. Phone: +8801300723307, Email: info@medicare.com, Website: medicare.com. Emergency: +8801300723307. Hours: Mon–Thu, Fri (6:00–22:00), Sat (8:00–20:00), Sun (8:00–18:00).
  
  Departments & Heads:
  - Cardiology – Dr. John Smith (heart care, ECG, Echo, Stress test). Contact: cardiology@medicare.com, +1555123456.
  - Neurology – Dr. Sarah Johnson (EEG, MRI, CT Scan). Contact: neurology@medicare.com, +1555123457.
  - Orthopedics – Dr. Michael Brown (X-Ray, Joint Replacement). Contact: orthopedics@medicare.com, +1555123458.
  - Pediatrics – Dr. Emily Davis (Children’s care, Vaccines). Contact: pediatrics@medicare.com, +1555123459.
  - Dermatology – Dr. David Wilson (Skin care, Acne, Biopsy). Contact: dermatology@medicare.com, +1555123460.
  - Psychiatry – Dr. Lisa Martinez (Therapy, Medication, Crisis). Contact: psychiatry@medicare.com, +1555123461.
  - Gastroenterology – Dr. Robert Garcia (Endoscopy, Colonoscopy). Contact: gastroenterology@medicare.com, +1555123462.
  - Ophthalmology – Dr. Jennifer Lee (Eye exams, Cataract surgery). Contact: ophthalmology@medicare.com, +1555123463.
  - Gynecology – Dr. Amanda Taylor (Women’s health, Prenatal, Family planning). Contact: gynecology@medicare.com, +1555123464.
  - Oncology – Dr. Thomas Anderson (Head), Dr. Maria Rodriguez, Dr. Christopher White (Cancer care: Chemo, Radiation, Surgery). Contact: oncology@medicare.com, +1555123465.
  
  Doctors (with specialties):
  - Dr. John Smith – Cardiologist, 15 yrs, Rating 4.8.
  - Dr. Sarah Johnson – Neurologist, 12 yrs, Rating 4.9.
  - Dr. Michael Brown – Orthopedic Surgeon, 18 yrs, Rating 4.7.
  - Dr. Emily Davis – Pediatrician, 10 yrs, Rating 4.9.
  - Dr. David Wilson – Dermatologist, 14 yrs, Rating 4.6.
  - Dr. Lisa Martinez – Psychiatrist, 16 yrs, Rating 4.8.
  - Dr. Robert Garcia – Gastroenterologist, 20 yrs, Rating 4.7.
  - Dr. Jennifer Lee – Ophthalmologist, 13 yrs, Rating 4.8.
  - Dr. Amanda Taylor – Gynecologist, 11 yrs, Rating 4.9.
  - Dr. Thomas Anderson – Oncologist, 22 yrs, Rating 4.9.
  - Dr. Maria Rodriguez – Radiation Oncologist, 17 yrs, Rating 4.8.
  - Dr. Christopher White – Surgical Oncologist, 19 yrs, Rating 4.9.
  
  Appointments: Slots = 30 mins, min 1 day advance, max 90 days ahead. 24 hr cancellation policy, penalty $25.
  
  Always answer with professionalism, empathy, and clarity.
  here is the user message: 
  `;
  
  private static getApiKey(): string {
    // Try to get from environment variable, fallback to a placeholder
    return "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";
  }

  private static cleanResponse(content: string): string {
    // Remove reasoning tags and content
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // Remove extra whitespace and newlines
    cleaned = cleaned.trim();
    
    // Remove multiple consecutive newlines
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return cleaned;
  }

  static async sendMessage(userMessage: string): Promise<string> {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      console.warn('GROQ_API_KEY not found. Please set VITE_GROQ_API_KEY in your environment variables.');
      return 'I apologize, but the AI service is currently unavailable. Please try again later or contact our support team directly.';
    }

    try {
      const requestBody = {
        model: this.MODEL,
        input: `${this.PREDEFINED_PROMPT}${userMessage}`
      };
      
      console.log('Request URL:', this.API_URL);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: GroqResponse = await response.json();
      console.log('Full API Response:', JSON.stringify(data, null, 2));

      if (data.error) {
        throw new Error(data.error.message || 'API returned an error');
      }

      // Check for different response formats
      let messageContent: string | undefined;

      console.log('API Response Status:', data.status);
      console.log('API Response Structure:', JSON.stringify(data, null, 2));

      // Try to extract from output array first (Groq specific format)
      if (data.output && data.output.length > 0) {
        console.log('All outputs:', JSON.stringify(data.output, null, 2));
        
        // Look for the "message" type output (Groq returns reasoning + message)
        const messageOutput = data.output.find(output => output.type === 'message');
        
        if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
          messageContent = messageOutput.content[0]?.text;
          console.log('Extracted from message output:', messageContent);
        }
        
        // Fallback to first output if no message type found
        if (!messageContent && data.output[0].content && data.output[0].content.length > 0) {
          messageContent = data.output[0].content[0]?.text;
          console.log('Extracted from first output:', messageContent);
        }
      }
      
      // If not found, try direct text property
      if (!messageContent && data.text) {
        messageContent = data.text;
        console.log('Extracted from data.text:', messageContent);
      }
      
      // If still not found, try other common response structures
      if (!messageContent) {
        // Try choices array (common in OpenAI-style APIs)
        if (data.choices && data.choices.length > 0) {
          messageContent = data.choices[0]?.message?.content || data.choices[0]?.text;
          console.log('Extracted from choices:', messageContent);
        }
        
        // Try message property
        if (!messageContent && data.message) {
          if (typeof data.message === 'string') {
            messageContent = data.message;
          } else {
            messageContent = data.message.content || data.message.text;
          }
          console.log('Extracted from message:', messageContent);
        }
        
        // Try content property directly
        if (!messageContent && data.content) {
          messageContent = typeof data.content === 'string' ? data.content : data.content.text;
          console.log('Extracted from content:', messageContent);
        }
      }
      
      console.log('Extracted message content:', messageContent);
      
      if (!messageContent) {
        throw new Error('No message content found in API response');
      }

      // Ensure we always return a string
      if (typeof messageContent !== 'string') {
        console.warn('Message content is not a string:', messageContent);
        return typeof messageContent === 'object' ? JSON.stringify(messageContent) : String(messageContent);
      }

      // Clean up the response (remove reasoning tags and extra content)
      const cleanedContent = this.cleanResponse(messageContent);
      console.log('Final cleaned content:', cleanedContent);

      return cleanedContent;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      
      // Return a fallback response
      return 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment, or feel free to contact our support team directly for immediate assistance.';
    }
  }
}
