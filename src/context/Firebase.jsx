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
import Razorpay from "razorpay";

const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// console.log("BK firebaseConfig", firebaseConfig);


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

  const handleCreateNewVariant = async (data) => {
    const { productId } = data;
    const collectionRef = collection(firestore, "products", productId, "variants");
    const docRef = await addDoc(collectionRef, {
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


  const getSubCollectionAllDocuments = async (collection1Name, collection1Id, collection2Name) => {
    const collectionRef = collection(firestore, collection1Name, collection1Id, collection2Name);
    const querySnapshot = await getDocs(collectionRef);
    console.log("BK getSubCollectionAllDocuments res", querySnapshot);
    return querySnapshot;
  };


  const getDocById = async (id, collectionName) => {
    const docRef = doc(firestore, collectionName, id);
    const result = await getDoc(docRef);
    return result;
  };





  /*************** data-related function end  **************/







  /*************** RAZORPAY function begin  **************/

  const createOrder = async () => {
    console.log("BK createOrder begin");
    // var instance = new Razorpay({
    //   key_id: import.meta.env.VITE_RAZORPAY_KEY_ID,
    //   key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET,
    // })
    // console.log("BK instance :", instance);

    // const res = await instance.orders.create({
    //   amount: 5000,
    //   currency: "INR",
    //   receipt: "receipt#1",
    //   notes: {
    //     key1: "value3",
    //     key2: "value2"
    //   }
    // })
    // console.log("BK res :", res);
  }


  /*************** RAZORPAY function end  **************/


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

        singinUserWithEmailAndPass,
        signupUserWithEmailAndPassword,

        getDocById,
        getDocuments,
        handleCreateNewDoc,
        handleCreateNewVariant,
        getSubCollectionAllDocuments,


        createOrder,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
