/* eslint-disable */
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

initializeApp();
dotenv.config();

const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.VITE_RAZORPAY_KEY_SECRET;

// logger.log("BK process.env",process.env);

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,// process.env.RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,// process.env.RAZORPAY_KEY_SECRET,
});



import cors from "cors";

const corsHandler = cors({ origin: true });

export const createRazorPayOrder = onRequest(async (req, res) => {
    return corsHandler(req, res, async () => {
        if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ error: "Missing Razorpay API keys!" });
        }

        // console.log("bk req body:", req.body);

        if (req.body.status !== "razorpayOrderCreationStart") {
            return res.status(400).json({ error: "Order status not matched" });
        }

        try {
            const options = {
                amount: req.body.finalPrice * 100, // Amount in paise
                currency: "INR",
                receipt: `order_rcptid_${Date.now()}`,
                payment_capture: 1,
            };

            console.log("Received request to create Razorpay order with options:", options);

            const response = await razorpay.orders.create(options);
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
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
export const verifyPaymentSignature = onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const { razorpayPaymentSuccessId } = req.body;
            if (!razorpayPaymentSuccessId) {
                return res.status(400).json({ error: "razorpayPaymentSuccessId ID is required" });
            }
            console.log("razorpayPaymentSuccessId:", razorpayPaymentSuccessId);

            // Fetch order details from Firestore
            const razorpayPaymentSuccessRef = await getDocById(razorpayPaymentSuccessId, "razorpayPaymentSuccess");
            const data = razorpayPaymentSuccessRef.data();
            const { orderId } = data;

            const orderRef = await getDocById(orderId, "orders");

            console.log("razorpayPaymentSuccessData:", data);
            console.log("Verifying Razorpay payment signature with data:", data);

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

                console.log("Payment verification successful for order:", orderId);
                return res.json({ success: true, message: "Payment verified successfully" });
            } else {
                console.error("Payment signature verification failed for order:", orderId);
                return res.status(400).json({ error: "Signature verification failed" });
            }
        } catch (error) {
            console.error("Error verifying payment signature:", error);
            return res.status(500).json({ error: error.message });
        }
    });
});
