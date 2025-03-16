/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

/**
 * Import function triggers from their respective submodules:
 *
 * import { onCall } from "firebase-functions/v2/https";
 * import { onDocumentWritten } from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

initializeApp();
dotenv.config(); 

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;


const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,// process.env.RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,// process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorPayOrder = onRequest(async (req, res) => {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        throw new Error("Missing Razorpay API keys!");
    }
    
    logger.log("BK req body:", req.body);

    if (req.body.status !== 'razorpayOrderCreationStart') {
        return res.status(500).send('order status not matched');
    }

    try {
        const options = {
            amount: req.body.finalPrice * 100, // Amount in paise
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`,
            payment_capture: 1,
        };

        const response = await razorpay.orders.create(options);
        // logger.log("BK response:", response);
        res.json(response);


    } catch (error) {
        res.status(500).send(error.message);
    }
});


const firestore = getFirestore();

const getDocById = async (id, collectionName) => {
    if (!id || !collectionName) {
        throw new Error("Missing document ID or collection name");
    }

    const docRef = firestore.collection(collectionName).doc(id); // ✅ Correct way in Admin SDK
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
        throw new Error(`Document with ID ${id} not found in collection ${collectionName}`);
    }

    return docSnapshot;
};

// 🔹 Function to verify Razorpay payment signature
export const verifyPaymentSignature = onRequest(async (req, res) => {
    try {
        const { razorpayPaymentSuccessId } = req.body; // Use `req.body` instead of `req`
        if (!razorpayPaymentSuccessId) {
            return res.status(400).json({ error: "razorpayPaymentSuccessId ID is required" });
        }
        logger.log("razorpayPaymentSuccessId:", razorpayPaymentSuccessId);


        // Fetch order details from Firestore
        const razorpayPaymentSuccessRef = await getDocById(razorpayPaymentSuccessId, "razorpayPaymentSuccess");
        const data = razorpayPaymentSuccessRef.data();
        const { orderId } = data;

        const orderRef = await getDocById(orderId, "orders");


        logger.log("razorpayPaymentSuccessData:", data);


        if (!data || !data.razorpayOrderId || !data.razorpayPaymentId || !data.razorpaySignature) {
            return res.status(400).json({ error: "Invalid razorpayPaymentSuccessData data" });
        }

        if (!orderRef || !orderRef.id) {
            return res.status(400).json({ error: "Invalid order data" });
        }

        // Generate HMAC SHA256 signature
        const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
        hmac.update(data.razorpayOrderId + "|" + data.razorpayPaymentId);
        const generatedSignature = hmac.digest("hex");

        if (generatedSignature === data.razorpaySignature) {
            // Update order status in Firestore
            await orderRef.ref.update({ razorpayPaymentStatus: "Done" });

            logger.log("Payment verification successful for order:", orderId);
            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            logger.error("Payment signature verification failed for order:", orderId);
            return res.status(400).json({ error: "Signature verification failed" });
        }
    } catch (error) {
        logger.error("Error verifying payment signature:", error);
        return res.status(500).json({ error: error.message });
    }
});