/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, ROLE_PRIVILEGES_MAP, DEMO_PRESET_USERS, testFirestoreConnection } from '../firebase';
import { testSupabaseConnection } from '../supabase';
import { UserRole, RolePrivileges, AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  privileges: RolePrivileges;
  isLoading: boolean;
  isFirebaseOnline: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  loginAs: (user: AuthUser) => void;
  switchRole: (role: UserRole) => void;
  updateUserRole: (targetUserId: string, newRole: UserRole) => Promise<void>;
  userList: AuthUser[];
  can: (permission: keyof Omit<RolePrivileges, 'role' | 'label' | 'description'>) => boolean;
  isSessionLocked: boolean;
  secondsRemaining: number;
  lockSession: () => void;
  unlockSession: (role?: UserRole, customUser?: AuthUser) => void;
  resetInactivityTimer: () => void;
  isPortalActive: boolean;
  setPortalActive: (active: boolean) => void;
}

const BOOTSTRAPPED_ADMIN_EMAILS = [
  'jaahwix@gmail.com',
  'nabieumelissajosephine@gmail.com'
];
const INACTIVITY_TIMEOUT_SECONDS = 1800; // 30 minutes idle timeout

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState(false);
  
  // Stored registry of system accounts
  const [userList, setUserList] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('sma_user_registry');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user registry', e);
      }
    }
    return Object.values(DEMO_PRESET_USERS);
  });

  // Current active role derived from user or fallback to admin
  const currentRole: UserRole = user?.role || 'admin';
  const privileges: RolePrivileges = ROLE_PRIVILEGES_MAP[currentRole];

  // Helper permission check
  const can = (permission: keyof Omit<RolePrivileges, 'role' | 'label' | 'description'>): boolean => {
    return Boolean(privileges[permission]);
  };

  // Test Supabase connection on boot
  useEffect(() => {
    testSupabaseConnection().then(res => {
      setIsFirebaseOnline(res.success);
    }).catch(() => {
      setIsFirebaseOnline(true);
    });
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Determine role: bootstrapped admin emails get 'admin'
        let assignedRole: UserRole = 'teacher';
        if (firebaseUser.email && BOOTSTRAPPED_ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())) {
          assignedRole = 'admin';
        } else {
          // Check local registry or Firestore
          const existing = userList.find(u => u.uid === firebaseUser.uid || u.email === firebaseUser.email);
          if (existing) {
            assignedRole = existing.role;
          } else {
            // Check Firestore doc if online
            try {
              const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              if (userDoc.exists() && userDoc.data().role) {
                assignedRole = userDoc.data().role;
              }
            } catch (err) {
              console.warn('Could not read user profile from Firestore, using default:', err);
            }
          }
        }

        const authUserObj: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
          role: assignedRole,
        };

        setUser(authUserObj);

        // Update in-memory registry
        setUserList(prev => {
          const index = prev.findIndex(p => p.uid === authUserObj.uid);
          let updated: AuthUser[];
          if (index >= 0) {
            updated = [...prev];
            updated[index] = { ...updated[index], ...authUserObj };
          } else {
            updated = [...prev, authUserObj];
          }
          localStorage.setItem('sma_user_registry', JSON.stringify(updated));
          return updated;
        });

        // Save to Firestore if admin
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: assignedRole,
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          // Non-blocking in case of restricted write
        }
      } else {
        // Only restore if a verified authenticated session exists
        const storedSession = sessionStorage.getItem('jcc_authenticated_user') || localStorage.getItem('jcc_authenticated_user');
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            if (parsed && parsed.role) {
              setUser(parsed);
              setIsSessionLocked(false);
              setIsLoading(false);
              return;
            }
          } catch {}
        }
        setUser(null);
        setIsSessionLocked(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Sign-in failed:', error);
      alert(`Authentication failed: ${error.message || 'Please check your connection and popup permissions.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Portal Active State (public website vs management portal)
  const [isPortalActive, setIsPortalActiveRaw] = useState<boolean>(false);

  const handleSetPortalActive = useCallback((active: boolean) => {
    setIsPortalActiveRaw(active);
    if (active) {
      setIsSessionLocked(false);
      sessionStorage.removeItem('sma_session_locked');
      lastActivityRef.current = Date.now();
      setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
    }
  }, []);

  // Inactivity & Session Lock State - always unlocked by default for public visitors
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(INACTIVITY_TIMEOUT_SECONDS);
  const lastActivityRef = useRef<number>(Date.now());

  // Ensure public visitors start with clean unlocked session on fresh loads
  useEffect(() => {
    sessionStorage.removeItem('sma_session_locked');
    setIsSessionLocked(false);
    lastActivityRef.current = Date.now();
  }, []);

  // Function to lock session (only applicable when in portal)
  const lockSession = useCallback(() => {
    setIsSessionLocked(true);
    sessionStorage.setItem('sma_session_locked', 'true');
    setSecondsRemaining(0);
  }, []);

  // Login as a specific authenticated account
  const loginAs = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('sma_active_role', authUser.role);
    sessionStorage.setItem('jcc_authenticated_user', JSON.stringify(authUser));
    localStorage.setItem('jcc_authenticated_user', JSON.stringify(authUser));
    setIsSessionLocked(false);
    sessionStorage.removeItem('sma_session_locked');
    lastActivityRef.current = Date.now();
    setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
  }, []);

  // Function to unlock session
  const unlockSession = useCallback((roleToUnlock?: UserRole, customUser?: AuthUser) => {
    if (customUser) {
      loginAs(customUser);
      return;
    }
    const targetRole = roleToUnlock || 'admin';
    const preset = DEMO_PRESET_USERS[targetRole];
    loginAs(preset);
  }, [loginAs]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (!isSessionLocked) {
      lastActivityRef.current = Date.now();
      setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
    }
  }, [isSessionLocked]);

  // Global Inactivity Event Listeners (only locks if user is actively in the portal)
  useEffect(() => {
    const handleUserActivity = () => {
      if (isSessionLocked) return;
      const now = Date.now();
      // Throttle timestamp updates to at most once every 500ms
      if (now - lastActivityRef.current >= 500) {
        lastActivityRef.current = now;
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    activityEvents.forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Inactivity countdown & lock trigger interval (every 1 second)
    const interval = setInterval(() => {
      // If browsing public website, never lock session!
      if (!isPortalActive) {
        if (isSessionLocked) setIsSessionLocked(false);
        setSecondsRemaining(INACTIVITY_TIMEOUT_SECONDS);
        return;
      }

      if (isSessionLocked) {
        setSecondsRemaining(0);
        return;
      }

      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_SECONDS - elapsedSeconds);
      setSecondsRemaining(remaining);

      // Session is kept active and unlocked without prompting for keys
      setIsSessionLocked(false);
      sessionStorage.removeItem('sma_session_locked');
    }, 1000);

    return () => {
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, handleUserActivity);
      });
      clearInterval(interval);
    };
  }, [isSessionLocked, isPortalActive]);

  // Sign Out
  const signOutUser = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
      // Cleanly clear session and return to Login Screen
      setUser(null);
      localStorage.removeItem('sma_active_role');
      localStorage.removeItem('jcc_authenticated_user');
      sessionStorage.removeItem('jcc_authenticated_user');
      localStorage.removeItem('sma_active_portal_student');
      setIsSessionLocked(true);
      setIsPortalActiveRaw(false);
      sessionStorage.setItem('sma_session_locked', 'true');
      setSecondsRemaining(0);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick switch role (vital for demoing & testing all 5 privilege tiers in real-time)
  const switchRole = (newRole: UserRole) => {
    localStorage.setItem('sma_active_role', newRole);
    if (user) {
      setUser({
        ...user,
        role: newRole,
        displayName: user.displayName || DEMO_PRESET_USERS[newRole].displayName,
      });
    } else {
      setUser(DEMO_PRESET_USERS[newRole]);
    }
  };

  // Update a user's role (Admin Privilege feature)
  const updateUserRole = async (targetUserId: string, newRole: UserRole) => {
    if (!can('canManageUserRoles')) {
      alert('Unauthorized: Only Super Administrators can alter user roles.');
      return;
    }

    setUserList(prev => {
      const updated = prev.map(u => u.uid === targetUserId ? { ...u, role: newRole } : u);
      localStorage.setItem('sma_user_registry', JSON.stringify(updated));
      return updated;
    });

    // If updating currently logged in user
    if (user && user.uid === targetUserId) {
      setUser(prev => prev ? { ...prev, role: newRole } : null);
    }

    // Attempt Firestore persistence if possible
    try {
      await setDoc(doc(db, 'users', targetUserId), { role: newRole }, { merge: true });
    } catch (err) {
      console.warn('Firestore update role notification:', err);
    }
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: currentRole,
        privileges,
        isLoading,
        isFirebaseOnline,
        isAuthenticated,
        signInWithGoogle,
        signOutUser,
        loginAs,
        switchRole,
        updateUserRole,
        userList,
        can,
        isSessionLocked,
        secondsRemaining,
        lockSession,
        unlockSession,
        resetInactivityTimer,
        isPortalActive,
        setPortalActive: handleSetPortalActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
