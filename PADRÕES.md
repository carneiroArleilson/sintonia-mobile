# Padrões do app Sintonia Mobile

## 1. Estilos: um arquivo por tela/componente

- **Cada arquivo `.tsx`** (tela ou componente com layout próprio) tem **um arquivo de estilos dedicado** com o mesmo nome + `.styles.ts`.
- Exemplo: `LoginScreen.tsx` → `LoginScreen.styles.ts`; `HomeScreen.tsx` → `HomeScreen.styles.ts`.
- No `.tsx`, **nunca** use `StyleSheet.create` inline: importe sempre de `./NomeDoArquivo.styles`.
- O arquivo `.styles.ts` exporta um único objeto `styles` criado com `StyleSheet.create({ ... })`.
- Cores e espaçamentos da marca devem ser constantes no topo do `.styles.ts` (ex.: `BRAND_COLOR`, `SPACING`) para manter consistência.

```
screens/
  LoginScreen.tsx       → import { styles } from './LoginScreen.styles'
  LoginScreen.styles.ts
  HomeScreen.tsx       → import { styles } from './HomeScreen.styles'
  HomeScreen.styles.ts
```

---

## 2. Textos traduzíveis (i18n)

- **Nenhum texto visível** deve ser fixo no código: use sempre o sistema de tradução.
- Idiomas suportados: **Português do Brasil (pt)**, **Inglês (en)** e **Espanhol (es)**.
- As chaves de tradução ficam em **um único arquivo**: `i18n/translations.ts`.
- No componente: `const { t } = useTranslation()` e use `t('chave')` para exibir o texto.
- Ao criar uma nova tela ou mensagem, **adicione as chaves nos três idiomas** em `translations.ts`.

Exemplo em `translations.ts`:

```ts
pt: { welcome: 'Bem-vindo', ... },
en: { welcome: 'Welcome', ... },
es: { welcome: 'Bienvenido', ... },
```

No componente: `<Text>{t('welcome')}</Text>`

---

## 3. Design: identidade visual

- **Estilo:** limpo, simples, intuitivo e bonito, alinhado à identidade da marca Sintonia.
- **Referência de assets (logo):** os arquivos oficiais estão em **sintonia-backoffice/public/assets/**:
  - **icon** – ícone simples do aplicativo (favicon/app icon).
  - **logo** – versão mais completa, usada na **abertura do app** (splash/tela inicial).
- No mobile, use em `sintonia-mobile/assets/`:
  - `icon.png` – ícone do app (pode ser cópia ou adaptação do backoffice).
  - `logo.png` (ou equivalente) – logo da abertura/splash.
- Cores e tipografia devem ser inspiradas nesses assets; evitar poluição visual e manter hierarquia clara.

---

## Resumo

| Regra | O que fazer |
|-------|-------------|
| Estilos | 1 arquivo `.styles.ts` por `.tsx`; nunca StyleSheet inline no componente. |
| Textos | Tudo via `t('chave')`; chaves em `i18n/translations.ts` em pt, en e es. |
| Design | Limpo e intuitivo; icon = app icon, logo = abertura; referência em backoffice/public/assets. |
