'use client'

import { useState, useEffect } from 'react'
import * as nearAPI from 'near-api-js'
import { BellIcon as Bull, AlertCircle, ArrowRight } from 'lucide-react'
///////////////////////
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupBitgetWallet } from "@near-wallet-selector/bitget-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
// import { setupNearSnap } from "@near-wallet-selector/near-snap";
// import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
// import { setupOkxWallet } from "@near-wallet-selector/okx-wallet";
// import { setupNarwallets } from "@near-wallet-selector/narwallets";
// import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
// import { setupNearFi } from "@near-wallet-selector/nearfi";
// import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
// import { setupNeth } from "@near-wallet-selector/neth";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
// import { setupRamperWallet } from "@near-wallet-selector/ramper-wallet";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet"; 
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet"; 
// import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";
// import { setupEthereumWallets } from "@near-wallet-selector/ethereum-wallets";

const { connect, WalletConnection, Contract } = nearAPI

export default function ContractInteraction() {
  
  ///////////////////////////////////////////////////
  const [near, setNear] = useState<nearAPI.Near | null>(null)
  const [walletConnection, setWalletConnection] = useState<nearAPI.WalletConnection | null>(null)
  const [contract, setContract] = useState<nearAPI.Contract | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [totalSupply, setTotalSupply] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    initNear()
  }, [])
  

  /*
const selector = await setupWalletSelector({
  network: "testnet",
  modules: [
    setupBitgetWallet(),
    setupMyNearWallet(),
    setupSender(),
    setupHereWallet(),
    // setupMathWallet(),
    setupNightly(),
    setupMeteorWallet(),
    // setupNearSnap(),
    // setupOkxWallet(),
    // setupNarwallets(),
    // setupWelldoneWallet(),
    setupLedger(),
    // setupNearFi(),
    // setupCoin98Wallet(),
    // setupNeth(),
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
    setupMintbaseWallet({
          // networkId: "mainnet",
          walletUrl: "https://wallet.mintbase.xyz",
          callbackUrl: "https://www.mywebsite.com",
          deprecated: false,
          contractId: "baideployer.testnet"
    }),
   /* setupBitteWallet({
        networkId: "mainnet",
        walletUrl: "https://wallet.bitte.ai",
        callbackUrl: "https://www.mywebsite.com",
        deprecated: false,
    }),
    setupEthereumWallets({ wagmiConfig, web3Modal }),
  ],
}); */

// const modal = setupModal(selector, {
//   contractId: "baideployer.testnet"
// });

////////////////////////////////////////////////

  async function initNear() {
    const config = {
      networkId: 'testnet',
      keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      headers: {}
    }

    try {
      const nearInstance = await connect(config)
      setNear(nearInstance)

      const walletConnectionInstance = new WalletConnection(nearInstance, 'bullpalooza-ai')
      setWalletConnection(walletConnectionInstance)

      if (walletConnectionInstance.isSignedIn()) {
        const accountIdFromWallet = walletConnectionInstance.getAccountId()
        setAccountId(accountIdFromWallet)
        await setupContract(walletConnectionInstance, accountIdFromWallet)
      }
    } catch (err) {
      console.error('Failed to initialize NEAR:', err)
      setError('Failed to initialize NEAR connection')
    }
  }

  async function setupContract(walletConnection: nearAPI.WalletConnection, accountId: string) {
    const contractInstance = new Contract(
      walletConnection.account(),
      'baideployer.testnet', // Replace with your actual contract ID
      {
        viewMethods: ['ft_total_supply', 'ft_balance_of'],
        changeMethods: ['ft_transfer'],
        useLocalViewExecution: false
      }
    )
    setContract(contractInstance as any)
    await updateTokenInfo(contractInstance, accountId)
  }

  async function handleConnect() {
    if (!walletConnection) return

    try {
      await walletConnection.requestSignIn({
        contractId: 'baideployer.testnet', // Replace with your actual contract ID
        // methodNames: ['ft_transfer'], // Optional
        failureUrl: 'https://www.mywebsite.com',
        keyType: 'ed25519'
      })
    } catch (err) {
      console.error('Failed to connect wallet:', err)
      setError('Failed to connect to NEAR wallet')
    }
  }

  async function handleDisconnect() {
    if (!walletConnection) return

    try {
      walletConnection.signOut()
      setAccountId(null)
      setContract(null)
      setTotalSupply('')
      setBalance('')
    } catch (err) {
      console.error('Failed to disconnect wallet:', err)
      setError('Failed to disconnect from NEAR wallet')
    }
  }

  async function updateTokenInfo(contractInstance: nearAPI.Contract, accountId: string) {
    try {
      const totalSupply = await (contractInstance as any).ft_total_supply()
      setTotalSupply(totalSupply)
      
      const balance = await (contractInstance as any).ft_balance_of({ account_id: accountId })
      setBalance(balance)
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
      await (contract as any).ft_transfer({
        args: {
          receiver_id: receiverId,
          amount: amount
        },
        gas: '300000000000000', // 300 TGas
        amount: '1' // 1 yoctoNEAR for security reasons
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
                <div className="font-bold">{totalSupply}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Your Balance</div>
                <div className="font-bold">{balance}</div>
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
              <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Amount</label>
              <input
                id="amount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-black/30 border border-green-500/20 rounded-md text-white"
                placeholder="e.g. 500"
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


