"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useFirebase, useUser, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { ensureTeamMember, updateTeamMemberProfile } from './firestore';
import { TeamMember } from '../types';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  isAuthorized: boolean;
  teamMember: TeamMember | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateDisplayName: (newName: string) => Promise<void>;
  updatePhotoURL: (newUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useFirebase();
  const db = useFirestore();
  const { user, isAdmin, isUserLoading } = useUser();
  const { toast } = useToast();
  const [internalLoading, setInternalLoading] = useState(false);
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (user && db) {
      ensureTeamMember(db, user);
      const unsub = onSnapshot(doc(db, 'teamMembers', user.uid), (snap) => {
        if (snap.exists()) {
          setTeamMember(snap.data() as TeamMember);
        }
      });
      return () => unsub();
    } else {
      setTeamMember(null);
    }
  }, [user, db]);

  const signIn = async (email: string, pass: string) => {
    try {
      setInternalLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Denied", description: error.message });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setInternalLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Error", description: error.message });
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
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Setup Failed", description: error.message });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Logout Error", description: error.message });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setInternalLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Reset Link Dispatched", description: `Sent to ${email}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Reset Failed", description: error.message });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const updateDisplayName = async (newName: string) => {
    if (!auth.currentUser) return;
    try {
      setInternalLoading(true);
      await updateProfile(auth.currentUser, { displayName: newName });
      if (db) {
        const memberRef = doc(db, 'teamMembers', auth.currentUser.uid);
        await updateDoc(memberRef, { name: newName });
      }
      await auth.currentUser.reload();
      toast({ title: "Identity Synchronized", description: "Your executive profile name has been updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const updatePhotoURL = async (newUrl: string) => {
    if (!auth.currentUser) return;
    try {
      setInternalLoading(true);
      await updateProfile(auth.currentUser, { photoURL: newUrl });
      if (db) {
        await updateTeamMemberProfile(db, auth.currentUser.uid, { photoURL: newUrl });
      }
      await auth.currentUser.reload();
      toast({ title: "Thumbnail Updated", description: "Your profile visual has been synchronized." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
      throw error;
    } finally {
      setInternalLoading(false);
    }
  };

  const isAuthorized = isAdmin || (!!teamMember && teamMember.status === 'Authorized');

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin,
      isAuthorized,
      teamMember,
      loading: isUserLoading || internalLoading, 
      signIn, 
      signInWithGoogle,
      signUp, 
      logOut,
      resetPassword,
      updateDisplayName,
      updatePhotoURL
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
