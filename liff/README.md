# LIFF placeholder

このディレクトリは LIFF アプリケーションのプレースホルダです。
本格的な LIFF アプリを追加する場合は、ここにソース（React/Vue 等）を配置し、`package.json` を整備してください。

現在は実装されていません。LIFF を追加する場合の基本手順:

1. `npx create-react-app liff-app --template typescript` などでアプリを作成
2. `npm run build` でビルドし、Firebase Hosting にデプロイ
3. LIFF のチャネル設定を行い、LIFF ID を取得してアプリに組み込む
