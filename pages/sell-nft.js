import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Form, useNotification, Button } from 'web3uikit';
import { ethers } from 'ethers';
import { useWeb3Contract, useMoralis } from 'react-moralis';
import {
  loadDeployedNftMarketplaceContract,
  loadDeployedBasicNftContract,
  networkMapping,
} from '../constants';
import { useEffect, useState } from 'react';

export default function Home() {
  const { chainId: chainIdHex, account, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const networkName = networkMapping[chainId];
  const basicNftContract = loadDeployedBasicNftContract(networkName);
  const basicNftAbi = basicNftContract.abi;
  const nftMarketplaceContract = loadDeployedNftMarketplaceContract(networkName);
  const marketplaceAbi = nftMarketplaceContract.abi;
  const marketplaceAddress = nftMarketplaceContract.address;

  const dispatch = useNotification();

  const [proceeds, setProceeds] = useState('0');

  const { runContractFunction } = useWeb3Contract();

  async function approveAndList(data) {
    let [nftAddress, tokenId, price] = data.data;
    nftAddress = nftAddress.inputResult;
    tokenId = tokenId.inputResult;
    price = ethers.utils.parseEther(price.inputResult).toString();

    const approveOptions = {
      abi: basicNftAbi,
      contractAddress: nftAddress,
      functionName: 'approve',
      params: {
        to: marketplaceAddress,
        tokenId: tokenId,
      },
    };

    await runContractFunction({
      params: approveOptions,
      onError: (err) => {
        console.log(err);
        console.log(approveOptions);
      },
      onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
    });
  }

  async function handleApproveSuccess(nftAddress, tokenId, price) {
    const listOptions = {
      abi: marketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: 'listItem',
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price,
      },
    };

    await runContractFunction({
      params: listOptions,
      onError: (err) => {
        console.log(err);
        console.log(listOptions);
      },
      onSuccess: () => handleListSuccess(),
    });
  }

  async function handleListSuccess() {
    dispatch({
      type: 'success',
      message: 'NFT listing',
      title: 'NFT listed',
      position: 'topR',
    });
  }

  const getProceedsOptions = {
    abi: marketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'getProceeds',
    params: {
      seller: account,
    },
  };

  async function setupUI() {
    const returnedProceeds = await runContractFunction({
      params: getProceedsOptions,
      onError: (error) => {
        console.log(error);
        console.log(getProceedsOptions);
      },
    });
    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString());
    }
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      setupUI();
    }
  }, [proceeds, account, isWeb3Enabled, chainId]);

  const withdrawProceedsOptions = {
    abi: marketplaceAbi,
    contractAddress: marketplaceAddress,
    functionName: 'withdrawProceeds',
    params: {},
  };

  async function performWithdraw() {
    runContractFunction({
      params: withdrawProceedsOptions,
      onError: (error) => {
        console.log(error);
        console.log(withdrawProceedsOptions);
      },
      onSuccess: handleWithdrawSuccess,
    });
  }

  const handleWithdrawSuccess = async (tx) => {
    await tx.wait(1);
    dispatch({
      type: 'success',
      message: 'Withdrawing proceeds',
      position: 'topR',
    });
  };

  return (
    <div className={styles.container}>
      <Form
        onSubmit={approveAndList}
        data={[
          {
            name: 'NFT Address',
            type: 'text',
            inputWidth: '50%',
            value: '',
            key: 'nftAddress',
          },
          {
            name: 'Token ID',
            type: 'number',
            value: '',
            key: 'tokenId',
          },
          {
            name: 'Price (in ETH)',
            type: 'number',
            value: '',
            key: 'price',
          },
        ]}
        title="Sell your NFT!"
        id="main-form"
      />
      <div className=" p-2 py-4">
        Withdraw {ethers.utils.formatUnits(proceeds, 'ether')} ETH proceeds
      </div>
      {proceeds != '0' ? (
        <Button onClick={() => performWithdraw()} text="Withdraw" type="button" />
      ) : (
        <div>No proceeds detected</div>
      )}
    </div>
  );
}
