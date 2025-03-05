"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, ChevronDown, Star, Heart, Zap, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/ui/header"

// Product type definition
type Product = {
  id: string
  name: string
  category: string
  price: number
  image: string
  rating: number
  features: string[]
  isNew: boolean
  isFeatured?: boolean
}

export default function Marketplace() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Product data
  const products: Product[] = [
    {
      id: "neo-basketball-x1",
      name: "NeoSphere Basketball X1",
      category: "basketballs",
      price: 2.5,
      image: "/products/p1.jpg",
      rating: 4.8,
      features: ["Motion-tracking sensors", "LED illumination", "Impact-resistant shell", "Wireless charging"],
      isNew: true,
      isFeatured: true
    },
    {
      id: "quantum-shoes-v3",
      name: "Quantum Leap Shoes V3",
      category: "shoes",
      price: 8.75,
      image: "/products/p10.jpg",
      rating: 4.9,
      features: ["Adaptive cushioning", "Biometric feedback", "Energy return soles", "Holographic accents"],
      isNew: true,
      isFeatured: true
    },
    {
      id: "pulse-jersey-pro",
      name: "Pulse Jersey Pro",
      category: "apparel",
      price: 3.2,
      image: "/products/p11.jpg",
      rating: 4.7,
      features: ["Thermo-regulating fabric", "Biometric sensors", "Moisture wicking", "UV protection"],
      isNew: true
    },
    {
      id: "neural-headband",
      name: "Neural Focus Headband",
      category: "accessories",
      price: 4.5,
      image: "/products/p4.jpg",
      rating: 4.6,
      features: ["EEG monitoring", "Focus enhancement", "Wireless connectivity", "20hr battery life"],
      isNew: false
    },
    {
      id: "cyber-gloves-elite",
      name: "CyberGrip Gloves Elite",
      category: "accessories",
      price: 2.8,
      image: "/products/p6.jpg",
      rating: 4.5,
      features: ["Haptic feedback", "Grip enhancement", "Touchscreen compatible", "Impact protection"],
      isNew: false
    },
    {
      id: "aero-shorts-x2",
      name: "AeroFlex Shorts X2",
      category: "apparel",
      price: 2.4,
      image: "/products/p7.jpg",
      rating: 4.7,
      features: ["4-way stretch", "Hidden pockets", "Reflective accents", "Antimicrobial"],
      isNew: false
    },
    {
      id: "volt-running-shoes",
      name: "Volt Runner 3000",
      category: "shoes",
      price: 7.9,
      image: "/products/p8.jpg",
      rating: 4.8,
      features: ["Energy return", "Neon light strips", "Auto-lacing", "Shock absorption"],
      isNew: true
    },
    {
      id: "matrix-basketball",
      name: "Matrix Basketball",
      category: "basketballs",
      price: 1.9,
      image: "/products/p9.jpg",
      rating: 4.5,
      features: ["Trajectory tracking", "Grip-enhancing surface", "Balanced weight", "Durability"],
      isNew: false
    }
  ];

  // Filter products by category and search query
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Featured products
  const featuredProducts = products.filter(product => product.isFeatured);

  // Add to cart function
  const addToCart = (productId: string) => {
    setCartItems([...cartItems, productId]);
  };

  // Categories
  const categories = [
    { id: "all", name: "All Products" },
    { id: "basketballs", name: "Basketballs" },
    { id: "shoes", name: "Shoes" },
    { id: "apparel", name: "Apparel" },
    { id: "accessories", name: "Accessories" }
  ];

  return (
    <div
      className="w-full overflow-x-hidden"
      style={{
        backgroundImage: "url('/bg2.png')",
        backgroundSize: "cover",
        backgroundPosition: "top",
      }}
    >
      <Header className={`transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg' : 'bg-transparent'}`} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20 lg:py-24 relative">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400 mb-4">
                Marketplace
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter gradient-text mb-4">
                NEXT-GEN SPORTS GEAR
              </h1>
              <p className="max-w-[800px] text-gray-300 md:text-xl">
                Exchange your NFTs and elevate your game with cutting-edge tech-infused sports equipment.
                Blockchain authenticated. Performance enhanced. Future ready.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="gap-2 bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white border-0 glow"
                    style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                    Shop Now <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="border-pink-500/50 text-white hover:bg-pink-500/10">
                    View Collections
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="w-full py-12 relative">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center text-center space-y-4 mb-12"
            >
              <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400">
                FEATURED
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
                Top Performance Gear
              </h2>
              <p className="max-w-[600px] text-gray-300">
                Cutting-edge equipment designed for the athletes of tomorrow.
                Enhance your performance with our most advanced tech.
              </p>
            </motion.div>

            <motion.div
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {featuredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeIn}
                  whileHover={{ y: -10 }}
                  className="relative group overflow-hidden rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-sm shadow-lg shadow-purple-500/10"
                >
                  <div className="absolute top-4 right-4 z-10 flex items-center justify-center gap-2">
                    {product.isNew && (
                      <span className="rounded-full bg-gradient-to-b from-[#F1039C] to-transparent px-3 py-1 text-xs font-medium text-white"
                        style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                        NEW
                      </span>
                    )}
                    <button className="rounded-full bg-black/50 backdrop-blur-sm p-2 text-white hover:text-pink-400 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>


                  <div className="grid md:grid-cols-2">
                    <div className="relative aspect-square overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay group-hover:opacity-70 transition-opacity"></div>
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    </div>

                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400 uppercase">{product.category}</span>

                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>

                        <ul className="space-y-1 mb-4">
                          {product.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-gray-300 flex items-start">
                              <Zap className="h-3 w-3 text-pink-400 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-2xl font-bold text-white">{product.price} <span className="text-sm text-pink-400">SOL</span></div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product.id)}
                          className="w-full py-2 px-4 rounded-lg bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white flex items-center justify-center gap-2"
                          style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* All Products */}
        <section className="w-full py-12 relative">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center text-center space-y-4 mb-8"
            >
              <div className="inline-block rounded-lg bg-pink-500/20 px-3 py-1 text-sm text-pink-400">
                SHOP
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-white">
                High tech Sports Collection
              </h2>
              <p className="max-w-[600px] text-gray-300">
                Explore our full range of high-tech sports equipment designed for the athletes of 2030.
              </p>
            </motion.div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
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
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${activeCategory === category.id
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
            </div>

            {/* Products Grid */}
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={fadeIn}
                  whileHover={{ y: -10 }}
                  className="relative group overflow-hidden rounded-xl border border-purple-500/30 bg-black/40 backdrop-blur-sm shadow-lg shadow-purple-500/10"
                >
                  <div className="absolute top-4 right-4 z-10 flex gap-2 items-center justify-center">
                    {product.isNew && (
                      <span className="rounded-full bg-gradient-to-b from-[#F1039C] to-transparent px-3 py-1 text-xs font-medium text-white"
                        style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}>
                        NEW
                      </span>
                    )}
                    <button className="rounded-full bg-black/50 backdrop-blur-sm p-2 text-white hover:text-pink-400 transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay group-hover:opacity-70 transition-opacity"></div>
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 uppercase">{product.category}</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs ml-1">{product.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xl font-bold text-white">{product.price} <span className="text-sm text-pink-400">SOL</span></div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addToCart(product.id)}
                      className="w-full py-2 px-4 rounded-lg bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white flex items-center justify-center gap-2"
                      style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Call to Action */}
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
                  <h2 className="text-3xl font-bold tracking-tighter text-white mb-4">
                    Join AthleteIQ Sports Revolution
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Subscribe to get early access to new product drops, exclusive discounts, and tech updates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-lg border border-purple-500/30 bg-black/60 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 rounded-lg bg-gradient-to-b from-[#F1039C] to-transparent hover:from-pink-600 hover:to-purple-700 text-white font-medium"
                      style={{ backgroundImage: "linear-gradient(220deg, #F1039C -5.33%, rgba(255, 255, 255, 0) 156.4%)" }}
                    >
                      Subscribe
                    </motion.button>
                  </div>
                </div>

                <div className="relative w-full max-w-[450px] max-h-[300px] aspect-square overflow-hidden rounded-xl border border-purple-500/30 shadow-lg shadow-pink-500/20">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/30 to-pink-500/30 mix-blend-overlay z-10 pointer-events-none"></div>
                  <Image
                    src="/ball.jpg"
                    alt="Cyberpunk Basketball"
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

      {/* Footer */}
      <footer className="w-full border-t border-purple-500/30 bg-black/60 backdrop-blur-sm py-8 md:py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-6">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={45}
              height={40}
              className="h-8 w-8 text-primary"
            />
            <span>AthleteIQ Market</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link href="#" className="text-sm text-gray-300 hover:text-pink-400 transition-colors">
              Shop
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-pink-400 transition-colors">
              Collections
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-pink-400 transition-colors">
              About
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-pink-400 transition-colors">
              Support
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-pink-400 transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-pink-400 transition-colors">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>)
};