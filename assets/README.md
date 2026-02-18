# Assets do app

- **icon.png** – Ícone do app (home do dispositivo).
- **logo.png** – Logo usada na tela de login (e splash). **Deve ser a mesma do backoffice.**

## Logo (obrigatória para a tela de login)

A tela de login usa `logo.png`. Use o mesmo arquivo do backoffice:

1. No backoffice: coloque a logo em **sintonia-backoffice/public/assets/logo.png** (veja README_LOGO.md).
2. Copie para o mobile: **sintonia-backoffice/public/assets/logo.png** → **sintonia-mobile/assets/logo.png**.

Exemplo (na raiz do monorepo `sintonia`):

```bash
cp sintonia-backoffice/public/assets/logo.png sintonia-mobile/assets/logo.png
```

No Windows (PowerShell):

```powershell
Copy-Item sintonia-backoffice\public\assets\logo.png -Destination sintonia-mobile\assets\logo.png
```

Se ainda não tiver `logo.png` no backoffice, crie a pasta `public/assets`, coloque sua logo lá e depois copie para esta pasta.
