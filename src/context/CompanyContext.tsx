'use client';
import * as React from "react";
import { createContext, useContext, useState } from 'react';

export type CompanyResearch = any; // Replace with a more specific type if desired

const CompanyContext = createContext<{
  research: CompanyResearch | null;
  setResearch: (data: CompanyResearch) => void;
}>({
  research: null,
  setResearch: () => {},
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  return (
    <CompanyContext.Provider value={{ research, setResearch }}>
      {children}
    </CompanyContext.Provider>
  );
}; 