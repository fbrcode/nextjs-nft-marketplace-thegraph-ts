# NextJS NFT Marketplace (Moralis)

This project is the frontend part of a web3 fullstack implementation to buy and sell NFTs.

## Project instructions

1. Home Page:
   1. Show recently listed NFTs ✅
      1. If you own the NFT, you can update the listing ✅
      2. If not, you can buy the listing ✅
2. Sell Page:
   1. You can list your NFT in the Marketplace ✅
   2. Withdraw proceeds

## Init

`yarn create next-app .`

### Install wallet connection dependencies

`yarn add web3uikit moralis react-moralis`

#### !!Attention

Some newer packages can break your app with **Module no found: `Can't resolve web3kitui`**

Here is package listing that works:

```json
{
  "dependencies": {
    "moralis": "^1.5.11",
    "next": "12.1.5",
    "react": "18.1.0",
    "react-dom": "18.1.0",
    "react-moralis": "^1.3.5",
    "web3uikit": "^0.0.133"
  }
}
```

## Formatting

Tailwind with NextJS: <https://tailwindcss.com/docs/guides/nextjs>

- `yarn add --dev tailwindcss postcss autoprefixer`
- `yarn tailwindcss init -p`

## Moralis Server

Handling events for a Dapp.

Register user/server and link the app with the server in **`_app.js`**:

```js
<MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
```

Docs:

- <https://admin.moralis.io/dapps/details/198884>
- <https://docs.moralis.io/moralis-dapp/automatic-transaction-sync/smart-contract-events>

How to listen for events?

1. Connect the server to our blockchain.
2. Which contract, which events, and what to do when it hears those events.

Use moralis reverse proxy to connect the local chain to the Moralis server.

- <https://github.com/fatedier/frp/releases>

On Mac Apple Silicon use: \*frp\_?_darwin_arm64.tar.gz

Example: <https://github.com/fatedier/frp/releases/download/v0.44.0/frp_0.44.0_darwin_arm64.tar.gz>

### CLI Setup

On **Devchain Proxy Server** get the configuration for `hardhat`

### Run

Run on command line with: `./frpc -c frpc.ini`

## Better option: Moralis Admin CLI

Reference: <https://docs.moralis.io/moralis-dapp/tools/moralis-admin-cli>

Use moralis admin cli to manage server connection to local blockchain.

Install: `yarn add --dev moralis-admin-cli`

To see the options, run: `yarn moralis-admin-cli`

### Package run setup

Create a command line option in `package.json` to link the local chain with moralis server.

```json
"moralis:sync": "moralis-admin-cli connect-local-devchain --chain hardhat --moralisSubdomain vqac57rjwq7.usemoralis.com --frpcPath ./frp_0440/frpc"
```

It will use FRP and start listening for blockchain events.

Now we need to tell which events we want to keep watching with `addEvents.js`. With the packages:

`yarn add --dev dotenv`

Example: <https://docs.moralis.io/moralis-dapp/connect-the-sdk/connect-using-node>

After running `node ./addEvents.js`, we should be able to see the database updated with the events listening being recorded:

- <https://rvqac57rjwq7.usemoralis.com:2083/apps/moralisDashboard/browser/_EventSyncStatus>

## Moralis cloud functions

Reference: <https://docs.moralis.io/moralis-dapp/cloud-code/cloud-functions>

Create a script to run on the server side when we need to.

Example: `./cloudFunctions/updateActiveItems.js`

Keep the Cloud function running with `yarn moralis:cloud` command.

For our use-case, the cloud function whenever one of the 3 event call are synced in the database.

With a new table `ActiveItem` to manage which NFT items are active.

## Moralis Queries

Allow to perform queries on moralis databases:

Reference: <https://docs.moralis.io/moralis-dapp/database/queries>
