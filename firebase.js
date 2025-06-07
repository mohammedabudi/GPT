const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBJmSb9l0LHZgGQKv2ZEZc_DJLvFrPpmSg",
  authDomain: "trainingfeedback-f788d.firebaseapp.com",
  projectId: "trainingfeedback-f788d",
  storageBucket: "trainingfeedback-f788d.appspot.com",
  messagingSenderId: "509836635886",
  appId: "1:509836635886:web:xxxxxxx" // تقدر تتركه مؤقتًا هيچي
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db, collection, addDoc };
