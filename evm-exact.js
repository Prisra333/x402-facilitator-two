const { ethers } = require("ethers");
const BASE_RPC = "https://mainnet.base.org";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RECIPIENT = "0xc02e351cb6e9f8a82a0fd02931c7c8bcd031c2b7";
const USDC_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
async function verifyUSDCTransfer(txHash, expectedAmount = null) {
  const provider = new ethers.JsonRpcProvider(BASE_RPC);
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) return { success: false, error: "TX not found" };
  if (receipt.status !== 1) return { success: false, error: "TX failed" };
  const iface = new ethers.Interface(USDC_ABI);
  const transferTopic = iface.getEvent("Transfer").topicHash;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== USDC_ADDRESS.toLowerCase()) continue;
    if (log.topics[0] !== transferTopic) continue;
    const parsed = iface.parseLog({ topics: log.topics, data: log.data });
    if (parsed.args.to.toLowerCase() !== RECIPIENT.toLowerCase()) continue;
    const amount = Number(ethers.formatUnits(parsed.args.value, 6));
    if (expectedAmount && amount < expectedAmount) return { success: false, error: `Amount too low: ${amount} USDC` };
    return { success: true, txHash, from: parsed.args.from, amount, blockNumber: receipt.blockNumber };
  }
  return { success: false, error: "No matching USDC transfer found" };
}
module.exports = { verifyUSDCTransfer };
