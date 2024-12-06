// 'use client'

// import { useState, useEffect } from 'react'
// import { BellIcon as Bull, AlertCircle, ArrowRight } from 'lucide-react'
// import { setupWalletSelector } from "@near-wallet-selector/core"
// import { setupModal } from "@near-wallet-selector/modal-ui"
// import { setupBitgetWallet } from "@near-wallet-selector/bitget-wallet"
// import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet"
// import { setupSender } from "@near-wallet-selector/sender"
// import { setupHereWallet } from "@near-wallet-selector/here-wallet"
// import { setupNightly } from "@near-wallet-selector/nightly"
// import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet"
// import { setupLedger } from "@near-wallet-selector/ledger"
// import { setupWalletConnect } from "@near-wallet-selector/wallet-connect"
// import { setupXDEFI } from "@near-wallet-selector/xdefi"
// import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet"
// import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet"
// import { Contract } from "near-api-js"

// export default function ContractInteraction() {
//   const [selector, setSelector] = useState<any>(null)
//   const [modal, setModal] = useState<any>(null)
//   const [accounts, setAccounts] = useState<any[]>([])
//   const [accountId, setAccountId] = useState<string | null>(null)
//   const [contract, setContract] = useState<any>(null)
//   const [totalSupply, setTotalSupply] = useState<string>('')
//   const [balance, setBalance] = useState<string>('')
//   const [receiverId, setReceiverId] = useState<string>('')
//   const [amount, setAmount] = useState<string>('')
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)
//   const [success, setSuccess] = useState<string | null>(null)
//   const contract_id: string = "baideployer.testnet"

//   useEffect(() => {
//     initNear()
//   }, [])

//   async function initNear() {
//     const selector = await setupWalletSelector({
//       network: "testnet",
//       modules: [
//         setupBitgetWallet(),
//         setupMyNearWallet(),
//         setupSender(),
//         setupHereWallet(),
//         setupNightly(),
//         setupMeteorWallet(),
//         setupLedger(),
//         setupXDEFI(),
//         setupWalletConnect({
//           projectId: "c4f79cc...",
//           metadata: {
//             name: "NEAR Wallet Selector",
//             description: "Example dApp used by NEAR Wallet Selector",
//             url: "https://github.com/near/wallet-selector",
//             icons: ["https://avatars.githubusercontent.com/u/37784886"],
//           },
//         }),
//         setupNearMobileWallet(),
//        /* setupMintbaseWallet({
//           walletUrl: "https://wallet.mintbase.xyz",
//           callbackUrl: "https://www.mywebsite.com",
//           deprecated: false,
//         }), */
//       ],
//     })

//     const modal = setupModal(selector, {
//       // contractId: "baideployer.testnet"
//       contractId: contract_id
//     })

//     const state = selector.store.getState()
//     setAccounts(state.accounts)

//     setSelector(selector)
//     setModal(modal)

//     const account = await getAccountFromSelector(selector)
//     if (account) {
//       setAccountId(account.accountId)
//       await setupContract(account)
//     }
//   }

//   async function getAccountFromSelector(selector: any) {
//     const wallet = await selector.wallet()
//     if (!wallet) return null
//     return wallet.getAccounts().then((accounts: any[]) => accounts[0])
//   }

//   async function setupContract(account: any) {
//     const contractInstance = new Contract(
//       account,
//       contract_id, //'baideployer.testnet',
//       {
//         viewMethods: ['ft_total_supply', 'ft_balance_of'],
//         changeMethods: ['ft_transfer'],
//         useLocalViewExecution: false
//       }
//     )
//     setContract(contractInstance)
//     await updateTokenInfo(contractInstance, account.accountId)
//   }

//   async function handleConnect() {
//     modal.show()
//   }

//   async function handleDisconnect() {
//     const wallet = await selector.wallet()
//     await wallet.signOut()
//     setAccountId(null)
//     setContract(null)
//     setTotalSupply('')
//     setBalance('')
//   }

//   async function updateTokenInfo(contractInstance: any, accountId: string) {
//     try {
//       const totalSupply = await (contractInstance as any).ft_total_supply()
//       setTotalSupply(totalSupply)
      
//       const balance = await (contractInstance as any).ft_balance_of({ account_id: accountId })
//       setBalance(balance)
//     } catch (err) {
//       console.error('Error fetching token info:', err)
//       setError('Failed to fetch token information')
//     }
//   }

//   async function handleTransfer() {
//     if (!contract || !accountId) return

//     setIsLoading(true)
//     setError(null)
//     setSuccess(null)

