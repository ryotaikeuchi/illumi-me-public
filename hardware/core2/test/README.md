# Beebotte通信テスト

M5Stack Core2とBeebotteのMQTT通信の検証プログラムです。

## 検証内容

1. Beebotteへの接続性
2. MQTTメッセージの受信
3. JSONデータの解析と表示

## セットアップ

1. Arduino IDEに必要なライブラリをインストール
   - M5Core2
   - PubSubClient
   - ArduinoJson

2. `config.h`に必要な情報を設定
   - WiFi情報
   - Beebotteトークン

## Beebotteの設定

1. チャンネル: `led_control`
2. リソース: `commands`
3. データ形式:
```json
{
    "pattern": "flow",  // または "blink"
    "colors": ["#FF0000", "#00FF00", "#0000FF"]
}
```