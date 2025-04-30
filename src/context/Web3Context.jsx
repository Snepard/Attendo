import { createContext, useContext, useState, useEffect } from 'react';
import { connectWallet, saveWalletAddress, hasConnectedWallet } from '../utils/web3Utils';
import { useAuth } from './AuthContext';
import { ethers } from 'ethers';

const Web3Context = createContext();

export function useWeb3() {
  return useContext(Web3Context);
}

export function Web3Provider({ children }) {
  const { user, profile, updateProfile } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [provider, setProvider] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected in profile
  useEffect(() => {
    if (profile?.wallet_address) {
      setWalletAddress(profile.wallet_address);
      // Initialize provider
      if (window.ethereum) {
        setProvider(new ethers.BrowserProvider(window.ethereum));
      }
    }
  }, [profile]);

  // Connect wallet function
  const connectUserWallet = async () => {
    if (!user) {
      setError('Please log in to connect your wallet');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Connect to MetaMask
      const { address, provider: newProvider } = await connectWallet();
      
      // Save wallet address to user profile
      await saveWalletAddress(user.id, address);
      
      // Update local state
      setWalletAddress(address);
      setProvider(newProvider);
      
      // Update profile context
      updateProfile({ wallet_address: address });
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Check if wallet is connected
  const isWalletConnected = () => {
    return !!walletAddress;
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const value = {
    walletAddress,
    provider,
    isConnecting,
    error,
    connectWallet: connectUserWallet,
    isWalletConnected,
    formatAddress,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}