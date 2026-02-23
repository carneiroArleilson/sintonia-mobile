# Login com Google – configuração

O erro **"Acesso bloqueado: erro de autorização"** ou **400: invalid request** costuma ser **redirect URI não cadastrado** ou uso de fluxo não permitido.

## 1. Fluxo usado no app

O app usa **Authorization Code com PKCE** (recomendado pelo Google). O redirect URI varia conforme o ambiente.

## 2. Onde ver o redirect URI

Ao tocar em **"Continuar com Gmail"**, no terminal do Metro/Expo aparece algo como:

```text
[Google] Adicione este URI no Google Cloud Console > Credenciais > URIs de redirecionamento: https://auth.expo.io/@SEU_USUARIO/sintonia-mobile
```

Copie esse valor exato (pode ser `https://auth.expo.io/...` no Expo Go ou `sintonia://` em build de produção).

## 3. Configurar no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/) → seu projeto.
2. **APIs e serviços** → **Credenciais**.
3. Abra o **OAuth 2.0 Client ID** do tipo **"Aplicativo da Web"** (ou crie um).
4. Em **URIs de redirecionamento autorizados**, clique em **+ ADICIONAR URI** e cole **exatamente** o URI que apareceu no log (incluindo `https://` ou `sintonia://`).
5. Salve.

## 4. Tipos de cliente

- **Expo Go (desenvolvimento):** use cliente **"Aplicativo da Web"** e redirect URI `https://auth.expo.io/@SEU_USUARIO/sintonia-mobile`.
- **Build de produção (scheme `sintonia`):** adicione também `sintonia://` (ou o scheme que você configurou no `app.json`) nos URIs de redirecionamento.

## 5. Tela de consentimento OAuth

Se o app estiver em **"Testando"**, só contas adicionadas como **usuários de teste** conseguem entrar. Em **Tela de consentimento OAuth** adicione o e-mail que você usa para testar.

Depois de salvar as alterações no Console, espere alguns minutos e tente o login de novo.
