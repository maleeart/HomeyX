"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push("/login");
    }
  }, [user, initialized, router]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF7F2] dark:bg-[#141210]">
        <style>{`
          @keyframes homey-breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.06); }
          }
          .homey-breathe { animation: homey-breathe 2s ease-in-out infinite; }
        `}</style>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16 rounded-3xl overflow-hidden shadow-md border border-[#EADBCE] dark:border-[#38332E] homey-breathe bg-white">
            <Image
              src="/logo.png"
              alt="HomeyX"
              width={64}
              height={64}
              className="object-cover"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C25E40] animate-pulse" />
            <span className="text-xs font-semibold text-[#78716A] dark:text-[#A8A199]">
              กำลังโหลดข้อมูลบ้าน...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
