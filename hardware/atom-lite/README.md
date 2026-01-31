# M5Atom Lite (LINE Beacon)

このディレクトリには M5Atom Lite 用の LINE Beacon 実装のプレースホルダがあります。`
`green-beacon-esp32`（MIT ライセンス）の `GreenBeacon` 実装を取り込み、`src/GreenBeacon.h` / `src/GreenBeacon.cpp` を配置しています。

使い方（概要）

1. Arduino IDE (ESP32 ボード) を準備し、M5Atom ライブラリと `ESP32 BLE` 関連ライブラリをインストールしてください。
2. `atom_lite.ino` を開き、`HWID`（10 文字の HEX、例: `0011223344`）を設定します。
3. ボードに書き込んで実行すると、LINEビーコン相当のアドバタイズパケットを発信します。

注意・ライセンス

- `GreenBeacon` の元実装は https://github.com/ukkz/green-beacon-esp32 にあり、MIT ライセンスのもとで配布されています。
	取り込んだファイルは `src/GreenBeacon.h` と `src/GreenBeacon.cpp` です。オリジナルの著作権表示とライセンスはリポジトリの `green-beacon-esp32/LICENSE` を参照してください。

依存

- Arduino core for ESP32
- BLE (ライブラリは Arduino core に含まれる `BLEDevice` を使用)

テスト

- シリアルモニタで起動メッセージを確認
- スマートフォンの BLE スキャンアプリ（nRF Connect 等）でアドバタイズパケットを確認

## PlatformIO セットアップ（VSCode）

このディレクトリは PlatformIO プロジェクトとして設定されています。`platformio.ini` に M5Atom Lite (ESP32) 用の設定が記載されており、VSCode の PlatformIO Extension を使ってビルド・アップロードが可能です。

### 必須
- VSCode に PlatformIO Extension がインストールされていること
- PlatformIO CLI がシステムに存在すること（拡張インストール時に自動セットアップされる）

### ビルド方法

#### VSCode UI（推奨）
1. VSCode の左サイドバーから PlatformIO アイコン（虫アイコン）をクリック
2. ツリーで `m5stack-atom` プロジェクトを選択
3. 「Build」をクリックするとコンパイル開始

#### コマンドライン
```bash
cd hardware/atom-lite
platformio run -e m5stack-atom
```

### アップロード方法

#### VSCode UI
1. デバイスを USB で接続
2. PlatformIO サイドバーで「Upload」をクリック

#### コマンドライン
```bash
cd hardware/atom-lite
platformio run -e m5stack-atom --target upload
```

### シリアルモニタ

```bash
cd hardware/atom-lite
platformio device monitor -e m5stack-atom
```

または VSCode UI から PlatformIO → Monitor をクリック。

### トラブルシューティング

- **ボード認識エラー**: `platformio device list` でデバイスが表示されるか確認
- **ライブラリ解決エラー**: `platformio lib install` で手動インストール、または `platformio.ini` の `lib_deps` を見直す
- **ビルドエラー**: GreenBeacon.h の include パスが正しいか確認（`src/GreenBeacon.h` と `src/GreenBeacon.cpp` が配置済みか）

