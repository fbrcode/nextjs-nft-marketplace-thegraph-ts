import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { useMoralisQuery, useMoralis } from 'react-moralis';
import NFTBox from '../components/NFTBox';

export default function Home() {
  // How do we show recent listed NFTs?
  // We will index the events off-chain and then read from our database
  // We will set up a server to listen for those events to be fired,
  // and then we will add them to a database and query later.
  // Isn't that centralized? Moralis is centralized and The Graph is not.
  // Moralis Server: NFT Marketplace
  // https://admin.moralis.io/dapps/details/198884
  // https://docs.moralis.io/moralis-dapp/automatic-transaction-sync/smart-contract-events
  const { isWeb3Enabled } = useMoralis();
  const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
    'ActiveItem', // TableName
    (query) => query.limit(10).descending('tokenId') // can also use .skip() for pagination
  );

  const myKey = 12345;

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          fetchingListedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.map((nft) => {
              // console.log(`NFT Attributes:`);
              // console.log(nft.attributes);
              const { marketplaceAddress, nftAddress, tokenId, price, seller } = nft.attributes;
              const key = nftAddress.toString() + tokenId.toString();
              // console.log(`Key: ${key}`);
              // marketplaceAddress: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
              // nftAddress: "0x5fbdb2315678afecb367f032d93f642f64180aa3"
              // price: "100000000000000000"
              // seller: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
              // tokenId: "1"
              return (
                <div>
                  <NFTBox
                    key={key}
                    marketplaceAddress={marketplaceAddress}
                    nftAddress={nftAddress}
                    tokenId={tokenId}
                    price={price}
                    seller={seller}
                  />
                </div>
              );
            })
          )
        ) : (
          <div>Web3 Currently Not Enabled</div>
        )}
      </div>
    </div>
  );
}
