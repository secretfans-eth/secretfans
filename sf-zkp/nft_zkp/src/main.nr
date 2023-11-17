//fn hash()
//{
//    let eceks: [Field; 3] = [1, 2, 3];
//    let message_size = 4;
//    let hash = std::hash::keccak256(eceks, message_size);
//}

struct NFTsubs // struct for subscribers that have downloaded an NFT have their respective public key and ECEK
{
    ecek: Field;
    pubKey: Field;
}

fn main(cek: Field, eceks: [Field, 3], pubKeys: [Field, 3], pub ecekHash: Field, pub merkleRoot: Field) 
{
    // assert(x != y);
    for i in 0..3
    {
        
    };
}

#[test]
fn test_main() {
    main(1, 2);

    // Uncomment to make test fail
    // main(1, 1);
}
