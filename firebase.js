import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAo169TRqZ9rvLDncutBbubotMtX3PHbdk",
  authDomain: "company-chat-c7944.firebaseapp.com",
  projectId: "company-chat-c7944",
  storageBucket: "company-chat-c7944.firebasestorage.app",
  messagingSenderId: "1005058214205",
  appId: "1:1005058214205:web:61f9d747cdde44ea0edd54",
  measurementId: "G-BCGPCM5NBV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
