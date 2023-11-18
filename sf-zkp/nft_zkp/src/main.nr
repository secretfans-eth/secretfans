
//struct NFTsubs // struct for subscribers that have downloaded an NFT have their respective public key and ECEK
//{
//    ecek: Field;
//    pubKey: Field;
//}

use dep::griffin;

fn encrypt_griff(plains: [Field; 3]) -> Field {
    griffin::bn254::hash_3(plains)
}

// use dep::hydra;

// fn hydra_encrypt(plains: [Field; 4], key : [Field; 4], iv: [Field; 4]) -> pub [Field; 4] {
//         hydra::bn254::enc::encrypt(plains, key, iv)
//     }




fn main(cek: Field, eceks: [Field; 3], pubKeys: pub [Field; 3], merkleLeaves: [Field; 3], hashInput: pub Field, merkleRoot: Field)
{
    assert(encrypt_griff(merkleLeaves) == merkleRoot );
    let mut thisEceks = [0, 0, 0];
    for i in 0..3
    {
        thisEceks[i] = cek + pubKeys[i];
        assert (thisEceks[i] == eceks[i]);
    };

    let x = encrypt_griff(eceks);

    assert(hashInput == x);
    
}

#[test]
fn test_main() {
    main(1, [3, 3, 3], [2, 2, 2], [3, 3, 3], 0x132087f636e0e40cfeaa84b07adc71914fb0e162b4214f822aeb18bccce1597c, 0x132087f636e0e40cfeaa84b07adc71914fb0e162b4214f822aeb18bccce1597c);

    // Uncomment to make test fail
    // main(1, 1);
}