//     try {
//       await (contract as any).ft_transfer({
//         // args: {
//           receiver_id: receiverId,
//           amount: amount
//         // },
//         // gas: '300000000000000', // 300 TGas
//         // amount: '1' // 1 yoctoNEAR for security reasons
//       })
//       setSuccess('Transfer successful!')
//       await updateTokenInfo(contract, accountId)
//       setReceiverId('')
//       setAmount('')
//     } catch (err) {
//       console.error('Transfer error:', err)
//       setError('Transfer failed. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="bg-black/50 backdrop-blur border border-green-500/20 rounded-lg p-6">
//       <div className="flex items-center gap-2 mb-4">
//         <Bull className="h-6 w-6 text-green-400" />
//         <h2 className="text-xl font-bold">NEAR Contract Interaction</h2>
//       </div>
//       <div className="space-y-6">
//         {!accountId ? (
//           <button 
//             onClick={handleConnect}
//             className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
//           >
//             Connect to NEAR Wallet
//           </button>
//         ) : (
//           <>
//             <div className="flex justify-between items-center">
//               <span className="text-sm text-gray-400">Connected: {accountId}</span>
//               <button 
//                 onClick={handleDisconnect}
//                 className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
//               >
//                 Disconnect
//               </button>
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-sm text-gray-400">Total Supply: {totalSupply}</div>
//                 <div className="font-bold">{totalSupply}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-400">Your Balance: {balance}</div>
//                 <div className="font-bold">{balance}</div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <label htmlFor="receiver" className="block text-sm font-medium text-gray-400">Receiver ID</label>
//               <input
//                 id="receiver"
//                 type="text"
//                 value={receiverId}
//                 onChange={(e) => setReceiverId(e.target.value)}
//                 className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
//                 placeholder="e.g. receiver.testnet"
//               />
//             </div>
//             <div className="space-y-2">
//               <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount</label>
//               <input
//                 id="amount"
//                 type="text"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
//                 placeholder="e.g. 500"
//               />
//             </div>
//             <button
//               onClick={handleTransfer}
//               disabled={isLoading || !receiverId || !amount}
//               className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
//             >
//               {isLoading ? 'Transferring...' : 'Transfer Tokens'}
//             </button>
//           </>
//         )}

//         {error && (
//           <div className="flex items-center gap-2 text-red-400 text-sm">
//             <AlertCircle className="h-4 w-4" />
//             {error}
//           </div>
//         )}

//         {success && (
//           <div className="flex items-center gap-2 text-green-400 text-sm">
//             <ArrowRight className="h-4 w-4" />
//             {success}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

