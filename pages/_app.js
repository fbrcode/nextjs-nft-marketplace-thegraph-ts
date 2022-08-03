import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";
import Head from "next/head";
import { NotificationProvider } from "web3uikit";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

// source: https://thegraph.com/studio/subgraph/nft-marketplace/
// source: https://api.studio.thegraph.com/query/32189/nft-marketplace/v0.0.2
// uri is used as a gateway to the graphql server and query decentralized data
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.studio.thegraph.com/query/32189/nft-marketplace/v0.0.2",
});

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* connect the application to the Moralis server */}
      <MoralisProvider initializeOnMount={false}>
        <ApolloProvider client={client}>
          <NotificationProvider>
            <Header />
            <Component {...pageProps} />
          </NotificationProvider>
        </ApolloProvider>
      </MoralisProvider>
    </div>
  );
}

export default MyApp;
