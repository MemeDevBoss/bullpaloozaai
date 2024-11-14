// 'use client'

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Skeleton } from "@/components/ui/skeleton"
// import { BellIcon as Bull, AlertCircle, ArrowRight, Lock, Coins, Users, Wallet } from 'lucide-react'
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"



// interface TokenAnalysis {
//   name: string
//   symbol: string
//   totalSupply: string
//   owner: string
//   deployerHistory: {
//     totalDeployments: number
//     riskLevel: 'Low' | 'Medium' | 'High'
//   }
//   tokenMetrics: {
//     marketCap: string
//     liquidityUSD: string
//     holders: number
//     largestHolder: {
//       address: string
//       percentage: number
//     }
//   }
//   features: {
//     burnable: boolean
//     mintable: boolean
//     lockupPeriod: string
//   }
//   socials: {
//     telegram?: string
//     twitter?: string
//     website?: string
//   }
// }

// export default function Component() {
//   const [contractAddress, setContractAddress] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null)
//   const [error, setError] = useState("")

//   const analyzeToken = async () => {
//     setIsLoading(true)
//     setError("")
    
//     try {
//       // Here you would integrate with NEAR blockchain APIs
//       // This is a mock response for demonstration
//       const mockAnalysis: TokenAnalysis = {
//         name: "BullPalooza Token",
//         symbol: "BULL",
//         totalSupply: "1,000,000,000",
//         owner: "near.deployer.testnet",
//         deployerHistory: {
//           totalDeployments: 3,
//           riskLevel: 'Low'
//         },
//         tokenMetrics: {
//           marketCap: "$500,000",
//           liquidityUSD: "$100,000",
//           holders: 1500,
//           largestHolder: {
//             address: "near.whale.testnet",
//             percentage: 5.5
//           }
//         },
//         features: {
//           burnable: true,
//           mintable: false,
//           lockupPeriod: "6 months"
//         },
//         socials: {
//           telegram: "t.me/bullpalooza",
//           twitter: "twitter.com/bullpalooza",
//           website: "bullpalooza.near"
//         }
//       }

//       await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
//       setAnalysis(mockAnalysis)
//     } catch (err) {
//       setError("Failed to analyze token. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const getRiskColor = (level: string) => {
//     switch (level) {
//       case 'Low': return 'text-green-400'
//       case 'Medium': return 'text-yellow-400'
//       case 'High': return 'text-red-400'
//       default: return 'text-gray-400'
//     }
//   }

//   return (
//     <Card className="bg-black/50 backdrop-blur border-green-500/20">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Bull className="h-6 w-6 text-green-400" />
//           Bull Market Detector
//           <span className="text-sm font-normal text-gray-400">AI-Powered On-Chain Analysis</span>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="space-y-2">
//           <Label htmlFor="contract">NEAR Contract Address</Label>
//           <div className="flex gap-2">
//             <Input
//               id="contract"
//               placeholder="e.g. token.near"
//               value={contractAddress}
//               onChange={(e) => setContractAddress(e.target.value)}
//               className="bg-black/30 border-green-500/20"
//             />
//             <Button 
//               onClick={analyzeToken} 
//               disabled={isLoading || !contractAddress}
//               className="bg-green-500 hover:bg-green-600"
//             >
//               Analyze
//             </Button>
//           </div>
//         </div>

//         {error && (
//           <div className="flex items-center gap-2 text-red-400 text-sm">
//             <AlertCircle className="h-4 w-4" />
//             {error}
//           </div>
//         )}

//         {isLoading ? (
//           <div className="space-y-4">
//             <Skeleton className="h-4 w-3/4" />
//             <Skeleton className="h-4 w-1/2" />
//             <Skeleton className="h-4 w-2/3" />
//           </div>
//         ) : analysis ? (
//           <div className="space-y-6">
//             {/* Token Basic Info */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-sm text-gray-400">Token Name</div>
//                 <div className="font-bold">{analysis.name}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Symbol</div>
//                 <div className="font-bold">{analysis.symbol}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Total Supply</div>
//                 <div className="font-bold">{analysis.totalSupply}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Owner</div>
//                 <div className="font-bold truncate">{analysis.owner}</div>
//               </div>
//             </div>

//             {/* Security Analysis */}
//             <div className="space-y-2">
//               <h3 className="font-bold flex items-center gap-2">
//                 <Lock className="h-4 w-4" />
//                 Security Analysis
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger className="text-left">
//                       <div className="text-sm text-gray-400">Deployer Risk</div>
//                       <div className={`font-bold ${getRiskColor(analysis.deployerHistory.riskLevel)}`}>
//                         {analysis.deployerHistory.riskLevel}
//                       </div>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Based on {analysis.deployerHistory.totalDeployments} previous deployments</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//                 <div>
//                   <div className="text-sm text-gray-400">Features</div>
//                   <div className="flex gap-2">
//                     {analysis.features.burnable && (
//                       <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
//                         Burnable
//                       </span>
//                     )}
//                     {analysis.features.mintable && (
//                       <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
//                         Mintable
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Market Metrics */}
//             <div className="space-y-2">
//               <h3 className="font-bold flex items-center gap-2">
//                 <Coins className="h-4 w-4" />
//                 Market Metrics
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-sm text-gray-400">Market Cap</div>
//                   <div className="font-bold">{analysis.tokenMetrics.marketCap}</div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-400">Liquidity</div>
//                   <div className="font-bold">{analysis.tokenMetrics.liquidityUSD}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Holder Analysis */}
//             <div className="space-y-2">
//               <h3 className="font-bold flex items-center gap-2">
//                 <Users className="h-4 w-4" />
//                 Holder Analysis
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-sm text-gray-400">Total Holders</div>
//                   <div className="font-bold">{analysis.tokenMetrics.holders.toLocaleString()}</div>
//                 </div>
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger className="text-left">
//                       <div className="text-sm text-gray-400">Largest Holder</div>
//                       <div className="font-bold">{analysis.tokenMetrics.largestHolder.percentage}%</div>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p className="text-xs">{analysis.tokenMetrics.largestHolder.address}</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//               </div>
//             </div>

//             {/* Socials */}
//             {Object.keys(analysis.socials).length > 0 && (
//               <div className="flex gap-2">
//                 {Object.entries(analysis.socials).map(([platform, link]) => (
//                   <a
//                     key={platform}
//                     href={`https://${link}`}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
//                   >
//                     {platform}
//                     <ArrowRight className="h-3 w-3" />
//                   </a>
//                 ))}
//               </div>
//             )}
//           </div>
//         ) : null}
//       </CardContent>
//     </Card>
//   )
// }