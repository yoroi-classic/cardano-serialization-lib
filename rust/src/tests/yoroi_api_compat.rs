use crate::tests::helpers::harden;
use crate::*;

const FIXTURE_ADDRESS_BECH32: &str = "addr_test1qpu5vlrf4xkxv2qpwngf6cjhtw542ayty80v8dyr49rf5ewvxwdrt70qlcpeeagscasafhffqsxy36t90ldv06wqrk2qum8x5w";
const FIXTURE_ADDRESS_HEX: &str = "0079467c69a9ac66280174d09d62575ba955748b21dec3b483a9469a65cc339a35f9e0fe039cf510c761d4dd29040c48e9657fdac7e9c01d94";
const FIXTURE_STAKE_CRED_HEX: &str =
    "8200581ccc339a35f9e0fe039cf510c761d4dd29040c48e9657fdac7e9c01d94";
const FIXTURE_VALUE_HEX: &str =
    "821a0016e360a1581c1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504a145594f524f49182a";
const FIXTURE_OUTPUT_HEX: &str = "8258390079467c69a9ac66280174d09d62575ba955748b21dec3b483a9469a65cc339a35f9e0fe039cf510c761d4dd29040c48e9657fdac7e9c01d94821a0016e360a1581c1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504a145594f524f49182a";
const FIXTURE_UTXO_HEX: &str = "828258202222222222222222222222222222222222222222222222222222222222222222038258390079467c69a9ac66280174d09d62575ba955748b21dec3b483a9469a65cc339a35f9e0fe039cf510c761d4dd29040c48e9657fdac7e9c01d94821a0016e360a1581c1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504a145594f524f49182a";
const FIXTURE_METADATUM_HEX: &str =
    "a3646d656d6f6766697874757265636d73678170596f726f692041504920636f6d706174616e07";
const FIXTURE_METADATA_JSON: &str = r#"{"memo":"fixture","msg":["Yoroi API compat"],"n":7}"#;
const FIXTURE_AUXILIARY_DATA_HEX: &str =
    "a11902a2a3646d656d6f6766697874757265636d73678170596f726f692041504920636f6d706174616e07";
const FIXTURE_AUXILIARY_DATA_HASH: &str =
    "00c6287ee7d7dd5102b4114a16cfb1fd5393d5fce8b018c92f3719fdbba9fd4b";
const FIXTURE_UNSIGNED_TX_HEX: &str = "84a500d901028182582022222222222222222222222222222222222222222222222222222222222222220301818258390079467c69a9ac66280174d09d62575ba955748b21dec3b483a9469a65cc339a35f9e0fe039cf510c761d4dd29040c48e9657fdac7e9c01d94821a0016e360a1581c1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504a145594f524f49182a021a0002b4e5031a030dc70707582000c6287ee7d7dd5102b4114a16cfb1fd5393d5fce8b018c92f3719fdbba9fd4ba0f5a11902a2a3646d656d6f6766697874757265636d73678170596f726f692041504920636f6d706174616e07";
const FIXTURE_TRANSACTION_HASH: &str =
    "16807e2c0e0d5a2fad7ec9531da6730c0c497f4691c7b82b63f7a668a2d73904";
const FIXTURE_VKEY_WITNESS_HEX: &str = "825820489ef28ea97f719ee7768645fc74b811c271e5d7ef06c2310854db30158e945d584066ba93725844a7f610fb40651d4101e6ba7b154246a667f83ea43258394af64027ece6a03b88134c4e2021fb0ca7629315c9f5840482fe8bfc2f357831100e02";
const FIXTURE_SIGNED_TX_HEX: &str = "84a500d901028182582022222222222222222222222222222222222222222222222222222222222222220301818258390079467c69a9ac66280174d09d62575ba955748b21dec3b483a9469a65cc339a35f9e0fe039cf510c761d4dd29040c48e9657fdac7e9c01d94821a0016e360a1581c1f1e1d1c1b1a191817161514131211100f0e0d0c0b0a090807060504a145594f524f49182a021a0002b4e5031a030dc70707582000c6287ee7d7dd5102b4114a16cfb1fd5393d5fce8b018c92f3719fdbba9fd4ba100d9010281825820489ef28ea97f719ee7768645fc74b811c271e5d7ef06c2310854db30158e945d584066ba93725844a7f610fb40651d4101e6ba7b154246a667f83ea43258394af64027ece6a03b88134c4e2021fb0ca7629315c9f5840482fe8bfc2f357831100e02f5a11902a2a3646d656d6f6766697874757265636d73678170596f726f692041504920636f6d706174616e07";

