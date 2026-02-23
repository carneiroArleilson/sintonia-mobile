/**
 * Países, máscaras e helpers de telefone (compartilhado entre Login e Cadastro).
 */

export type PhoneCountry = {
  code: string;
  name: string;
  maxLen: number;
  placeholder: string;
  mask: (nationalDigits: string) => string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  {
    code: '55',
    name: 'Brasil',
    maxLen: 11,
    placeholder: '(11) 99999-9999',
    mask: (d) => {
      if (d.length <= 2) return d ? `(${d}` : '';
      if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length === 7) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}`;
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    },
  },
  {
    code: '1',
    name: 'EUA / Canadá',
    maxLen: 10,
    placeholder: '(123) 456-7890',
    mask: (d) => {
      if (d.length <= 3) return d ? `(${d}` : '';
      if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    },
  },
  {
    code: '52',
    name: 'México',
    maxLen: 10,
    placeholder: '(55) 1234-5678',
    mask: (d) => {
      if (d.length <= 2) return d || '';
      if (d.length <= 5) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length === 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}`;
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    },
  },
  {
    code: '54',
    name: 'Argentina',
    maxLen: 10,
    placeholder: '(11) 9999-9999',
    mask: (d) => {
      if (d.length <= 2) return d ? `(${d}` : '';
      if (d.length <= 5) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      if (d.length === 6) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}`;
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    },
  },
  {
    code: '34',
    name: 'Espanha',
    maxLen: 9,
    placeholder: '612 345 678',
    mask: (d) => {
      if (d.length <= 3) return d || '';
      if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
      return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    },
  },
  {
    code: '351',
    name: 'Portugal',
    maxLen: 9,
    placeholder: '912 345 678',
    mask: (d) => {
      if (d.length <= 3) return d || '';
      if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
      return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    },
  },
  {
    code: '57',
    name: 'Colômbia',
    maxLen: 10,
    placeholder: '(300) 123-4567',
    mask: (d) => {
      if (d.length <= 3) return d ? `(${d}` : '';
      if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
      if (d.length === 7) return `(${d.slice(0, 3)}) ${d.slice(3, 7)}`;
      return `(${d.slice(0, 3)}) ${d.slice(3, 7)}-${d.slice(7)}`;
    },
  },
  {
    code: '56',
    name: 'Chile',
    maxLen: 9,
    placeholder: '9123 4567',
    mask: (d) => {
      if (d.length <= 4) return d || '';
      return `${d.slice(0, 4)} ${d.slice(4)}`;
    },
  },
  {
    code: '51',
    name: 'Peru',
    maxLen: 9,
    placeholder: '999 123 456',
    mask: (d) => {
      if (d.length <= 3) return d || '';
      return `${d.slice(0, 3)} ${d.slice(3)}`;
    },
  },
  {
    code: '593',
    name: 'Equador',
    maxLen: 9,
    placeholder: '99 123 4567',
    mask: (d) => {
      if (d.length <= 3) return d || '';
      return `${d.slice(0, 3)} ${d.slice(3)}`;
    },
  },
  {
    code: '598',
    name: 'Uruguai',
    maxLen: 8,
    placeholder: '99 123 45',
    mask: (d) => (d.length <= 4 ? d : `${d.slice(0, 4)} ${d.slice(4)}`),
  },
  {
    code: '595',
    name: 'Paraguai',
    maxLen: 9,
    placeholder: '981 123 456',
    mask: (d) => (d.length <= 4 ? d : `${d.slice(0, 4)} ${d.slice(4)}`),
  },
  {
    code: '353',
    name: 'Irlanda',
    maxLen: 9,
    placeholder: '85 123 4567',
    mask: (d) => {
      if (d.length <= 2) return d || '';
      if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
      return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
    },
  },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export function getCountryByCode(code: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.code === code) ?? DEFAULT_PHONE_COUNTRY;
}

/** Extrai código do país e número nacional a partir do número completo (só dígitos). */
export function parseFullPhone(fullDigits: string): { code: string; national: string } {
  const d = fullDigits.replace(/\D/g, '');
  if (!d.length) return { code: DEFAULT_PHONE_COUNTRY.code, national: '' };
  const sorted = [...PHONE_COUNTRIES].filter((c) => c.name !== 'Other').sort((a, b) => b.code.length - a.code.length);
  for (const country of sorted) {
    if (d.startsWith(country.code)) {
      const national = d.slice(country.code.length).slice(0, country.maxLen);
      return { code: country.code, national };
    }
  }
  return { code: DEFAULT_PHONE_COUNTRY.code, national: d.slice(0, 15) };
}

export function applyPhoneMaskByCountry(nationalDigits: string, country: PhoneCountry): string {
  const d = nationalDigits.replace(/\D/g, '').slice(0, country.maxLen);
  return country.mask(d);
}

/** Retorna número completo em dígitos: código do país + nacional */
export function getFullPhoneDigits(countryCode: string, nationalDigits: string): string {
  const d = nationalDigits.replace(/\D/g, '').trim();
  const country = getCountryByCode(countryCode);
  return countryCode + d.slice(0, country.maxLen);
}
