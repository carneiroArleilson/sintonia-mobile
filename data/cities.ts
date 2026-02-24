/**
 * Capitais brasileiras e algumas cidades grandes (coordenadas aproximadas do centro).
 * Usado no seletor "Escolher cidade manualmente".
 */
export type City = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export const CITIES: City[] = [
  { id: 'saopaulo', name: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
  { id: 'riodejaneiro', name: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
  { id: 'belohorizonte', name: 'Belo Horizonte', latitude: -19.9167, longitude: -43.9345 },
  { id: 'brasilia', name: 'Brasília', latitude: -15.7942, longitude: -47.8822 },
  { id: 'curitiba', name: 'Curitiba', latitude: -25.4284, longitude: -49.2733 },
  { id: 'salvador', name: 'Salvador', latitude: -12.9714, longitude: -38.5014 },
  { id: 'fortaleza', name: 'Fortaleza', latitude: -3.7172, longitude: -38.5433 },
  { id: 'recife', name: 'Recife', latitude: -8.0476, longitude: -34.877 },
  { id: 'portoalegre', name: 'Porto Alegre', latitude: -30.0346, longitude: -51.2177 },
  { id: 'manaus', name: 'Manaus', latitude: -3.119, longitude: -60.0217 },
  { id: 'belem', name: 'Belém', latitude: -1.4558, longitude: -48.4902 },
  { id: 'goiania', name: 'Goiânia', latitude: -16.6869, longitude: -49.2648 },
  { id: 'guarulhos', name: 'Guarulhos', latitude: -23.4628, longitude: -46.5333 },
  { id: 'campinas', name: 'Campinas', latitude: -22.9099, longitude: -47.0626 },
  { id: 'santos', name: 'Santos', latitude: -23.9608, longitude: -46.3336 },
  { id: 'sãoluís', name: 'São Luís', latitude: -2.5297, longitude: -44.3028 },
  { id: 'sãogonçalo', name: 'São Gonçalo', latitude: -22.8269, longitude: -43.0539 },
  { id: 'maceio', name: 'Maceió', latitude: -9.6658, longitude: -35.735 },
  { id: 'duquedecaxias', name: 'Duque de Caxias', latitude: -22.7858, longitude: -43.3117 },
  { id: 'natal', name: 'Natal', latitude: -5.7945, longitude: -35.211 },
  { id: 'teresina', name: 'Teresina', latitude: -5.0892, longitude: -42.8019 },
  { id: 'joãopessoa', name: 'João Pessoa', latitude: -7.1195, longitude: -34.845 },
  { id: 'aracaju', name: 'Aracaju', latitude: -10.9472, longitude: -37.0731 },
  { id: 'florianopolis', name: 'Florianópolis', latitude: -27.5954, longitude: -48.548 },
  { id: 'campogrande', name: 'Campo Grande', latitude: -20.4697, longitude: -54.6201 },
  { id: 'cuiaba', name: 'Cuiabá', latitude: -15.6014, longitude: -56.0979 },
  { id: 'palmas', name: 'Palmas', latitude: -10.2491, longitude: -48.3243 },
  { id: 'macapa', name: 'Macapá', latitude: 0.0349, longitude: -51.0694 },
  { id: 'boavista', name: 'Boa Vista', latitude: 2.8235, longitude: -60.6758 },
  { id: 'riobranco', name: 'Rio Branco', latitude: -9.0238, longitude: -70.812 },
  { id: 'portovelho', name: 'Porto Velho', latitude: -8.7612, longitude: -63.9039 },
  { id: 'vitoria', name: 'Vitória', latitude: -20.3155, longitude: -40.2922 },
].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
