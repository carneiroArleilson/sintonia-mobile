import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginWithSocial as apiLoginSocial,
  getProfile,
  verifyPhoneCode,
  type LoginResult,
} from './client';

const TOKEN_KEY = '@sintonia_token';

export type AuthUser = {
  email: string;
  nome?: string;
  role: string;
  phone?: string | null;
  photoUrl?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  genderLookingFor?: string | null;
  categories?: string[];
  profileComplete?: boolean;
  /** 'phone' = login por telefone (não pedir telefone no cadastro); 'social' = login por email (não pedir email) */
  signupVia?: 'phone' | 'social';
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  profileComplete: boolean;
  refreshProfile: () => Promise<void>;
  /** Marca o perfil como completo no estado local (ex.: após salvar com sucesso). */
  markProfileComplete: () => void;
  loginWithSocial: (
    provider: 'google' | 'facebook' | 'apple',
    options: { idToken?: string; accessToken?: string },
  ) => Promise<void>;
  loginWithPhone: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  setResult: (result: LoginResult) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setResult = useCallback((result: LoginResult) => {
    setToken(result.access_token);
    setUser({
      email: result.email,
      nome: result.nome,
      role: result.role,
    });
    AsyncStorage.setItem(TOKEN_KEY, result.access_token);
  }, []);

  const refreshProfile = useCallback(async () => {
    const t = token;
    if (!t) return;
    try {
      const profile = await getProfile(t);
      setUser({
        email: profile.email,
        nome: profile.nome,
        role: profile.role,
        phone: profile.phone ?? undefined,
        photoUrl: profile.photoUrl ?? undefined,
        birthDate: profile.birthDate ?? undefined,
        gender: profile.gender ?? undefined,
        genderLookingFor: profile.genderLookingFor ?? undefined,
        categories: profile.categories,
        profileComplete: profile.profileComplete,
        signupVia: profile.signupVia,
      });
    } catch {
      // keep current user
    }
  }, [token]);

  const markProfileComplete = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, profileComplete: true } : null));
  }, []);

  const loginWithSocial = useCallback(
    async (
      provider: 'google' | 'facebook' | 'apple',
      options: {
        idToken?: string;
        accessToken?: string;
        nome?: string;
        photoUrl?: string;
      },
    ) => {
      const result = await apiLoginSocial(provider, options);
      setToken(result.access_token);
      AsyncStorage.setItem(TOKEN_KEY, result.access_token);
      const nome = result.nome ?? options.nome ?? undefined;
      const photoUrl = result.photoUrl ?? options.photoUrl ?? undefined;
      setUser({
        email: result.email,
        nome,
        role: result.role,
        photoUrl,
        birthDate: result.birthDate ?? undefined,
        gender: result.gender ?? undefined,
        genderLookingFor: result.genderLookingFor ?? undefined,
        categories: result.categories,
        profileComplete: false,
      });
      try {
        const profile = await getProfile(result.access_token);
        setUser({
          email: profile.email,
          nome: profile.nome ?? nome,
          role: profile.role,
          phone: profile.phone ?? undefined,
          photoUrl: profile.photoUrl ?? photoUrl,
          birthDate: profile.birthDate ?? result.birthDate ?? undefined,
          gender: profile.gender ?? result.gender ?? undefined,
          genderLookingFor: profile.genderLookingFor ?? result.genderLookingFor ?? undefined,
          categories: profile.categories ?? result.categories,
          profileComplete: profile.profileComplete,
          signupVia: profile.signupVia,
        });
      } catch {
        // mantém nome/foto do result já definidos acima
      }
    },
    [],
  );

  const loginWithPhone = useCallback(async (phone: string, code: string) => {
    const result = await verifyPhoneCode(phone, code);
    setToken(result.access_token);
    AsyncStorage.setItem(TOKEN_KEY, result.access_token);
    setUser({
      email: result.email,
      nome: result.nome,
      role: result.role,
      photoUrl: result.photoUrl ?? undefined,
      birthDate: result.birthDate ?? undefined,
      gender: result.gender ?? undefined,
      genderLookingFor: result.genderLookingFor ?? undefined,
      categories: result.categories,
      profileComplete: false,
    });
    try {
      const profile = await getProfile(result.access_token);
      setUser({
        email: profile.email,
        nome: profile.nome,
        role: profile.role,
        phone: profile.phone ?? undefined,
        photoUrl: profile.photoUrl ?? undefined,
        birthDate: profile.birthDate ?? undefined,
        gender: profile.gender ?? undefined,
        genderLookingFor: profile.genderLookingFor ?? undefined,
        categories: profile.categories,
        profileComplete: profile.profileComplete,
        signupVia: profile.signupVia,
      });
    } catch {
      // mantém dados do result
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (cancelled || !stored) {
          setLoading(false);
          return;
        }
        const profile = await getProfile(stored);
        if (cancelled) return;
        setToken(stored);
        setUser({
          email: profile.email,
          nome: profile.nome,
          role: profile.role,
          phone: profile.phone ?? undefined,
          photoUrl: profile.photoUrl ?? undefined,
          birthDate: profile.birthDate ?? undefined,
          gender: profile.gender ?? undefined,
          genderLookingFor: profile.genderLookingFor ?? undefined,
          categories: profile.categories,
          profileComplete: profile.profileComplete,
          signupVia: profile.signupVia,
        });
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Ao voltar ao app, buscar dados frescos do banco (evitar cache)
  useEffect(() => {
    if (!token) return;
    const sub = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') refreshProfile();
    });
    return () => sub.remove();
  }, [token, refreshProfile]);

  const value: AuthContextValue = {
    token,
    user,
    loading,
    profileComplete: user?.profileComplete ?? false,
    refreshProfile,
    markProfileComplete,
    loginWithSocial,
    loginWithPhone,
    logout,
    setResult,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
