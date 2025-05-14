import { createContext, useContext, useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  getFirestore,
  collection,
  onSnapshot,
  orderBy,
  addDoc,
  getDocs,
  getDoc,
  doc,
  setDoc,
  query,
  where,
  limit,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";


import { getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject, 
} from "firebase/storage";

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
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSiteOpen, setIsSiteOpen] = useState(true); // Default to true while loading
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
    if (user) {
      if (user?.uid == "d0CkzQ2rBpQLd3OLOkWkgjjQZaI3") {
        setIsAdmin(true);
      } else if (user?.uid == "EEqRTrY732ZaK27XRkjkJbjMq5E2") {
        setIsDeliveryPartner(true);
      }
    } else {
      if (isAdmin) setIsAdmin(false);
      if (isDeliveryPartner) setIsDeliveryPartner(false);
    }
  }, [user]);

  // Authentication functions
  const signupUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(firebaseAuth, email, password);

  const singinUserWithEmailAndPass = (email, password) =>
    signInWithEmailAndPassword(firebaseAuth, email, password);

  // Add this function inside the FirebaseProvider
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(firebaseAuth, email);
    console.log("Password reset email sent successfully.");
    displayToastMessage("Password reset email sent successfully!");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    displayToastMessage(error.message, "error");
  }
};

// Add this function inside the FirebaseProvider
const saveUserDetails = async (userId, userDetails) => {
  try {
    const userDocRef = doc(firestore, "users", userId); // Save user details in the "users" collection
    await setDoc(userDocRef, userDetails);
    console.log("User details saved successfully.");
  } catch (error) {
    console.error("Error saving user details:", error);
    throw error;
  }
};

// Function to fetch phone number from the "users" collection
const fetchPhoneNumber = async (userId) => {
  try {
    const userDocRef = doc(firestore, "users", userId); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.phoneNumber || null; // Return the phone number if it exists
    } else {
      console.error("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching phone number:", error);
    throw error;
  }
};

const listenForNewOrders = (callback) => {
  const ordersCollectionRef = collection(firestore, "orders");
  const q = query(ordersCollectionRef, orderBy("_createdDate", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newOrders = snapshot.docChanges().filter((change) => change.type === "added");
    if (newOrders.length > 0) {
      callback(newOrders.map((change) => ({ id: change.doc.id, ...change.doc.data() })));
    }
  });

  return unsubscribe; // Return the unsubscribe function for cleanup
};

