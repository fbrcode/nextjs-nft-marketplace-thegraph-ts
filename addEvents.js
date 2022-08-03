const Moralis = require('moralis/node');
require('dotenv').config();

// read contract information from constants
// right now, just localhost
const contract = require(`./constants/localhost/NftMarketplace.json`);
// define constants only for local right, now
// moralis understands that 31337 is 1337
const moralisChainId = process.env.MORALIS_LOCAL_CHAIN_ID || 1337;

const serverUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL;
const appId = process.env.NEXT_PUBLIC_MORALIS_APP_ID;
const masterKey = process.env.MORALIS_MASTER_KEY;

async function main() {
  console.log(`Starting Moralis server: ${serverUrl}... 🚀`);
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log(`Working with contract: ${contract.address}`);
  // add events functionality
  // https://docs.moralis.io/moralis-dapp/connect-the-sdk/connect-using-node#add-new-event-sync-from-code

  // for each event we want to listen to, we'll define a config object
  let itemListedOptions = {
    chainId: moralisChainId,
    address: contract.address,
    sync_historical: true,
    topic: 'ItemListed(address,address,uint256,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
      ],
      name: 'ItemListed',
      type: 'event',
    },
    tableName: 'ItemListed',
  };

  let itemBoughtOptions = {
    chainId: moralisChainId,
    address: contract.address,
    sync_historical: true,
    topic: 'ItemBought(address,address,uint256,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'buyer',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'price',
          type: 'uint256',
        },
      ],
      name: 'ItemBought',
      type: 'event',
    },
    tableName: 'ItemBought',
  };

  let itemCancelledOptions = {
    chainId: moralisChainId,
    address: contract.address,
    sync_historical: true,
    topic: 'ItemCancelled(address,address,uint256)',
    abi: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nftAddress',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256',
        },
      ],
      name: 'ItemCancelled',
      type: 'event',
    },
    tableName: 'ItemCancelled',
  };

  const listedResponse = await Moralis.Cloud.run('watchContractEvent', itemListedOptions, {
    useMasterKey: true,
  });

  const boughtResponse = await Moralis.Cloud.run('watchContractEvent', itemBoughtOptions, {
    useMasterKey: true,
  });

  const cancelledResponse = await Moralis.Cloud.run('watchContractEvent', itemCancelledOptions, {
    useMasterKey: true,
  });

  if (listedResponse.success) {
    console.log('✅ ItemListed event added successfully to the database!');
  } else {
    console.log('❌ ItemListed event failed to add to the database!');
  }

  if (boughtResponse.success) {
    console.log('✅ ItemBought event added successfully to the database!');
  } else {
    console.log('❌ ItemBought event failed to add to the database!');
  }

  if (cancelledResponse.success) {
    console.log('✅ ItemCancelled event added successfully to the database!');
  } else {
    console.log('❌ ItemCancelled event failed to add to the database!');
  }
}

main()
  .then(() => {
    console.log('Events updated! 🎉');
  })
  .catch((err) => {
    console.error(err);
  });
