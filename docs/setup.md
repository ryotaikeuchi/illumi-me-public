# セットアップとデプロイ

## 必要な環境
- Arduino IDE
  - M5Stack関連ライブラリ
  - FastLED
- Node.js
- Firebase CLI
- LINE Developers アカウント
- Beebotte アカウント

## 環境変数
プロジェクトのルートで、以下の環境変数ファイルを作成または設定してください。

### LIFFアプリ用 (`liff/liff-app/.env`)
Viteの仕様に従い、`VITE_`プレフィックスを付ける必要がある。
```
VITE_CREATE_TOKEN_URL="https://us-central1-your-project-id.cloudfunctions.net/createFirebaseToken"
```

### Cloud Functions用 (`cloud/functions/.env`)
Cloud Functions v2では、`.env`ファイルを使用して環境変数を管理する。`cloud/functions`ディレクトリに`.env`ファイルを作成し、以下のように変数を設定すること。

**注意:** `.env`ファイルは`.gitignore`に含まれており、バージョン管理の対象外である。

```
LIFF_CHANNEL_ID="YOUR_LIFF_CHANNEL_ID"
LINE_CHANNEL_ACCESS_TOKEN="YOUR_LINE_CHANNEL_ACCESS_TOKEN"
LINE_CHANNEL_SECRET="YOUR_LINE_CHANNEL_SECRET" # Cloud FunctionsでLINE IDトークンを検証するために使用
BEEBOTTE_TOKEN="YOUR_BEEBOTTE_API_TOKEN"
BEEBOTTE_CHANNEL="YOUR_BEEBOTTE_CHANNEL"
BEEBOTTE_RESOURCE="YOUR_BEEBOTTE_RESOURCE"
```

### M5Stack Core2用 (`hardware/core2/src/credentials.h`)
このファイルは手動で作成すること。
```cpp
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define BEEBOTTE_MQTT_BROKER "mqtt.beebotte.com"
#define BEEBOTTE_MQTT_PORT 1883
#define BEEBOTTE_MQTT_TOKEN "YOUR_BEEBOTTE_MQTT_TOKEN" // BeebotteのToken
#define BEEBOTTE_CHANNEL "YOUR_BEEBOTTE_CHANNEL"
#define BEEBOTTE_RESOURCE "YOUR_BEEBOTTE_RESOURCE"
```

> [!NOTE]
> **M5Atom Liteについて**
> Atom LiteはLINE Beaconの信号を発信するのみであるため、WiFi設定やクラウド連携の環境変数は不要である。電源を入れるだけで動作する。

## デプロイ手順

1. **Firebaseプロジェクトの設定**
   初回のみ、またはプロジェクト設定を変更した場合に実行する。
   ```bash
   firebase init
   ```

2. **Cloud Functionsのデプロイ**
   ```bash
   cd cloud/functions
   npm install
   firebase deploy --only functions
   ```

3. **LIFFアプリのデプロイ**
   ```bash
   cd liff/liff-app
   npm install
   npm run build
   firebase deploy --only hosting
   ```
   
4. **Firestoreセキュリティルールのデプロイ**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **M5デバイスの設定**
- Arduino IDEで各ファームウェアをビルド・書き込み
- **ライブラリの準備**:
  `green-beacon-esp32` ライブラリが必要である。プロジェクトのルートディレクトリで以下のコマンドを実行して取得すること。
  ```bash
  git clone https://github.com/ukkz/green-beacon-esp32.git
  ```
  ※ Arduino IDEを使用する場合は、このフォルダをArduinoのライブラリフォルダ（例: `Documents/Arduino/libraries`）に配置するか、ZIPライブラリとしてインポートすること。
- `hardware/core2/src/credentials.h` 等に正しい認証情報を設定
