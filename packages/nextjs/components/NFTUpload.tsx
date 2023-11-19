import { useState, useEffect } from "react";
import { Box, Button, Heading, Input, Textarea } from "@chakra-ui/react";
import { NFTStorage } from "nft.storage";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";
import { formatEther } from "viem";
const EthCrypto = require("eth-crypto");

const fileToArrayBuffer = require("file-to-array-buffer");

export default function NFTUpload() {
  const [url, setURL] = useState(null);
  // const [nft, setNFT] = useState(null);
  // const [provider, setProvider] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { address } = useAccount();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  const [subsPubKeys, setSubsPubKeys] = useState<any>({});
  const [subs, setSubs] = useState<any>({});

  const uploadNFT = async (name, description, image, encryptedContent) => {
    console.log("PUBLISHER FLOW")
    console.log("______________")
    console.log("token", process.env.REACT_APP_NFT_STORAGE_API_KEY)
    const nftstorage = new NFTStorage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDcyN0QwMWZFZEM0MWFENURhNDNhNzBGMkI2OUM4NTc4YmM5QUFmYTIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwMDM2MDUxMjM4NiwibmFtZSI6InNlY3JldGZhbiJ9.AHsuVUs1PUUiUgqfjqIwzt8inNs1mdgqdVpYFtrSy7Q" })

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      name,
      description,
      image,
      encryptedContent: encryptedContent
    });

    // Save the URL
    const url = `https://${ipnft}.ipfs.dweb.link/?format=dag-json`
    setURL(url)

    return url;
  }

  // const mintImage = async (tokenURI) => {
  //   setMessage("Waiting for Mint...")

  //   const signer = await provider.getSigner()
  //   const transaction = await nft.connect(signer).mint(tokenURI, { value: ethers.utils.parseUnits("1", "ether") })
  //   await transaction.wait()
  // }

  const handleFileChange = event => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    // Handle your file submission logic here
    console.log(`Submitting file: ${file.name}`);
    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const contentEncryptionKey = await crypto.subtle.generateKey(
      // generate key
      { name: "AES-CBC", length: 256 }, // algorithm
      true, // extractable
      ["encrypt", "decrypt"], // can encrypt and decrypt
    );
    console.log("GENERATED RANDOM contentEncryptonKey: ", contentEncryptionKey)

    const blobFile = await fileToArrayBuffer(file);
    const encryptedContent = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, contentEncryptionKey, blobFile);
    console.log("encrypted file: ", file);
    console.log("decrypted content: ", arrayBufferToBase64(blobFile));
    console.log("encrypted content: ", encryptedContent);


    const exported = await window.crypto.subtle.exportKey("raw", contentEncryptionKey);
    console.log({ exported });
    const exportedContentEncryptionKey = arrayBufferToBase64(exported);
    console.log("Encryption key exported: ", exported)
    console.log(exportedContentEncryptionKey)

    // Get image for NFT frontpage
    const res = await fetch("https://imgs.search.brave.com/LID9amr1_Iya7zHnxnwsyYTU9qyijJ8uPg2JwaPUFCU/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucGV4ZWxzLmNv/bS9waG90b3MvMTY0/NDI1L3BleGVscy1w/aG90by0xNjQ0MjUu/anBlZz9hdXRvPWNv/bXByZXNzJmNzPXRp/bnlzcmdiJmRwcj0x/Jnc9NTAw");
    if (!res.ok) {
      throw new Error(`Failed to fetch image. Status: ${res.status}`);
    }
    const imgBlob = await res.blob();
    const imageBlob = new Blob([imgBlob]);
    const ipfsURI = await uploadNFT("name", "description", imageBlob, arrayBufferToBase64(encryptedContent));
    console.log("Uploaded NFT to IPFS: ", ipfsURI)

    // Get public keys of the subs of the content creator
    console.log({subs, subsPubKeys})
    const subs1 = [
      {
        addr: "0xF00B47",
        pubKey:
          "044a801e476131320ae8a85946ec3a9175ace3280d4586f0e183c64494f825a4faf7191d6f3d7a3c7c76f3e502c4e4a56824e9a3304f9f321212acc14af6c69d0f",
      },
    ];
    console.log("Encrypting contentEncryptionKey to public key:", subs1[0].pubKey)
    // Encrypt contentEncryptionKey with the pubKeys of the subs
    const encryptedContentEncryptionKeys = [];
    for (let i = 0; i < subs1.length; i++) {
      const publicKeyBytes = EthCrypto.publicKey.compress(subs1[i].pubKey.replace("0x", ""));
      const encryptedObject = await EthCrypto.encryptWithPublicKey(publicKeyBytes, exportedContentEncryptionKey);
      const encryptedKey = await EthCrypto.cipher.stringify(encryptedObject);
      encryptedContentEncryptionKeys.push({
        encryptedKey: encryptedKey,
        address: subs1[i].addr,
      });
      console.log("Encrypted the exportedContentEncryptionKey. Before encrypt: ", exportedContentEncryptionKey)
      console.log("After encrypt: ", encryptedKey)
    }


    // Send it to Ethereum, get money, enjoy
    console.log("SUNSCRIBER FLOW")
    console.log("______________")

    // decrypt ===> test the PoC
    // TODO: GET encryptedKey and IPFS from SC
    const snapId = "local:http://localhost:8080";
    const response = await window.ethereum.request({
      method: "wallet_invokeSnap",
      params: {
        snapId,
        request: { method: "decrypt", params: { encryptedString: encryptedContentEncryptionKeys[0].encryptedKey } },
      },
    });
    console.log("decrypting the encrypted decryption key, using metamask snap, and the subscriber private key")
    console.log("before decryption: ", encryptedContentEncryptionKeys[0].encryptedKey)
    console.log("after decryption: ", response)
    const imported = await window.crypto.subtle.importKey(
      "raw",
      base64ToArrayBuffer(response),
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    console.log("imported decrypted key (needed to decrypt the content): ", imported)
    // Download encrypted content from IPFS
    // Fetch the image as a binary response
    const rs = await fetch(ipfsURI);
    console.log({ rs })
    if (!rs.ok) {
      throw new Error(`Failed to fetch image. Status: ${rs.status}`);
    }

    // Convert the response to a Blob
    const downloadedJson = await rs.json();
    console.log("downloaded from IPFS: ", downloadedJson)

    // Create a Blob from the binary data

    const decryptedContent = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, imported, base64ToArrayBuffer(downloadedJson.encryptedContent));
    console.log({ decryptedContent, blobFile });
    const uint8Array = new Uint8Array(decryptedContent);
    const blob = new Blob([uint8Array]);
    console.log("decrypting encrypted content from IPFS")
    console.log("before decryption: ", downloadedJson.encryptedContent)
    console.log("after decryption: ", decryptedContent)

    // Create a File from the Blob
    const decryptedFile = new File([blob], "filename.txt", { type: "application/octet-stream" });
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(decryptedFile);

    // Create a link element
    const link = document.createElement("a");

    // Set the href attribute of the link to the temporary URL
    link.href = url;

    // Set the download attribute to specify the filename
    link.download = "filename.txt";

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click event on the link to start the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);

    // Revoke the temporary URL to free up resources
    URL.revokeObjectURL(url);
  };

  // Helper functions to convert between ArrayBuffer and Base64
  function arrayBufferToBase64(buffer) {
    const binary = new Uint8Array(buffer);
    return btoa(String.fromCharCode.apply(null, binary));
  }

  function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  return (
    // <Box style={{backgroundColor: "white"}}>
    //   <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
    //   <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
    //   <Input type="file" onChange={handleFileChange} />
    //   <Button onClick={handleSubmit}>Submit</Button>
    // </Box>
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
        bg="white"
        border="2px gray solid"
        style={{ borderRadius: "3px", height: "385px" }}
        pt={2}
      >
        <Heading style={{ borderRadius: 0 }} textAlign="center" mb={4}>
          Content Upload
        </Heading>
        <Input
          style={{ borderRadius: 0, borderColor: "#EEEEEE" }}
          bg="white"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Textarea
          style={{ borderRadius: 0, borderColor: "#EEEEEE" }}
          bg="white"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Input style={{ borderRadius: 0, borderColor: "#EEEEEE" }} bg="white" type="file" onChange={handleFileChange} />
        <Button style={{ borderRadius: 0, borderColor: "#EEEEEE" }} onClick={handleSubmit} w="100%">
          Submit
        </Button>
      </Box>
    </>
  );
}