///////////////////////////////////////////////////////////----------------------------------------///////////////////////////////////////////
/*
'use client'

import { useState, useEffect } from 'react'
import { BellIcon as Bull, AlertCircle, ArrowRight } from 'lucide-react'
import { setupWalletSelector } from "@near-wallet-selector/core"
import { setupModal } from "@near-wallet-selector/modal-ui"
import { setupBitgetWallet } from "@near-wallet-selector/bitget-wallet"
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet"
import { setupSender } from "@near-wallet-selector/sender"
import { setupHereWallet } from "@near-wallet-selector/here-wallet"
import { setupNightly } from "@near-wallet-selector/nightly"
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet"
import { setupLedger } from "@near-wallet-selector/ledger"
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect"
import { setupXDEFI } from "@near-wallet-selector/xdefi"
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet"
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet"
import { Contract, utils } from "near-api-js"
import '@near-wallet-selector/modal-ui/styles.css';


export default function ContractInteraction() {
  const [selector, setSelector] = useState<any>(null)
  const [modal, setModal] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [accountId, setAccountId] = useState<string | null>(null)
  const [contract, setContract] = useState<any>(null)
  const [totalSupply, setTotalSupply] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const contract_id: string = "baideployer.testnet"

  useEffect(() => {
    initNear()
  }, [])

  async function initNear() {
    const selector = await setupWalletSelector({
      network: "testnet",
      modules: [
        setupBitgetWallet(),
        setupMyNearWallet(),
        setupSender(),
        setupHereWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupLedger(),
        setupXDEFI(),
        setupWalletConnect({
          projectId: "c4f79cc...",
          metadata: {
            name: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            url: "https://github.com/near/wallet-selector",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
        }),
        setupNearMobileWallet(),
       /* setupMintbaseWallet({
          walletUrl: "https://wallet.mintbase.xyz",
          callbackUrl: "https://www.mywebsite.com",
          deprecated: false,
        }),  //
      ],
    })

    const modal = setupModal(selector, {
      contractId: contract_id
    })

    const state = selector.store.getState()
    setAccounts(state.accounts)

    setSelector(selector)
    setModal(modal)

    selector.on("accountsChanged", async (accounts: any) => {
      const account = accounts[0]
      setAccountId(account?.accountId ?? null)
      if (account) {
        await setupContract(account)
      }
    })

    const wallet = await selector.wallet()
    if (wallet) {
      const accounts = await wallet.getAccounts()
      if (accounts.length > 0) {
        setAccountId(accounts[0].accountId)
        await setupContract(accounts[0])
      }
    }
  }

  async function setupContract(account: any) {
    const wallet = await selector.wallet()
    const contractInstance = new Contract(
      wallet,
      contract_id,
      {
        viewMethods: ['ft_total_supply', 'ft_balance_of'],
        changeMethods: ['ft_transfer'],
        useLocalViewExecution: true
      }
    )
    setContract(contractInstance)
    await updateTokenInfo(contractInstance, account.accountId)
  }

  async function handleConnect() {
    modal.show()
  }

  async function handleDisconnect() {
    const wallet = await selector.wallet()
    await wallet.signOut()
    setAccountId(null)
    setContract(null)
    setTotalSupply('')
    setBalance('')
  }

  async function updateTokenInfo(contractInstance: any, accountId: string) {
    try {
      const totalSupply = await contractInstance.ft_total_supply()
      setTotalSupply(utils.format.formatNearAmount(totalSupply, 8))
      
      const balance = await contractInstance.ft_balance_of({ account_id: accountId })
      setBalance(utils.format.formatNearAmount(balance, 8))
    } catch (err) {
      console.error('Error fetching token info:', err)
      setError('Failed to fetch token information')
    }
  }

  async function handleTransfer() {
    if (!contract || !accountId) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const wallet = await selector.wallet()
      await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: contract_id,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'ft_transfer',
              args: {
                receiver_id: receiverId,
                amount: utils.format.parseNearAmount(amount)
              },
              gas: '300000000000000',
              deposit: '1'
            }
          }
        ]
      })

      setSuccess('Transfer successful!')
      await updateTokenInfo(contract, accountId)
      setReceiverId('')
      setAmount('')
    } catch (err) {
      console.error('Transfer error:', err)
      setError('Transfer failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-green-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bull className="h-6 w-6 text-green-400" />
        <h2 className="text-xl font-bold">NEAR Contract Interaction</h2>
      </div>
      <div className="space-y-6">
        {!accountId ? (
          <button 
            onClick={handleConnect}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            Connect to NEAR Wallet
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Connected: {accountId}</span>
              <button 
                onClick={handleDisconnect}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              >
                Disconnect
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Total Supply</div>
                <div className="font-bold">{totalSupply} NEAR</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Your Balance</div>
                <div className="font-bold">{balance} NEAR</div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="receiver" className="block text-sm font-medium text-gray-400">Receiver ID</label>
              <input
                id="receiver"
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
                placeholder="e.g. receiver.testnet"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount (NEAR)</label>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
                placeholder="e.g. 0.1"
              />
            </div>
            <button
              onClick={handleTransfer}
              disabled={isLoading || !receiverId || !amount}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Transferring...' : 'Transfer Tokens'}
            </button>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <ArrowRight className="h-4 w-4" />
            {success}
          </div>
        )}
      </div>
    </div>
  )
}
*/
///////////////////////////////////////---------------------Recent-------------------/////////////////////////////////////////////
'use client'

import { useState, useEffect } from 'react'
import { BellIcon as Bull, AlertCircle, ArrowRight } from 'lucide-react'
import { setupWalletSelector } from "@near-wallet-selector/core"
import { setupModal } from "@near-wallet-selector/modal-ui"
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet"
import { setupSender } from "@near-wallet-selector/sender"
import { setupHereWallet } from "@near-wallet-selector/here-wallet"
import { setupNightly } from "@near-wallet-selector/nightly"
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet"
import { setupLedger } from "@near-wallet-selector/ledger"
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect"
import { Contract, utils } from "near-api-js"
import "@near-wallet-selector/modal-ui/styles.css"

