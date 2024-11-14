// 'use client'

// import { useState } from "react"
// import { connect, Contract, keyStores, WalletConnection } from 'near-api-js'
// import { BellIcon as Bull, AlertCircle, ArrowRight, LockIcon, CoinsIcon, UsersIcon, WalletIcon, TwitterIcon } from 'lucide-react'

// // NEAR configuration
// const nearConfig = {
//   networkId: 'testnet',
//   nodeUrl: 'https://rpc.testnet.near.org',
//   walletUrl: 'https://wallet.testnet.near.org',
//   helperUrl: 'https://helper.testnet.near.org',
//   explorerUrl: 'https://explorer.testnet.near.org',
// }

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
//   twitterSentiment: {
//     bullish: number
//     bearish: number
//     neutral: number
//   }
// }

// export default function BullMarketDetector() {
//   const [contractAddress, setContractAddress] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null)
//   const [error, setError] = useState("")

//   const analyzeToken = async () => {
//     setIsLoading(true)
//     setError("")
    
//     try {
//       // Connect to NEAR
//       const near = await connect(nearConfig)
//       const account = await near.account("example-account.testnet")

//       // Load the contract
//       const contract = new Contract(account, contractAddress, {
//         viewMethods: ['get_token_info', 'get_owner', 'get_total_supply'],
//         changeMethods: [],
//       })

//       // Fetch token information
//       const tokenInfo = await contract.get_token_info()
//       const owner = await contract.get_owner()
//       const totalSupply = await contract.get_total_supply()

//       // Fetch additional on-chain data (these would be separate API calls in a real implementation)
//       const deployerHistory = await fetchDeployerHistory(owner)
//       const tokenMetrics = await fetchTokenMetrics(contractAddress)
//       const features = await fetchTokenFeatures(contractAddress)
//       const socials = await fetchTokenSocials(contractAddress)

//       // Fetch Twitter sentiment (this would be a separate API call to your backend)
//       const twitterSentiment = await fetchTwitterSentiment(tokenInfo.symbol)

//       const tokenAnalysis: TokenAnalysis = {
//         name: tokenInfo.name,
//         symbol: tokenInfo.symbol,
//         totalSupply: totalSupply.toString(),
//         owner,
//         deployerHistory,
//         tokenMetrics,
//         features,
//         socials,
//         twitterSentiment,
//       }

//       setAnalysis(tokenAnalysis)
//     } catch (err) {
//       setError("Failed to analyze token. Please check the contract address and try again.")
//       console.error(err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // These functions would be implemented to fetch data from various sources
//   const fetchDeployerHistory = async (owner: string) => {
//     // Implementation to fetch deployer history
//     return { totalDeployments: 3, riskLevel: 'Low' as const }
//   }

//   const fetchTokenMetrics = async (contractAddress: string) => {
//     // Implementation to fetch token metrics
//     return {
//       marketCap: "$500,000",
//       liquidityUSD: "$100,000",
//       holders: 1500,
//       largestHolder: {
//         address: "near.whale.testnet",
//         percentage: 5.5
//       }
//     }
//   }

//   const fetchTokenFeatures = async (contractAddress: string) => {
//     // Implementation to fetch token features
//     return {
//       burnable: true,
//       mintable: false,
//       lockupPeriod: "6 months"
//     }
//   }

//   const fetchTokenSocials = async (contractAddress: string) => {
//     // Implementation to fetch token socials
//     return {
//       telegram: "t.me/bullpalooza",
//       twitter: "twitter.com/bullpalooza",
//       website: "bullpalooza.near"
//     }
//   }

//   const fetchTwitterSentiment = async (symbol: string) => {
//     // Implementation to fetch Twitter sentiment
//     return {
//       bullish: 65,
//       bearish: 20,
//       neutral: 15
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
//     <div className="bg-black/50 backdrop-blur border border-green-500/20 rounded-lg p-6">
//       <div className="flex items-center gap-2 mb-4">
//         <Bull className="h-6 w-6 text-green-400" />
//         <h2 className="text-xl font-bold">Bull Market Detector</h2>
//         <span className="text-sm font-normal text-gray-400">AI-Powered On-Chain Analysis</span>
//       </div>
//       <div className="space-y-6">
//         <div className="space-y-2">
//           <label htmlFor="contract" className="block text-sm font-medium text-gray-400">NEAR Contract Address</label>
//           <div className="flex gap-2">
//             <input
//               id="contract"
//               type="text"
//               placeholder="e.g. token.near"
//               value={contractAddress}
//               onChange={(e) => setContractAddress(e.target.value)}
//               className="flex-grow px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
//             />
//             <button 
//               onClick={analyzeToken} 
//               disabled={isLoading || !contractAddress}
//               className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
//             >
//               Analyze
//             </button>
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
//             <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
//             <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
//             <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2"></div>
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
//                 <LockIcon className="h-4 w-4" />
//                 Security Analysis
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-sm text-gray-400">Deployer Risk</div>
//                   <div className={`font-bold ${getRiskColor(analysis.deployerHistory.riskLevel)}`}>
//                     {analysis.deployerHistory.riskLevel}
//                   </div>
//                   <div className="text-xs text-gray-500">Based on {analysis.deployerHistory.totalDeployments} previous deployments</div>
//                 </div>
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
//                 <div>
//                   <div className="text-sm text-gray-400">Lock-up Period</div>
//                   <div className="font-bold">{analysis.features.lockupPeriod}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Market Metrics */}
//             <div className="space-y-2">
//               <h3 className="font-bold flex items-center gap-2">
//                 <CoinsIcon className="h-4 w-4" />
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
//                 <UsersIcon className="h-4 w-4" />
//                 Holder Analysis
//               </h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-sm text-gray-400">Total Holders</div>
//                   <div className="font-bold">{analysis.tokenMetrics.holders.toLocaleString()}</div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-400">Largest Holder</div>
//                   <div className="font-bold">{analysis.tokenMetrics.largestHolder.percentage}%</div>
//                   <div className="text-xs text-gray-500 truncate">{analysis.tokenMetrics.largestHolder.address}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Twitter Sentiment */}
//             <div className="space-y-2">
//               <h3 className="font-bold flex items-center gap-2">
//                 <TwitterIcon className="h-4 w-4" />
//                 Twitter Sentiment
//               </h3>
//               <div className="flex gap-4">
//                 <div className="flex-1 bg-green-500/20 rounded p-2">
//                   <div className="text-sm text-gray-400">Bullish</div>
//                   <div className="font-bold text-green-400">{analysis.twitterSentiment.bullish}%</div>
//                 </div>
//                 <div className="flex-1 bg-red-500/20 rounded p-2">
//                   <div className="text-sm text-gray-400">Bearish</div>
//                   <div className="font-bold text-red-400">{analysis.twitterSentiment.bearish}%</div>
//                 </div>
//                 <div className="flex-1 bg-gray-500/20 rounded p-2">
//                   <div className="text-sm text-gray-400">Neutral</div>
//                   <div className="font-bold text-gray-400">{analysis.twitterSentiment.neutral}%</div>
//                 </div>
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
//       </div>
//     </div>
//   )
// }