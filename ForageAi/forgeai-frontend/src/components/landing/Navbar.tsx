"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react"
import { authStorage } from "@/lib/auth"
import { authApi } from "@/lib/api"

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isAuth, setIsAuth] = useState(false)
  const { scrollY } = useScroll()
  const isScrolled = useTransform(scrollY, [0, 50], [0, 1])

  useEffect(() => {
    setIsAuth(authStorage.isAuthenticated())
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (e) {
      console.error(e)
    } finally {
      authStorage.clearAuth()
      setIsAuth(false)
      setIsOpen(false)
      router.refresh()
    }
  }

  return (
    <motion.header
      style={{
        backgroundColor: useTransform(isScrolled, [0, 1], ["rgba(17, 17, 22, 0)", "rgba(17, 17, 22, 0.9)"]),
        backdropFilter: useTransform(isScrolled, [0, 1], ["blur(0px)", "blur(12px)"]),
        borderBottom: useTransform(isScrolled, [0, 1], ["1px solid rgba(255, 255, 255, 0)", "1px solid rgba(255, 255, 255, 0.05)"])
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
            <span className="sr-only">ForgeAI</span>
            <div className="h-6 w-6 relative text-indigo-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ForgeAI</span>
          </Link>
        </div>
        
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
        
        <div className="hidden lg:flex lg:gap-x-10 text-sm font-medium">
          <Link href="#platform" className="text-gray-300 hover:text-white transition-colors">Platform</Link>
          <Link href="#solutions" className="text-gray-300 hover:text-white transition-colors">Solutions</Link>
          <Link href="#developers" className="text-gray-300 hover:text-white transition-colors">Developers</Link>
          <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="#changelog" className="text-gray-300 hover:text-white transition-colors">Changelog</Link>
        </div>
        
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
          {isAuth ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[#1a1d26] hover:bg-[#252a38] px-3.5 py-2 rounded-lg border border-[#2d3248] transition-colors">
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600 px-3.5 py-2 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium leading-6 text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/signup">
                <Button variant="default" size="sm" className="rounded-md bg-[#5a55e2] hover:bg-[#4a45d2] text-white border-0 shadow-none px-4 h-9 cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
      
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#111116] border-b border-white/10 p-6 shadow-xl">
          <div className="space-y-4">
            <Link href="#platform" className="block text-base font-medium text-gray-300" onClick={() => setIsOpen(false)}>Platform</Link>
            <Link href="#solutions" className="block text-base font-medium text-gray-300" onClick={() => setIsOpen(false)}>Solutions</Link>
            <Link href="#developers" className="block text-base font-medium text-gray-300" onClick={() => setIsOpen(false)}>Developers</Link>
            <Link href="#pricing" className="block text-base font-medium text-gray-300" onClick={() => setIsOpen(false)}>Pricing</Link>
            <Link href="#changelog" className="block text-base font-medium text-gray-300" onClick={() => setIsOpen(false)}>Changelog</Link>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {isAuth ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-base font-medium text-white" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard className="w-4 h-4 text-purple-400" />
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-base font-medium text-rose-400 text-left">
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-base font-medium text-gray-300" onClick={() => setIsOpen(false)}>Sign in</Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button variant="default" className="w-full justify-center bg-[#5a55e2]">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.header>
  )
}

