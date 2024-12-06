'use client'

import { useState, useEffect } from 'react'
import { BellIcon as Bull, AlertCircle, ArrowRight, Wallet, Send, Flame, Check, Plus, Loader2 } from 'lucide-react'
import { setupWalletSelector } from "@near-wallet-selector/core"
import { setupModal } from "@near-wallet-selector/modal-ui"
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet"
import { setupSender } from "@near-wallet-selector/sender"
import { setupHereWallet } from "@near-wallet-selector/here-wallet"
import { setupNightly } from "@near-wallet-selector/nightly"
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet"
import { setupLedger } from "@near-wallet-selector/ledger"
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect"
import { Contract, utils, providers } from "near-api-js"
import "@near-wallet-selector/modal-ui/styles.css"

interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  icon: string | null
}

interface BatchTransfer {
  receiver: string
  amount: string
}

export default function ContractInteraction() {
  // Basic states
  const [selector, setSelector] = useState<any>(null)
  const [modal, setModal] = useState<any>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [contract, setContract] = useState<any>(null)
  
  // Token info states
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null)
  const [totalSupply, setTotalSupply] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  
  // UI states
  const [activeTab, setActiveTab] = useState<'transfer' | 'approve' | 'burn' | 'batch'>('transfer')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [nearBalance, setNearBalance] = useState<string>('0')


  // Form states
  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [spenderId, setSpenderId] = useState<string>('')
  const [approvalAmount, setApprovalAmount] = useState<string>('')
  const [burnAmount, setBurnAmount] = useState<string>('')
  const [batchTransfers, setBatchTransfers] = useState<BatchTransfer[]>([
    { receiver: '', amount: '' }
  ])

  const contract_id: string = "hello2.baideployer.testnet" // Your contract ID

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
            projectId: "c4f79cc...", // Replace with your actual project ID
            metadata: {
              name: "NEAR Token Interface",
              description: "Interface for NEAR Token Contract",
              url: typeof window !== 'undefined' ? window.location.origin : '',
              icons: ["https://yourapp.com/icon.png"],
            },
          }),
        ],
      });
  
      const modal = setupModal(selector, {
        contractId: contract_id
      });
  
      setSelector(selector);
      setModal(modal);
      
  
      // Check if user is already signed in
      const wallet = await selector.wallet();
      const isSignedIn = await selector.isSignedIn();
      
      
      if (isSignedIn) {
        const accounts = await wallet.getAccounts();
        
        if (accounts.length > 0) {
          const accountId = accounts[0].accountId;
          console.log("AccountId:", accountId);
          setAccountId(accountId);
          await setupContract(selector, accountId);
        }
      }
  
      // Subscribe to changes
      selector.on("accountsChanged", async (accounts: any) => {
        const accountId = accounts?.[0]?.accountId;
        setAccountId(accountId ?? null);
        if (accountId) {
          await setupContract(selector, accountId);
        }
      });
  
    } catch (err) {
      console.error('Failed to initialize wallet selector:', err);
      setError('Failed to initialize wallet connection');
    }
  }
    useEffect(() => {
       initNear()
    }, [])

  // Add this function to fetch NEAR balance
  async function fetchNearBalance(selector: any, accountId: string) {
    try {
      const provider = new providers.JsonRpcProvider({ url: selector.options.network.nodeUrl });
      const account = await provider.query({
        request_type: "view_account",
        finality: "final",
        account_id: accountId
      });
  
      if (account) {
        /*const balanceInYocto = account.amount;
        const formattedBalance = utils.format.formatNearAmount(balanceInYocto);  */
        setNearBalance('10');
      }
    } catch (err: any) {
      console.error('Error fetching NEAR balance:', err.message);
      setNearBalance('Error');
    }
  }

  async function setupContract(selector: any, accountId: string) {
    try {
      const wallet = await selector.wallet();
      const account2Use = wallet.getAccounts()
      
      
      // Create contract instance
      const contract = new Contract(
        account2Use,
        contract_id,
        {
          viewMethods: [
            'ft_total_supply',
            'ft_balance_of',
            'ft_metadata',
            'ft_allowance'
          ],
          changeMethods: [
            'ft_transfer',
            'ft_approve',
            'ft_burn',
            'ft_batch_transfer'
          ],
          useLocalViewExecution: false
        }
      );
  
      setContract(contract);
  
      // Fetch initial data
      await Promise.all([
        fetchTokenInfo(contract, accountId),
        fetchNearBalance(selector, accountId)
      ]);
  
    } catch (err: any) {
      console.error('Contract setup error:', err.message);
      setError(`Failed to initialize contract: ${err.message}`);
    }
  }
  

  async function fetchTokenInfo(contractInstance: any, accountId: string) {
  try {
    console.log('Fetching token info for:', accountId) // Debug log

    const [totalSupplyResult, balanceResult, metadataResult] = await Promise.all([
      contractInstance.ft_total_supply(),
      contractInstance.ft_balance_of({ account_id: accountId }),
      contractInstance.ft_metadata()
    ])
    
    console.log('Token info results:', { // Debug logs
      totalSupply: totalSupplyResult,
      balance: balanceResult,
      metadata: metadataResult
    })

    // Format values based on token decimals
    const decimals = metadataResult.decimals || 18
    const divisor = BigInt(10) ** BigInt(decimals)
    
    const formattedTotalSupply = (BigInt(totalSupplyResult) / divisor).toString()
    const formattedBalance = (BigInt(balanceResult) / divisor).toString()

    setTotalSupply(formattedTotalSupply)
    setBalance(formattedBalance)
    setMetadata(metadataResult)
  } catch (err: any) {
    console.error('Token info fetch error:', err.message)
    setError(`Failed to fetch token information: ${err.message}`)
  }
}

