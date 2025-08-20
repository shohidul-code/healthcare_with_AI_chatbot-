// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDwaR7gLC-PRdr0A5Bb27ykw5HlGv4qAn4",
//   authDomain: "medicare-aad03.firebaseapp.com",
//   databaseURL: "https://medicare-aad03-default-rtdb.firebaseio.com/",
//   projectId: "medicare-aad03",
//   storageBucket: "medicare-aad03.firebasestorage.app",
//   messagingSenderId: "502242696908",
//   appId: "1:502242696908:web:72c711301067f269396c69"
// };


const firebaseConfig = {
  apiKey: "AIzaSyAASya6Q5Ijy3yoIA08SmEYQI83opmWcjM",
  authDomain: "medicare-4b741.firebaseapp.com",
  databaseURL: "https://medicare-4b741-default-rtdb.firebaseio.com/",
  projectId: "medicare-4b741",
  storageBucket: "medicare-4b741.firebasestorage.app",
  messagingSenderId: "751189708716",
  appId: "1:751189708716:web:2500ceb57f2e893f1bf409"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database = getDatabase(app);
export const auth = getAuth(app);
export default app;