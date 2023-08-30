require("dotenv").config();

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// ERC1155のABI（TransferSingleとTransferBatchイベントを含む必要があります）
const abi = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URI); // RPCエンドポイントを指定してください
  const contractAddress = ""; // ERC1155のコントラクトアドレスを指定してください
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const tokenIds = [1, 2, 3]; // 同じコントラクトアドレスであれば、複数のトークンIDを指定できます
  const ownersMap = new Map();

  for (const tokenId of tokenIds) {
    ownersMap.set(tokenId, new Set());
  }

  // TransferSingle イベントをフィルタリング
  const filterSingle = contract.filters.TransferSingle(
    null,
    null,
    null,
    null,
    null
  );
  const logsSingle = await provider.getLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: contractAddress,
    topics: filterSingle.topics,
  });

  // TransferBatch イベントをフィルタリング
  const filterBatch = contract.filters.TransferBatch(
    null,
    null,
    null,
    null,
    null
  );
  const logsBatch = await provider.getLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: contractAddress,
    topics: filterBatch.topics,
  });

  // TransferSingle イベントからオーナーを取得
  for (const log of logsSingle) {
    const event = contract.interface.parseLog(log);
    const tokenId = event.args.id.toNumber();
    const to = event.args.to;

    if (tokenIds.includes(tokenId)) {
      ownersMap.get(tokenId).add(to);
    }
  }

  // TransferBatch イベントからオーナーを取得
  for (const log of logsBatch) {
    const event = contract.interface.parseLog(log);
    const ids = event.args.ids.map((id) => id.toNumber());
    const to = event.args.to;

    for (const tokenId of ids) {
      if (tokenIds.includes(tokenId)) {
        ownersMap.get(tokenId).add(to);
      }
    }
  }

  // CSVに保存
  if (!fs.existsSync("owners")) {
    fs.mkdirSync("owners");
  }

  if (!fs.existsSync(path.join("owners", contractAddress))) {
    fs.mkdirSync(path.join("owners", contractAddress));
  }

  for (const [tokenId, ownerSet] of ownersMap) {
    const filePath = path.join("owners", contractAddress, `${tokenId}.csv`);
    fs.writeFileSync(filePath, Array.from(ownerSet).join("\n"));
  }
}

main()
  .then(() => console.log("CSV files have been created."))
  .catch((err) => console.error("An error occurred:", err));
