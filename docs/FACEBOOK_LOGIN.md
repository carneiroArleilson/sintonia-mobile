# Configurar Login com Facebook

## Onde fica "URIs de redirecionamento OAuth válidos"

A opção pode aparecer em **dois lugares** no painel do Facebook, dependendo da versão da interface:

### Caminho 1 – Pelo produto Facebook Login (mais comum)

1. Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps) e abra o seu app.
2. No **menu lateral esquerdo**, em **"Configurar" (Configure)**, clique em **"Produtos" (Products)**.
3. Localize **"Facebook Login"** e clique nele.
4. No submenu que aparece, clique em **"Configurações" (Settings)**.
5. Na página de configurações do Facebook Login, procure a seção **"Client OAuth Settings"** ou **"Configurações OAuth do cliente"**.
6. O campo **"Valid OAuth Redirect URIs"** / **"URIs de redirecionamento OAuth válidos"** fica nessa seção.  
   Cole lá a URL de redirect (veja abaixo) e clique em **Salvar alterações**.

### Caminho 2 – Por Configurações gerais do app

1. No mesmo painel do app, no menu lateral, clique em **"Configurações" (Settings)**.
2. Clique em **"Avançado" (Advanced)**.
3. Role a página até a seção **"Segurança" (Security)**.
4. Procure o campo **"Valid OAuth Redirect URIs"** e adicione a URL de redirect.

---

## Qual URL colocar no redirect

Ao rodar o app e tocar em **"Continuar com Facebook"**, o Metro/Expo mostra no console algo como:

```
[Facebook] Redirect URI (adicione no Facebook App): https://auth.expo.io/@SEU_USUARIO_EXPO/sintonia-mobile
```

**Use exatamente essa URL** no campo "Valid OAuth Redirect URIs" no Facebook (uma URL por linha se houver várias).

Se não aparecer no console, tente uma destas (trocando `SEU_USUARIO` pelo seu usuário Expo):

- `https://auth.expo.io/@SEU_USUARIO/sintonia-mobile`
- Ou a URL que `npx expo start` mostrar quando você usar login com Facebook.

---

## Checklist

- [ ] App criado em [developers.facebook.com](https://developers.facebook.com)
- [ ] Produto **"Facebook Login"** adicionado ao app
- [ ] **Valid OAuth Redirect URIs** preenchido com a URL do Expo
- [ ] **ID do app** (não o "App Secret") colocado no `.env` como `EXPO_PUBLIC_FACEBOOK_APP_ID`
