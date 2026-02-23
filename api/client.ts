import { API_BASE_URL } from './config';

if (__DEV__) {
  console.log('[API] Usando base URL:', API_BASE_URL);
}

export type SocialProvider = 'google' | 'facebook' | 'apple';

export type LoginResult = {
  access_token: string;
  role: string;
  email: string;
  nome?: string;
  photoUrl?: string;
  birthDate?: string | null;
  gender?: string | null;
  genderLookingFor?: string | null;
  categories?: string[];
};

async function fetchWithNetworkHint(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'Network request failed' || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error(
        `Não foi possível conectar ao servidor. URL usada: ${API_BASE_URL}. Verifique: 1) Backend rodando (npm run start no sintonia-backend); 2) Celular e PC na mesma rede Wi‑Fi; 3) Firewall do Windows liberando a porta 3001; 4) No .env, EXPO_PUBLIC_API_URL com o IP correto do PC (ipconfig). Reinicie o Metro após alterar o .env.`,
      );
    }
    throw e;
  }
}

export async function loginWithSocial(
  provider: SocialProvider,
  options: { idToken?: string; accessToken?: string; nome?: string | null; photoUrl?: string | null },
): Promise<LoginResult> {
  const body: {
    provider: SocialProvider;
    idToken?: string;
    accessToken?: string;
    nome?: string;
    photoUrl?: string;
  } = { provider };
  if (options.idToken) body.idToken = options.idToken;
  if (options.accessToken) body.accessToken = options.accessToken;
  if (options.nome != null && options.nome !== '') body.nome = options.nome;
  if (options.photoUrl != null && options.photoUrl !== '') body.photoUrl = options.photoUrl;

  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/app/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Login falhou');
  }

  const data = await res.json();
  if (__DEV__) {
    console.log('[API] Login social resposta:', {
      email: data.email,
      nome: data.nome ?? '(vazio)',
      photoUrl: data.photoUrl ? 'ok' : '(vazio)',
      birthDate: data.birthDate ?? '(vazio)',
      gender: data.gender ?? '(vazio)',
      genderLookingFor: data.genderLookingFor ?? '(vazio)',
      categorias: data.categories?.length ?? 0,
    });
  }
  return data;
}

/** Solicita código OTP para o telefone (backend gera e persiste; em produção enviar SMS). */
export async function requestPhoneCode(phone: string): Promise<{ success: boolean }> {
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/app/phone/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Falha ao enviar código');
  }
  return res.json();
}

/** Verifica código OTP e retorna token + dados do usuário (mesmo formato do login social). */
export async function verifyPhoneCode(
  phone: string,
  code: string,
): Promise<LoginResult> {
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/app/phone/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Código inválido ou expirado');
  }
  return res.json();
}

export type AppProfile = {
  nome?: string;
  photoUrl?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  genderLookingFor?: string | null;
  categories?: string[];
  profileComplete?: boolean;
};

export async function getProfile(accessToken: string): Promise<{
  role: string;
  email: string;
  nome?: string;
  photoUrl?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  genderLookingFor?: string | null;
  categories?: string[];
  profileComplete?: boolean;
  signupVia?: 'phone' | 'social' | 'email';
  galleryPhotos?: { id: string; url: string }[];
}> {
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Não autorizado');
  const data = await res.json();
  if (__DEV__) {
    console.log('[API] GET /auth/me photoUrl:', data?.photoUrl ? data.photoUrl.substring(0, 50) + '...' : '(vazio)', 'profileComplete:', data?.profileComplete);
  }
  return data;
}

export type GalleryPhotoItem = { id: string; url: string };

/** Adiciona uma foto na galeria do usuário (vários ângulos). Use a URL retornada por uploadProfilePhoto. */
export async function addGalleryPhoto(
  accessToken: string,
  photoUrl: string,
): Promise<{ id: string }> {
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/profile/gallery-photos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ photoUrl: photoUrl.trim() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Falha ao adicionar foto na galeria');
  }
  return res.json();
}

