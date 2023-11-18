import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import NFTView from "~~/components/NFTView";
import { useEffect, useState } from "react";
import SubscribeButton from "~~/components/Buttons/SubscribeButton";
import InstallSnapButton from "~~/components/Buttons/InstallSnapButton";

const PublisherBrowseView: NextPage = () => {
  const nfts = [
    {
      title: "NFT 1",
      description: "NFT 1 description",
      photoUrl: "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
      fileUrl: "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
    },
    {
      title: "NFT 1",
      description: "NFT 1 description",
      photoUrl: "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
      fileUrl: "https://ipfs.io/ipfs/QmQqzMTavQgT4f4T5v6PWBp7XNKtoPmC9jvn12WPT3gkSE",
    },
  ];
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const { data: contract, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  // console.log({publicKey})

  const handleSetPublicKey = (response:string) => {
    setPublicKey(response);
};
  return (
    <>
      <MetaHeader />
      {
         !deployedContractLoading && contract && (
          < SubscribeButton
            smartContract={contract}
            amountETH={BigInt("0x44444444")}
            contentCreatorAddr="0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97"
            publicKey={publicKey}
          />
        )
      }
        <InstallSnapButton setPublicKey={handleSetPublicKey} />
      <div className="flex items-center flex-col flex-grow">
        <div className="flex-grow bg-base-300 w-full px-8 py-12">
          <div className="flex justify-center items-center gap-2 flex-col sm:flex-row">
            {nfts.map((nft, index) => (
              <NFTView {...nft} key={index} isDecrypted/>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PublisherBrowseView;