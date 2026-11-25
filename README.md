# Vida Sem Fumaça

PWA de apoio para parar ou reduzir o cigarro. Projeto Integrador – GTI – Senac Santo Amaro.

| Equipe | Pessoas | Pasta |
| --- | --- | --- |
| Front-end (React + Vite) | Henrique e Felipe | `frontend/` |
| Back-end (Python + FastAPI) | Yago e Oliver | `backend/app/` |
| Banco de dados (SQLAlchemy) | Daniel e Leonardo | `backend/app/models.py`, `backend/dados_iniciais.py`, `docs/` |

> **Vai usar IA?** Entregue primeiro o arquivo [`CONTEXTO_IA.md`](CONTEXTO_IA.md) inteiro. Ele é a
> fonte da verdade do projeto: rotas, campos, tabelas, regras e o que já está pronto.

**Situação:** Sprints 0, 1 e 2 concluídas (cadastro, login, perfil, diário, progresso, plano do
dia e marcos de saúde funcionando de ponta a ponta). Próxima: Sprint 3 (SOS e mapa do SUS).

---

## 1. O que instalar antes (uma vez só)

| Programa | Versão | Como conferir |
| --- | --- | --- |
| Git | qualquer recente | `git --version` |
| Python | 3.11 ou mais novo | Windows: `python --version` · Linux: `python3 --version` |
| Node.js e npm | Node 18 ou mais novo | `node --version` e `npm --version` |

- **Windows:** `winget install Git.Git Python.Python.3.12 OpenJS.NodeJS.LTS` (feche e abra o terminal depois).
- **Linux (Ubuntu):** `sudo apt install git python3 python3-venv python3-pip nodejs npm`

Depois, baixe o projeto:

```bash
git clone https://github.com/henriquefrancisco821-spec/projeto-vida-sem-fuma-a.git
cd projeto-vida-sem-fuma-a
```

---

## 2. Back-end (API)

Todos os comandos desta parte são rodados **dentro da pasta `backend`**.

### 2.1 Ambiente virtual e bibliotecas

**Linux**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

