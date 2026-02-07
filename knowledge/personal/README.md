# Personal Tier Configuration (Local Only)

このディレクトリは Git にコミットされません。あなた個人の秘密情報や設定を配置してください。

## 1. 推奨されるファイル
- `secrets.json`: APIキー、個人用トークン等。
- `memo.md`: 公開・共有したくない個人的な思考プロセス。
- `config.json`: 個人環境に特化したパス設定等。

## 2. スキルからの参照方法
スキルは `knowledge/personal/` 以下のファイルを最優先（最高位 Tier）として読み込みます。
ここに設定を置くことで、`Confidential` や `Public` の設定を安全に上書きできます。
