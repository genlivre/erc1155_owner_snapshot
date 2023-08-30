const fs = require("fs");
const path = require("path");

// 先程のsnapshot.jsで作成したCSVファイルのパスを指定
const csvFiles = ["owners/[コントラクトアドレスを入れてください]/1.csv"];

async function main() {
  const addressSets = [];

  // 各CSVファイルからアドレスを読み込む
  for (const csvFile of csvFiles) {
    const content = fs.readFileSync(csvFile, "utf-8");
    const addresses = content.trim().split("\n");
    addressSets.push(new Set(addresses));
  }

  // 全てで重複するアドレスを見つける
  const commonAddresses = Array.from(addressSets[0]).filter((address) =>
    addressSets.every((set) => set.has(address))
  );

  // 結果を新しいCSVファイルに出力
  const outputPath = path.join("allOwnedSnapshot.csv");
  fs.writeFileSync(outputPath, commonAddresses.join("\n"));

  console.log(`Common addresses have been saved to ${outputPath}`);
}

main()
  .then(() => console.log("Done"))
  .catch((err) => console.error("An error occurred:", err));
