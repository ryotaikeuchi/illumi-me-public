# 認証フロー

本システムでは、以下の認証フローでLINEユーザーとFirebaseを連携している。

1.  **LIFFアプリからのIDトークン取得**: LIFFアプリの`useAuth`カスタムフック (`liff/liff-app/src/hooks/useAuth.js`) が、LINE SDKを通じてLINE IDトークンを取得する。
2.  **Cloud Functionsでのカスタムトークン生成**: 取得したLINE IDトークンはCloud Functionsの`createFirebaseToken`関数 (`cloud/functions/auth.js`) に送信される。
3.  **IDトークンの検証とFirebase認証**: Cloud FunctionsはLINEサーバーでIDトークンを検証し、トークンからLINEユーザーIDを抽出する。このLINEユーザーIDをFirebaseのUIDとして使用し、Firebaseカスタムトークンを生成する。
4.  **Firebaseへのサインイン**: LIFFアプリはCloud Functionsから受け取ったFirebaseカスタムトークンを使用してFirebase Authenticationにサインインする。これにより、Firebaseのユーザー認証が確立され、FirebaseのUIDはLINEユーザーIDと同一になる。
5.  **Firestoreアクセス制御**: Firestoreのセキュリティルール (`firestore.rules`) は、このFirebase UID（LINEユーザーID）に基づいてユーザーごとのデータアクセスを制御する。各ユーザーは自身のLINEユーザーIDに対応するFirestoreドキュメントのみを読み書きできる（例: `/users/{lineUserId}`）。

```mermaid
sequenceDiagram
    participant User
    participant LIFF App (Frontend)
    participant LINE Platform
    participant Cloud Function (Backend)
    participant Firebase Auth

    User->>LIFF App (Frontend): アプリを開く
    LIFF App (Frontend)->>LINE Platform: LIFF初期化 & ログイン確認 (liff.init)
    alt ログインしていない場合
        LIFF App (Frontend)->>User: LINEログイン画面にリダイレクト
        User->>LINE Platform: ログイン情報入力
        LINE Platform-->>LIFF App (Frontend): 認証情報と共にリダイレクト
    end
    LIFF App (Frontend)->>LINE Platform: IDトークンを要求 (liff.getIDToken)
    LINE Platform-->>LIFF App (Frontend): IDトークンを返却

    LIFF App (Frontend)->>Cloud Function (Backend): (1) IDトークンを送信
    Cloud Function (Backend)->>LINE Platform: (2) IDトークンを検証 (verify API)
    LINE Platform-->>Cloud Function (Backend): (3) 検証結果 (ユーザーID等) を返却

    Cloud Function (Backend)->>Firebase Auth: (4) ユーザーIDでカスタムトークンを要求
    Firebase Auth-->>Cloud Function (Backend): (5) Firebaseカスタムトークンを返却
    Cloud Function (Backend)-->>LIFF App (Frontend): (6) Firebaseカスタムトークンを返却

    LIFF App (Frontend)->>Firebase Auth: (7) Firebaseカスタムトークンでサインイン
    Firebase Auth-->>LIFF App (Frontend): (8) Firebase認証完了
```
