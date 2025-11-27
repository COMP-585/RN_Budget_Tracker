// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdkdxFV_GBzn_QbdbmDFXUbMYCCwVEzg0",
  authDomain: "comp-585-savings-goal-app.firebaseapp.com",
  projectId: "comp-585-savings-goal-app",
  storageBucket: "comp-585-savings-goal-app.firebasestorage.app",
  messagingSenderId: "75063085321",
  appId: "1:75063085321:web:f47ed68163452ccff26bd8",
};

// Initialize Firebase
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
})
export const db = getFirestore(app);
