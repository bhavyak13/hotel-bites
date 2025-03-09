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
    // console.log("BK data2",data);
    if (data && data?.productImage) {
      const { productImage } = data;
      const imageRef = ref(storage, `uploads/images/${Date.now()}-${productImage.name}`);
      uploadResult = await uploadBytes(imageRef, productImage);
      data = {
        ...data,
        productImage: uploadResult?.ref?.fullPath || '',
      }
      // console.log("BK imageRef,uploadResult", imageRef, uploadResult);
    }
    let docRef;
    docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
      userId: user?.uid || "",
    });
    // console.log("BK handleCreateNewDoc docRef.id, docRef:", docRef.id, docRef);
    return docRef;
  };

  const handleCreateNewVariant = async (data) => {
    const { productId } = data;
    const collectionRef = collection(firestore, "products", productId, "variants");
    const docRef = await addDoc(collectionRef, {
      ...data,
      userId: user?.uid || "",
    });
    // console.log("BK handleCreateNewDoc docRef.id, docRef:", docRef.id, docRef);
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
    // console.log("BK getSubCollectionAllDocuments res", querySnapshot);
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
      console.log("BK Data2", data);


      const purchasedItemPromises = data.map(cartItem =>
        getDoc(doc(firestore, "purchasedItems", cartItem))
      );

      let purchasedItemSnapshots = await Promise.all(purchasedItemPromises);

      console.log("BK purchasedItemSnapshots", purchasedItemSnapshots);
      purchasedItemSnapshots = purchasedItemSnapshots.map((cartItem, index) => (
        cartItem.data()
      ));
      console.log("BK purchasedItemSnapshots2", purchasedItemSnapshots);


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
      const q = query(ordersRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const ordersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

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
      }));

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
      }));

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


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!orderId || !newStatus) {
        throw new Error("Order ID and new status are required.");
      }
      console.log("BK orderId || !newStatus", orderId, newStatus)

      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });

      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };


  /*************** data-related function end  **************/







  /*************** RAZORPAY function begin  **************/

  const createOrder = async () => {
    // console.log("BK createOrder begin");
    // var instance = new Razorpay({
    //   key_id: import.meta.env.VITE_RAZORPAY_KEY_ID,
    //   key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET,
    // })
    // // console.log("BK instance :", instance);

    // const res = await instance.orders.create({
    //   amount: 5000,
    //   currency: "INR",
    //   receipt: "receipt#1",
    //   notes: {
    //     key1: "value3",
    //     key2: "value2"
    //   }
    // })
    // // console.log("BK res :", res);
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
    console.log("BK user", user, user?.uid)
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
        createOrder,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
