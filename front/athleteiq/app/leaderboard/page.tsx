"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Trophy,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  Zap,
  Heart,
  Award,
  TrendingUp,
  Shield,
} from "lucide-react"
import Header from "@/components/ui/header"
import styles from "./leaderboard.module.css"
import Avatar from "boring-avatars"

type Player = {
  id: string
  name: string
  rank: number
  score: number
  avatar: string
  verified: boolean
  specialty: string
  level: string
  stats: {
    wins: number
    topSpeed: string
    endurance: number
    strength: number
  }
  achievements: string[]
  sponsored: boolean
}

export default function LeaderboardPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // Fake player data
  const players: Player[] = [
    {
      id: "neo-runner-01",
      name: "Axel Velocity",
      rank: 1,
      score: 9875,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "Sprinter",
      level: "Elite",
      stats: {
        wins: 42,
        topSpeed: "28.5 mph",
        endurance: 92,
        strength: 85,
      },
      achievements: ["Olympic Gold", "World Record Holder", "Grand Slam Champion"],
      sponsored: true,
    },
    {
      id: "cyber-athlete-02",
      name: "Nova Pulse",
      rank: 2,
      score: 9650,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "Marathon",
      level: "Pro",
      stats: {
        wins: 38,
        topSpeed: "22.1 mph",
        endurance: 98,
        strength: 79,
      },
      achievements: ["Continental Champion", "Ironman Winner"],
      sponsored: true,
    },
    {
      id: "quantum-jumper-03",
      name: "Zephyr Dash",
      rank: 3,
      score: 9320,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "High Jump",
      level: "Elite",
      stats: {
        wins: 35,
        topSpeed: "24.3 mph",
        endurance: 88,
        strength: 90,
      },
      achievements: ["National Champion", "Diamond League Winner"],
      sponsored: true,
    },
    {
      id: "neon-striker-04",
      name: "Blaze Momentum",
      rank: 4,
      score: 9105,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "Basketball",
      level: "Pro",
      stats: {
        wins: 31,
        topSpeed: "26.7 mph",
        endurance: 85,
        strength: 92,
      },
      achievements: ["MVP", "Championship Winner"],
      sponsored: true,
    },
    {
      id: "flux-racer-05",
      name: "Echo Surge",
      rank: 5,
      score: 8950,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: false,
      specialty: "Triathlon",
      level: "Elite",
      stats: {
        wins: 29,
        topSpeed: "23.8 mph",
        endurance: 95,
        strength: 82,
      },
      achievements: ["Ironman Top 3", "Continental Silver"],
      sponsored: true,
    },
    {
      id: "volt-runner-06",
      name: "Cipher Bolt",
      rank: 6,
      score: 8790,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "Football",
      level: "Pro",
      stats: {
        wins: 27,
        topSpeed: "27.2 mph",
        endurance: 87,
        strength: 93,
      },
      achievements: ["League Champion", "Golden Boot"],
      sponsored: true,
    },
    {
      id: "pulse-athlete-07",
      name: "Vortex Stride",
      rank: 7,
      score: 8675,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: false,
      specialty: "Long Jump",
      level: "Elite",
      stats: {
        wins: 25,
        topSpeed: "25.1 mph",
        endurance: 84,
        strength: 89,
      },
      achievements: ["National Gold", "University Champion"],
      sponsored: false,
    },
    {
      id: "cyber-sprinter-08",
      name: "Phoenix Dash",
      rank: 8,
      score: 8520,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "Sprinter",
      level: "Pro",
      stats: {
        wins: 23,
        topSpeed: "27.9 mph",
        endurance: 83,
        strength: 86,
      },
      achievements: ["Regional Champion", "Rising Star Award"],
      sponsored: true,
    },
    {
      id: "neon-jumper-09",
      name: "Omega Leap",
      rank: 9,
      score: 8340,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: false,
      specialty: "High Jump",
      level: "Elite",
      stats: {
        wins: 21,
        topSpeed: "23.5 mph",
        endurance: 81,
        strength: 88,
      },
      achievements: ["University Gold", "Junior Champion"],
      sponsored: false,
    },
    {
      id: "quantum-athlete-10",
      name: "Zenith Velocity",
      rank: 10,
      score: 8210,
      avatar: "/placeholder.svg?height=100&width=100",
      verified: true,
      specialty: "Decathlon",
      level: "Pro",
      stats: {
        wins: 19,
        topSpeed: "25.8 mph",
        endurance: 90,
        strength: 91,
      },
      achievements: ["National Bronze", "Regional MVP"],
      sponsored: true,
    },
  ]

  // Filter and sort players
  const filteredPlayers = [...players]
    .filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "verified" && player.verified) ||
        (activeCategory === "sponsored" && player.sponsored) ||
        (activeCategory === "available" && !player.sponsored)
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      return sortOrder === "desc" ? b.score - a.score : a.score - b.score
    })

  // Categories
  const categories = [
    { id: "all", name: "All Athletes" },
    { id: "verified", name: "Verified" },
    { id: "sponsored", name: "Sponsored" },
    { id: "available", name: "Available for Sponsorship" },
  ]

  // Handle sponsorship
  const handleSponsor = (playerId: string) => {
    console.log(`Sponsoring player: ${playerId}`)
    // Implement sponsorship logic here
  }

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{
        backgroundImage: "url('/bg2.png')",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <Header
        className={`transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-lg" : "bg-transparent"}`}
      />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="w-full py-8 md:py-12 relative">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400 mb-4">
                ATHLETE RANKINGS
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter gradient-text mb-4">GLOBAL LEADERBOARD</h1>
              <p className="max-w-[800px] text-gray-300 md:text-xl">
                Track the top athletes, discover rising stars, and sponsor the next generation of champions.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-8 relative">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search athletes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-purple-500/30 bg-black/40 backdrop-blur-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      activeCategory === category.id
                        ? "bg-gradient-to-b from-[#F1039C] to-transparent text-white"
                        : "bg-black/40 border border-purple-500/30 text-gray-300 hover:text-white"
                    }`}
                    style={
                      activeCategory === category.id
                        ? { backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }
                        : {}
                    }
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="px-4 py-2 rounded-lg bg-black/40 border border-purple-500/30 text-gray-300 hover:text-white flex items-center gap-2 whitespace-nowrap"
              >
                <Filter className="h-4 w-4" />
                Sort {sortOrder === "desc" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>

            <div className="rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden shadow-lg shadow-purple-500/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Athlete
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Specialty
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/20">
                    {filteredPlayers.map((player, index) => (
                      <motion.tr
                        key={player.id}
                        className={`${styles.playerRow} relative`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onMouseEnter={(e) => {
                            setHoveredPlayer(player.id)
                            setMousePosition({ x: e.clientX, y: e.clientY })
                        }}
                        onMouseLeave={() => setHoveredPlayer(null)}
                        onMouseMove={(e) => {
                            if (hoveredPlayer === player.id) {
                              setMousePosition({ x: e.clientX, y: e.clientY })
                            }
                        }}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {player.rank <= 3 ? (
                              <Trophy
                                className={`h-5 w-5 mr-2 ${
                                  player.rank === 1
                                    ? "text-yellow-400"
                                    : player.rank === 2
                                      ? "text-gray-300"
                                      : "text-amber-600"
                                }`}
                              />
                            ) : (
                              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-gray-300 mr-2">
                                {player.rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-purple-500/30 mr-3 relative">
                            <Avatar
                                size={40}
                                name={player.name}
                                variant="bauhaus" // You can change this to "beam", "marble", "pixel", "sunset", or "ring"
                                colors={["#F1039C", "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B"]}
                              />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <div className="font-medium text-white">{player.name}</div>
                                {player.verified && (
                                  <div className="ml-2 flex items-center" title="Verified Athlete">
                                    <div className="h-2 w-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{player.level}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-white">{player.score.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">Performance Points</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-pink-500/20 text-pink-400">
                            {player.specialty}
                          </span>
                        </td>



                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          {player.sponsored ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              <Shield className="h-3 w-3 mr-1" />
                              Sponsored
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSponsor(player.id)}
                              className="px-3 py-1 rounded-lg bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white text-sm flex items-center"
                              style={{
                                backgroundImage:
                                  "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)",
                              }}
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Sponsor
                            </motion.button>
                          </span>
                          )}
                        </td>

                        {hoveredPlayer === player.id && (
                          <div
                          className={styles.playerDetails}
                          style={{
                            position: "fixed",
                            left: `${mousePosition.x -400}px`,
                            top: `${mousePosition.y - 100}px`,
                          }}
                        >
                            <div className="p-4 rounded-lg border border-purple-500/30 bg-black/90 backdrop-blur-md shadow-lg">
                              <h3 className="text-lg font-bold text-white mb-2">{player.name}</h3>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <h4 className="text-xs text-gray-400 uppercase mb-1">Stats</h4>
                                  <ul className="space-y-1">
                                    <li className="flex items-center text-sm text-gray-300">
                                      <Trophy className="h-3 w-3 text-yellow-400 mr-2" />
                                      {player.stats.wins} Wins
                                    </li>
                                    <li className="flex items-center text-sm text-gray-300">
                                      <Zap className="h-3 w-3 text-blue-400 mr-2" />
                                      {player.stats.topSpeed}
                                    </li>
                                    <li className="flex items-center text-sm text-gray-300">
                                      <Heart className="h-3 w-3 text-red-400 mr-2" />
                                      Endurance: {player.stats.endurance}/100
                                    </li>
                                    <li className="flex items-center text-sm text-gray-300">
                                      <TrendingUp className="h-3 w-3 text-green-400 mr-2" />
                                      Strength: {player.stats.strength}/100
                                    </li>
                                  </ul>
                                </div>

                                <div>
                                  <h4 className="text-xs text-gray-400 uppercase mb-1">Achievements</h4>
                                  <ul className="space-y-1">
                                    {player.achievements.map((achievement, i) => (
                                      <li key={i} className="flex items-start text-sm text-gray-300">
                                        <Award className="h-3 w-3 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                                        {achievement}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {!player.sponsored && (
                                <div className="text-xs text-gray-400 italic">
                                  Available for sponsorship opportunities
                                </div>
                              )}
                              {player.verified && (
                                <div className="text-xs text-gray-400 italic flex items-center">
  <div className="h-2 w-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
  <span>Verified With zkproof txin: 0x3f42w...23f</span>
</div>

                              )}
                            </div>
                          </div>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-20 relative">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="rounded-2xl border border-purple-500/30 bg-black/40 backdrop-blur-sm p-8 md:p-12 shadow-lg shadow-purple-500/10 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 mix-blend-overlay"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-md">
                  <h2 className="text-3xl font-bold tracking-tighter text-white mb-4">Become a Verified Athlete</h2>
                  <p className="text-gray-300 mb-6">
                    Join the elite ranks of verified athletes. Upload your performance data, get authenticated, and
                    unlock sponsorship opportunities.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-lg bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white font-medium"
                    style={{
                      backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)",
                    }}
                  >
                    Apply for Verification
                  </motion.button>
                </div>

                <div className="relative w-full max-w-[300px] aspect-square overflow-hidden rounded-xl border border-purple-500/30 shadow-lg shadow-pink-500/20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay z-10 pointer-events-none"></div>
                  <Image
                    src="/x3.jpg"
                    alt="Verified Athlete"
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-500 rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-0"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}

