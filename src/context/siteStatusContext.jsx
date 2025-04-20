import React, { createContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../context/Firebase";

export const SiteStatusContext = createContext();

export const SiteStatusProvider = ({ children }) => {
  const [isSiteOpen, setIsSiteOpen] = useState(true); // Default to true while loading

  useEffect(() => {
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

    fetchSiteStatus();
  }, []);

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

  return (
    <SiteStatusContext.Provider value={{ isSiteOpen, toggleSiteStatus }}>
      {children}
    </SiteStatusContext.Provider>
  );
};
