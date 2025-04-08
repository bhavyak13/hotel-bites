import React, { createContext, useState, useEffect } from 'react';

export const SiteStatusContext = createContext();

export const SiteStatusProvider = ({ children }) => {
  const [isSiteOpen, setIsSiteOpen] = useState(() => {
    const storedStatus = localStorage.getItem('isSiteOpen');
    return storedStatus ? JSON.parse(storedStatus) : true;
  });

  useEffect(() => {
    localStorage.setItem('isSiteOpen', JSON.stringify(isSiteOpen));
  }, [isSiteOpen]);

  const toggleSiteStatus = () => {
    setIsSiteOpen(!isSiteOpen);
  };

  return (
    <SiteStatusContext.Provider value={{ isSiteOpen, toggleSiteStatus }}>
      {children}
    </SiteStatusContext.Provider>
  );
};
