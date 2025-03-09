"use client"

import { RegistrationForm } from "@/components/registration/registration-form"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Bluetooth, Watch, Zap, ChevronRight, Shield } from "lucide-react"
import { useState } from "react"
import { useRouter } from 'next/navigation';


export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const handleConnectFitbit = () => {
    setIsConnecting(true)
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false)
    }, 3000)
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 overflow-hidden"
      style={{
        backgroundImage: "url('/bg2.png')",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      {/* Hero section */}
      <motion.div initial="hidden" animate="visible" variants={staggerChildren} className="text-center mb-12">
        <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-bold tracking-tighter gradient-text mb-4">
          Athlete Registration
        </motion.h1>

        <motion.p variants={fadeIn} className="text-xl text-gray-300 max-w-2xl">
          Climb the leaderboards, Find Sponsorships, Earn NFTs!
        </motion.p>
      </motion.div>

      {/* Main content with two columns */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-stretch gap-8">
        {/* Left column - Fitbit import */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/3 rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10"
        >
          <div className="h-full flex flex-col">
            <div className="mb-6">
              <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400 mb-4">
                QUICK SETUP
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Import Your Data</h2>
              <p className="text-gray-300 mb-6">
                Connect your Fitbit watch via Bluetooth to automatically import your athletic data and create your
                profile instantly.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 border border-dashed border-purple-500/30 rounded-lg mb-6">
              <Watch className="h-16 w-16 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Fitbit Connection</h3>
              <p className="text-gray-400 mb-6">
                Sync your performance metrics, training history, and biometric data directly from your device.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleConnectFitbit}
                disabled={isConnecting}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white flex items-center justify-center gap-2 disabled:opacity-70"
                style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-4 w-4" />
                    Connect Fitbit
                  </>
                )}
              </motion.button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">Instant profile creation with verified athletic data</p>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-pink-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">Secure, encrypted data transfer with zero-knowledge proofs</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vertical divider for desktop */}
        <div className="hidden lg:flex flex-col items-center justify-center">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
          <div className="my-4 rounded-full bg-pink-500/20 p-2">
            <ChevronRight className="h-5 w-5 text-pink-400" />
          </div>
          <div className="h-full w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent"></div>
        </div>

        {/* Horizontal divider for mobile */}
        <div className="flex lg:hidden w-full items-center justify-center">
          <div className="w-1/3 h-px bg-gradient-to-r from-transparent to-purple-500/30"></div>
          <div className="mx-4 rounded-full bg-pink-500/20 p-2">
            <ChevronRight className="h-5 w-5 text-pink-400" />
          </div>
          <div className="w-1/3 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
        </div>

        {/* Right column - Registration form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-2/3"
        >
          <RegistrationForm />
          <Button
            className="mt-4 w-full w-full max-w-2xl flex items-center gap-2 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0"
            style={{ backgroundImage: "linear-gradient(220deg,rgba(241, 3, 158, 0.39) -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
            onClick={() => router.push('/leaderboard')}
          >
            Skip <ChevronRight className="h-4 w-4" />
          </Button>

        </motion.div>
      </div>
    </main>
  )
}

