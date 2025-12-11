
// services/firebaseConfig.ts

// 1. Check Local Storage for ERP Configuration (Entered via UI)
const storedConfig = localStorage.getItem('rg_erp_config');
const dynamicConfig = storedConfig ? JSON.parse(storedConfig) : null;

// 2. Fallback to Environment Variables (Development/Hardcoded)
const envConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// 3. Export the active configuration
export const firebaseConfig = dynamicConfig || envConfig;

// Check if config is actually set (simple check on apiKey)
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};

export const saveERPConfig = (config: typeof envConfig) => {
    localStorage.setItem('rg_erp_config', JSON.stringify(config));
};

export const clearERPConfig = () => {
    localStorage.removeItem('rg_erp_config');
};
