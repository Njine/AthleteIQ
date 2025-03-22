"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useKeylessAccounts } from "@/lib/useKeylessAccounts"
import { motion } from "framer-motion"
import styles from "./callback.module.css"
import { ethers } from "ethers"
import { provider, NEXT_PUBLIC_CONTRACT_ADDRESS, NEXT_PUBLIC_GAS_WALLET } from "@/lib/constants"
import confetti from "canvas-confetti"

// Contract ABI - just the function we need
const CONTRACT_ABI = [
  "function verifyLogin(uint256 timestamp, string calldata proofHash, address userAddress, bytes calldata signature) public returns (bool)"
]

export default function CallbackPage() {
  const isLoading = useRef(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  const switchKeylessAccount = useKeylessAccounts((state) => state.switchKeylessAccount)
  const activeAccount = useKeylessAccounts((state) => state.activeAccount)
  const disconnectKeylessAccount = useKeylessAccounts((state) => state.disconnectKeylessAccount)
  const router = useRouter()

  // Loading steps with messages and durations
  const loadingSteps = [
    { message: "Generating zkProof...", duration: 3000 },
    { message: "Sending zkProof to verifier...", duration: 3000 },
    { message: "Waiting for blockchain confirmation...", duration: 5000 },
    { message: "Verification successful!", duration: 2000 },
  ]

  useEffect(() => {
    // Update progress when loading step changes
    if (loadingStep > 0) {
      setProgress(Math.max(loadingStep * 25, progress))
    }
  }, [loadingStep])

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

    // First stage - handle account creation and proof generation
    const handleLogin = async () => {
      try {
        // Step 1: Generate zkProof by switching account
        setLoadingStep(0)
        await new Promise((resolve) => setTimeout(resolve, loadingSteps[0].duration))

        const account = await switchKeylessAccount(idToken)
        console.log("Account data:", account)
        if (!account || !account.proof_hash || !account.signature || !account.timestamp) {
          throw new Error("Failed to generate proof or signature")
        }
        
        // Step 2: Connect to blockchain
        setLoadingStep(1)
        await new Promise((resolve) => setTimeout(resolve, loadingSteps[1].duration))

        console.log("Send transaction to contract")
        console.log("Loaded rpc")
        await provider.getBlockNumber().catch((err) => {
          throw new Error(`RPC connection failed: ${err.message}`)
        })
        const signer = new ethers.Wallet(NEXT_PUBLIC_GAS_WALLET, provider)
        // const signer = await provider.getSigner(account.address)
        console.log("Loaded signer")
        const contract = new ethers.Contract(NEXT_PUBLIC_CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        
        // Step 3: Send verification to smart contract
        setLoadingStep(2)
        
        // Convert signature from hex string to bytes if needed
        console.log("Sending.....")
        const timestamp = String(account.timestamp)
        const signature = String(account.signature)
        const prf = String(account.proof_hash)
        const add = String(account.address)

        console.log("Timestamp:", timestamp, typeof timestamp)
        console.log("Proof Hash:", prf, typeof prf)
        console.log("Address:", add, typeof add)
        console.log("Signature Bytes:", signature, typeof signature)
        // Call the smart contract to verify the signature
        const tx = await contract.verifyLogin(timestamp, prf, add, signature)
        console.log("Sent.....")
        setTxHash(tx.hash)

        // Display transaction hash
        console.log("Transaction hash:", tx.hash)
        const txHash = tx.hash

        // Wait for the transaction to be mined
        const receipt = await tx.wait()
        console.log("recipt:  ", receipt)

        // Check if verification was successful by looking for the event
        const verified = receipt.logs.some((log) => {
          try {
            console.log("log: ", log.data)
            const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["bool", "uint256"], log.data)
            console.log(decoded)
            return decoded[0]
          } catch (e) {
            return false
          }
        })

        if (!verified) {
          disconnectKeylessAccount()
          router.push("/login")
          throw new Error("Blockchain verification failed")
        }
        
        // Step 4: Complete the process
        await new Promise((resolve) => setTimeout(resolve, loadingSteps[2].duration - 2000)) // Adjust for tx wait time
        setLoadingStep(3)

        // Trigger confetti on success
        if (typeof window !== "undefined") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }

        // Start countdown before redirect
        let countdown = 3
        setRedirectCountdown(countdown)
        const countdownInterval = setInterval(() => {
          countdown -= 1
          setRedirectCountdown(countdown)
          if (countdown <= 0) {
            clearInterval(countdownInterval)
            router.push("/home")
          }
        }, 1000)
      } catch (error) {
        disconnectKeylessAccount()
        console.error("Authentication error:", error)
        setError(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`)
        // Optionally redirect to login after a delay
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    // Simpler progress bar animation that works reliably
    const startTime = Date.now()
    const totalDuration = loadingSteps.reduce((acc, step) => acc + step.duration, 0)

    const progressInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime
      const calculatedProgress = Math.min(Math.floor((elapsedTime / totalDuration) * 100), 99)

      // Force progress to match loading step if it's behind
      const minimumProgress = loadingStep * 25
      const newProgress = Math.max(calculatedProgress, minimumProgress)

      // Set to 100% when we reach the final step
      if (loadingStep === loadingSteps.length - 1) {
        setProgress(100)
      } else if (!error) {
        setProgress(newProgress)
      }

      // Clear interval when done
      if (newProgress >= 100 || error) {
        clearInterval(progressInterval)
      }
    }, 50)

    handleLogin()

    return () => {
      clearInterval(progressInterval)
    }
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
            <div className={styles.terminalTitle}>ZK LOGIN VERIFICATION</div>
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
                  {index === loadingStep && !error && <span className={styles.consoleCursor}></span>}
                  {index < loadingStep && <span className={styles.consoleSuccess}>✓</span>}
                </motion.div>
              ))}
              
              {error && (
                <motion.div
                  className={`${styles.consoleLine} ${styles.consoleError}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className={styles.consolePrompt}>&gt;</span>
                  <span className={styles.consoleText}>{error}</span>
                  <span className={styles.consoleFailure}>✗</span>
                </motion.div>
              )}

              {loadingStep === 2 && activeAccount && (
                <motion.div
                  className={`${styles.consoleLine} ${styles.consoleDetails}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1 }}
                >
                  <pre className={styles.codeBlock}>
                    {`Address: ${activeAccount.address?.substring(0, 10)}...
ProofHash: ${activeAccount.proof_hash?.substring(0, 15)}...
Timestamp: ${activeAccount.timestamp}`}
                  </pre>
                </motion.div>
              )}

              {txHash && (
                <motion.div
                  className={`${styles.consoleLine} ${styles.consoleDetails}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                >
                  <div className={styles.txHashContainer}>
                    <span className={styles.txHashLabel}>TX Hash: </span>
                    <span className={styles.txHashValue}>{`${txHash.substring(0, 18)}...`}</span>
                    <button
                      className={styles.txHashButton}
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${txHash}`, "_blank")}
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className={styles.progressContainer}>
              <div
                className={`${styles.progressBar} ${error ? styles.progressError : ""} ${loadingStep === 2 ? styles.progressPulse : ""}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className={styles.statusText}>
              {error
                ? "Authentication failed. Redirecting..."
                : loadingStep < loadingSteps.length - 1
                  ? `Verifying... ${progress}%`
                  : loadingStep === loadingSteps.length - 1
                    ? `Success! Redirecting in ${redirectCountdown}...`
                    : "Loading Blockchain Data..."}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}