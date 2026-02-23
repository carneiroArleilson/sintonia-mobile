/**
 * Fluxos OAuth para Google, Facebook e Apple.
 * Variáveis: EXPO_PUBLIC_GOOGLE_CLIENT_ID, EXPO_PUBLIC_FACEBOOK_APP_ID
 *
 * Google: em iOS/Android usa @react-native-google-signin (nativo, exige iosUrlScheme no app.json).
 * Em web ou fallback usa expo-auth-session (authorization code + PKCE).
 */

import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { exchangeCodeAsync } from 'expo-auth-session';
import {
  GoogleSignin,
  type SignInResponse,
} from '@react-native-google-signin/google-signin';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';

export async function signInWithGoogle(): Promise<{
  idToken: string;
  name?: string | null;
  photoUrl?: string | null;
} | null> {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('EXPO_PUBLIC_GOOGLE_CLIENT_ID não definido');
    return null;
  }

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_CLIENT_ID,
        offlineAccess: false,
      });
      // Força o seletor de contas a aparecer sempre (em vez de usar a conta em cache)
      await GoogleSignin.signOut();
      const response: SignInResponse = await GoogleSignin.signIn();
      if (response.type !== 'success' || !response.data) return null;
      const data = response.data as { idToken?: string | null; user?: { name?: string | null; photo?: string | null } };
      let idToken = data.idToken ?? null;
      if (!idToken) {
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens?.idToken ?? null;
      }
      if (!idToken) return null;
      const name = data.user?.name ?? null;
      const photoUrl = data.user?.photo ?? null;
      return { idToken, name, photoUrl };
    } catch {
      return null;
    }
  }

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  if (__DEV__) {
    console.log('[Google] Redirect URI para Google Console:', redirectUri);
  }
  const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com');
  if (!discovery?.authorizationEndpoint) return null;
  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
  });
  await request.makeAuthUrlAsync(discovery);
  const result = await request.promptAsync(discovery);
  if (result?.type !== 'success') return null;
  const code = (result.params as Record<string, string>).code;
  if (!code) return null;
  const tokenResponse = await exchangeCodeAsync(
    {
      clientId: GOOGLE_CLIENT_ID,
      code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier ?? '' },
    },
    discovery,
  );
  const idToken = tokenResponse?.idToken ?? null;
  return idToken ? { idToken } : null;
}

export type GoogleSignInResult = Awaited<ReturnType<typeof signInWithGoogle>>;

/**
 * Facebook: autenticação via OAuth (abre browser e captura access_token no redirect).
 * Mesmas etapas que Google/Apple: login → cadastro se incompleto → home.
 * No Facebook Developers: adicione "Facebook Login" e em "Valid OAuth Redirect URIs"
 * coloque o redirect que o Expo mostra (ex.: https://auth.expo.io/@seu-user/sintonia-mobile).
 */
export async function signInWithFacebook(): Promise<{ accessToken: string } | null> {
  if (!FACEBOOK_APP_ID) {
    console.warn('EXPO_PUBLIC_FACEBOOK_APP_ID não definido');
    return null;
  }
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  if (__DEV__) {
    console.log('[Facebook] Redirect URI (adicione no Facebook App):', redirectUri);
  }
  const url = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email,public_profile`;
  const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
  if (result?.type !== 'success' || !result.url) return null;
  const hashMatch = result.url.match(/#access_token=([^&]+)/);
  const queryMatch = result.url.match(/[?&]access_token=([^&]+)/);
  const raw = hashMatch?.[1] ?? queryMatch?.[1];
  if (!raw) return null;
  const accessToken = decodeURIComponent(raw);
  return { accessToken };
}

/**
 * Apple: só disponível em dispositivo iOS (não no Expo Go em Android).
 */
export async function signInWithApple(): Promise<{ idToken: string } | null> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const idToken = credential.identityToken ?? null;
    return idToken ? { idToken } : null;
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw e;
  }
}
