"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  updateProfile
} from 'firebase/auth';
import { useFirebase, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
  const { user, isAdmin, isUserLoading } = useUser();
  const { toast } = useToast();
  const [internalLoading, setInternalLoading] = useState(false);

  const signIn = async (email: string, pass: string) => {
    try {
      setInternalLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        toast({
          title: "Session Initialized",
          description: `Welcome back to the studio.`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: error.message || "Invalid security credentials.",
      });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    try {
      setInternalLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await updateProfile(result.user, { displayName: name });
        toast({
          title: "Account Provisioned",
          description: `Your workspace has been successfully initialized, ${name}.`,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Could not provision your creative account.",
      });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Secure Logout",
        description: "Your session has been terminated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Error",
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading: isUserLoading || internalLoading, 
      signIn, 
      signUp, 
      logOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}