import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9A5kUQyN5cN9ASLjII8xrD3SfOyCwTJk",
  authDomain: "guestcam3-8cb1f.firebaseapp.com",
  projectId: "guestcam3-8cb1f",
  storageBucket: "guestcam3-8cb1f.appspot.com",
  messagingSenderId: "1091056590380",
  appId: "1:1091056590380:web:b1e22a9e5737942bf9fb89",
};

//init firebase
firebase.initializeApp(firebaseConfig);

//init services
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();
const projectStorage = firebase.storage();

//timestamp
const timestamp = firebase.firestore.Timestamp;

export { projectAuth, projectFirestore, projectStorage, timestamp };
