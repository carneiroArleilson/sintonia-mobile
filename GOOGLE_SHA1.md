# Como obter a impressão digital SHA-1 para o Google Login (Android)

O Google Cloud Console exige o **SHA-1** ao criar um cliente OAuth do tipo **Android**. Use um dos métodos abaixo.

---

## 1. Keystore de debug (desenvolvimento)

O keystore de debug é criado automaticamente quando você roda o app Android pela primeira vez (por exemplo `npx expo run:android` ou uma build no Android Studio).

### No Windows (PowerShell ou CMD)

```powershell
keytool -keystore $env:USERPROFILE\.android\debug.keystore -list -v -alias androiddebugkey -storepass android
```

Ou, se preferir o caminho completo (troque `SEU_USUARIO` pelo seu usuário do Windows):

```powershell
keytool -keystore C:\Users\SEU_USUARIO\.android\debug.keystore -list -v -alias androiddebugkey -storepass android
```

### Onde fica o SHA-1 na saída

Na saída do comando, procure a linha **"Impressão digital SHA1:"** (ou "SHA1:"). O valor é algo como:

```
AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```

Copie **esse valor completo** e cole no campo "Impressão digital para certificação SHA-1" no Google Cloud Console.

---

## 2. Se o arquivo debug.keystore não existir

Ele só é criado depois da primeira build Android. Opções:

- **Opção A:** Rodar uma vez no Android (device ou emulador):
  ```bash
  npx expo run:android
  ```
  Depois disso o `debug.keystore` costuma aparecer em `C:\Users\SEU_USUARIO\.android\`.

- **Opção B:** Usar só **login no Expo Go** (sem cliente Android no Google): crie um cliente OAuth do tipo **"Aplicativo da Web"** e use o redirect URI `https://auth.expo.io/@seu-usuario/sintonia-mobile`. Nesse fluxo **não é necessário** configurar SHA-1.

---

## 3. Keystore de produção (release)

Para o app em produção (loja), use o keystore que você usa para assinar o APK/AAB. O comando é o mesmo, trocando o caminho e a senha:

```powershell
keytool -keystore CAMINHO_DO_SEU_KEYSTORE_RELEASE -list -v
```

O keytool vai pedir a senha do keystore. Copie o SHA-1 que aparecer e cadastre no Console em um cliente Android de **produção**, se o Google exigir.

---

## Resumo

| Situação | O que fazer |
|----------|-------------|
| Desenvolvimento no **Expo Go** | Use cliente "Aplicativo da Web" + redirect URI do Expo. **Não precisa** de SHA-1. |
| Build **Android** (debug) | Rode `expo run:android` uma vez; depois use o comando acima com `debug.keystore` e copie o SHA-1. |
| Build **Android** (release) | Use o comando com seu keystore de release e cadastre o SHA-1 no cliente Android de produção. |
