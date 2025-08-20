# doctors-app-v1

## Setup Instructions

### Environment Variables

Create a `.env` file in the root directory and add your Groq API key:

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

To get your Groq API key:
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Installation

```bash
npm install
npm run dev
```

## Features

- AI-powered chat support using Groq API
- Firebase integration for user authentication
- Real-time messaging
- Doctor appointment management
- Prescription management