/** Remove uma foto da galeria do usuário. */
export async function removeGalleryPhoto(
  accessToken: string,
  photoId: string,
): Promise<{ success: boolean }> {
  const res = await fetchWithNetworkHint(
    `${API_BASE_URL}/auth/profile/gallery-photos/${encodeURIComponent(photoId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Falha ao remover foto');
  }
  return res.json();
}

/** Perfil retornado pela listagem de discovery (tela de match). */
export type DiscoveryProfile = {
  id: string;
  userId: string;
  nome: string;
  photoUrl: string;
  birthDate: string;
  categories: string[];
  galleryPhotos?: { id: string; url: string }[];
};

/** Lista perfis para discovery (tela de match). Requer token app_user. */
export async function getDiscoveryProfiles(accessToken: string): Promise<DiscoveryProfile[]> {
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/discovery`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Falha ao carregar perfis');
  return res.json();
}

/** Verifica se o e-mail está disponível (não usado por outra conta). Requer token. */
export async function checkEmailAvailable(
  accessToken: string,
  email: string,
): Promise<{ available: boolean }> {
  const encoded = encodeURIComponent(email.trim().toLowerCase());
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/check-email?email=${encoded}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Falha ao verificar e-mail');
  }
  return res.json();
}

export type CategoryItem = { id: string; key: string; label: string };

export async function getCategories(locale: string): Promise<CategoryItem[]> {
  const res = await fetchWithNetworkHint(
    `${API_BASE_URL}/categories?locale=${encodeURIComponent(locale || 'pt')}`,
  );
  if (!res.ok) throw new Error('Falha ao carregar categorias');
  return res.json();
}

export async function updateAppProfile(
  accessToken: string,
  data: {
    nome?: string;
    email?: string | null;
    phone?: string | null;
    photoUrl?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    genderLookingFor?: string | null;
    categories?: string[];
  },
): Promise<{ success: boolean }> {
  const body: Record<string, unknown> = {};
  if (data.nome !== undefined) body.nome = data.nome;
  if (data.email !== undefined) body.email = data.email;
  if (data.phone !== undefined) body.phone = data.phone;
  if (data.photoUrl !== undefined) body.photoUrl = data.photoUrl;
  if (data.birthDate !== undefined) body.birthDate = data.birthDate;
  if (data.gender !== undefined) body.gender = data.gender;
  if (data.genderLookingFor !== undefined) body.genderLookingFor = data.genderLookingFor;
  if (data.categories !== undefined) body.categories = data.categories;

  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = err.message || 'Falha ao atualizar perfil';
    if (__DEV__) {
      console.warn('[API] PATCH /auth/profile falhou:', res.status, msg, 'body keys:', Object.keys(body));
    }
    throw new Error(msg);
  }
  if (__DEV__) {
    console.log('[API] PATCH /auth/profile ok, body tinha', Object.keys(body).length, 'campos');
  }
  return res.json();
}

/** Atualiza apenas a URL da foto de perfil (app user). Usar após upload. */
export async function updateProfilePhotoUrl(
  accessToken: string,
  photoUrl: string,
): Promise<{ success: boolean }> {
  const res = await fetchWithNetworkHint(`${API_BASE_URL}/auth/profile/photo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ photoUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Falha ao atualizar foto');
  }
  return res.json();
}

/** Upload de foto de perfil (app user). Retorna a URL para enviar em updateAppProfile. */
export async function uploadProfilePhoto(
  accessToken: string,
  file: { uri: string; type?: string; name?: string },
): Promise<{ url: string; key: string }> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type || 'image/jpeg',
    name: file.name || 'photo.jpg',
  } as unknown as Blob);

  const res = await fetchWithNetworkHint(`${API_BASE_URL}/upload/profile-photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Falha ao enviar foto');
  }
  const data = await res.json();
  if (__DEV__) {
    console.log('[API] Upload profile-photo resposta:', { url: data?.url ? 'ok' : '(vazio)', key: data?.key ?? '(n/a)' });
  }
  const url = data?.url ?? data?.secure_url;
  if (!url || typeof url !== 'string') {
    console.warn('[API] Resposta do upload sem url:', data);
    throw new Error('Servidor não retornou a URL da foto');
  }
  return { url, key: data?.key ?? '' };
}