const FIXTURE_ENTROPY: [u8; 20] = [
    0x0c, 0xcb, 0x74, 0xf3, 0x6b, 0x7d, 0xa1, 0x64, 0x9a, 0x81, 0x44, 0x67, 0x55, 0x22, 0xd4, 0xd8,
    0x09, 0x7c, 0x64, 0x12,
];

fn fixture_root_key() -> Bip32PrivateKey {
    Bip32PrivateKey::from_bip39_entropy(&FIXTURE_ENTROPY, &[])
}

fn fixture_account_key() -> Bip32PrivateKey {
    fixture_root_key()
        .derive(harden(1852))
        .derive(harden(1815))
        .derive(harden(0))
}

fn fixture_payment_key() -> Bip32PrivateKey {
    fixture_account_key().derive(0).derive(0)
}

fn fixture_stake_key() -> Bip32PrivateKey {
    fixture_account_key().derive(2).derive(0)
}

fn fixture_address() -> Address {
    let payment = fixture_payment_key().to_public().to_raw_key();
    let stake = fixture_stake_key().to_public().to_raw_key();
    BaseAddress::new(
        NetworkInfo::testnet_preprod().network_id(),
        &Credential::from_keyhash(&payment.hash()),
        &Credential::from_keyhash(&stake.hash()),
    )
    .to_address()
}

fn fixture_value() -> Value {
    let policy_id = ScriptHash::from([
        0x1f, 0x1e, 0x1d, 0x1c, 0x1b, 0x1a, 0x19, 0x18, 0x17, 0x16, 0x15, 0x14, 0x13, 0x12, 0x11,
        0x10, 0x0f, 0x0e, 0x0d, 0x0c, 0x0b, 0x0a, 0x09, 0x08, 0x07, 0x06, 0x05, 0x04,
    ]);
    let asset_name = AssetName::new(b"YOROI".to_vec()).unwrap();
    let mut assets = Assets::new();
    assets.insert(&asset_name, &BigNum::from(42u32));

    let mut multiasset = MultiAsset::new();
    multiasset.insert(&policy_id, &assets);

    Value::new_with_assets(&BigNum::from(1_500_000u64), &multiasset)
}

fn fixture_metadata() -> TransactionMetadatum {
    encode_json_str_to_metadatum(
        r#"{"msg":["Yoroi API compat"],"memo":"fixture","n":7}"#.to_string(),
        MetadataJsonSchema::BasicConversions,
    )
    .unwrap()
}

fn fixture_auxiliary_data() -> AuxiliaryData {
    let mut metadata = GeneralTransactionMetadata::new();
    metadata.insert(&BigNum::from(674u32), &fixture_metadata());

    let mut auxiliary_data = AuxiliaryData::new();
    auxiliary_data.set_metadata(&metadata);
    auxiliary_data
}

fn fixture_unsigned_transaction() -> Transaction {
    let input = TransactionInput::new(
        &TransactionHash::from([0x22; TransactionHash::BYTE_COUNT]),
        3,
    );
    let output = TransactionOutput::new(&fixture_address(), &fixture_value());

    let mut inputs = TransactionInputs::new();
    inputs.add(&input);

    let mut outputs = TransactionOutputs::new();
    outputs.add(&output);

    let fee = Coin::from(177_381u64);
    let mut body = TransactionBody::new_tx_body(&inputs, &outputs, &fee);
    let auxiliary_data = fixture_auxiliary_data();
    body.set_auxiliary_data_hash(&hash_auxiliary_data(&auxiliary_data));
    body.set_ttl(&BigNum::from(51_234_567u64));

    Transaction::new(&body, &TransactionWitnessSet::new(), Some(auxiliary_data))
}

