import { Modal, Input, useNotification } from 'web3uikit';
import { useState } from 'react';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import {
  loadDeployedNftMarketplaceContract,
  // loadDeployedBasicNftContract,
  networkMapping,
} from '../constants';
import { ethers } from 'ethers';

export default function UpdateListingModal({
  nftAddress,
  tokenId,
  isVisible,
  marketplaceAddress,
  onClose,
}) {
  const { chainId: chainIdHex } = useMoralis();

  const dispatch = useNotification();

  const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);
  // console.log(`priceToUpdateListingWith: ${priceToUpdateListingWith}`);

  const handleUpdateListingSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: 'success',
      message: 'Listing updated',
      title: 'Listing updated - please refresh (and move blocks)',
      position: 'topR',
    });
    onClose && onClose();
    setPriceToUpdateListingWith(0);
  };

  const chainId = parseInt(chainIdHex);
  const networkName = networkMapping[chainId];
  const nftMarketplaceContract = loadDeployedNftMarketplaceContract(networkName);
  // const basicNftContract = loadDeployedBasicNftContract(networkName);
  // console.log(`NFTBox: basicNftContract: ${basicNftContract}`);
  // const basicNftAddress = basicNftContract.address;
  // const basicNftAbi = basicNftContract.abi;
  const nftMarketplaceAbi = nftMarketplaceContract.abi;
  // const nftMarketplaceAddress = nftMarketplaceContract.address;
  const newPrice = ethers.utils.parseEther(priceToUpdateListingWith || '0');

  const options = {
    abi: nftMarketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'updateListing',
    params: {
      nftAddress: nftAddress,
      tokenId: tokenId,
      newPrice: newPrice,
    },
  };

  // console.log(options);
  const { runContractFunction: updateListing } = useWeb3Contract(options);

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => {
        updateListing({
          onError: (err) => console.log(err),
          onSuccess: handleUpdateListingSuccess,
        });
      }}
    >
      <Input
        label="Update listing price in L1 Currency (ETH)"
        name="New listing price"
        type="number"
        onChange={(event) => {
          setPriceToUpdateListingWith(event.target.value);
        }}
      />
    </Modal>
  );
}