async function handleConnect() {
    try {
      if (!modal) {
        throw new Error('Modal not initialized');
      }
      modal.show();
    } catch (err: any) {
      console.error('Connection error:', err);
      setError(`Failed to connect: ${err.message}`);
    }
  }

  async function handleDisconnect() {
    
    const wallet = await selector.wallet()
    await wallet.signOut()
    setAccountId(null)
    setContract(null)
    setTotalSupply('')
    setBalance('')
    setMetadata(null)
  }

  async function handleTransfer() {
    if (!contract || !accountId || !amount || !receiverId) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await contract.ft_transfer({
        args: {
          receiver_id: receiverId,
          amount: utils.format.parseNearAmount(amount),
          memo: 'Transfer from web interface'
        },
        amount: "1" // 1 yoctoNEAR required for security
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

  async function handleApprove() {
    if (!contract || !spenderId || !approvalAmount) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await contract.ft_approve({
        args: {
          spender_id: spenderId,
          amount: utils.format.parseNearAmount(approvalAmount)
        },
        amount: "1"
      })
      setSuccess('Approval successful!')
      setSpenderId('')
      setApprovalAmount('')
    } catch (err) {
      console.error('Approval error:', err)
      setError('Approval failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBurn() {
    if (!contract || !burnAmount) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await contract.ft_burn({
        args: {
          amount: utils.format.parseNearAmount(burnAmount)
        }
      })
      setSuccess('Tokens burned successfully!')
      await fetchTokenInfo(contract, accountId!)
      setBurnAmount('')
    } catch (err) {
      console.error('Burn error:', err)
      setError('Burn failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleBatchTransfer() {
    if (!contract || !batchTransfers.length) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const transfers = batchTransfers.map(t => ({
        receiver_id: t.receiver,
        amount: utils.format.parseNearAmount(t.amount)
      }))
      
      await contract.ft_batch_transfer({
        args: { transfers },
        amount: "1"
      })
      setSuccess('Batch transfer successful!')
      await fetchTokenInfo(contract, accountId!)
      setBatchTransfers([{ receiver: '', amount: '' }])
    } catch (err) {
      console.error('Batch transfer error:', err)
      setError('Batch transfer failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function addBatchTransfer() {
    setBatchTransfers([...batchTransfers, { receiver: '', amount: '' }])
  }

  function updateBatchTransfer(index: number, field: keyof BatchTransfer, value: string) {
    const newTransfers = [...batchTransfers]
    newTransfers[index][field] = value
    setBatchTransfers(newTransfers)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <Bull className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold">NEAR Token Interface</h2>
          </div>
  
          {!selector ? (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-400" />
              <p className="mt-2">Initializing...</p>
            </div>
          ) : !accountId ? (
            <button 
              onClick={handleConnect}
              className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center gap-2"
            >
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </button>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-gray-400">Connected Account</p>
                  <p className="font-mono">{accountId}</p>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-sm"
                >
                  Disconnect
                </button>
              </div>
  
              {metadata && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Token</p>
                    <p className="font-bold">{metadata.symbol}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">Token Balance</p>
                    <p className="font-bold">{balance} {metadata.symbol}</p>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">NEAR Balance</p>
                    <p className="font-bold">{nearBalance} NEAR</p>
                  </div>
                </div>
              )}
  
              <div className="flex space-x-2 mb-6">
                {(['transfer', 'approve', 'burn', 'batch'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg capitalize ${
                      activeTab === tab 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
  
              <div className="space-y-4">
                {/* Transfer Tab */}
                {activeTab === 'transfer' && (
                  <>
                    <input
                      placeholder="Receiver ID"
                      value={receiverId}
                      onChange={(e) => setReceiverId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      placeholder="Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      type="number"
                      step="0.000000000000000001"
                    />
                    <button
                      onClick={handleTransfer}
                      disabled={isLoading || !receiverId || !amount}
                      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      {isLoading ? 'Processing...' : 'Transfer'}
                    </button>
                  </>
                )}
  
                {/* Approve Tab */}
                {activeTab === 'approve' && (
                  <>
                    <input
                      placeholder="Spender ID"
                      value={spenderId}
                      onChange={(e) => setSpenderId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      placeholder="Amount to Approve"
                      value={approvalAmount}
                      onChange={(e) => setApprovalAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      type="number"
                      step="0.000000000000000001"
                    />
                    <button
                      onClick={handleApprove}
                      disabled={isLoading || !spenderId || !approvalAmount}
                      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                      {isLoading ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                )}
  
                {/* Burn Tab */}
                {activeTab === 'burn' && (
                  <>
                    <input
                      placeholder="Amount to Burn"
                      value={burnAmount}
                      onChange={(e) => setBurnAmount(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      type="number"
                      step="0.000000000000000001"
                    />
                    <button
                      onClick={handleBurn}
                      disabled={isLoading || !burnAmount}
                      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Flame className="h-5 w-5" />}
                      {isLoading ? 'Processing...' : 'Burn Tokens'}
                    </button>
                  </>
                )}
  
                {/* Batch Transfer Tab */}
                {activeTab === 'batch' && (
                  <>
                    {batchTransfers.map((transfer, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          placeholder="Receiver ID"
                          value={transfer.receiver}
                          onChange={(e) => updateBatchTransfer(index, 'receiver', e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          placeholder="Amount"
                          value={transfer.amount}
                          onChange={(e) => updateBatchTransfer(index, 'amount', e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          type="number"
                          step="0.000000000000000001"
                        />
                      </div>
                    ))}
                    <button
                      onClick={addBatchTransfer}
                      className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Add Transfer
                    </button>
                    <button
                      onClick={handleBatchTransfer}
                      disabled={isLoading || batchTransfers.some(t => !t.receiver || !t.amount)}
                      className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                      {isLoading ? 'Processing...' : 'Execute Batch Transfer'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
  
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
  
          {success && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400">
              <ArrowRight className="h-5 w-5" />
              {success}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}