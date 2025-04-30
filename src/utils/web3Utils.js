import { ethers } from 'ethers';
import { supabase } from './supabaseClient';

// Telos EVM Testnet Network Configuration
export const TELOS_NETWORK = {
  chainId: '0x29',  // 41 in decimal
  chainName: 'Telos EVM Testnet',
  nativeCurrency: {
    name: 'TLOS',
    symbol: 'TLOS',
    decimals: 18
  },
  
  rpcUrls: ['https://rpc.testnet.telos.net'],
  blockExplorerUrls: ['https://testnet.teloscan.io/']
};

// Check if MetaMask is available
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Switch to Telos network
export const switchToTelosNetwork = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Try to switch to the Telos network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: TELOS_NETWORK.chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: TELOS_NETWORK.chainId,
            chainName: TELOS_NETWORK.chainName,
            nativeCurrency: TELOS_NETWORK.nativeCurrency,
            rpcUrls: TELOS_NETWORK.rpcUrls,
            blockExplorerUrls: TELOS_NETWORK.blockExplorerUrls
          }],
        });
      } catch (addError) {
        console.error('Error adding Telos network:', addError);
        throw new Error('Failed to add Telos network to MetaMask');
      }
    } else {
      console.error('Error switching to Telos network:', switchError);
      throw new Error('Failed to switch to Telos network');
    }
  }
};

// Request MetaMask connection
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Switch to Telos network first
    await switchToTelosNetwork();
    
    // Request account access
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    
    // Get chain ID
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
    // Verify we're on Telos Testnet
    if (chainId.toString() !== '41') {
      throw new Error('Please switch to the Telos Testnet network');
    }
    
    return { 
      address, 
      chainId: chainId.toString(),
      provider 
    };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

// Save wallet address to user profile
export const saveWalletAddress = async (userId, walletAddress) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ wallet_address: walletAddress })
    .eq('id', userId);
  
  return { data, error };
};

// Check if user has connected wallet
export const hasConnectedWallet = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('wallet_address')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
  
  return !!data?.wallet_address;
};