const playNotificationSound = () => {
  const audio = new Audio("/notification.wav"); // Path to the sound file in the public folder
  audio.play();
};

  // OTP Login Functions
  const sendOtp = async (phoneNumber) => {
    try {
      // Ensure the recaptcha-container exists in the DOM
      if (!document.getElementById("recaptcha-container")) {
        const recaptchaContainer = document.createElement("div");
        recaptchaContainer.id = "recaptcha-container";
        document.body.appendChild(recaptchaContainer);
      }

      // Initialize reCAPTCHA verifier
      const recaptchaVerifier = new RecaptchaVerifier(
        firebaseAuth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified:", response);
          },
          'expired-callback': () => {
            console.error("reCAPTCHA expired. Please try again.");
          },
        }
      );

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(
        firebaseAuth,
        phoneNumber,
        recaptchaVerifier
      );

      console.log("OTP sent successfully.");
      return confirmationResult; // Return the confirmation result to verify OTP later
    } catch (error) {
      console.error("Error sending OTP:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/invalid-app-credential") {
        console.error("Invalid app credentials. Check your Firebase configuration.");
      } else if (error.code === "auth/missing-phone-number") {
        console.error("Phone number is missing or invalid.");
      } else {
        console.error("Unexpected error during OTP login.");
      }

      throw error; // Re-throw the error for the caller to handle
    }
  };

  const verifyOtp = async (confirmationResult, otp) => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      console.log("User signed in successfully:", userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  };

  const fetchAddresses = async () => {
    try {
      const addressesCollectionRef = collection(firestore, "delivery_addresses");
      const snapshot = await getDocs(addressesCollectionRef);
      const addresses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return addresses; // Return the fetched addresses
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  };

  // Fetch the site status from Firestore
    const fetchSiteStatus = async () => {
      try {
        const siteStatusDocRef = doc(firestore, "siteStatus", "global");
        const siteStatusDoc = await getDoc(siteStatusDocRef);
        if (siteStatusDoc.exists()) {
          setIsSiteOpen(siteStatusDoc.data().isSiteOpen);
        } else {
          console.log("Site status document does not exist. Initializing...");
          await setDoc(siteStatusDocRef, { isSiteOpen: true }); // Default to true
          setIsSiteOpen(true);
        }
      } catch (error) {
        console.error("Error fetching site status:", error);
      }
    };
  
    // Toggle the site status in Firestore
    const toggleSiteStatus = async () => {
      try {
        const newStatus = !isSiteOpen; // Toggle the current status
        console.log("Toggling site status to:", newStatus); // Debugging log
        setIsSiteOpen(newStatus); // Update local state
        await setDoc(doc(firestore, "siteStatus", "global"), { isSiteOpen: newStatus });
        console.log("Site status updated successfully in Firestore."); // Debugging log
      } catch (error) {
        console.error("Error updating site status:", error); // Log any errors
      }
    };
  
    useEffect(() => {
      // Fetch site status on component mount
      fetchSiteStatus();
    }, []);
  
    useEffect(() => {
      onAuthStateChanged(firebaseAuth, (currentUser) => {
        if (currentUser) setUser(currentUser);
        else setUser(null);
      });
    }, []);

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
    // console.log("BK user",user?.uid, user)
    docRef = await addDoc(collection(firestore, collectionName), {
      ...data,
      userId: user?.uid || "",
      phoneNumber: user?.phoneNumber || '',
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
        where("userId", "==", user?.uid),
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
      // console.log("bk orderId,payload", orderId, payload)
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

  // NEW FUNCTION: Fetch a specific variant by Product ID and Variant ID
  const fetchVariantById = async (productId, variantId) => {
    if (!productId || !variantId) {
      console.error("Product ID and Variant ID are required to fetch variant.");
      return null;
    }
    try {
      const variantDocRef = doc(
        firestore,
        "products",
        productId,
        "variants",
        variantId
      );
      const variantDocSnap = await getDoc(variantDocRef);

      if (variantDocSnap.exists()) {
        // Return the variant data along with its ID
        return { id: variantDocSnap.id, ...variantDocSnap.data() };
      } else {
        console.error("No such variant document found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching variant by ID:", error);
      throw error; // Re-throw the error for the component to handle
    }
  };

  // NEW FUNCTION: Update a specific variant
  const updateVariant = async (productId, variantId, dataToUpdate) => {
     if (!productId || !variantId) {
        console.error("Product ID and Variant ID are required to update variant.");
        throw new Error("Product ID and Variant ID are required.");
    }
    try {
        const variantDocRef = doc(firestore, "products", productId, "variants", variantId);

        // --- Image Handling (Simplified Example - Needs Refinement) ---
        // This part assumes 'dataToUpdate.productImages' might contain File objects
        // for new uploads. A more robust solution involves handling this in the component
        // before calling updateVariant, passing only storage paths/URLs.

        if (dataToUpdate.productImages && dataToUpdate.productImages.length > 0 && dataToUpdate.productImages[0] instanceof File) {
            console.log("Uploading new images for variant update...");
            // **Important**: You need a strategy for existing images.
            // Do you delete old ones? Add to the list? This example replaces them.
            // Consider fetching the existing variant data first to get old image paths for deletion.

            const uploadPromises = dataToUpdate.productImages.map(async (file) => {
                 // Use a consistent path structure
                const imageRef = ref(storage, `products/${productId}/variants/${variantId}/${Date.now()}-${file.name}`);
                const uploadResult = await uploadBytes(imageRef, file);
                return uploadResult.ref.fullPath; // Store the storage path
            });

            const newImagePaths = await Promise.all(uploadPromises);
            dataToUpdate = { ...dataToUpdate, productImages: newImagePaths }; // Update data with new paths

            // **Optional**: Delete old images here if replacing. You'd need their paths.
        } else {
             // If no new File objects, remove the field if it wasn't intended to be updated,
             // or ensure it holds the correct existing string paths/URLs if you allow reordering/removal without new uploads.
             // For safety, if it's not an array of strings, remove it to avoid errors.
            if (dataToUpdate.productImages && !(Array.isArray(dataToUpdate.productImages) && dataToUpdate.productImages.every(item => typeof item === 'string'))) {
                 delete dataToUpdate.productImages;
            }
        }
        // --- End Image Handling ---


        await updateDoc(variantDocRef, dataToUpdate);
        console.log(`Variant ${variantId} in product ${productId} updated successfully.`);
        return true; // Indicate success
    } catch (error) {
        console.error("Error updating variant:", error);
        throw error; // Re-throw
    }
  };

  const fetchProductById = async (productId) => {
    try {
      const productDocRef = doc(firestore, "products", productId); // Reference to the product document
      const productDoc = await getDoc(productDocRef);
  
      if (productDoc.exists()) {
        return { id: productDoc.id, ...productDoc.data() }; // Return the product data
      } else {
        console.error("No such product document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }
  };

  const updateProduct = async (productId, updatedData) => {
    try {
      const productDocRef = doc(firestore, "products", productId); // Reference to the product document
      await updateDoc(productDocRef, updatedData); // Update the document with the new data
      console.log("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  };

  /*************** data-related function end  **************/







  /*************** RAZORPAY function begin  **************/

  const generateUniqueId = () => {
    return uuidv4();
  };

  const createRazorpayOrder = async (orderPayload) => {
    try {
      // console.log("Server time when creating Razorpay order:", new Date().toISOString()); // Log server time
      // console.log("Order payload being sent to Razorpay:", orderPayload); // Log order payload
      const response = await axios.post(
        "https://us-central1-hotel-bites.cloudfunctions.net/createRazorPayOrder",
        orderPayload,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      console.log("Order Created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error.response?.data || error.message);
    }
  };

  const createRazorpayPaymentsSuccess = async (payload) => {
    try {

      // console.log("bk HERE", payload);;
      const finalPayload = {
        razorpayOrderId: payload.razorpayOrderId,
        razorpayPaymentId: payload.paymentId,
        razorpaySignature: payload.signature,
        orderId: payload.orderId
      };
      const razorpayPaymentSuccessRef = await handleCreateNewDoc(finalPayload, 'razorpayPaymentSuccess')
      const razorpayPaymentSuccessId = razorpayPaymentSuccessRef.id;

      const response = await axios.post(
        "https://us-central1-hotel-bites.cloudfunctions.net/verifyPaymentSignature",
        { razorpayPaymentSuccessId },
      );
      console.log(response.data);

      const razorpayPaymentSuccessSnap = await getDoc(razorpayPaymentSuccessRef);

      const orderRef = doc(firestore, "orders", payload.orderId);
      if (razorpayPaymentSuccessSnap.data().paymentStatus === 'Done') {
        await updateDoc(orderRef, { razorpayPaymentId: payload.paymentId });
      }
      // console.log("bk pass 1");
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


  // const [user, setUser] = useState(null);
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);

  // useEffect(() => {
  //   onAuthStateChanged(firebaseAuth, (user) => {
  //     if (user) setUser(user);
  //     else setUser(null);
  //   });
  // }, []);

  // const isLoggedIn = user ? true : false;

  // const logoutUser = async () => {
  //   try {
  //     await firebaseAuth.signOut();
  //     console.log("User signed out successfully");
  //     setUser(null);

  //   } catch (error) {
  //     console.error("Sign Out Error", error);
  //   }
  // };

  // useEffect(() => {
  //   // console.log("BK user", user, user?.uid)
  //   if (user) {
  //     if (user?.uid == "ukEdfieQ7FaI4rpITgxbtWyBuZZ2") {
  //       setIsAdmin(true);
  //     } else if (user?.uid == "EEqRTrY732ZaK27XRkjkJbjMq5E2") {
  //       setIsDeliveryPartner(true);
  //     }
  //   }
  //   else {
  //     if (isAdmin) setIsAdmin(false);
  //     if (isDeliveryPartner) setIsDeliveryPartner(false);
  //   }
  // }, [user])


  return (
    <FirebaseContext.Provider
      value={{
        isLoggedIn,
        user,
        isSiteOpen,
        toggleSiteStatus,
        fetchSiteStatus,
        firebaseAuth,
        firestore,
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
        fetchVariantById,
        updateVariant,

        logoutUser,

        displayToastMessage,
        checkIsItemAlreadyInCart,
        createOrder,
        createRazorpayPaymentsSuccess,

        sendOtp,
        verifyOtp,
        resetPassword,
        saveUserDetails,
        fetchPhoneNumber,
        listenForNewOrders,
        playNotificationSound,
        fetchAddresses,
        fetchProductById,
        updateProduct,
        storage,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
