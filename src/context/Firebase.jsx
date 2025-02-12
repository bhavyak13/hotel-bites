import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyBB5YbvvoBIG3HtqgAx8iRBSqR-8EvhAYM",
  authDomain: "hotel-bites.firebaseapp.com",
  projectId: "hotel-bites",
  storageBucket: "hotel-bites.firebasestorage.app",
  messagingSenderId: "1088802123792",
  appId: "1:1088802123792:web:e6e2ba513ce6847c6a1a95"
};


export const useFirebase = () => useContext(FirebaseContext);

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);


export const FirebaseProvider = (props) => {

  const signupUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const singinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);

  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  const isLoggedIn = user ? true : false;



  return (
    <FirebaseContext.Provider
      value={{
        signupUserWithEmailAndPassword,
        singinUserWithEmailAndPass,
        isLoggedIn,

      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
