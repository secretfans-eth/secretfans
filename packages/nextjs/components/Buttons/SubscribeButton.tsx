import { get } from 'http';
import React from 'react'
import { useAccount, useContractWrite } from 'wagmi';
import { useDeployedContractInfo, useTransactor } from '~~/hooks/scaffold-eth';
import { getTargetNetwork, notification } from '~~/utils/scaffold-eth';
import { getParsedError } from '../scaffold-eth';
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { Button } from "@chakra-ui/react";

export default function SubscribeButton({smartContract, amountETH, contentCreatorAddr, publicKey}) {
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
        args: [
            contentCreatorAddr,
            publicKey
        ],
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
                console.log(e)
                notification.error(message);
            }
        }
    };

    return (
        <div>
            <Button
                colorScheme="blue"
                className="mb-1 w-56 active:bg-slate-700 font-bold uppercase text-sm px-4 py-1 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={handleWrite}>Subscribe</Button>

        </div>
    )
}
