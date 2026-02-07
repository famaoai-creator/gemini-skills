# 要件定義書：GAI-Customer Portal v4
**フロー**: ハイブリッド型AIネイティブ開発 (Hybrid AI-Native Flow)

## 1. コアロジック (Critical TDD 対象)
- **認証トークン検証 (Auth Logic)**: 期限切れチェック、署名検証を含むセキュアなロジック。

## 2. 標準機能 (AI Scaffolding 対象)
- REST API エンドポイント、エラーハンドリング、DB接続（モック）。

## 3. 品質目標
- **最終カバレッジ**: 90% 以上。
- **監査**: `security-scanner` によるシークレット検知。
