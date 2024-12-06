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
import { utils, providers } from "near-api-js"
import "@near-wallet-selector/modal-ui/styles.css"
import type { AccountView } from 'near-api-js/lib/providers/provider'
import { Buffer } from 'buffer';
import { resolve } from 'path'

// If you get a Buffer not found error, add this before your component:
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Types and Interfaces
interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  icon: string | null
}

interface BatchTransfer {
    receiver_id: string;  // Changed from 'receiver' to 'receiver_id'
    amount: string;
    memo?: string;
  }

  interface ContractMethods {
    ft_total_supply: () => Promise<string>;
    ft_balance_of: (args: { account_id: string }) => Promise<string>;
    ft_metadata: () => Promise<TokenMetadata>;
    ft_transfer: (args: { receiver_id: string; amount: string; memo?: string }) => Promise<void>;
    ft_approve: (args: { spender_id: string; amount: string; expires_at?: number }) => Promise<void>;
    ft_burn: (args: { amount: string }) => Promise<void>;
    ft_batch_transfer: (args: { transfers: BatchTransfer[] }) => Promise<void>;
  }

export default function ContractInteraction() {
  // Constants
  const CONTRACT_ID = "hello2.baideployer.testnet"
  const WALLET_CONNECT_PROJECT_ID = "your_project_id_here"

  // States
  const [selector, setSelector] = useState<any>(null)
  const [modal, setModal] = useState<any>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [contract, setContract] = useState<ContractMethods | null>(null)
  
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null)
  const [totalSupply, setTotalSupply] = useState<string>('')
  const [balance, setBalance] = useState<string>('')
  const [nearBalance, setNearBalance] = useState<string>('0')
  
  const [activeTab, setActiveTab] = useState<'transfer' | 'approve' | 'burn' | 'batch'>('transfer')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [receiverId, setReceiverId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [spenderId, setSpenderId] = useState<string>('')
  const [approvalAmount, setApprovalAmount] = useState<string>('')
  const [burnAmount, setBurnAmount] = useState<string>('')
  const [amountError, setAmountError] = useState<string | null>(null);


  const [batchTransfers, setBatchTransfers] = useState<BatchTransfer[]>([
  { receiver_id: '', amount: '', memo: '' }
]);

  // Contract Setup
  async function setupContract(selector: any, accountId: string) {
    try {
      const wallet = await selector.wallet();
      
      const contract: ContractMethods = {
        // View methods
        ft_total_supply: async () => {
          const provider = new providers.JsonRpcProvider({ url: selector.options.network.nodeUrl });
          const result = await provider.query({
            request_type: "call_function",
            account_id: CONTRACT_ID,
            method_name: "ft_total_supply",
            args_base64: Buffer.from("{}").toString('base64'),
            finality: "final"
          });
          // @ts-ignore: result.result is a Uint8Array
          return JSON.parse(Buffer.from(result.result).toString());
        },
  
        ft_balance_of: async ({ account_id }) => {
          const provider = new providers.JsonRpcProvider({ url: selector.options.network.nodeUrl });
          const result = await provider.query({
            request_type: "call_function",
            account_id: CONTRACT_ID,
            method_name: "ft_balance_of",
            args_base64: Buffer.from(JSON.stringify({ account_id })).toString('base64'),
            finality: "final"
          });
          // @ts-ignore: result.result is a Uint8Array
          return JSON.parse(Buffer.from(result.result).toString());
        },
  
        ft_metadata: async () => {
          const provider = new providers.JsonRpcProvider({ url: selector.options.network.nodeUrl });
          const result = await provider.query({
            request_type: "call_function",
            account_id: CONTRACT_ID,
            method_name: "ft_metadata",
            args_base64: Buffer.from("{}").toString('base64'),
            finality: "final"
          });
          // @ts-ignore: result.result is a Uint8Array
          return JSON.parse(Buffer.from(result.result).toString());
        },
  
        // Change methods remain the same
        ft_transfer: async (args) => {
          return wallet.signAndSendTransaction({
            signerId: accountId,
            receiverId: CONTRACT_ID,
            actions: [{
              type: 'FunctionCall',
              params: {
                methodName: 'ft_transfer',
                args,
                gas: '30000000000000',
                deposit: '1'
              }
            }]
          });
        },
  
        ft_approve: async (args) => {
          return wallet.signAndSendTransaction({
            signerId: accountId,
            receiverId: CONTRACT_ID,
            actions: [{
              type: 'FunctionCall',
              params: {
                methodName: 'ft_approve',
                args,
                gas: '30000000000000',
                deposit: '1'
              }
            }]
          });
        },
  
        ft_burn: async (args) => {
          return wallet.signAndSendTransaction({
            signerId: accountId,
            receiverId: CONTRACT_ID,
            actions: [{
              type: 'FunctionCall',
              params: {
                methodName: 'ft_burn',
                args,
                gas: '30000000000000',
                deposit: '1'
              }
            }]
          });
        },
  
        ft_batch_transfer: async (args) => {
          return wallet.signAndSendTransaction({
            signerId: accountId,
            receiverId: CONTRACT_ID,
            actions: [{
              type: 'FunctionCall',
              params: {
                methodName: 'ft_batch_transfer',
                args,
                gas: '30000000000000',
                deposit: '1'
              }
            }]
          });
        }
      };
  
      setContract(contract);
      await fetchTokenInfo(contract, accountId);
      await fetchNearBalance(selector, accountId);
  
    } catch (err: any) {
      console.error('Contract setup error:', err);
      setError(`Failed to initialize contract: ${err.message}`);
    }
  }

    // Initialize NEAR
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
                projectId: WALLET_CONNECT_PROJECT_ID,
                metadata: {
                  name: "NEAR Token Interface",
                  description: "Interface for NEAR Token Contract",
                  url: typeof window !== 'undefined' ? window.location.origin : '',
                  icons: ["https://yourapp.com/icon.png"],
                },
              }),
            ],
          });
    
          const modal = setupModal(selector, { contractId: CONTRACT_ID });
          setSelector(selector);
          setModal(modal);
    
          // Check if user is already signed in
          if (await selector.isSignedIn()) {
            const wallet = await selector.wallet();
            const accounts = await wallet.getAccounts();
            
            if (accounts.length > 0) {
              const accountId = accounts[0].accountId;
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
    
        } catch (err: any) {
          console.error('Failed to initialize:', err);
          setError(`Failed to initialize: ${err.message}`);
        }
      }
    
      // Fetch token information
      async function fetchTokenInfo(contract: ContractMethods, accountId: string) {
        try {
          console.log('Fetching token info for:', accountId);
      
          const [totalSupplyResult, balanceResult, metadataResult] = await Promise.all([
            contract.ft_total_supply(),
            contract.ft_balance_of({ account_id: accountId }),
            contract.ft_metadata()
          ]);
      
          console.log('Token info results:', {
            totalSupply: totalSupplyResult,
            balance: balanceResult,
            metadata: metadataResult
          });
      
          setTotalSupply(totalSupplyResult);
          setBalance(balanceResult);
          setMetadata(metadataResult);
        } catch (err: any) {
          console.error('Error fetching token info:', err);
          setError(`Failed to fetch token info: ${err.message}`);
          // Set default values on error
          setTotalSupply('0');
          setBalance('0');
          setMetadata(prev => prev || {
            name: 'Token',
            symbol: 'TOKEN',
            decimals: 18,
            icon: null
          });
        }
      }
    
      // Fetch NEAR balance
      async function fetchNearBalance(selector: any, accountId: string) {
        try {
          const provider = new providers.JsonRpcProvider({ 
            url: selector.options.network.nodeUrl 
          });
          
          const account = await provider.query({
            request_type: "view_account",
            finality: "final",
            account_id: accountId
          }) as AccountView;
    
          if (account) {
            const balanceInYocto = account.amount;
            const formattedBalance = utils.format.formatNearAmount(balanceInYocto);
            setNearBalance(formattedBalance);
          }
        } catch (err: any) {
          console.error('Error fetching NEAR balance:', err);
          setNearBalance('Error');
        }
      }
    
      // Handle connect/disconnect
      async function handleConnect() {
        modal?.show();
      }
    
      async function handleDisconnect() {
        try {
          const wallet = await selector?.wallet();
          await wallet?.signOut();
          setAccountId(null);
          setContract(null);
        } catch (err: any) {
          console.error('Error disconnecting:', err);
          setError(`Failed to disconnect: ${err.message}`);
        }
      }

      function formatBalance(balance: string, decimals: number = 18): string {
        try {
          const fullNumber = BigInt(balance);
          const divisor = BigInt(10 ** decimals);
          const integerPart = fullNumber / divisor;
          const fractionalPart = fullNumber % divisor;
          
          let formatted = integerPart.toString();
          if (fractionalPart > 0) {
            const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
            // Trim trailing zeros
            const trimmed = fractionalStr.replace(/0+$/, '');
            if (trimmed.length > 0) {
              formatted += '.' + trimmed;
            }
          }
          
          // Limit to max 6 decimal places for display
          if (formatted.includes('.')) {
            const [int, dec] = formatted.split('.');
            formatted = `${int}.${dec.slice(0, 6)}`;
          }
          
          return formatted;
        } catch (err) {
          console.error('Error formatting balance:', err);
          return balance;
        }
      }
    
      // Handle transactions
      /* async function handleTransfer() {
        if (!contract || !accountId || !receiverId || !amount) return;
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {

            if (parseFloat(amount) < 0){
                throw new Error('Amount must be greater than 0');
            }
            console.log('Initiating transfer:', {receiverId, amount});

          const result = await contract.ft_transfer({
            receiver_id: receiverId,
            amount: amount,
            memo: 'Transfer from web interface'
          });

          console.log('Transfer result', result);

          await new Promise(resolve => setTimeout(resolve, 1000));

          await fetchTokenInfo(contract, accountId);
          await fetchNearBalance(selector, accountId);


          setSuccess('Transfer successful!');
          setReceiverId('');
          setAmount('');
        } catch (err: any) {
          console.error('Transfer error:', err);
          setError(err.message || ' Transfer failed. Please Retry');
        } finally {
          setIsLoading(false);
        }
      } */



