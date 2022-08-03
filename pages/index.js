import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";
import NFTBox from "../components/NFTBox";
import {
  loadDeployedNftMarketplaceContract,
  networkMapping,
} from "../constants";
import { useQuery } from "@apollo/client";
import { GET_ACTIVE_ITEMS } from "../constants/subGraphQueries";

export default function Home() {
  // How do we show recent listed NFTs?
  // We will index the events off-chain and then read from our database
  // We will set up a server to listen for those events to be fired,
  // and then we will add them to a database and query later.
  // Isn't that centralized? Moralis is centralized and The Graph is not.
  // Moralis Server: NFT Marketplace
  // https://admin.moralis.io/dapps/details/198884
  // https://docs.moralis.io/moralis-dapp/automatic-transaction-sync/smart-contract-events
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  // this is using Moralis Server implementation which we are replacing by TheGraph
  // const { data: listedNfts, isFetching: fetchingListedNfts } = useMoralisQuery(
  //   "ActiveItem", // TableName
  //   (query) => query.limit(10).descending("tokenId") // can also use .skip() for pagination
  // );

  // this is using TheGraph implementation (GraphQL)
  const chainId = parseInt(chainIdHex);
  const networkName = networkMapping[chainId];
  // console.log(`networkName: ${networkName}`);
  const nftMarketplaceContract =
    loadDeployedNftMarketplaceContract(networkName);
  // console.log(nftMarketplaceContract);

  // const marketplaceAddress = nftMarketplaceContract.address;
  const marketplaceAddress =
    nftMarketplaceContract?.address === undefined
      ? "0x"
      : nftMarketplaceContract.address;

  // const marketplaceAddress = "0xe088bD8Bb7e0aDcEB50D302bDF49763fD008ABBc";

  const { loading, error, data: listedNfts } = useQuery(GET_ACTIVE_ITEMS);

  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      <div className="flex flex-wrap">
        {isWeb3Enabled ? (
          loading || !listedNfts ? (
            <div>Loading...</div>
          ) : (
            listedNfts.activeItems.map((nft) => {
              // console.log(nft);
              const { nftAddress, tokenId, price, seller } = nft;
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
