const CONTRACT_ADDRESS = "0x83e4F529Eaccb2b6685C62428261d0AFF6b41aCC";
const CONTRACT_ABI =[
	{
		"inputs": [],
		"name": "increment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newCount",
				"type": "uint256"
			}
		],
		"name": "setCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "count",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider;
let signer;
let contract;

// UI elements
const connectButton = document.getElementById("connectButton");
const accountDisplay = document.getElementById("accountDisplay");
const getCountButton = document.getElementById("getCountButton");
const countValue = document.getElementById("countValue");
const incrementButton = document.getElementById("incrementButton");
const setCountButton = document.getElementById("setCountButton");
const newCountInput = document.getElementById("newCountInput");
const status = document.getElementById("status");
const networkDisplay = document.getElementById("networkDisplay");

function setStatus(text, isError = false) {
  if (status) status.textContent = text;
  console.log((isError ? "ERROR: " : "STATUS: ") + text);
}

function extractErrorMessage(err) {
  // Try multiple known shapes for ethers/provider errors
  try {
    if (!err) return 'Unknown error object';
    if (typeof err === 'string') return err;
    if (err.reason) return err.reason;
    if (err.error && err.error.message) return err.error.message;
    if (err.data && err.data.message) return err.data.message;
    if (err.message) return err.message;
    // Some providers wrap revert reason in err.body or err.response
    if (err.body) {
      try {
        const body = JSON.parse(err.body);
        if (body && body.error && body.error.message) return body.error.message;
      } catch (e) {}
    }
    return JSON.stringify(err);
  } catch (e) {
    return 'Failed to parse error';
  }
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask!");
    return;
  }

  try {
    setStatus('Requesting accounts...');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts && accounts[0];
    accountDisplay.textContent = account ? `Connected: ${account}` : 'Connected: (no account)';
    // Ethers v6: BrowserProvider
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // show network
    try {
      const network = await provider.getNetwork();
    if (networkDisplay) networkDisplay.textContent = `Network: ${network.name} (chainId ${network.chainId})`;
      console.log('Connected network', network);
    } catch (e) {
      console.warn('Could not read network:', e);
    }

    // Create contract with signer so we can send transactions
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log('Contract instance created:', contract.address);

    setStatus('Wallet connected and contract ready.');
  } catch (err) {
    console.error('connectWallet error', err);
    setStatus('Error connecting wallet: ' + extractErrorMessage(err), true);
  }
}

function ensureContractMethod(name) {
  if (!contract) return false;
  // ethers v6 may expose functions under contract[name]
  const fn = contract[name];
  return typeof fn === 'function';
}

async function getCount() {
  if (!contract) {
    alert('Connect your wallet first.');
    return;
  }

  if (!ensureContractMethod('getCount') && !ensureContractMethod('count')) {
    setStatus('Contract does not have getCount/count methods (ABI mismatch).', true);
    console.error('ABI or contract address appears incorrect. ABI methods available:', Object.keys(contract));
    return;
  }

  try {
    // prefer getCount if available
    const value = ensureContractMethod('getCount') ? await contract.getCount() : await contract.count();
    // value could be BigInt-like or ethers.BigNumber (v5) or bigint (v6)
    const asString = (value && value.toString) ? value.toString() : String(value);
    countValue.textContent = asString;
    setStatus('Fetched current count: ' + asString);
  } catch (err) {
    console.error('getCount error', err);
    setStatus('Error fetching count: ' + extractErrorMessage(err), true);
  }
}

async function increment() {
  if (!contract) {
    alert('Connect your wallet first.');
    return;
  }

  if (!ensureContractMethod('increment')) {
    setStatus('Contract does not have increment() method (ABI mismatch).', true);
    console.error('ABI mismatch - available contract keys:', Object.keys(contract));
    return;
  }

  try {
    console.log('Calling increment()...');
    const tx = await contract.increment();
    console.log('Transaction object returned:', tx);
    setStatus('Transaction sent. Tx hash: ' + (tx.hash || '(no-hash)'));

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction receipt:', receipt);
    if (receipt.status === 0) {
      setStatus('Transaction failed (status 0). Check explorer and console for details.', true);
    } else {
      setStatus('Increment successful! Tx confirmed.');
      await getCount();
    }
  } catch (err) {
    console.error('increment error', err);
    setStatus('Error incrementing: ' + extractErrorMessage(err), true);
  }
}

async function setCount() {
  if (!contract) {
    alert('Connect your wallet first.');
    return;
  }

  if (!ensureContractMethod('setCount')) {
    setStatus('Contract does not have setCount(uint256) method (ABI mismatch).', true);
    console.error('ABI mismatch - available contract keys:', Object.keys(contract));
    return;
  }

  const newValue = newCountInput.value;
  if (newValue === "") {
    alert('Enter a value first.');
    return;
  }

  // basic validation
  if (!/^-?\d+$/.test(newValue)) {
    alert('Enter a valid integer value.');
    return;
  }

  try {
    console.log('Calling setCount with', newValue);
    const tx = await contract.setCount(BigInt(newValue));
    setStatus('Transaction sent. Tx hash: ' + (tx.hash || '(no-hash)'));
    const receipt = await tx.wait();
    console.log('setCount receipt:', receipt);
    if (receipt.status === 0) {
      setStatus('Transaction failed (status 0).', true);
    } else {
      setStatus('Set count successful!');
      await getCount();
    }
  } catch (err) {
    console.error('setCount error', err);
    setStatus('Error setting count: ' + extractErrorMessage(err), true);
  }
}

// Attach event listeners (safely)
if (connectButton) connectButton.addEventListener('click', connectWallet);
if (getCountButton) getCountButton.addEventListener('click', getCount);
if (incrementButton) incrementButton.addEventListener('click', increment);
if (setCountButton) setCountButton.addEventListener('click', setCount);

// Helpful: auto-detect provider presence and log
console.log('Script loaded. window.ethereum present?', !!window.ethereum);
if (window.ethereum) {
  console.log('isMetaMask?', window.ethereum.isMetaMask);
  window.ethereum.on && window.ethereum.on('accountsChanged', (accounts) => {
    console.log('accountsChanged event:', accounts);
    if (accounts && accounts[0]) {
  accountDisplay.textContent = `Connected: ${accounts[0]}`;
} else {
  accountDisplay.textContent = 'Not connected';
}
  });
  window.ethereum.on && window.ethereum.on('chainChanged', (chainId) => {
    console.log('chainChanged event:', chainId);
    // reload to reset provider/contract under new chain
    try { if (networkDisplay) networkDisplay.textContent = 'Chain changed: ' + chainId; } catch(e){}
  });
}