#[test]
fn yoroi_address_api_fixture_is_stable() {
    let address = fixture_address();
    let parsed = Address::from_bech32(&address.to_bech32(None).unwrap()).unwrap();
    let base_address = BaseAddress::from_address(&parsed).unwrap();

    assert!(!parsed.is_malformed());
    assert_eq!(address.to_bech32(None).unwrap(), FIXTURE_ADDRESS_BECH32);
    assert_eq!(address.to_hex(), FIXTURE_ADDRESS_HEX);
    assert_eq!(base_address.stake_cred().to_hex(), FIXTURE_STAKE_CRED_HEX);
    assert_eq!(parsed.to_bytes(), address.to_bytes());
    assert_eq!(
        base_address.network_id(),
        NetworkInfo::testnet_preprod().network_id()
    );
}

#[test]
fn yoroi_value_and_utxo_api_fixture_is_stable() {
    let value = fixture_value();
    let address = fixture_address();
    let output = TransactionOutput::new(&address, &value);
    let input = TransactionInput::new(
        &TransactionHash::from([0x22; TransactionHash::BYTE_COUNT]),
        3,
    );
    let utxo = TransactionUnspentOutput::new(&input, &output);

    let multiasset = value.multiasset().unwrap();
    let policy_id = multiasset.keys().get(0);
    let asset_name = multiasset.get(&policy_id).unwrap().keys().get(0);

    assert_eq!(value.to_hex(), FIXTURE_VALUE_HEX);
    assert_eq!(output.to_hex(), FIXTURE_OUTPUT_HEX);
    assert_eq!(utxo.to_hex(), FIXTURE_UTXO_HEX);
    assert_eq!(value.coin(), Coin::from(1_500_000u64));
    assert_eq!(asset_name.name(), b"YOROI".to_vec());
    assert_eq!(
        multiasset.get_asset(&policy_id, &asset_name),
        BigNum::from(42u32)
    );
    assert_eq!(
        TransactionUnspentOutput::from_bytes(utxo.to_bytes()).unwrap(),
        utxo
    );
}

#[test]
fn yoroi_metadata_api_fixture_is_stable() {
    let metadatum = fixture_metadata();
    let auxiliary_data = fixture_auxiliary_data();
    let decoded =
        decode_metadatum_to_json_str(&metadatum, MetadataJsonSchema::BasicConversions).unwrap();

    assert_eq!(metadatum.to_hex(), FIXTURE_METADATUM_HEX);
    assert_eq!(decoded, FIXTURE_METADATA_JSON);
    assert_eq!(auxiliary_data.to_hex(), FIXTURE_AUXILIARY_DATA_HEX);
    assert_eq!(
        hash_auxiliary_data(&auxiliary_data).to_hex(),
        FIXTURE_AUXILIARY_DATA_HASH
    );
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&decoded).unwrap(),
        serde_json::json!({"msg":["Yoroi API compat"],"memo":"fixture","n":7})
    );
    assert!(auxiliary_data.metadata().is_some());
}

#[test]
fn yoroi_transaction_hash_and_signing_fixture_is_stable() {
    let tx = fixture_unsigned_transaction();
    let fixed_tx = FixedTransaction::from_bytes(tx.to_bytes()).unwrap();
    let payment_key = fixture_payment_key().to_raw_key();
    let witness = make_vkey_witness(&fixed_tx.transaction_hash(), &payment_key);

    assert_eq!(tx.to_hex(), FIXTURE_UNSIGNED_TX_HEX);
    assert_eq!(
        fixed_tx.transaction_hash().to_hex(),
        FIXTURE_TRANSACTION_HASH
    );
    assert_eq!(witness.to_hex(), FIXTURE_VKEY_WITNESS_HEX);

    let mut signed_fixed_tx = FixedTransaction::from_hex(&tx.to_hex()).unwrap();
    signed_fixed_tx
        .sign_and_add_vkey_signature(&payment_key)
        .unwrap();
    let signed_tx = Transaction::from_bytes(signed_fixed_tx.to_bytes()).unwrap();

    let witnesses = signed_tx.witness_set().vkeys().unwrap();
    assert_eq!(signed_tx.to_hex(), FIXTURE_SIGNED_TX_HEX);
    assert_eq!(witnesses.len(), 1);
    assert!(witnesses.contains(&witness));
}
