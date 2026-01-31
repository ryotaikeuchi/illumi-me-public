# illumi-me

LINEビーコンでユーザーの接近を検知し、カスタマイズされたLEDテープの点灯パターンを表示するシステム

> [!NOTE]
> 本プロジェクトは、M5Atom LiteでのLINE Beacon機能の実現に [Green Beacon by ukkz](https://github.com/ukkz/green-beacon-esp32) を使用している。
> LINE Beaconの利用には、対象公式アカウントの友だち追加や、端末のBluetooth・位置情報設定、LINEアプリ内設定等が必要となる。詳細はLINEの仕様を確認すること。


## プロジェクト概要

- M5Atom Lite でLINEビーコンを実現
- M5Stack Core2 でLEDテープを制御
- LIFFアプリでユーザーごとの点灯パターンを設定
- Cloud FunctionsとBeebotteで実現するリアルタイム制御

## システム構成

### ハードウェア
- M5Atom Lite: LINEビーコン送信機
- M5Stack Core2: LED制御装置
- SK6812 LEDテープ（30LED）
- AC電源アダプタ

### クラウドサービス
- LINE Messaging API
- Firebase
  - Cloud Functions
  - Firestore
  - Hosting
- Beebotte（MQTT）

## 詳細ドキュメント
より詳細な技術情報については、`docs`ディレクトリ以下の各ドキュメントを参照すること。

- **[認証フロー](./docs/authentication.md)**: 本システムの認証プロセスの詳細なシーケンスについて説明する。
- **[セットアップとデプロイ](./docs/setup.md)**: 開発環境の構築からFirebaseへのデプロイまでの手順を説明する。
- **[システム設計書](./docs/architecture.md)**: システム全体のアーキテクチャとデータフローについて説明する。


## ディレクトリ構成

```
illumi-me/
├── cloud/
│   └── functions/              # Firebase Cloud Functions
│       ├── index.js            # Functionsのエントリーポイント
│       ├── auth.js             # 認証関連のFunction
│       └── bot.js              # LINE BotのWebhook処理
├── docs/                       # ドキュメント
│   ├── architecture.md
│   ├── authentication.md
│   ├── setup.md
│   └── specifications.md
├── hardware/                   # ハードウェア関連
│   ├── atom-lite/
│   └── core2/
├── liff/
│   └── liff-app/               # LIFFアプリケーション (React + Vite)
│       ├── src/
│       │   ├── App.jsx             # メインアプリケーションコンポーネント
│       │   ├── constants.js        # 定数管理（メッセージ等）
│       │   ├── firebase.js         # Firebase初期化設定
│       │   ├── components/
│       │   │   ├── ColorPalette.jsx
│       │   │   ├── LedPreview.jsx
│       │   │   ├── SettingsPanel.jsx
│       │   │   └── ...
│       │   └── hooks/
│       │       ├── useAuth.js
│       │       └── useFirestoreSettings.js
│       └── .env
├── firebase.json
├── firestore.rules
└── README.md
```