async function handleTransfer() {
  if (!contract || !accountId || !receiverId || !amount) return;
  setIsLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // Convert input amount to token decimal format
    const tokenAmount = parseTokenAmount(amount, metadata?.decimals || 18);
    
    // Check balance
    const currentBalance = BigInt(balance);
    const transferAmount = BigInt(tokenAmount);
    if (transferAmount > currentBalance) {
      setError('Insufficient balance');
      return;
    }

    console.log('Initiating transfer:', { receiverId, amount: tokenAmount });

    const result = await contract.ft_transfer({
      receiver_id: receiverId,
      amount: tokenAmount,
      memo: 'Transfer from web interface'
    });

    console.log('Transfer result:', result);

    // Wait for transaction to be mined
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Refresh balances
    await fetchTokenInfo(contract, accountId);
    await fetchNearBalance(selector, accountId);
    
    setSuccess('Transfer successful! Transaction has been confirmed.');
    setReceiverId('');
    setAmount('');
  } catch (err: any) {
    console.error('Transfer error:', err);
    setError(err.message || 'Transfer failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
}

function validateAmount(value: string) {
    try {
      if (!value) {
        setAmountError(null);
        return;
      }
      
      const tokenAmount = parseTokenAmount(value, metadata?.decimals || 18);
      const currentBalance = BigInt(balance);
      const transferAmount = BigInt(tokenAmount);
      
      if (transferAmount > currentBalance) {
        setAmountError('Exceeded Balance');
      } else {
        setAmountError(null);
      }
    } catch (err) {
      setAmountError('Invalid amount');
    }
  }
  

    
      async function handleApprove() {
        if (!contract || !accountId || !spenderId || !approvalAmount) return;
        setIsLoading(true);
        setError(null);
        try {
          await contract.ft_approve({
            spender_id: spenderId,
            amount: approvalAmount
          });
          setSuccess('Approval successful!');
          setSpenderId('');
          setApprovalAmount('');
        } catch (err: any) {
          console.error('Approval error:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    
      async function handleBurn() {
        if (!contract || !accountId || !burnAmount) return;
        setIsLoading(true);
        setError(null);
        try {
          await contract.ft_burn({
            amount: burnAmount
          });
          setSuccess('Burn successful!');
          await fetchTokenInfo(contract, accountId);
          setBurnAmount('');
        } catch (err: any) {
          console.error('Burn error:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    
      async function handleBatchTransfer() {
        if (!contract || !accountId || batchTransfers.some(t => !t.receiver_id || !t.amount)) return;
        setIsLoading(true);
        setError(null);
        try {
          await contract.ft_batch_transfer({
            transfers: batchTransfers
          });
          setSuccess('Batch transfer successful!');
          await fetchTokenInfo(contract, accountId);
          setBatchTransfers([{ receiver_id: '', amount: '', memo: '' }]);
        } catch (err: any) {
          console.error('Batch transfer error:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    
      // Batch transfer helpers
      function updateBatchTransfer(index: number, field: 'receiver_id' | 'amount', value: string) {
        setBatchTransfers(transfers => 
          transfers.map((t, i) => 
            i === index ? { ...t, [field]: value } : t
          )
        );
      }
    
      function addBatchTransfer() {
        setBatchTransfers(transfers => [...transfers, { receiver_id: '', amount: '', memo: '' }]);
      }
    
      // Initialize on mount
      useEffect(() => {
        initNear();
      }, []);

      function parseTokenAmount(amount: string, decimals: number = 18): string {
        try {
          // Remove any commas from the input
          const cleanAmount = amount.replace(/,/g, '');
          // Convert to number and check if valid
          const numberAmount = parseFloat(cleanAmount);
          if (isNaN(numberAmount)) throw new Error('Invalid amount');
          if (numberAmount <= 0) throw new Error('Amount must be greater than 0');
          
          // Convert to token decimal format
          const multiplier = BigInt(10 ** decimals);
          const bigIntAmount = BigInt(Math.floor(numberAmount * (10 ** decimals)));
          return bigIntAmount.toString();
        } catch (err) {
          throw new Error('Invalid amount format');
        }
      }
      
      function formatDisplayBalance(balance: string, decimals: number = 18): string {
        const balanceBig = BigInt(balance);
        const divisor = BigInt(10 ** decimals);
        const integerPart = balanceBig / divisor;
        const fractionalPart = balanceBig % divisor;
        
        let formatted = integerPart.toString();
        if (fractionalPart > 0) {
          const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
          const trimmed = fractionalStr.replace(/0+$/, '');
          if (trimmed.length > 0) {
            formatted += '.' + trimmed;
          }
        }
        return formatted;
      }

      // Your existing JSX return remains the same
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
                <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">Token Balance</div>
                  <div className="text-xl font-bold truncate" title={balance}>
                  {/* {metadata.icon} */}
                    {metadata ?  formatBalance(balance, metadata.decimals) : '0'} {metadata?.symbol || 'TOKEN'}
                  </div>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="text-sm text-gray-400">NEAR Balance</div>
                  <div className="text-xl font-bold truncate" title={nearBalance}>
                    {parseFloat(nearBalance).toFixed(2)} Ⓝ
                  </div>
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
  {isLoading ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Processing Transfer...</span>
    </>
  ) : (
    <>
      <Send className="h-5 w-5" />
      <span>Transfer</span>
    </>
  )}
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
                          value={transfer.receiver_id}
                          onChange={(e) => updateBatchTransfer(index, 'receiver_id', e.target.value)}
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
                      disabled={isLoading || batchTransfers.some(t => !t.receiver_id || !t.amount)}
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