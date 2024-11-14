'use client'

import { Button } from "@/components/ui/button"
import  Link  from 'next/link'
// import { Card, CardContent } from "@/components/ui/card"
import { Card, CardContent } from "@/components/ui/Card"
import { ArrowUpRight, BellIcon as Bull, LineChartIcon as ChartLineUp, Coins, Rocket, Sparkles, Send, Twitter, Mail } from 'lucide-react'
import { useState } from "react"

export default function Component() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <Bull className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold">BullPaloozaAI</span>
          </div>
          <Button 
            variant="outline" 
            className="bg-green-500 text-white hover:bg-green-600 border-none"
          >
            Connect NEAR Wallet
          </Button>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold leading-tight">
              Your AI Companion for the Ultimate
              <span className="text-green-400"> Bull Market</span> Experience
            </h1>
            <p className="text-lg text-gray-300">
              Packed with insights, trading signals, and hype-worthy predictions, BullPaloozaAI brings the energy of a festival straight to the world of finance.
            </p>
            <div className="flex gap-4">
            <Link href="/bull-market-detector" passHref>
                <Button 
                  className="bg-green-500 hover:bg-green-600"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  Launch App
                  <ArrowUpRight className={`ml-2 transition-transform ${isHovered ? 'translate-x-1 -translate-y-1' : ''}`} />
                </Button>
              </Link>
              {/* <Button variant="outline">Read Docs</Button> */}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-[120px] opacity-20" />
            <Card className="relative bg-black/50 backdrop-blur border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Bull className="h-12 w-12 text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold">Bull Market Detector</h3>
                    <p className="text-gray-400">AI-Powered Market Sentiment</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-2 bg-green-900 rounded-full">
                    <div className="h-full w-3/4 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bullish Sentiment: 75%</span>
                    <span className="text-green-400">Strong Buy Signal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-black/50 backdrop-blur border-green-500/20">
            <CardContent className="p-6 space-y-4">
              <ChartLineUp className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-bold">Bullish Sentiment Analyzer</h3>
              <p className="text-gray-300">AI-powered tool that scans social media and crypto forums for market sentiment</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 backdrop-blur border-green-500/20">
            <CardContent className="p-6 space-y-4">
              <Sparkles className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-bold">AI Meme Creator</h3>
              <p className="text-gray-300">Generate viral-worthy crypto memes with our AI-powered meme creation bot</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 backdrop-blur border-green-500/20">
            <CardContent className="p-6 space-y-4">
              <Coins className="h-8 w-8 text-green-400" />
              <h3 className="text-xl font-bold">Staking Rewards</h3>
              <p className="text-gray-300">Stake tokens to earn rewards and climb the Bull Champions leaderboard</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <Rocket className="h-12 w-12 mx-auto text-green-400" />
          <h2 className="text-3xl font-bold">Ready to Join the Bull Run?</h2>
          <p className="text-gray-300">
          Get ready to ride the bullish waves, maximize gains, and celebrate the thrill of every market surge.

Whether you’re a seasoned investor or just here for the excitement, BullPaloozaAI keeps you ahead of the trends and amplifies your trading game!
          </p>
          <Button className="bg-green-500 hover:bg-green-600">
            Get Started Now
          </Button>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-green-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <a 
              href="https://t.me/+mlM09KA_NzE5ZTNk" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-white hover:text-green-400 transition-colors"
            >
              <Send className="mr-2 h-6 w-6" />
              Join Telegram
            </a>
            <a 
              href="https://x.com/bullPalooza_ai" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-white hover:text-green-400 transition-colors"
            >
              <Twitter className="mr-2 h-6 w-6" />
              Follow on Twitter
            </a>
            <a 
              href="mailto:bullpaloozaai@gmail.com" 
              className="flex items-center text-white hover:text-green-400 transition-colors"
            >
              <Mail className="mr-2 h-6 w-6" />
              Contact for Partnership
            </a>
          </div>
          <div className="text-center mt-8 text-sm text-gray-400">
            © 2024 BullPaloozaAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}