export default function ContractInteraction() {
  const [selector, setSelector] = useState<any>(null)
  const [modal, setModal] = useState<any>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [contract, setContract] = useState<any>(null)
  const [totalSupply, setTotalSupply] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const contract_id: string = "baideployer.testnet"

  useEffect(() => {
    initNear()
  }, [])

  async function initNear() {
    try {
      const selector = await setupWalletSelector({
        network: "testnet",
        modules: [
          setupMyNearWallet(),
          setupSender(),
          setupHereWallet(),
          setupNightly(),
          setupMeteorWallet(),
          setupLedger(),
          setupWalletConnect({
            projectId: "c4f79cc...",
            metadata: {
              name: "NEAR Wallet Selector",
              description: "Example dApp used by NEAR Wallet Selector",
              url: "https://github.com/near/wallet-selector",
              icons: ["https://avatars.githubusercontent.com/u/37784886"],
            },
          }),
        ],
      })

      const modal = setupModal(selector, {
        contractId: contract_id
      })

      setSelector(selector)
      setModal(modal)

      selector.on("accountsChanged", async (accounts: any) => {
        const account = accounts[0]
        setAccountId(account?.accountId ?? null)
        if (account) {
          await setupContract(account.accountId)
        }
      })

      if (selector.isSignedIn()) {
        const wallet = await selector.wallet()
        const accounts = await wallet.getAccounts()
        if (accounts.length > 0) {
          setAccountId(accounts[0].accountId)
          await setupContract(accounts[0].accountId)
        }
      }
    } catch (err) {
      console.error('Failed to initialize wallet selector:', err)
      setError('Failed to initialize wallet connection')
    }
  }

  async function setupContract(accountId: string) {
    try {
      const { contract } = await selector.wallet().then((wallet: any) => {
        return {
          contract: new Contract(wallet.account(), contract_id, {
            viewMethods: ['ft_total_supply', 'ft_balance_of'],
            changeMethods: ['ft_transfer'],
            useLocalViewExecution: true
          })
        }
      })
      setContract(contract)
      await fetchTokenInfo(contract, accountId)
    } catch (err) {
      console.error('Failed to setup contract:', err)
      setError('Failed to initialize contract')
    }
  }

  async function fetchTokenInfo(contractInstance: any, accountId: string) {
    try {
      const [totalSupplyResult, balanceResult] = await Promise.all([
        contractInstance.ft_total_supply(),
        contractInstance.ft_balance_of({ account_id: accountId })
      ])
      
      setTotalSupply(utils.format.formatNearAmount(totalSupplyResult, 8))
      setBalance(utils.format.formatNearAmount(balanceResult, 8))
      console.log('Total Supply:', totalSupplyResult)
      console.log('Balance:', balanceResult)
    } catch (err) {
      console.error('Error fetching token info:', err)
      setError('Failed to fetch token information')
    }
  }

  async function handleConnect() {
    modal.show()
  }

  async function handleDisconnect() {
    const wallet = await selector.wallet()
    await wallet.signOut()
    setAccountId(null)
    setContract(null)
    setTotalSupply('')
    setBalance('')
  }

  async function handleTransfer() {
    if (!contract || !accountId || !amount || !receiverId) return

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const wallet = await selector.wallet()
      await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: contract_id,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'ft_transfer',
              args: {
                receiver_id: receiverId,
                amount: utils.format.parseNearAmount(amount)
              },
              gas: '300000000000000',
              deposit: '1'
            }
          }
        ]
      })

      setSuccess('Transfer successful!')
      await fetchTokenInfo(contract, accountId)
      setReceiverId('')
      setAmount('')
    } catch (err) {
      console.error('Transfer error:', err)
      setError('Transfer failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-black/50 backdrop-blur border border-green-500/20 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bull className="h-6 w-6 text-green-400" />
        <h2 className="text-xl font-bold">NEAR Contract Interaction</h2>
      </div>
      <div className="space-y-6">
        {!accountId ? (
          <button 
            onClick={handleConnect}
            className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            Connect to NEAR Wallet
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Connected: {accountId}</span>
              <button 
                onClick={handleDisconnect}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              >
                Disconnect
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Total Supply</div>
                <div className="font-bold">{totalSupply} NEAR</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Your Balance</div>
                <div className="font-bold">{balance} NEAR</div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="receiver" className="block text-sm font-medium text-gray-400">Receiver ID</label>
              <input
                id="receiver"
                type="text"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
                placeholder="e.g. receiver.testnet"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount (NEAR)</label>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
                placeholder="e.g. 1000"
              />
            </div>
            <button
              onClick={handleTransfer}
              disabled={isLoading || !receiverId || !amount}
              className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Transferring...' : 'Transfer Tokens'}
            </button>
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <ArrowRight className="h-4 w-4" />
            {success}
          </div>
        )}
      </div>
    </div>
  )
}