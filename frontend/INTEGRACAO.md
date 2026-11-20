# Front ligado na API: login, cadastro e perfil (20/11/2026)

## O que mudou
- **Novo `src/api.js`**: o único arquivo que fala com o back. Envia o token em toda chamada,
  traduz os erros da API para mensagens em português e, se a API responder 401, apaga o token
  e volta para a tela de login.
- **`state.jsx`**:
  - `register()` → `POST /auth/cadastro` (as 4 etapas de uma vez)
  - `login()` → `POST /auth/login`
  - ao abrir o app com token guardado → `GET /usuarios/me`
  - `patchMe()` → `PATCH /usuarios/me` para apelido, motivo, fotos, lembretes e perfil
  - **a senha não é mais guardada no aparelho**; só o token
- **Telas**: Login e Cadastro esperam a resposta da API ("Entrando...", "Criando sua conta...")
  e mostram os erros dela (e-mail já cadastrado, senha errada, servidor fora do ar).
  Perfil mostra "Salvo!" só depois que a API confirma.
- **Lembretes**: agora salva primeiro e depois pede a permissão de notificação, sem travar.

## Ainda no aparelho (próximas sprints)
Diário de cigarros e vontades, metas do dia, crises e comunidade.

## Como testar (dois terminais)
1. Back, na pasta `backend`: `uvicorn app.main:app --reload`
2. Front, na pasta `frontend`: copie `.env.example` para `.env` e rode `npm run dev`
3. Abra **http://localhost:5173** (com `localhost`, não `127.0.0.1`, por causa do CORS)

Testado de ponta a ponta com o banco SQLite: 20 verificações, incluindo senha fora do aparelho,
token adulterado recusado e API fora do ar.
