"use client"

import type React from "react"
import { motion } from "framer-motion"
import styles from "./login.module.css"
import { ChevronRight } from "lucide-react"
import { FaGoogle } from "react-icons/fa";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useEphemeralKeyPair from '../../lib/useEphemeralKeyPair';
import { GOOGLE_CLIENT_ID, REDIRECT_URI } from '../../lib/constants';
import { useKeylessAccounts } from '../../lib/useKeylessAccounts';


const LoginPage = () => {
  const router = useRouter();
  const ephemeralKeyPair = useEphemeralKeyPair();
  const { activeAccount } = useKeylessAccounts();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (activeAccount) {
      router.push('/home');
      return;
    }

    // Build the Google OAuth URL
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const searchParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: ephemeralKeyPair.nonce,
    });
    url.search = searchParams.toString();
    console.log(url);
    setRedirectUrl(url.toString());
  }, [ephemeralKeyPair, router, activeAccount]);

  // Generate grid spans
  const gridSpans = Array(225)
    .fill(0)
    .map((_, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: i * 0.01 }}
        className={styles.gridSpan}
      />
    ))

  return (
    <section className={styles.loginSection}>
      <div className={styles.gridContainer}>{gridSpans}</div>
      <motion.div
        className={styles.signin}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.content}>
          <h2 className={styles.title}>
            Login <span className={styles.highlight}>AthleteIQ</span>
          </h2>
          <div className={styles.biometricText}>
            <p>Using Keyless Login</p>
          </div>
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = redirectUrl)}
              
            >
            <FaGoogle className={styles.googleIcon} />
              <span>Sign in with Google</span>
              <ChevronRight className={styles.buttonIcon} />
            </motion.button>
        </div>
      </motion.div>
    </section>
  )
}

export default LoginPage