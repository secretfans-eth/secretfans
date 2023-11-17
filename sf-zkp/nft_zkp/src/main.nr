
//struct NFTsubs // struct for subscribers that have downloaded an NFT have their respective public key and ECEK
//{
//    ecek: Field;
//    pubKey: Field;
//}

fn main(cek: Field, eceks: [Field, 3], pubKeys: [Field, 3], pub ecekHash: Field, pub merkleRoot: Field) 
{

    let nonce = 11561;
    let iv = [nonce, 432,324,14];
    let ciphers = hydra::bn254::enc::encrypt(pubKeys, cek, iv);

    let message_size = 10;
    let thisEcekHash = std::hash::keccak256(eceks, message_size);
    let thisMerkleRoot = std::hash::keccak256(pubKeys, message_size);

    if merkleRoot == thisMerkleRoot
    {
        assert (ecekHash == thisEcekHash);
    }
}

#[test]
fn test_main() {
    main(1, 2);

    // Uncomment to make test fail
    // main(1, 1);
}
