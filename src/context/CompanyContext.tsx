import React, { createContext, useContext, useState } from 'react';

export type CompanyResearch = any; // Replace with a more specific type if desired

const CompanyContext = createContext<{
  research: CompanyResearch | null;
  setResearch: (data: CompanyResearch) => void;
  workspaceId: string | null;
  setWorkspaceId: (id: string | null) => void;
}>({
  research: null,
  setResearch: () => {},
  workspaceId: null,
  setWorkspaceId: () => {},
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [research, setResearch] = useState<CompanyResearch | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  return (
    <CompanyContext.Provider value={{ research, setResearch, workspaceId, setWorkspaceId }}>
      {children}
    </CompanyContext.Provider>
  );
}; 