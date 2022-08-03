import { useEffect, useState } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import Image from 'next/image';
import { Card, useNotification } from 'web3uikit';
import { ethers } from 'ethers';
import {
  loadDeployedNftMarketplaceContract,
  loadDeployedBasicNftContract,
  networkMapping,
} from '../constants';
import UpdateListingModal from './UpdateListingModal';

const truncateAddress = (address, desiredLength) => {
  if (address.length <= desiredLength) {
    return address;
  }
  const separator = '...';
  const charsToShow = desiredLength - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    address.substring(0, frontChars) + separator + address.substring(address.length - backChars)
  );
};

export default function NFTBox({ marketplaceAddress, nftAddress, tokenId, price, seller }) {
  const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis();
  const [imageURI, setImageURI] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const hideModal = () => setShowModal(false);
  const dispatch = useNotification();

  const chainId = parseInt(chainIdHex);
  const networkName = networkMapping[chainId];
  // console.log(`NFTBox: chainId: ${chainId}`);
  // console.log(`NFTBox: networkName: ${networkName}`);
  const basicNftContract = loadDeployedBasicNftContract(networkName);
  const basicNftAbi = basicNftContract.abi;

  const nftMarketplaceContract = loadDeployedNftMarketplaceContract(networkName);
  const nftMarketplaceAbi = nftMarketplaceContract.abi;

  // const fixedTokenId = ethers.BigNumber.from('0');
  // console.log(fixedTokenId);

  const optionsTokenURI = {
    abi: basicNftAbi,
    contractAddress: nftAddress,
    functionName: 'TOKEN_URI',
    params: {
      tokenId: tokenId,
    },
  };
  // console.log(optionsTokenURI);

  const { runContractFunction: getTokenURI } = useWeb3Contract(optionsTokenURI);

  const optionsBuyItem = {
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'buyItem',
    msgValue: price,
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
    },
  };

  const { runContractFunction: buyItem } = useWeb3Contract(optionsBuyItem);

  async function updateUI() {
    // get the token URI
    // using the image tag from the token URI, get the image
    const tokenURI = await getTokenURI({
      onError: (err) => console.log(err),
    });
    console.log(`Token URI ==> ${tokenURI}`);
    if (tokenURI) {
      // cheating to have more browser support :: use IPFS gateway instead,
      // which is a server the returns IPFS files from "normal" URL
      const requestURL = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      const response = await fetch(requestURL);
      const tokenUriResponse = await response.json();
      const imageURI = tokenUriResponse.image;
      const imageUriUrl = imageURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
      setImageURI(imageUriUrl);
      setTokenName(tokenUriResponse.name);
      setTokenDescription(tokenUriResponse.description);
      // other options could be:
      // - we could render the image on out server, and just call the server
      // - for testnets & mainnet we could use moralis server hooks
      // - have the world adopt IPFS :)
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  const isOwnedByUser = seller === account || seller === undefined;
  const formattedSellerAddress = isOwnedByUser ? 'you' : truncateAddress(seller, 15) || 'unknown';

  const handleCardClick = () => {
    isOwnedByUser
      ? setShowModal(true) // show the update listing modal
      : // call the buyItem function
        buyItem({
          onError: (err) => console.log(err),
          onSuccess: () => handleBuyItemSuccess(),
        });
  };

  const handleBuyItemSuccess = () => {
    dispatch({
      type: 'success',
      message: 'Item bought!',
      title: 'Item Bought',
      position: 'topR',
    });
  };

  return (
    <div>
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              marketplaceAddress={marketplaceAddress}
              nftAddress={nftAddress}
              onClose={hideModal}
            />
            <Card title={tokenName} description={tokenDescription} onClick={handleCardClick}>
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">Owned by {formattedSellerAddress}</div>
                  <Image loader={() => imageURI} src={imageURI} height="200" width="200" />
                  <div className="font-bold">{ethers.utils.formatUnits(price, 'ether')} ETH</div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}