**Windows (PowerShell)**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
```

Deu certo quando o terminal mostra `(.venv)` no começo da linha.
O `requirements-dev.txt` instala as bibliotecas da API **e** as dos testes.

> Windows: se o PowerShell disser que "a execução de scripts foi desabilitada", rode uma vez
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e tente de novo.

### 2.2 Arquivo `.env` (configurações secretas)

Copie o modelo:

- Linux: `cp .env.example .env`
- Windows: `Copy-Item .env.example .env`

Gere uma chave secreta só sua:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Abra o `.env` no editor e troque o valor de `SECRET_KEY` pela chave gerada. Fica assim (com a sua chave):

```
DATABASE_URL=sqlite:///./vida_sem_fumaca.db
SECRET_KEY=<a chave que o comando gerou>
CORS_ORIGINS=http://localhost:5173
```

> **Segurança:** o `.env` nunca vai para o GitHub (o `.gitignore` já impede) e nunca deve ser
> colado no chat de IA, no Trello ou no WhatsApp. Quem tiver a `SECRET_KEY` consegue criar
> crachás de login falsos. Cada pessoa gera a sua.

### 2.3 Criar o banco e os dados iniciais

A ordem importa: primeiro as tabelas, depois os dados.

```bash
python criar_banco.py
python dados_iniciais.py
```

Saída esperada (resumida):

```
Banco pronto com 15 tabelas: ...
Marcos de saúde: 6 criados agora, 6 no banco.
```

Isso cria o arquivo `vida_sem_fumaca.db`. Pode rodar o `dados_iniciais.py` de novo quando quiser:
ele não duplica nada (na segunda vez mostra `0 criados agora, 6 no banco`).

### 2.4 Rodar os testes

```bash
pytest
```

Esperado: todos passando (`46 passed` no fim da Sprint 2). Os testes usam um banco temporário
próprio, então não mexem no seu `vida_sem_fumaca.db`.

### 2.5 Ligar a API

```bash
uvicorn app.main:app --reload
```

- Documentação e testes manuais: <http://127.0.0.1:8000/docs>
- Saúde da API: <http://127.0.0.1:8000/health> → `{"status":"ok","banco":"conectado"}`

Deixe este terminal aberto. `Ctrl + C` desliga a API.

---

## 3. Front-end (app)

Abra **outro terminal** (a API continua ligada no primeiro) e vá para a pasta `frontend`:

```bash
cd frontend
npm install
```

Crie o `.env` do front a partir do modelo:

- Linux: `cp .env.example .env`
- Windows: `Copy-Item .env.example .env`

Ligue o app:

```bash
npm run dev
```

Abra <http://localhost:5173>. Use o modo celular do navegador (`F12` → ícone de celular) para ver
como no aparelho.

> **Testar no celular de verdade:** `npm run dev -- --host` e abra no celular o endereço
> "Network" que aparecer. Faça isso **só em Wi-Fi de confiança**: com `--host`, qualquer
> aparelho da mesma rede consegue acessar o seu servidor de desenvolvimento.
>
> **`npm audit`:** existe um alerta no Vite/esbuild que afeta só o servidor de desenvolvimento.
> **Não rode `npm audit fix --force`**: ele troca versões sem testar e pode quebrar o app. A
> atualização vai ser feita num card próprio.

---

## 4. Resumo do dia a dia

Com tudo instalado, para trabalhar você só precisa de dois terminais:

| Terminal 1 (API) | Terminal 2 (app) |
| --- | --- |
| `cd backend` | `cd frontend` |
| Linux: `source .venv/bin/activate` · Windows: `.venv\Scripts\Activate.ps1` | `npm run dev` |
| `uvicorn app.main:app --reload` | abrir <http://localhost:5173> |

Depois de um `git pull` que trouxe mudanças, rode de novo, conforme o caso:
- mudou `requirements*.txt` → `pip install -r requirements-dev.txt`
- mudou `package.json` → `npm install`
- mudou `dados_iniciais.py` → `python dados_iniciais.py`
- mudou `models.py` (tabela nova ou coluna nova) → apague o `vida_sem_fumaca.db`, depois
  `python criar_banco.py` e `python dados_iniciais.py` (no MVP não usamos migrações; você perde
  só os dados de teste da sua máquina)

---

## 5. Como contribuir (Git)

1. Atualize a `main` e crie a branch do card:
   ```bash
   git checkout main
   git pull
   git checkout -b s3-back-crises
   ```
2. Programe e teste (`pytest` no back; navegador no front).
3. Confira **o que** vai entrar no commit:
   ```bash
   git status -u
   ```
   Não podem aparecer: `.env`, `*.db`, `.venv/`, `node_modules/`, `.pytest_cache/`.
4. Adicione só os arquivos do card, faça o commit e envie:
   ```bash
   git add backend/app/routers/crises.py backend/tests/test_crises.py
   git commit -m "S3: cria rota de crises"
   git push -u origin s3-back-crises
   ```
   Os caminhos do `git add` são relativos à pasta em que o terminal está.
5. Abra o Pull Request no GitHub. Revisão cruzada: **Front revisa Back, Back revisa Banco, Banco
   revisa Front**. Ninguém envia direto para a `main`.
6. Mudou rota, campo, tabela ou regra? Atualize o `CONTEXTO_IA.md` **no mesmo PR**.

---

## 6. Problemas comuns

| Erro | Causa | Solução |
| --- | --- | --- |
| `No module named 'app'` | `uvicorn` rodado fora da pasta `backend` | `cd backend` e rode de novo |
| `No module named 'dotenv'` (ou `fastapi`, `bcrypt`...) | `.venv` não ativado, ou bibliotecas não instaladas | Ative o `.venv` e rode `pip install -r requirements-dev.txt` |
| `no such table: ...` | Banco ainda não criado ou desatualizado | `python criar_banco.py` e `python dados_iniciais.py` |
| Marcos de saúde não aparecem na tela de Progresso | Faltou o `dados_iniciais.py` | `python dados_iniciais.py` |
| App mostra "Não foi possível falar com o servidor" | API desligada | Ligue a API (seção 2.5) |
| Erro de CORS no console do navegador | App aberto em `127.0.0.1:5173` em vez de `localhost:5173` | Use <http://localhost:5173> (é o endereço liberado em `CORS_ORIGINS`) |
| `npm: command not found` | Node.js não instalado | Seção 1 |
| `pathspec ... did not match any files` no `git add` | Caminho relativo à pasta errada | Confira em que pasta o terminal está (`pwd`) |
| `ZoneInfoNotFoundError` (Windows) | Faltou o pacote `tzdata` | `pip install -r requirements-dev.txt` |

---

## 7. Estrutura

```
projeto/
├── CONTEXTO_IA.md   ← fonte da verdade (contrato, regras, situação)
├── README.md        ← este arquivo
├── backend/         ← API FastAPI, modelos do banco, testes
└── frontend/        ← PWA React + Vite
```

Detalhes de cada arquivo: seção 3 do `CONTEXTO_IA.md`.
