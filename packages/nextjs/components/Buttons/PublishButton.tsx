import React from "react";
import { getParsedError } from "../scaffold-eth";
import { get } from "http";
import { useAccount, useContractWrite } from "wagmi";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";

export default function PublishButton({ smartContract, ipfsURI, decryptionKeys }) {
  console.log("welcome: ", smartContract);
  const writeTxn = useTransactor();

  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    chainId: getTargetNetwork().id,
    address: smartContract.address,
    functionName: "subscribeSpotsAvaliable",
    abi: smartContract.abi,
    args: [ipfsURI, decryptionKeys],
  });

  const handleWrite = async () => {
    console.log("Subscribing");
    console.log(smartContract);
    if (writeAsync) {
      try {
        const makeWriteWithParams = () => writeAsync({ value: amountETH });
        await writeTxn(makeWriteWithParams);
      } catch (e: any) {
        const message = getParsedError(e);
        console.log(e);
        notification.error(message);
      }
    }
  };

  return (
    <div>
      {
        <button
          className="mb-1 w-56 bg-green-700 text-white active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          type="button"
          onClick={handleWrite}
        >
          Subscribe
        </button>
      }
    </div>
  );
}
