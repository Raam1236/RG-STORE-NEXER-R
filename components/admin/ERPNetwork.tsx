
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import database from '../../services/database';
import { firebaseConfig, saveERPConfig, clearERPConfig } from '../../services/firebaseConfig';

const ERPNetwork: React.FC = () => {
    const { showToast } = useAppContext();
    const [config, setConfig] = useState(firebaseConfig);
    const [isConnected, setIsConnected] = useState(database.isCloud);
    const [showConfigParams, setShowConfigParams] = useState(false);
    
    // For syncing other computers
    const [configString, setConfigString] = useState('');

    useEffect(() => {
        if (isConnected) {
            // Create a base64 string of the config to easily share
            const jsonStr = JSON.stringify(firebaseConfig);
            setConfigString(btoa(jsonStr));
        }
    }, [isConnected]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, [e.target.name]: e.target.value });
    };

    const handleConnect = () => {
        if (!config.apiKey || !config.projectId) {
            showToast("API Key and Project ID are required", "error");
            return;
        }
        
        if (window.confirm("Connecting to ERP Cloud will reload the application. Continue?")) {
            saveERPConfig(config);
            window.location.reload();
        }
    };

    const handleDisconnect = () => {
        if (window.confirm("Disconnecting will revert to Local Mode (Single Computer). Data on this device will be separate from the cloud. Continue?")) {
            clearERPConfig();
            window.location.reload();
        }
    };

    const handleImportString = () => {
        const input = prompt("Paste the ERP Configuration String from the Main Computer:");
        if (input) {
            try {
                const decoded = atob(input);
                const parsed = JSON.parse(decoded);
                saveERPConfig(parsed);
                alert("Configuration Loaded! App will restart to sync.");
                window.location.reload();
            } catch (e) {
                showToast("Invalid Configuration String", "error");
            }
        }
    };

    return (
        <div className="animate-fade-in-down">
            <h1 className="text-3xl font-bold text-on-surface mb-6">ERP & Network Sync</h1>
            
            {/* Status Banner */}
            <div className={`p-6 rounded-lg shadow-md mb-8 flex items-center justify-between ${isConnected ? 'bg-green-600 text-white' : 'bg-surface border-l-4 border-yellow-500'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isConnected ? 'bg-white/20' : 'bg-yellow-100'}`}>
                        <ServerIcon className={isConnected ? 'text-white' : 'text-yellow-600'} />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold ${isConnected ? 'text-white' : 'text-on-surface'}`}>
                            {isConnected ? 'ERP System Online' : 'Local Mode (Standalone)'}
                        </h2>
                        <p className={`text-sm ${isConnected ? 'text-green-100' : 'text-on-surface/70'}`}>
                            {isConnected 
                                ? 'Data is syncing in real-time across all connected terminals.' 
                                : 'Data is stored only on this computer. Connect to Cloud to sync multiple devices.'}
                        </p>
                    </div>
                </div>
                {isConnected && (
                    <button 
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow transition"
                    >
                        Disconnect
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Panel */}
                <div className="bg-surface p-8 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-on-surface">Connection Settings</h3>
                        {!isConnected && (
                             <button onClick={handleImportString} className="text-sm text-primary hover:underline">
                                 Have a code? Import here
                             </button>
                        )}
                    </div>

                    <div className="space-y-4">
                         {!isConnected ? (
                             <>
                                <p className="text-sm text-on-surface/70 mb-4">
                                    To connect more than 2 computers, enter your Firebase Project credentials below. 
                                    <br/>
                                    <span className="text-xs italic">Don't have one? Ask your developer for the "Firebase Config".</span>
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-on-surface uppercase mb-1">API Key</label>
                                        <input name="apiKey" value={config.apiKey} onChange={handleChange} className="w-full p-2 border border-on-surface/20 rounded bg-background text-on-surface" placeholder="AIza..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase mb-1">Project ID</label>
                                            <input name="projectId" value={config.projectId} onChange={handleChange} className="w-full p-2 border border-on-surface/20 rounded bg-background text-on-surface" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-on-surface uppercase mb-1">Auth Domain</label>
                                            <input name="authDomain" value={config.authDomain} onChange={handleChange} className="w-full p-2 border border-on-surface/20 rounded bg-background text-on-surface" />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowConfigParams(!showConfigParams)}
                                        className="text-xs text-on-surface/50 text-left hover:text-primary"
                                    >
                                        {showConfigParams ? '- Hide Advanced' : '+ Show Advanced Parameters'}
                                    </button>
                                    {showConfigParams && (
                                        <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-on-surface/10">
                                            <input name="storageBucket" value={config.storageBucket} onChange={handleChange} className="w-full p-2 border border-on-surface/20 rounded bg-background text-on-surface text-xs" placeholder="Storage Bucket" />
                                            <input name="messagingSenderId" value={config.messagingSenderId} onChange={handleChange} className="w-full p-2 border border-on-surface/20 rounded bg-background text-on-surface text-xs" placeholder="Messaging Sender ID" />
                                            <input name="appId" value={config.appId} onChange={handleChange} className="w-full p-2 border border-on-surface/20 rounded bg-background text-on-surface text-xs" placeholder="App ID" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6">
                                    <button onClick={handleConnect} className="w-full py-3 bg-primary text-white font-bold rounded hover:bg-indigo-600 transition shadow-lg">
                                        Save & Connect to ERP
                                    </button>
                                </div>
                             </>
                         ) : (
                             <div className="text-center py-8">
                                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                     <CloudIcon className="w-10 h-10 text-green-600" />
                                 </div>
                                 <h4 className="text-lg font-bold text-on-surface">Connection Active</h4>
                                 <p className="text-sm text-on-surface/60">Project: {config.projectId}</p>
                                 <p className="text-xs text-on-surface/40 mt-2">To change settings, disconnect first.</p>
                             </div>
                         )}
                    </div>
                </div>

                {/* Multi-Computer Setup Guide */}
                <div className="bg-surface p-8 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-on-surface mb-6">Connect Other Computers</h3>
                    
                    {isConnected ? (
                        <div className="space-y-6">
                            <p className="text-sm text-on-surface/80">
                                Copy the code below and paste it into the <b>"Import"</b> option on other computers to instantly sync them to this shop.
                            </p>
                            
                            <div className="bg-background p-4 rounded border border-on-surface/20 break-all font-mono text-xs text-on-surface/70 relative">
                                {configString}
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(configString); showToast("Copied to clipboard!"); }}
                                    className="absolute top-2 right-2 p-1 bg-surface border border-on-surface/20 rounded hover:bg-primary hover:text-white transition"
                                    title="Copy"
                                >
                                    <CopyIcon />
                                </button>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                <h4 className="font-bold text-blue-700 text-sm mb-1">Steps to add Computer #2, #3...</h4>
                                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                                    <li>Open RG Billing App on the new computer.</li>
                                    <li>Login as Admin -> Go to <b>ERP & Sync</b> tab.</li>
                                    <li>Click <b>"Have a code? Import here"</b>.</li>
                                    <li>Paste the code above.</li>
                                    <li>The app will restart and sync automatically!</li>
                                </ol>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                            <LockIcon className="w-12 h-12 mb-2" />
                            <p>Connect to ERP Cloud first to enable multi-computer syncing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ServerIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export default ERPNetwork;
