"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { HomeyUser } from "@/types";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  signInAnonymously,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function isMobileOrTouch(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouch = "ontouchstart" in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || Boolean(isTouch && isSmallScreen);
}

interface AuthContextType {
  user: HomeyUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  isGuest: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name?: string) => void;
  logout: () => Promise<void>;
  updateHouseholdName: (name: string) => void;
}

const GUEST_STORAGE_KEY = "homeyx_guest_user";

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  initialized: false,
  isGuest: false,
  isConfigured: false,
  loginWithGoogle: async () => {},
  loginAsGuest: () => {},
  logout: async () => {},
  updateHouseholdName: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HomeyUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // 1. Check for guest session first if no firebase credentials
    const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
    const savedHousehold = localStorage.getItem("homeyx_household_name") || "บ้านสุขสันต์";

    if (savedGuest) {
      try {
        const parsed = JSON.parse(savedGuest);
        setUser({
          uid: parsed.uid || "guest-user",
          email: parsed.email || "guest@homeyx.local",
          displayName: parsed.displayName || "ผู้ใช้งานชั่วคราว (Guest)",
          householdName: savedHousehold,
          role: "owner",
        });
        setIsGuest(true);
      } catch {
        // ignore
      }
    }

    // 2. Check for redirect login result (mobile flow)
    if (isFirebaseConfigured) {
      getRedirectResult(auth)
        .then((res) => {
          if (res?.user) {
            toast.success(`ยินดีต้อนรับ ${res.user.displayName || "เข้าสู่ระบบ"}!`);
          }
        })
        .catch((err: any) => {
          if (err?.code && err.code !== "auth/credential-already-in-use") {
            console.error("Redirect sign in error:", err);
          }
        });
    }

    // 3. Listen to real Firebase Auth
    try {
      const unsub = onAuthStateChanged(auth, (fUser) => {
        setFirebaseUser(fUser);
        if (fUser) {
          setIsGuest(false);
          setUser({
            uid: fUser.uid,
            email: fUser.email || "user@google.com",
            displayName: fUser.displayName || "สมาชิกในบ้าน",
            photoURL: fUser.photoURL || undefined,
            householdName: savedHousehold,
            role: "owner",
          });
          localStorage.removeItem(GUEST_STORAGE_KEY);
        } else if (!savedGuest) {
          // If not guest and not firebase user
          setUser(null);
        }
        setInitialized(true);
      });
      return () => unsub();
    } catch {
      setInitialized(true);
    }
  }, []);

  async function loginWithGoogle() {
    if (!isFirebaseConfigured) {
      toast.error("ยังไม่ได้ตั้งค่า Firebase API Key ในระบบ กรุณาตรวจสอบ .env");
      throw new Error("Firebase not configured");
    }

    const isMobile = isMobileOrTouch();

    try {
      setLoading(true);

      // On mobile / touch screen: Use redirect for seamless in-app experience without opening new tabs/windows
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      // On desktop: Popup window is standard and non-disruptive
      const res = await signInWithPopup(auth, googleProvider);
      toast.success(`ยินดีต้อนรับ ${res.user.displayName || "เข้าสู่ระบบ"}!`);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      // Fallback to redirect if popup was blocked by browser
      if (err?.code === "auth/popup-blocked" || err?.code === "auth/cancelled-popup-request") {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error("Fallback redirect sign in error:", redirectErr);
        }
      }
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(`เข้าสู่ระบบไม่สำเร็จ: ${err?.message || err?.code}`);
      }
      throw err;
    } finally {
      if (!isMobile) {
        setLoading(false);
      }
    }
  }

  async function loginAsGuest(name = "เจ้าของบ้าน (โหมดเข้าใช้งานทันที)") {
    try {
      if (isFirebaseConfigured) {
        setLoading(true);
        const cred = await signInAnonymously(auth);
        const guestUser: HomeyUser = {
          uid: cred.user.uid,
          email: "guest@homeyx.cloud",
          displayName: name,
          householdName: localStorage.getItem("homeyx_household_name") || "บ้านสุขสันต์",
          role: "owner",
        };
        setUser(guestUser);
        setIsGuest(false);
        toast.success("เชื่อมต่อฐานข้อมูลออนไลน์ (Cloud Database) เรียบร้อย! 🟢");
        return;
      }
    } catch (e) {
      console.warn("Anonymous auth fallback:", e);
    } finally {
      setLoading(false);
    }

    const guestUser: HomeyUser = {
      uid: "guest-user",
      email: "guest@homeyx.local",
      displayName: name,
      householdName: localStorage.getItem("homeyx_household_name") || "บ้านสุขสันต์",
      role: "owner",
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setIsGuest(true);
    toast.success("เข้าสู่ระบบเรียบร้อย");
  }

  async function logout() {
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setFirebaseUser(null);
    setUser(null);
    setIsGuest(false);
    toast.info("ออกจากระบบแล้ว");
  }

  function updateHouseholdName(name: string) {
    localStorage.setItem("homeyx_household_name", name);
    setUser((prev) => (prev ? { ...prev, householdName: name } : null));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        initialized,
        isGuest,
        isConfigured: isFirebaseConfigured,
        loginWithGoogle,
        loginAsGuest,
        logout,
        updateHouseholdName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
