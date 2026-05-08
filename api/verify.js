module.exports = async (req, res) => {
  try {
    const { verifyUSDCTransfer } = require("../evm-exact.js");
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const { txHash, amount } = req.body || {};
    if (!txHash) return res.status(400).json({ error: "txHash required" });
    const result = await verifyUSDCTransfer(txHash, amount || null);
    if (result.success) return res.status(200).json({ verified: true, ...result });
    return res.status(402).json({ verified: false, error: result.error });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
