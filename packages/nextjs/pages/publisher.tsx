import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import PublisherView from "~~/components/PublisherView";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";
import { formatEther } from "viem";

const PublisherDashboard: NextPage = () => {

  const { address } = useAccount();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  const [publisherInfo, setpublisherInfo] = useState<any>({});

  const { isFetching, refetch: refetchChannels } = useContractRead({
    address: deployedContractData?.address,
    functionName: "Channels",
    abi: deployedContractData?.abi as Abi,
    enabled: false,
    args: [address],
    onSuccess: (data: any) => {
      console.log("!!!!!!",data);
      const publisher = {
        nsub: data[0],
        minsubfee: data[1],
        totalETH: data[2],
        totalShares: data[3],
      };
      console.log("asaber torunamentbox, read"); // TODO no està loggegan aixo
      setpublisherInfo(publisher);
    },
  });
  refetchChannels()

  console.log("??????????",publisherInfo.nsub)
  const publisherProps = {
    subscribers: Number(publisherInfo.nsub),
    totalValueLocked:formatEther((publisherInfo.totalETH)),
    totalShares: formatEther(publisherInfo.totalShares),
    pricePerShare: Number(publisherInfo.totalETH)/Number(publisherInfo.totalShares),
    minPriceToSubscribe: formatEther(publisherInfo.minsubfee),
    nfts: ["nft1", "nft2"],
  };

  return (
    <>
      <MetaHeader />
      <PublisherView {...publisherProps} />
    </>
  );
};

export default PublisherDashboard;
