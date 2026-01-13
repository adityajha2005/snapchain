# Snapchain:Solana Smart Contracts

[![Next.js](https://img.shields.io/badge/Next.js-14.0+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-1.16+-blue?style=flat&logo=solana)](https://solana.com/)

**Snapchain** is a full-stack Web3 platform combining a no-code smart contract builder with a Next.js frontend for Solana blockchain applications. Create and deploy production-ready dApps without writing Rust code.


## 🌟 Snapchain Features

- **Visual Contract Builder**: Drag-and-drop interface for Solana programs
- **Cross-Chain Ready**: Built-in support for Polkadot and NEAR ecosystems
- **One-Click Deployment**: Direct to Solana devnet/mainnet from UI
- **Wallet SDK**: Integrated Phantom, Solflare, and Ledger support
- **Template Contracts**: Marketplace, NFT, DAO, and DeFi starters

## ⚡ Getting Started

### Prerequisites

- Node.js 18+ & npm 9+
- Solana CLI (`brew install solana-cli`)
- Phantom Wallet (Browser Extension)

### Installation

1. Clone the Snapchain repository:

```bash
git clone https://github.com/https://github.com/adityajha2005/snapchain.git

cd snapchain
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment:

```bash
cp .env.example .env.local
```

Add your credentials:

```env
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SNAPCHAIN_API_KEY=your_api_key_here
```

## 🛠️ Snapchain Workflow

1. **Build Contracts Visually**

   - Drag blockchain components (Tokens, NFTs, Governance)
   - Export as Solana Program (Anchor-compatible)

2. **Deploy Contracts**

```bash
# Using Snapchain CLI
snapchain deploy ./contracts/my_dapp.json --network devnet

# Or via dashboard interface
```

3. **Integrate with Frontend**

```typescript
// src/config/snapchain.ts
export const SNAPCHAIN_CONTRACTS = {
  NFT_MARKETPLACE: process.env.NEXT_PUBLIC_NFT_CONTRACT!,
  TOKEN_FACTORY: process.env.NEXT_PUBLIC_TOKEN_CONTRACT!,
};
```

## 📂 Architecture

```
snapchain-dapp/
├── contracts/            # Visual contract JSON blueprints
├── snapchain/            # Auto-generated SDK
│   ├── programs/         # Anchor-compatible Rust code
│   └── client/           # TypeScript client library
├── src/
│   ├── app/              # Next.js 14 app router
│   ├── components/       # Snapchain UI Kit
│   ├── providers/        # Web3 & Wallet context
│   └── lib/              # Blockchain utilities
└── public/               # Snapchain web assets
```

## 🖥️ Frontend Integration

### Connect Wallet

```typescript
import { useSnapchain } from "@snapchain/react";

const { connectWallet, connectedAddress } = useSnapchain();

return (
  <button onClick={connectWallet}>
    {connectedAddress ? truncateAddress(connectedAddress) : "Connect"}
  </button>
);
```

### Execute Contract Method

```typescript
const { execute } = useSnapchainContract("TOKEN_MINT");

const handleMint = async () => {
  const result = await execute("mintTo", {
    recipient: connectedAddress,
    amount: 100,
  });

  if (result.success) {
    toast.success("Tokens minted!");
  }
};
```

## 📈 Deploy to Production

1. Build production bundle:

```bash
npm build
```

2. Deploy to mainnet:

```bash
snapchain deploy --network mainnet-beta
```

3. Host frontend:

```bash
npm run dev
```

## 📄 License

Snapchain is open-source software licensed under the [MIT License](LICENSE).

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on how to get involved.

## 📜 Disclaimer

This project is for educational purposes only. Use at your own risk. Snapchain is not responsible for any losses or damages incurred.
