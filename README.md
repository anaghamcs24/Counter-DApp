# Counter-DApp
A minimal decentralized application (DApp) frontend that interacts with a deployed Counter smart contract. The UI allows users to connect a wallet, read the current counter value, increment the counter, and set the counter to a specific number. The frontend is built as a single-page static site (HTML/CSS/JS) using ethers v6 for blockchain interactions.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Features :

* Connect MetaMask (or any injected window.ethereum provider)

* Read current counter value (getCount() / count())

* increment() the counter (transaction)

* setCount(uint256) to set an exact value (transaction)

* Error extraction and friendly status messages

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Steps to deploy the smart contract (using Remix) : 

These steps assume you have the Solidity contract code for the counter (simple uint256 count; function increment() public, etc.).

1.  Open https://remix.ethereum.org in your browser.

2.  Create a new file Counter.sol and paste your contract code.

3.  In Remix, select the Solidity Compiler tab and choose a compiler version compatible with your contract (e.g., ^0.8.0). Click Compile.

4.  Switch to the Deploy & Run Transactions tab.

    *  Environment: choose Injected Provider - MetaMask if you want to deploy to a testnet via MetaMask. Make sure MetaMask is set to the target testnet (Hoodi Testnet or other).

    *  Account: your deployment account from MetaMask.

5.  Deploy the contract by clicking Deploy. Confirm the transaction in MetaMask.

6.  After the transaction confirms, copy the deployed contract address from Remix's Deployed Contracts section.

7.  Update app.js (if necessary) with the deployed contract address and ABI.

Notes:

  *  If deploying to a custom testnet (Hoodi), you may need to add the network to MetaMask first (RPC URL, chain ID, currency, explorer URL).

  *  Keep the ABI (from the compiled contract) and the contract address - these are required by the frontend.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Steps to run the frontend (locally) : 

1.  Place index.html, style.css, and app.js in a single folder (repo root recommended).

2.  Serve the folder with a static server (recommended; some wallet providers block file://):

    *  Using Node: npx http-server (then open http://localhost:8080) or

    *  Using Python: python -m http.server 8000 (then open http://localhost:8000).

3.  Open the served URL in Chrome/Edge and ensure MetaMask is installed.

4.  Switch MetaMask to the Hoodi Testnet (or the network where the contract is deployed).

5.  Click Connect Wallet, then use Get Current Count, Increment, or Set Count.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Contract address & test network

  *  Contract address: 0x83e4F529Eaccb2b6685C62428261d0AFF6b41aCC

  *  Test network used: Hoodi Testnet

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Screenshots : 

<img width="617" height="871" alt="image" src="https://github.com/user-attachments/assets/0460af82-feb4-403e-862f-05754b18252d" />

