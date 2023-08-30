# ERC1155 スナップショット

以下を実行し、.env の中に RPC の情報を登録してください。

```
$ mv .env.dummy .env
```

## snapshot.js

このスクリプトは ERC1155 の特定の NFT のオーナー一覧を CSV として保存するためのものです。

```
$ node snapshot.js
```

## allOwnedSnapshot.js

指定したスナップショットファイルから、重複しているオーナーアドレスをピックアップして CSV として保存します。

```
$ node allOwnedSnapshot.js
```
