import { useQuery, gql } from "@apollo/client";

// source: https://thegraph.com/studio/subgraph/nft-marketplace/
// source: https://api.studio.thegraph.com/query/32189/nft-marketplace/v0.0.2

const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(
      first: 5
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default function GraphExample() {
  const { data, loading, error } = useQuery(GET_ACTIVE_ITEMS);
  console.log(data);
  return (
    <div>
      <br />
      <div>
        <b>GraphQL example:</b>
      </div>
      <hr />
      <br />
      <ul>
        {loading
          ? "<li>Loading...</li>"
          : data.activeItems.map((d) => (
              <li key={d.id}>
                Token ID: {d.tokenId} <br />
                NFT Address: {d.nftAddress} <br />
                Seller: {d.seller} <br />
                Price: {d.price} <br />
                Buyer: {d.buyer} <br />
                ID: {d.id} <br />
                <br />
              </li>
            ))}
      </ul>
    </div>
  );
}

// yarn dev
// http://localhost:3000/graphExample
