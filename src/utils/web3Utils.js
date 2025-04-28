import { ethers } from 'ethers';
import { supabase } from './supabaseClient';

// Check if MetaMask is available
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Request MetaMask connection
export const connectWallet = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    
    // Get chain ID
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    
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