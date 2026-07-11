"use client";

import { createContext, useContext, useState } from "react";


const WelcomeContext = createContext({ entered: true, enter: () => {} });

export function WelcomeProvider({ children }) {
  const [entered, setEntered] = useState(false);
  return (
    <WelcomeContext.Provider value={{ entered, enter: () => setEntered(true) }}>
      {children}
    </WelcomeContext.Provider>
  );
}

export const useWelcome = () => useContext(WelcomeContext);
