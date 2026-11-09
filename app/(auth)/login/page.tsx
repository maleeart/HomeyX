"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  Boxes,
  ShoppingCart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithGoogle, loginAsGuest, isConfigured, initialized } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    if (initialized && user) {
      router.push("/dashboard");
    }
  }, [user, initialized, router]);

  async function handleGoogleLogin() {
    try {
      setLoadingGoogle(true);
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      // toast already shown in hook
      setLoadingGoogle(false);
    }
  }

  function handleGuestLogin() {
    loginAsGuest("เจ้าของบ้าน (Guest Mode)");
    router.push("/dashboard");
  }

  if (initialized && user) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#141210] flex flex-col justify-center items-center p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#78716A] dark:text-[#A8A199]">
          <span className="w-2 h-2 rounded-full bg-[#C25E40] animate-pulse" />
          <span>กำลังพาเข้าสู่ระบบ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#141210] flex flex-col justify-center items-center p-4 selection:bg-[#C25E40]/20 selection:text-[#C25E40]">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#F2ECE1]/60 to-transparent dark:from-[#26211C]/40 pointer-events-none rounded-b-[4rem]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#EADBCE] dark:border-[#38332E] shadow-xl p-6 sm:p-8 text-center"
      >
        {/* Brand Logo & Name */}
        <div className="relative w-18 h-18 mx-auto mb-4 rounded-3xl overflow-hidden shadow-sm border border-[#EADBCE] dark:border-[#403A34] bg-[#FAF7F2]">
          <Image
            src="/logo.png"
            alt="HomeyX"
            width={72}
            height={72}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        <h1 className="text-2xl font-black text-[#2D2926] dark:text-[#FAF7F2] tracking-tight">
          Homey<span className="text-[#C25E40]">X</span>
        </h1>
        <p className="text-xs font-semibold text-[#78716A] dark:text-[#A8A199] mt-1">
          เรดาร์ของหมด &amp; เช็คลิสต์ก่อนซื้อของเข้าบ้าน
        </p>

        {/* Features highlight pills */}
        <div className="my-6 grid grid-cols-2 gap-2 text-left">
          <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#EADBCE] dark:border-[#332E2A]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>เรดาร์ของหมด</span>
            </div>
            <p className="text-[10px] text-[#78716A] dark:text-[#A8A199] mt-0.5">
              เปิดดูเฉพาะตอนจะไปซื้อของเพิ่ม
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#262320] border border-[#EADBCE] dark:border-[#332E2A]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4E7D5B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ฐานข้อมูลออนไลน์</span>
            </div>
            <p className="text-[10px] text-[#78716A] dark:text-[#A8A199] mt-0.5">
              ซิงค์ Cloud Firestore เรียลไทม์
            </p>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white dark:bg-[#2A2622] hover:bg-[#FAF7F2] dark:hover:bg-[#332E2A] text-[#2D2926] dark:text-[#FAF7F2] font-bold text-sm border-2 border-[#EADBCE] dark:border-[#403A34] shadow-xs active:scale-98 transition-all disabled:opacity-60"
          >
            {/* Google SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loadingGoogle ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}</span>
          </button>

          {/* Quick Start / Guest */}
          <button
            onClick={handleGuestLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#78716A] dark:text-[#A8A199] hover:bg-[#FAF7F2] dark:hover:bg-[#262320] transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C25E40]" />
            <span>เข้าใช้งานทันที (เชื่อมต่อ Cloud Database)</span>
          </button>
        </div>

        {/* Configuration Notice if not yet configured */}
        {!isConfigured && (
          <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-left text-[11px] text-[#8C6420] dark:text-[#FBBF24]">
            <div className="flex items-center gap-1.5 font-bold mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>โหมดสาธิต (Local Demo)</span>
            </div>
            สามารถกดปุ่ม "โหมดผู้เยี่ยมชม" เพื่อทดลองใช้งานได้ทันที หรือใส่ Firebase API Key ในไฟล์ <code className="font-mono font-bold">.env.local</code> เพื่อเปิดใช้ Google Login จริง
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#EADBCE] dark:border-[#332E2A] text-[10px] text-[#A8A199]">
          HomeyX · Smart Home Stock &amp; Grocery List · Secured by Firebase &amp; Vercel
        </div>
      </motion.div>
    </div>
  );
}
