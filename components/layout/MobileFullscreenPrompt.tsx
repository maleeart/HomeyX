"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Share2,
  PlusSquare,
  X,
  Maximize2,
  CheckCircle2,
  Sparkles,
  ArrowDown,
  ExternalLink,
} from "lucide-react";

export function MobileFullscreenPrompt() {
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if running as standalone PWA
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(standalone);

    // 2. Check mobile device
    const ua = navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);

    setIsMobile(mobile);
    setIsIOS(ios);

    // 3. Check dismissed state in session/local storage
    const wasDismissed = sessionStorage.getItem("homeyx_pwa_dismissed");
    if (!wasDismissed) {
      setDismissed(false);
    }

    // 4. Catch Android/Desktop beforeinstallprompt event
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 5. Track fullscreen change
    const handleFullscreenChange = () => {
      setIsFullscreenActive(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Handle Android native install prompt
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsOpen(false);
        setDismissed(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback: try requestFullscreen if supported
      triggerFullscreen();
    }
  };

  // Toggle browser Fullscreen API (useful for Android & desktop browsers)
  const triggerFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreenActive(true);
        setIsOpen(false);
      } else {
        await document.exitFullscreen();
        setIsFullscreenActive(false);
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("homeyx_pwa_dismissed", "true");
  };

  // Don't show floating banner if already standalone or already in fullscreen
  const showFloatingBanner = !isStandalone && isMobile && !dismissed && !isFullscreenActive;

  return (
    <>
      {/* Floating Action Pill on Mobile (Bottom Right, Above safe area) */}
      {showFloatingBanner && (
        <div className="fixed bottom-20 right-4 z-40 lg:hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-1.5 p-1.5 pl-3 pr-2 bg-[#2D2926]/95 dark:bg-[#1E1B18]/95 backdrop-blur-md text-white rounded-2xl shadow-xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 hover:text-[#EADBCE] active:scale-95 transition-all text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-[#C25E40] flex items-center justify-center shrink-0">
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="leading-tight">
                <span className="font-bold text-[11px] block text-[#FAF7F2]">
                  เปิดโหมดเต็มจอ
                </span>
                <span className="text-[10px] text-[#A8A199] block">
                  ใช้งานแบบแอพแท้ ไม่มีแถบเว็บ
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/10 text-[#A8A199] hover:text-white transition-colors ml-1"
              aria-label="ปิดคำแนะนำ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen & PWA Install Guidance Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E1B18] w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#EADBCE] dark:border-[#38332E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#EADBCE] dark:border-[#332E2A] flex items-center justify-between bg-[#FAF7F2] dark:bg-[#171513]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FDF4F0] dark:bg-[#2C1F1B] flex items-center justify-center text-[#C25E40]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#2D2926] dark:text-[#FAF7F2]">
                    วิธีเปิดแสดงผลแบบเต็มจอ (100% Fullscreen)
                  </h3>
                  <p className="text-[11px] text-[#8C827A] dark:text-[#A8A199]">
                    ซ่อนแถบ URL และแถบเมนูเว็บ เพื่อประสบการณ์เหมือนแอพจริง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#EADBCE] dark:hover:bg-[#2A2622] text-[#78716A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* iOS Safari Guide */}
              {isIOS ? (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-[#FDF4F0] dark:bg-[#2A201A] border border-[#F5D8CE] dark:border-[#4D2E25]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#C25E40] mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>สำหรับ iPhone / iPad (Safari)</span>
                    </div>
                    <p className="text-xs text-[#544E48] dark:text-[#C5BFB8]">
                      Safari บน iOS อนุญาตให้เปิดเต็มจอ 100% ไร้แถบเว็บ ผ่านการเพิ่มไปยังหน้าจอโฮม (Add to Home Screen)
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#EADBCE] dark:border-[#38332E]">
                      <div className="w-7 h-7 rounded-full bg-[#C25E40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div className="text-xs text-[#2D2926] dark:text-[#FAF7F2]">
                        <p className="font-bold flex items-center gap-1.5">
                          แตะปุ่มแชร์ <Share2 className="w-3.5 h-3.5 text-[#C25E40]" />
                        </p>
                        <p className="text-[#78716A] dark:text-[#A8A199] mt-0.5">
                          ที่แถบเมนูด้านล่างสุดของหน้าต่าง Safari
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#EADBCE] dark:border-[#38332E]">
                      <div className="w-7 h-7 rounded-full bg-[#C25E40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div className="text-xs text-[#2D2926] dark:text-[#FAF7F2]">
                        <p className="font-bold flex items-center gap-1.5">
                          เลือก "เพิ่มไปยังหน้าจอโฮม" <PlusSquare className="w-3.5 h-3.5 text-[#C25E40]" />
                        </p>
                        <p className="text-[#78716A] dark:text-[#A8A199] mt-0.5">
                          (Add to Home Screen) ในเมนูที่เลื่อนขึ้นมา
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#EADBCE] dark:border-[#38332E]">
                      <div className="w-7 h-7 rounded-full bg-[#C25E40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        3
                      </div>
                      <div className="text-xs text-[#2D2926] dark:text-[#FAF7F2]">
                        <p className="font-bold">
                          กดปุ่ม "เพิ่ม" (Add) ที่มุมขวาบน
                        </p>
                        <p className="text-[#78716A] dark:text-[#A8A199] mt-0.5">
                          จะได้ไอคอน <strong>HomeyX</strong> บนหน้าจอมือถือของคุณทันที
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <div className="text-xs text-emerald-900 dark:text-emerald-200">
                        <p className="font-bold">
                          เปิดใช้งานจากไอคอน HomeyX บนหน้าจอ
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">
                          แอพจะแสดงผลแบบ <strong>เต็มหน้าจอ 100% ไม่มีกรอบเบราว์เซอร์</strong> สวยงาม รวดเร็ว และประหยัดแบตเตอรี่
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Android & Other Browsers */
                <div className="space-y-3.5">
                  <div className="p-3 rounded-2xl bg-[#FDF4F0] dark:bg-[#2A201A] border border-[#F5D8CE] dark:border-[#4D2E25]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#C25E40] mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>สำหรับ Android &amp; Chrome</span>
                    </div>
                    <p className="text-xs text-[#544E48] dark:text-[#C5BFB8]">
                      คุณสามารถติดตั้งแอพลงหน้าจอโฮม หรือเปิดโหมดเต็มจอได้ใน 1 คลิก
                    </p>
                  </div>

                  {/* 1-Click Install Button if supported */}
                  {deferredPrompt && (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="w-full py-3 px-4 rounded-xl bg-[#C25E40] hover:bg-[#D96E4C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>ติดตั้งแอพ HomeyX ลงหน้าจอมือถือทันที</span>
                    </button>
                  )}

                  {/* 1-Click Fullscreen Button */}
                  <button
                    type="button"
                    onClick={triggerFullscreen}
                    className="w-full py-3 px-4 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] hover:bg-[#F2ECE1] border border-[#D5C7B8] dark:border-[#403831] text-[#2D2926] dark:text-[#FAF7F2] font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                  >
                    <Maximize2 className="w-4 h-4 text-[#C25E40]" />
                    <span>
                      {isFullscreenActive ? "ออกจากโหมดเต็มจอ" : "ซ่อนแถบเบราว์เซอร์ทันที (Fullscreen Mode)"}
                    </span>
                  </button>

                  <div className="pt-2 border-t border-[#EADBCE] dark:border-[#38332E]">
                    <p className="text-[11px] font-semibold text-[#78716A] dark:text-[#A8A199] mb-2">
                      หรือทำตามขั้นตอนใน Chrome:
                    </p>
                    <ol className="text-xs text-[#544E48] dark:text-[#C5BFB8] space-y-1.5 list-decimal pl-4">
                      <li>แตะจุดสามจุด <strong>⋮</strong> ที่มุมขวาบนของเบราว์เซอร์</li>
                      <li>เลือก <strong>"ติดตั้งแอป" (Install app)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong></li>
                      <li>เปิดใช้งานผ่านไอคอน HomeyX บนหน้าจอมือถือเพื่อความเต็มจอ 100%</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF7F2] dark:bg-[#171513] border-t border-[#EADBCE] dark:border-[#332E2A] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D2926] dark:bg-[#FAF7F2] text-white dark:text-[#2D2926] text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
