"use client";

import { useState, useEffect } from "react";
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

export default function LandingPage() {
  // const [isScrolled, setIsScrolled] = useState(false);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setIsScrolled(window.scrollY > 50); // Trigger blur after 50px scroll
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);
  return (
    <div className="w-full overflow-x-hidden">
      <div
        className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat bg-fixed text font-dmsans"
        style={{ backgroundImage: "url('/bg1.png')", backgroundSize: "cover", backgroundPosition: "top" }}
      >
        <Header />
        <div className="w-[600px] ml-40 mt-24 font-poppins flex flex-col gap-8"
        style={{backgroundImage: "url('/Basketball.png')", backgroundSize: "cover", backgroundPosition: "center"}}>
        <p className="text-8xl font-bold gradient-text">OWN YOUR TRAINING. OWN YOUR FUTURE.</p>
          <p className="text-3xl font-bold gradient-text">AI-Powered. Blockchain-Secured.</p>
        </div>
      </div>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Revolutionizing Athletic Coaching
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Own Your Training Data with Blockchain & AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  A privacy-focused AI coaching app for athletes based on web3
                  tech with wide integration with existing ecosystems and smart
                  watches for maximum compatibility.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="gap-1">
                    Get Started <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl md:h-[450px]">
                  <Image
                    src="/sc11.png"
                    alt="Athlete using the app"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 left-6 right-6 rounded-lg bg-black/40 backdrop-blur-xl p-4 shadow-lg md:bottom-8 md:left-8 md:right-8 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Today's Training</p>
                      <p className="text-xl font-bold">5K Run + Strength</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <Heart className="h-5 w-5 text-red-500" />
                        <span className="text-xs font-medium">75 BPM</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-medium">45 min</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="text-xs font-medium">+12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Train Smarter, Compete Harder
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines the power of blockchain technology and
                  artificial intelligence to revolutionize how athletes train,
                  compete, and own their data.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Get Sponsorships</h3>
                <p className="text-muted-foreground">
                  Upload your metrics and our AI model will predict your
                  performance in upcoming races, helping you get recognized and
                  earn sponsorships.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Athlete-Centric Training</h3>
                <p className="text-muted-foreground">
                  Create decentralized athlete profiles to track progress
                  securely and store performance metrics, training history, and
                  personal bests—forever.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Analytics</h3>
                <p className="text-muted-foreground">
                  Get real-time insights and feedback from AI/ML models
                  analyzing your running times, heart rate, and endurance while
                  keeping data private using zkML.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  Immutable Competition Tracking
                </h3>
                <p className="text-muted-foreground">
                  Record lap times, scores, and event results immutably on the
                  blockchain with IoT & GPS integrations for seamless, real-time
                  updates.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Tokenized Rewards</h3>
                <p className="text-muted-foreground">
                  Earn Iten tokens for completing training goals & competitions,
                  unlock exclusive NFT achievements, and climb global
                  leaderboards.
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  Privacy-First Data Sharing
                </h3>
                <p className="text-muted-foreground">
                  Share training data securely with coaches, scouts, and
                  sponsors using ZK-Proofs. You control who sees what—your data,
                  your rules.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Your Journey to Better Performance
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform seamlessly integrates with your existing devices
                  and training routines to provide AI-powered insights while
                  keeping your data secure.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2">
            <div className="relative flex items-center justify-center">
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
                  <Image
                    src="/t5.jpg"
                    alt="Athletes training with technology"
                    fill
                    className="object-cover object-[50%_20%]"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      1
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">
                        Connect Your Devices
                      </h3>
                      <p className="text-muted-foreground">
                        Sync your smartwatch, fitness trackers, and other IoT
                        devices to automatically collect training data.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      2
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Secure Your Data</h3>
                      <p className="text-muted-foreground">
                        Your performance metrics are encrypted and stored on the
                        blockchain, giving you complete ownership and control.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      3
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Receive AI Insights</h3>
                      <p className="text-muted-foreground">
                        Our AI analyzes your data to provide personalized
                        training recommendations and performance predictions.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      4
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Earn Rewards</h3>
                      <p className="text-muted-foreground">
                        Complete challenges, hit milestones, and earn Iten
                        tokens and NFT achievements as you improve.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Why Now?
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  The Future of Athletic Training is Here
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Traditional training apps centralize data, lack privacy, and
                  offer little incentive for improvement. With the rise of Web3,
                  AI, and zk-technology, athletes can now:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/10 p-1">
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
                    <span className="font-medium">Own their data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/10 p-1">
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
                    <span className="font-medium">Monetize their progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/10 p-1">
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
                    <span className="font-medium">
                      Train smarter, compete harder
                    </span>
                  </li>
                </ul>
                <Button size="lg" className="mt-4">
                  Join the Revolution
                </Button>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl">
                  <Image
                    src="/t6.png"
                    alt="Athletes training with technology"
                    fill
                    className="object-cover object-[50%_80%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tech" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Technology
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Cutting-Edge Technology
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform leverages advanced technologies to provide
                  secure, private, and powerful athletic coaching.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex flex-col items-start gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Blockchain</h3>
                  <p className="text-muted-foreground">
                    Immutable storage of your training data and achievements,
                    ensuring complete ownership and transparency.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex flex-col items-start gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">zkML</h3>
                  <p className="text-muted-foreground">
                    Zero-Knowledge Machine Learning allows AI models to analyze
                    your data while maintaining complete privacy.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex flex-col items-start gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">GKR Protocol</h3>
                  <p className="text-muted-foreground">
                    An advanced argument system for proving circuit
                    satisfiability with no trusted setup and efficient proving
                    time.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex flex-col items-start gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Expander</h3>
                  <p className="text-muted-foreground">
                    A highly optimized GKR implementation that powers our secure
                    and private AI computations.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm md:col-span-2 lg:col-span-2">
                <div className="flex flex-col items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Seamless Integration</h3>
                  <p className="text-muted-foreground">
                    Our platform integrates with popular fitness devices and
                    apps, making it easy to incorporate into your existing
                    training routine. Connect your smartwatch, heart rate
                    monitor, or GPS tracker to automatically sync your workout
                    data.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-full bg-muted px-3 py-1 text-sm">
                      Garmin
                    </div>
                    <div className="rounded-full bg-muted px-3 py-1 text-sm">
                      Apple Watch
                    </div>
                    <div className="rounded-full bg-muted px-3 py-1 text-sm">
                      Fitbit
                    </div>
                    <div className="rounded-full bg-muted px-3 py-1 text-sm">
                      Strava
                    </div>
                    <div className="rounded-full bg-muted px-3 py-1 text-sm">
                      Polar
                    </div>
                    <div className="rounded-full bg-muted px-3 py-1 text-sm">
                      Suunto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Ready to Transform Your Training?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
                <Button type="submit" variant="secondary" className="shrink-0">
                  Get Early Access
                </Button>
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
            <Image src="/logo.svg" alt="Logo" width={45} height={40} className="h-8 w-8 text-primary" />
            <span>AthleteIQ</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs hover:underline underline-offset-4">
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
