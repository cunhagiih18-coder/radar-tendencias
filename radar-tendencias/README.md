# Radar de Tendências

Dashboard de monitoramento diário de marketing digital e lançamentos, com classificação automática por IA.

## Deploy no Vercel (passo a passo)

### 1. Suba o projeto no GitHub

```bash
git init
git add .
git commit -m "feat: radar de tendências v1"
git remote add origin https://github.com/SEU_USUARIO/radar-tendencias.git
git push -u origin main
```

### 2. Importe no Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Conecte o repositório `radar-tendencias`
3. Clique em **Deploy** (as configurações padrão funcionam)

### 3. Configure a variável de ambiente

Ainda no Vercel, vá em **Settings → Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` (sua chave da Anthropic) |

4. Clique em **Redeploy** após salvar a variável.

### Desenvolvimento local

```bash
npm install

# Crie o arquivo de variáveis locais
cp .env.example .env.local
# Edite .env.local e coloque sua chave real

npm run dev
# Acesse http://localhost:3000
```

## Segurança

- A chave da API **nunca** vai para o frontend — fica apenas na API Route (`/api/radar`)
- `.env.local` está no `.gitignore` — nunca será commitado
- O endpoint `/api/radar` só aceita `POST` e não expõe a chave

## Estrutura

```
app/
  api/radar/route.js   ← chamada server-side para Anthropic (chave segura)
  page.js              ← dashboard React (client)
  page.module.css      ← estilos
  globals.css          ← design system
  layout.js            ← metadata
```
