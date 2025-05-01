// src/context/LayoutContext.jsx
import { createContext, useState, useContext } from 'react';

const LayoutContext = createContext();

export function useLayout() {
  return useContext(LayoutContext);
}

export function LayoutProvider({ children }) {
  const [showNavbar, setShowNavbar] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  
  const value = {
    showNavbar,
    showFooter,
    setShowNavbar,
    setShowFooter
  };
  
  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}