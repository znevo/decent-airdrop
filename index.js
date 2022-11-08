import { ethers } from "ethers";
import { DecentSDK, chain, edition } from "@decent.xyz/sdk";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import * as dotenv from 'dotenv';
dotenv.config();

// time
const now = Math.floor((new Date()).getTime() / 1000);
const oneWeek = 60 * 60 * 24 * 7;

// global
let provider, wallet, sdk, nft;

async function main() {
  // set up
  provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  sdk = new DecentSDK(chain.localhost, wallet);

  // deploy
  nft = await deploy();
  console.log(`NFT deployed to: ${nft.address}`);

  // airdrop
  const tx = await nft.mintAirdrop([
    '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    '0x3151b5e92C98244cF9d15a10B12574bF5E079B4F',
    '0x3A67dF3898a0885ca712d1106168A72bFD427C02',
    '0xBfa62c4Ce08fdb2650c4880d394018b6ae87158a',
    '0x129cF81D7F847dF22C41168F266168F36fb47e15',
  ]);
  const receipt = await tx.wait();
  const total = await nft.totalSupply();
  console.log(`Airdropped ${total} to recipients!`);
}

const deploy = async () => {
  // token
  const name = '';
  const symbol = '';

  // minting
  const hasAdjustableCap = false;
  const maxTokens = 1_000_000;
  const tokenPrice = ethers.utils.parseEther('0.001');
  const maxTokenPurchase = 10;

  // sale
  const presaleStart = now + oneWeek;
  const presaleEnd = now + (oneWeek * 2);
  const saleStart = now + (oneWeek * 2);
  const saleEnd = now + (oneWeek * 6);
  const presaleMerkleRoot = null;
  // const presaleMerkleRoot = createMerkleRoot([
  //   // [address, maxQuantity, pricePerToken]
  //   ['0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', 10, ethers.utils.parseEther('0.001')],
  // ]);

  // royalty
  const royaltyBPS = 10_00;

  // metadata
  const contractURI = '';
  const metadataURI = '';
  const metadataRendererInit = null;
  // const metadataRendererInit = {
  //   description: '',
  //   imageURI: '',
  //   animationURI: '',
  // };

  // token gate
  const tokenGateConfig = {
    tokenAddress: ethers.constants.AddressZero,
    minBalance: 0,
    saleType: 0,
  };

  return await edition.deploy(
    sdk,
    name,
    symbol,
    hasAdjustableCap,
    maxTokens,
    tokenPrice,
    maxTokenPurchase,
    presaleMerkleRoot,
    presaleStart,
    presaleEnd,
    saleStart,
    saleEnd,
    royaltyBPS,
    contractURI,
    metadataURI,
    metadataRendererInit,
    tokenGateConfig,
    (pending) => { console.log('Pending nonce: ', pending.nonce) },
    (receipt) => { console.log('Receipt block: ', receipt.blockNumber) }
  );
}

const createMerkleRoot = (snapshot) => {
  const leaves = snapshot.map((leaf) => {
    return ethers.utils.solidityKeccak256(
      // [address, maxQuantity, pricePerToken]
      ["address", "uint256", "uint256"],
      [leaf[0], leaf[1], leaf[2]]
    );
  });

  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  return tree.getHexRoot();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
