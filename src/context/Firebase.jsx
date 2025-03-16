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
  limit,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";


import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


import Razorpay from "razorpay";
import { toast } from "react-toastify";
import axios from "axios";

import { v4 as uuidv4 } from 'uuid';


const FirebaseContext = createContext(null);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// // console.("BK firebaseConfig", firebaseConfig);


export const useFirebase = () => useContext(FirebaseContext);


const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);



export const FirebaseProvider = (props) => {

  const signupUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const singinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);





  /*************** data-related function start  **************/

  const handleCreateNewDoc = async (data, collectionName) => {
    let uploadResult = '';
    // // console.log("BK data2",data);
    if (data && data?.productImage) {
      const { productImage } = data;
      const imageRef = ref(storage, `uploads/images/${Date.now()}-${productImage.name}`);
      uploadResult = await uploadBytes(imageRef, productImage);
      data = {
        ...data,
        productImage: uploadResult?.ref?.fullPath || '',
      }
      // // console.log("BK imageRef,uploadResult", imageRef, uploadResult);
    }
    let docRef;
    docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
      userId: user?.uid || "",
    });
    // // console.log("BK handleCreateNewDoc docRef.id, docRef:", docRef.id, docRef);
    return docRef;
  };

  const handleCreateNewVariant = async (data) => {
    const { productId } = data;
    const collectionRef = collection(firestore, "products", productId, "variants");
    const docRef = await addDoc(collectionRef, {
      ...data,
      userId: user?.uid || "",
    });
    // // console.log("BK handleCreateNewDoc docRef.id, docRef:", docRef.id, docRef);
    return docRef;
  };

  const getDocuments = async (collectionName) => {
    const querySnapshot = await getDocs(collection(firestore, collectionName));
    // // console.log("Document data:", querySnapshot);
    return querySnapshot;
  };


  const getSubCollectionAllDocuments = async (collection1Name, collection1Id, collection2Name) => {
    const collectionRef = collection(firestore, collection1Name, collection1Id, collection2Name);
    const querySnapshot = await getDocs(collectionRef);
    // // console.log("BK getSubCollectionAllDocuments res", querySnapshot);
    return querySnapshot;
  };


  const getDocById = async (id, collectionName) => {
    const docRef = doc(firestore, collectionName, id);
    const result = await getDoc(docRef);
    return result;
  };

  const fetchProductsWithFirstVariant = async () => {
    try {
      // Step 1: Fetch all products
      const productsSnapshot = await getDocs(collection(firestore, "products"));
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Step 2: Fetch first variant for each product
      const variantPromises = products.map(async (product) => {
        const variantQuery = query(
          collection(firestore, `products/${product.id}/variants`),
          limit(1) // Get only the first variant
        );

        const variantSnapshot = await getDocs(variantQuery);
        const firstVariant = variantSnapshot.docs.length > 0
          ? { id: variantSnapshot.docs[0].id, ...variantSnapshot.docs[0].data() }
          : null;

        return { ...product, firstVariant }; // Attach first variant to product
      });

      // Step 3: Resolve all promises in parallel
      const productsWithVariants = await Promise.all(variantPromises);
      // console.log("Products with first variants:", productsWithVariants);

      return productsWithVariants;
    } catch (error) {
      console.error("Error fetching products with variants:", error);
    }
  };

  const removeDocumentWithId = async (collectionName, docId) => {
    try {
      if (!collectionName || !docId) {
        throw new Error("Collection name and document ID are required.");
      }

      const docRef = doc(firestore, collectionName, docId);
      await deleteDoc(docRef);

      // console.log(`Document with ID ${docId} deleted successfully from ${collectionName}`);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  }


  const fetchCartWithDetails = async (collectionName) => {
    try {
      // Step 1: Fetch all cart items (single query)

      if (!user) return null;

      const cartRef = collection(firestore, collectionName);
      const q = query(cartRef, where("userId", "==", user.uid));
      const cartSnapshot = await getDocs(q);



      const cartItems = cartSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(), // Contains productId & variantId
      }));

      // Step 2: Prepare product & variant fetch promises
      const productPromises = cartItems.map(cartItem =>
        getDoc(doc(firestore, "products", cartItem.productId))
      );

      const variantPromises = cartItems.map(cartItem =>
        getDoc(doc(firestore, `products/${cartItem.productId}/variants`, cartItem.variantId))
      );

      // Step 3: Fetch all products & variants concurrently
      const productSnapshots = await Promise.all(productPromises);
      const variantSnapshots = await Promise.all(variantPromises);

      // Step 4: Map cart items with product & variant details
      const cartWithDetails = cartItems.map((cartItem, index) => ({
        ...cartItem,
        product: productSnapshots[index].exists() ? { id: productSnapshots[index].id, ...productSnapshots[index].data() } : null,
        variant: variantSnapshots[index].exists() ? { id: variantSnapshots[index].id, ...variantSnapshots[index].data() } : null,
      }));

      // console.log("Cart with product & variant details:", cartWithDetails);
      return cartWithDetails;
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };


  const fetchPurchasedItemWithDetails = async (data) => {
    try {
      // Step 1: Fetch all cart items (single query)

      if (!user) return null;
      if (!data?.length) return null;
      // console.log("BK Data2", data);


      const purchasedItemPromises = data.map(cartItem =>
        getDoc(doc(firestore, "purchasedItems", cartItem))
      );

      let purchasedItemSnapshots = await Promise.all(purchasedItemPromises);

      // console.log("BK purchasedItemSnapshots", purchasedItemSnapshots);
      purchasedItemSnapshots = purchasedItemSnapshots.map((cartItem, index) => (
        cartItem.data()
      ));
      // console.log("BK purchasedItemSnapshots2", purchasedItemSnapshots);


      // Step 2: Prepare product & variant fetch promises
      const productPromises = purchasedItemSnapshots.map(cartItem =>
        getDoc(doc(firestore, "products", cartItem.productId))
      );

      const variantPromises = purchasedItemSnapshots.map(cartItem =>
        getDoc(doc(firestore, `products/${cartItem.productId}/variants`, cartItem.variantId))
      );

      // Step 3: Fetch all products & variants concurrently
      const productSnapshots = await Promise.all(productPromises);
      const variantSnapshots = await Promise.all(variantPromises);

      // Step 4: Map cart items with product & variant details
      const cartWithDetails = purchasedItemSnapshots.map((cartItem, index) => ({
        ...cartItem,
        product: productSnapshots[index].exists() ? { id: productSnapshots[index].id, ...productSnapshots[index].data() } : null,
        variant: variantSnapshots[index].exists() ? { id: variantSnapshots[index].id, ...variantSnapshots[index].data() } : null,
      }));

      // console.log("Cart with product & variant details:", cartWithDetails);
      return cartWithDetails;
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };


  const checkIsItemAlreadyInCart = async (collectionName, productId, variantId) => {
    try {
      const cartRef = collection(firestore, collectionName);
      const q = query(
        cartRef,
        where("productId", "==", productId),
        where("variantId", "==", variantId),
        limit(1) // Limit to one result as we only need to check existence
      );

      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty ? querySnapshot.docs[0] : null;
    } catch (error) {
      console.error("Error checking cart item:", error);
      return null;
    }
  };


  const fetchOrders = async () => {
    try {
      if (!user?.uid) {
        console.error("User is not logged in");
        return [];
      }

      const ordersRef = collection(firestore, "orders");

      const q = query(
        ordersRef,
        where("userId", "==", user.uid),
        // where("status", "!=", "razorpayOrderCreationStart")
      );

      const querySnapshot = await getDocs(q);

      const ordersList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(order => order.status !== "razorpayOrderCreationStart"); // Manual filtering

      return ordersList;

      return ordersList;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  };



  const fetchOrdersForDeliveryAgent = async (deliveryPartnerId) => {
    try {
      if (!deliveryPartnerId) {
        console.error("No delivery partner found");
        return [];
      }

      const ordersRef = collection(firestore, "orders");
      const q = query(ordersRef, where("deliveryPartnerId", "==", deliveryPartnerId));
      const querySnapshot = await getDocs(q);

      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).filter(order => order.status !== "razorpayOrderCreationStart");

      return ordersList;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  };

  const fetchAllOrders = async () => {
    try {
      if (!user || !user?.uid) {
        console.error("User is not logged in");
        return [];
      }

      const ordersRef = collection(firestore, "orders");
      const querySnapshot = await getDocs(ordersRef);

      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })).filter(order => order.status !== "razorpayOrderCreationStart");

      return ordersList;
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  };



  const getImageURL = (path) => {
    return getDownloadURL(ref(storage, path));
  };



  const displayToastMessage = (toastMessage) => {
    toast(toastMessage);
  }

  const updateOrderStatus = async (orderId, payload) => {
    try {
      console.log("BK orderId,payload", orderId, payload)
      if (!orderId || !payload) {
        throw new Error("Order ID and payload are required.");
      }

      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, payload);

      console.log(`Order ${orderId} updated!`)
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };


  /*************** data-related function end  **************/







  /*************** RAZORPAY function begin  **************/




  const generateUniqueId = () => {
    return uuidv4();
  };


  const createRazorpayOrder = async (orderPayload) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5001/hotel-bites/us-central1/createRazorPayOrder",
        orderPayload,
      );
      console.log("Order Created:", response.data);

      return response.data; // This contains order details from Razorpay
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const createRazorpayPaymentsSuccess = async (payload) => {
    try {

      console.log("BK HERE", payload);;
      const finalPayload = {
        razorpayOrderId: payload.razorpayOrderId,
        razorpayPaymentId: payload.paymentId,
        razorpaySignature: payload.signature,
        orderId: payload.orderId
      };
      const razorpayPaymentSuccessRef = await handleCreateNewDoc(finalPayload, 'razorpayPaymentSuccess')
      const razorpayPaymentSuccessId = razorpayPaymentSuccessRef.id;

      const response = await axios.post(
        "http://127.0.0.1:5001/hotel-bites/us-central1/verifyPaymentSignature",
        { razorpayPaymentSuccessId },
      );
      console.log(response.data);

      const razorpayPaymentSuccessSnap = await getDoc(razorpayPaymentSuccessRef);

      const orderRef = doc(firestore, "orders", payload.orderId);
      if (razorpayPaymentSuccessSnap.data().paymentStatus === 'Done') {
        await updateDoc(orderRef, { razorpayPaymentId: payload.paymentId });
      }
      console.log("BK pass 1");
    }
    catch (e) {
      console.log("error in createRazorpayPaymentsSuccess function  : ", e)
    }
  }


  const createOrder = async (createOrderPayload) => {
    // ORDER PAYLOAD!!

    const { finalPrice, paymentMethod } = createOrderPayload;
    let orderPayload = {
      orderId: generateUniqueId(), // Generate a unique order ID
      status: paymentMethod === 'online' ? "razorpayOrderCreationStart" : 'Created',
      finalPrice: parseFloat(finalPrice),
      _createdDate: new Date().toISOString(),
    }

    // create razorpay order

    if (paymentMethod === 'online') {
      const razorpayOrderRef = await createRazorpayOrder(orderPayload); // Amount in INR
      const razorpayOrderId = razorpayOrderRef.id;

      orderPayload = {
        ...orderPayload,
        razorpayOrderId,
      }
    }

    // create order 
    const orderRef = await handleCreateNewDoc(orderPayload, "orders");

    // Fetch the document snapshot
    // const orderSnap = await getDoc(orderRef);
    // const orderData = {
    //   ...orderSnap.data(),
    //   id: orderRef.id
    // };
    // console.log("BK orderRef.id,razorpayOrderRef, orderSnap.data(), orderData", orderRef.id, razorpayOrderRef, orderSnap.data(), orderData);
    // await handlePayment(orderData);
    return orderRef.id;
  }


  /*************** RAZORPAY function end  **************/


  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  const isLoggedIn = user ? true : false;

  const logoutUser = async () => {
    try {
      await firebaseAuth.signOut();
      console.log("User signed out successfully");
      setUser(null);

    } catch (error) {
      console.error("Sign Out Error", error);
    }
  };

  useEffect(() => {
    // console.log("BK user", user, user?.uid)
    if (user) {
      if (user?.uid == "ukEdfieQ7FaI4rpITgxbtWyBuZZ2") {
        setIsAdmin(true);
      } else if (user?.uid == "EEqRTrY732ZaK27XRkjkJbjMq5E2") {
        setIsDeliveryPartner(true);
      }
    }
    else {
      if (isAdmin) setIsAdmin(false);
      if (isDeliveryPartner) setIsDeliveryPartner(false);
    }
  }, [user])


  return (
    <FirebaseContext.Provider
      value={{
        isLoggedIn,
        user,
        isAdmin,
        isDeliveryPartner,
        fetchOrdersForDeliveryAgent,

        singinUserWithEmailAndPass,
        signupUserWithEmailAndPassword,

        getDocById,
        getDocuments,
        handleCreateNewDoc,
        handleCreateNewVariant,
        getSubCollectionAllDocuments,
        removeDocumentWithId,
        getImageURL,
        fetchOrders,
        fetchAllOrders,
        updateOrderStatus,

        fetchProductsWithFirstVariant,
        fetchCartWithDetails,
        fetchPurchasedItemWithDetails,

        logoutUser,

        displayToastMessage,
        checkIsItemAlreadyInCart,
        // createRazorpayOrder,
        createOrder,
        createRazorpayPaymentsSuccess,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
