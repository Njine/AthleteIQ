"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

export default function Header() {
  const [activeItem, setActiveItem] = useState("Leaderboards")

  const navItems = [
    { name: "Leaderboards", href: "#" },
    { name: "Top Players", href: "#" },
    { name: "Market Place", href: "#" },
    { name: "Partners", href: "#" },
    { name: "Sports Article", href: "#" },
  ]

  return (

    //  <header
    //     className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
    //       isScrolled
    //         ? "bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/40"
    //         : "bg-transparent"
    //     }`}
    //   > 
        
    <header className="w-full  py-6 font-dmsans">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl">
            <Image src="/logo.svg" alt="Logo" width={85} height={80} />
            <span>AthleteIQ</span>
          </div>

        <nav className="hidden md:flex flex-row items-center gap-5">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-2.5 py-2.5 text-[15px] ${
                activeItem === item.name ? "text-white font-bold" : "text-white/60 font-normal"
              }`}
              onClick={() => setActiveItem(item.name)}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <button className="px-4 py-2 rounded-full w-[80px] text-[14px] text-white  bg-gradient-to-r from-[rgba(241,3,128,0.7)] to-[rgba(250,213,171,0.7)]">
          Login
        </button>
      </div>
    </header>
  )
}

