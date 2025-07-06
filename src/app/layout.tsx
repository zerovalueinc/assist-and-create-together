import * as React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppHeader from "@/components/ui/AppHeader";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from 'next/link';
import { AuthProvider } from "@/context/AuthContext";
import { CompanyProvider } from "@/context/CompanyContext";
import { DataPreloadProvider } from "@/context/DataPreloadProvider";
import { Home, Shield, Briefcase, BarChart3, Layers, List, Activity, Settings, Mail, FileText, Key, User } from 'lucide-react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Intel', icon: Shield, path: '/intel' },
  { label: 'GTM', icon: Briefcase, path: '/gtm' },
  { label: 'Sales Intelligence', icon: BarChart3, path: '/sales-intelligence' },
  { label: 'Lead Enrichment', icon: Layers, path: '/lead-enrichment' },
  { label: 'Your Work', icon: List, path: '/your-work' },
  { label: 'System Audit', icon: Activity, path: '/system-audit' },
  { label: 'Pipeline Orchestrator', icon: Settings, path: '/pipeline-orchestrator' },
  { label: 'Email Campaigns', icon: Mail, path: '/email-campaigns' },
  { label: 'CRM Table', icon: FileText, path: '/crm-table' },
  { label: 'API Key Setup', icon: Key, path: '/api-key-setup' },
  { label: 'Account', icon: User, path: '/account' },
];

export const metadata: Metadata = {
  title: "PersonaOps App",
  description: "PersonaOps migrated from Vite to Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}>
        <AuthProvider>
          <CompanyProvider>
            <DataPreloadProvider>
              <SidebarProvider>
                <AppHeader />
                <div className="flex min-h-screen">
                  <Sidebar>
                    <SidebarMenu>
                      {navItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <Link href={item.path} passHref legacyBehavior>
                            <SidebarMenuButton asChild>
                              <a className="flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </a>
                            </SidebarMenuButton>
                          </Link>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </Sidebar>
                  <main className="flex-1 bg-background">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            </DataPreloadProvider>
          </CompanyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
