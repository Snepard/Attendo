import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { TELOS_NETWORK } from '../utils/web3Utils';

const WalletConnect = () => {
  const { walletAddress, connectWallet, isConnecting, error, formatAddress } = useWeb3();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const copyAddressToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Telos Testnet Identity</h3>
      
      {walletAddress ? (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="mr-2">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Telos Testnet Wallet Connected</p>
              <div className="relative">
                <button 
                  onClick={copyAddressToClipboard}
                  className="text-xs text-gray-500 flex items-center hover:text-primary-500 transition"
                >
                  {formatAddress(walletAddress)}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                {showTooltip && (
                  <div className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-3 text-sm text-green-700">
            <p>Your attendance is secured on the Telos Testnet blockchain.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your MetaMask wallet to the Telos Testnet network to verify your identity and secure your attendance records.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-700">
            <p>Network: {TELOS_NETWORK.chainName}</p>
            <p>Currency: {TELOS_NETWORK.nativeCurrency.symbol}</p>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn btn-primary w-full flex items-center justify-center"
          >
            {isConnecting ? 'Connecting...' : (
              <>
                <span className="mr-2">Connect to Telos Testnet</span>
                <svg width="20" height="20" viewBox="0 0 33 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M31.1114 1L18.6025 10.1521L20.9593 4.79333L31.1114 1Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.53174 1L14.9334 10.2339L12.6838 4.79333L2.53174 1Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M26.6186 22.1351L23.2504 27.115L30.3387 29.0257L32.3674 22.2579L26.6186 22.1351Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1.2872 22.2579L3.31596 29.0257L10.4042 27.115L7.03604 22.1351L1.2872 22.2579Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
          
          {error && <p className="text-error-500 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;