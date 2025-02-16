import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

console.log("BK firebaseConfig", firebaseConfig);


export const useFirebase = () => useContext(FirebaseContext);


const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);


export const FirebaseProvider = (props) => {

  const signupUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const singinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);





  /*************** data-related function start  **************/

  const handleCreateNewDoc = async (data, collectionName) => {
    // const imageRef = ref(storage, `uploads/images/${Date.now()}-${cover.name}`);
    // const uploadResult = await uploadBytes(imageRef, cover);
    // imageURL: uploadResult.ref.fullPath,
    const docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
      userId: user?.uid || "",
    });
    console.log("BK handleCreateNewDoc docRef.id, docRef:", docRef.id, docRef);
    return docRef;
  };


  const getDocuments = async (collectionName) => {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    // console.log("Document data:", querySnapshot);
    return querySnapshot;
  };


  /*************** data-related function end  **************/



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
        isLoggedIn,
        user,
        signupUserWithEmailAndPassword,
        singinUserWithEmailAndPass,
        handleCreateNewDoc,
        getDocuments,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
