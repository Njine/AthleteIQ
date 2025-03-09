"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useKeylessAccounts } from "@/lib/useKeylessAccounts"
import { motion } from "framer-motion"
import styles from "./callback.module.css"

export default function CallbackPage() {
  const isLoading = useRef(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const switchKeylessAccount = useKeylessAccounts((state) => state.switchKeylessAccount)
  const router = useRouter()

  // Loading steps with messages and durations
  const loadingSteps = [
    { message: "Generating zkProof...", duration: 3000 },
    { message: "Sending zkProof to verifier...", duration: 3000 },
    { message: "Waiting for verification...", duration: 2000 },
    { message: "Authentication successful!", duration: 2000 },
  ]

  useEffect(() => {
    // This is a workaround to prevent firing twice due to strict mode
    if (isLoading.current) return
    isLoading.current = true

    // Function to extract the id_token from URL fragment
    const getIdTokenFromHash = () => {
      if (typeof window === "undefined") return null

      const fragmentParams = new URLSearchParams(window.location.hash.substring(1))
      return fragmentParams.get("id_token")
    }

    const idToken = getIdTokenFromHash()
    if (!idToken) {
      router.push("/login")
      return
    }

    // Start the loading animation sequence
    const currentStep = 0
    let totalDuration = 0

    // Calculate total duration
    const totalTime = loadingSteps.reduce((acc, step) => acc + step.duration, 0)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, totalTime / 100)

    // Step through each loading message
    loadingSteps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingStep(index)
      }, totalDuration)
      totalDuration += step.duration
    })

    // After all animations, derive the account and redirect
    setTimeout(async () => {
      try {
        await switchKeylessAccount(idToken)
        router.push("/home")
      } catch (error) {
        console.error("Error switching account:", error)
        router.push("/login")
      }
    }, totalDuration)
  }, [router, switchKeylessAccount, loadingSteps])

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.loadingCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.cardContent}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalControls}>
              <span className={styles.terminalControl}></span>
              <span className={styles.terminalControl}></span>
              <span className={styles.terminalControl}></span>
            </div>
            <div className={styles.terminalTitle}>SECURE AUTHENTICATION PROTOCOL</div>
          </div>

          <div className={styles.terminalBody}>
            <div className={styles.consoleOutput}>
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className={`${styles.consoleLine} ${index <= loadingStep ? styles.visible : styles.hidden}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: index <= loadingStep ? 1 : 0,
                    x: index <= loadingStep ? 0 : -20,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={styles.consolePrompt}>&gt;</span>
                  <span className={styles.consoleText}>{step.message}</span>
                  {index === loadingStep && <span className={styles.consoleCursor}></span>}
                  {index < loadingStep && <span className={styles.consoleSuccess}>✓</span>}
                </motion.div>
              ))}
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
            </div>

            <div className={styles.statusText}>
              {loadingStep < loadingSteps.length - 1 ? `Processing... ${progress}%` : "Loading Blockchain Data..."}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

