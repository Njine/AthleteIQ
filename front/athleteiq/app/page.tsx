"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Award,
  TrendingUp,
  Database,
  Zap,
  Lock,
  ChevronRight,
  BarChart2,
  Trophy,
  Clock,
  Heart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import { motion } from "framer-motion";
import BlurText from "@/components/ui/BlurText";
import TiltedCard from "@/components/ui/Titles";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const heroImageAnimation = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.2
      }
    }
  };

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startText = useMemo(() => ["OWN  YOUR", "TRAINING.", "OWN  YOUR", "FUTURE."], []);
  if (!mounted) return null;



  return (
    <div
      className="w-full overflow-x-hidden"
      style={{
        backgroundImage: "url('/bg2.png')",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <main className="flex-1">
        <div
          className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat font-dmsans relative"
          style={{
            backgroundImage: "url('/bg1.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        >
          <Header className={`transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-transparent'}`} />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="w-full max-w-[800px] mx-auto px-6 md:ml-40 py-12 mt-24 font-poppins flex flex-col gap-8 z-10"
            style={{
              backgroundImage: "url('/Basketball.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <BlurText
              key="start"
              text={startText}
              delay={150}
              animateBy="words"
              direction="top"
              className="text-8xl font-bold gradient-text"
            />
            <motion.p
              className="text-3xl font-bold gradient-text"
              variants={fadeIn}
              transition={{ delay: 3 }}
            >
              AI-Powered. Blockchain-Secured.
            </motion.p>
          </motion.div>

          <section className="w-full py-12 md:py-28 lg:py-48 relative z-10">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
                <motion.div
                  className="flex flex-col justify-center space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeIn}
                >
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Own Your Training Data with Blockchain & AI
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl">
                    A privacy-focused AI coaching app for athletes based on web3
                    tech with wide integration with existing ecosystems and
                    smart watches for maximum compatibility.
                  </p>
                  <motion.div
                    className="flex flex-col gap-2 min-[400px]:flex-row"
                    variants={staggerChildren}
                  >
                    <motion.div variants={fadeIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="gap-1 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0 glow" style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                        Get Started <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                    <motion.div variants={fadeIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="outline" className="border-pink-500/50 text-white hover:bg-pink-500/10">
                        Learn More
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
                <motion.div
                  className="relative flex items-center justify-center"
                  variants={heroImageAnimation}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <TiltedCard
                    imageSrc="/sc11.png"
                    containerHeight="400px"
                    containerWidth="400px"
                    imageHeight="450px"
                    imageWidth="700px"
                    scaleOnHover={1.1}
                    showMobileWarning={false}
                    showTooltip={false}
                    displayOverlayContent={false}
                    effectStyle="neon"
                    shadowColor="rgba(168, 85, 247, 0.2)"
                    rotateAmplitude={18}
                    glowIntensity={1.5}
                    imageFilter={
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay"></div>
                    }
                  />
                  <motion.div
                    className="absolute -bottom-6 left-6 right-6 rounded-lg bg-black/40 backdrop-blur-xl p-4 shadow-lg md:bottom-8 md:left-8 md:right-8 md:p-6 border border-purple-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-300">Today's Training</p>
                        <p className="text-xl font-bold text-white">5K Run + Strength</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <motion.div
                          className="flex flex-col items-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Heart className="h-5 w-5 text-pink-500" />
                          <span className="text-xs font-medium text-gray-300">75 BPM</span>
                        </motion.div>
                        <motion.div
                          className="flex flex-col items-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span className="text-xs font-medium text-gray-300">45 min</span>
                        </motion.div>
                        <motion.div
                          className="flex flex-col items-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="text-xs font-medium text-gray-300">+12%</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        </div>

        <section id="features" className="w-full py-4 md:py-6 lg:py-12 relative">
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                  Train Smarter, Compete Harder
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines the power of blockchain technology and
                  artificial intelligence to revolutionize how athletes train,
                  compete, and own their data.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-16"
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {[
                {
                  icon: <Award className="h-6 w-6 text-pink-400" />,
                  title: "Get Sponsorships",
                  description: "Upload your metrics and our AI model will predict your performance in upcoming races, helping you get recognized and earn sponsorships."
                },
                {
                  icon: <Shield className="h-6 w-6 text-pink-400" />,
                  title: "Athlete-Centric Training",
                  description: "Create decentralized athlete profiles to track progress securely and store performance metrics, training history, and personal bests—forever."
                },
                {
                  icon: <BarChart2 className="h-6 w-6 text-pink-400" />,
                  title: "AI-Powered Analytics",
                  description: "Get real-time insights and feedback from AI/ML models analyzing your running times, heart rate, and endurance while keeping data private using zkML."
                },
                {
                  icon: <Trophy className="h-6 w-6 text-pink-400" />,
                  title: "Immutable Competition Tracking",
                  description: "Record lap times, scores, and event results immutably on the blockchain with IoT & GPS integrations for seamless, real-time updates."
                },
                {
                  icon: <Zap className="h-6 w-6 text-pink-400" />,
                  title: "Tokenized Rewards",
                  description: "Earn AthleteIQ tokens for completing training goals & competitions, unlock exclusive NFT achievements, and climb global leaderboards."
                },
                {
                  icon: <Lock className="h-6 w-6 text-pink-400" />,
                  title: "Privacy-First Data Sharing",
                  description: "Share training data securely with coaches, scouts, and sponsors using ZK-Proofs. You control who sees what—your data, your rules."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-start gap-2"
                  variants={fadeIn}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <div className="rounded-lg bg-pink-500/20 p-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-4 md:py-6 lg:py-12 "
        >
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                  Your Journey to Better Performance
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform seamlessly integrates with your existing devices
                  and training routines to provide AI-powered insights while
                  keeping your data secure.
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2">
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >

                <TiltedCard
                  imageSrc="/t5.jpg"
                  containerHeight="400px"
                  containerWidth="400px"
                  imageHeight="400px"
                  imageWidth="500px"
                  scaleOnHover={1.1}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={false}
                  effectStyle="neon"
                  shadowColor="rgba(255,0,128,0.4)"
                  rotateAmplitude={18}
                  glowIntensity={1.5}
                  imageFilter={
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay"></div>
                  }
                />
              </motion.div>
              <motion.div
                className="flex flex-col justify-center space-y-4"
                variants={staggerChildren}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <ul className="grid gap-6">
                  {[
                    {
                      step: 1,
                      title: "Connect Your Devices",
                      description: "Sync your smartwatch, fitness trackers, and other IoT devices to automatically collect training data."
                    },
                    {
                      step: 2,
                      title: "Secure Your Data",
                      description: "Your performance metrics are encrypted and stored on the blockchain, giving you complete ownership and control."
                    },
                    {
                      step: 3,
                      title: "Receive AI Insights",
                      description: "Our AI analyzes your data to provide personalized training recommendations and performance predictions."
                    },
                    {
                      step: 4,
                      title: "Earn Rewards",
                      description: "Complete challenges, hit milestones, and earn AthleteIQ tokens and NFT achievements as you improve."
                    }
                  ].map((step, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-4"
                      variants={fadeIn}
                      whileHover={{ x: 10, transition: { duration: 0.2 } }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-[7px] text-white bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white" style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                        {step.step}
                      </div>
                      <div className="grid gap-1">
                        <h3 className="text-xl font-bold text-white">{step.title}</h3>
                        <p className="text-gray-300">
                          {step.description}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-4 md:py-6 lg:py-12 relative">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-10 px-4 md:px-10 md:gap-16 lg:grid-cols-2">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400">
                  Why Now?
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                  The Future of Athletic Training is Here
                </h2>
                <p className="text-gray-300 md:text-xl">
                  Traditional training apps centralize data, lack privacy, and
                  offer little incentive for improvement. With the rise of Web3,
                  AI, and zk-technology, athletes can now:
                </p>
                <motion.ul
                  className="space-y-2"
                  variants={staggerChildren}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    "Own their data",
                    "Monetize their progress",
                    "Train smarter, compete harder"
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center gap-2"
                      variants={fadeIn}
                      whileHover={{ x: 10 }}
                    >
                      <div className="rounded-full bg-green-500/20 p-1">
                        <svg
                          className="h-4 w-4 text-green-500"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <span className="font-medium text-white">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="mt-4 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0 glow" style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                    Join the Revolution
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
              >


                <TiltedCard
                  imageSrc="/t6.png"
                  containerHeight="400px"
                  containerWidth="400px"
                  imageHeight="400px"
                  imageWidth="500px"
                  scaleOnHover={1.1}
                  showMobileWarning={false}
                  showTooltip={false}
                  displayOverlayContent={false}
                  effectStyle="neon"
                  shadowColor="rgba(0,252,237,0.4)"
                  rotateAmplitude={18}
                  glowIntensity={1.5}
                  imageFilter={
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay"></div>
                  }
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section id="tech" className="w-full py-4 md:py-6 lg:py-12 relative">
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center"
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
            >
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400">
                  Technology
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                  Cutting-Edge Technology
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform leverages advanced technologies to provide
                  secure, private, and powerful athletic coaching.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: <Database className="h-6 w-6 text-pink-400" />,
                  title: "Blockchain",
                  description: "Immutable storage of your training data and achievements, ensuring complete ownership and transparency."
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-pink-400" />,
                  title: "zkML",
                  description: "Zero-Knowledge Machine Learning allows AI models to analyze your data while maintaining complete privacy."
                },
                {
                  icon: <Lock className="h-6 w-6 text-pink-400" />,
                  title: "GKR Protocol",
                  description: "An advanced argument system for proving circuit satisfiability with no trusted setup and efficient proving time."
                },
                {
                  icon: <Zap className="h-6 w-6 text-pink-400" />,
                  title: "Expander",
                  description: "A highly optimized GKR implementation that powers our secure and private AI computations."
                }
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  className="rounded-lg border border-purple-500/20 bg-black/40 backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10"
                  variants={fadeIn}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.2), 0 8px 10px -6px rgba(147, 51, 234, 0.2)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex flex-col items-start gap-2">
                    <div className="rounded-lg bg-pink-500/20 p-2">
                      {tech.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{tech.title}</h3>
                    <p className="text-gray-300">
                      {tech.description}
                    </p>
                  </div>
                </motion.div>
              ))}
              <motion.div
                className="rounded-lg border border-purple-500/20 bg-black/40 backdrop-blur-sm p-6 shadow-lg shadow-purple-500/10 md:col-span-2 lg:col-span-2"
                variants={fadeIn}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.2), 0 8px 10px -6px rgba(147, 51, 234, 0.2)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-pink-500/20 p-2">
                    <Activity className="h-6 w-6 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Seamless Integration</h3>
                  <p className="text-gray-300">
                    Our platform integrates with popular fitness devices and
                    apps, making it easy to incorporate into your existing
                    training routine. Connect your smartwatch, heart rate
                    monitor, or GPS tracker to automatically sync your workout
                    data.
                  </p>
                  <motion.div
                    className="flex flex-wrap gap-2"
                    variants={staggerChildren}
                  >
                    {["Garmin", "Apple Watch", "Fitbit", "Strava", "Polar", "Suunto"].map((device, index) => (
                      <motion.div
                        key={index}
                        className="rounded-full bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0 px-3 py-1 text-sm text-white"
                        style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
                        variants={fadeIn}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {device}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-4 md:py-6 lg:py-12 text-white">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Training?
              </h2>
              <p className="mx-auto max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of athletes who are taking control of their data
                and optimizing their performance with ItenAI.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <form className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your email"
                  type="email"
                />
                <motion.div variants={fadeIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-1 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0 glow" style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                    Get Early Access <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </form>
              <p className="text-xs text-primary-foreground/60">
                By signing up, you agree to our{" "}
                <Link href="#" className="underline underline-offset-2">
                  Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t bg-background py-6 md:py-12">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={45}
              height={40}
              className="h-8 w-8 text-primary"
            />
            <span>AthleteIQ</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-xs hover:underline underline-offset-4"
            >
              Contact
            </Link>
          </nav>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AthleteIQ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
