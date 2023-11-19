import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import NFTView from "~~/components/NFTView";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";
import { formatEther } from "viem";

const Home: NextPage = () => {

  const { address } = useAccount();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  const [subscriberInfo, setsubscriberInfo] = useState<any>({});
  const [uriInfo, seturiInfo] = useState<any>({});

  const { isFetching, refetch: refetchUris } = useContractRead({
    address: deployedContractData?.address,
    functionName: "holdedNFTs",
    abi: deployedContractData?.abi as Abi,
    enabled: false,
    args: [address],
    onSuccess: (data: any) => {
      console.log("!!!!!!",data);
      const subscriber = {data
      };
      console.log("asaber torunamentbox, read"); // TODO no està loggegan aixo
      setsubscriberInfo(subscriber);
    },
  });
  refetchUris()

  const nfts = [
    {
      title: "NFT 1",
      description: "NFT 1 description",
      photoUrl: "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
      fileUrl: "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
    },
  ];
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow bg-base-300 w-full px-8 py-12">
          <div className="flex justify-center items-center gap-2 flex-col sm:flex-row">
            {/* <NFTUserView /> */}
            {nfts.map((nft, index) => (
              <NFTView key={index} {...nft} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
