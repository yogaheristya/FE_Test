"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { FiSettings } from "react-icons/fi";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "bg-gray-950/50 text-white"
      : "text-gray-300 hover:bg-white/5 hover:text-white";

  return (
    <nav className="relative bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo & Menu */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img src="/jm.png" alt="Your Company" className="h-8 w-auto" />
            </div>

            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(
                    "/dashboard"
                  )}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/master-data"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${isActive(
                    "/master-data"
                  )}`}
                >
                  Master Data
                </Link>
              </div>
            </div>
          </div>

          {/* Settings & Profile */}
          <div className="flex items-center gap-4">
            {/* Settings */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full 
                        text-gray-400 hover:text-white hover:bg-white/5
                        cursor-pointer"
              title="Settings"
            >
              <FiSettings className="h-5 w-5" />
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full
                          hover:bg-white/5 cursor-pointer"
              >
                <img
                  src="/pp.jpg"
                  alt="User"
                  className="h-8 w-8 rounded-full"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 py-1 shadow-lg z-[1200]">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    Your profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
