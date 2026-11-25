# Sprint 2 no front: Home, Progresso e diário ligados na API (24/11/2026)

## O que mudou
- **`state.jsx`**:
  - `addLog()` → `POST /registros` (cigarro ou vontade vencida, com gatilho e nível)
  - depois de entrar ou registrar, busca `GET /progresso`, `/plano/hoje`, `/registros?dias=7` e `/conquistas`
  - `tempoSemFumar()` deixa o contador andar sozinho entre uma consulta e outra
  - o diário **não fica mais no aparelho**
- **Home**: dia da jornada, contador, economia, cigarros a menos, marcos e limite do dia vêm da API.
  Para o perfil "parou" (Beatriz), o card mostra a **dica do dia** contra um dos gatilhos.
- **Progresso**: o gráfico de 7 dias usa os registros do banco e os marcos vêm da tabela `conquista`.
- **SOS**: "Resisti à vontade" grava a vontade com o nível informado (1 a 5).
- **`utils.js`**: saíram `computeStats`, `dailyLimit` e `MILESTONES`. As contas agora são da API.

## Ainda no aparelho
Metas do dia (checklist), crises e comunidade.

## Como testar
Back na pasta `backend` (`uvicorn app.main:app --reload`, depois de `python dados_iniciais.py`)
e front na pasta `frontend` (`npm run dev`). Abrir **http://localhost:5173**.

Testado de ponta a ponta: 17 verificações da Sprint 2 e as 20 do login (Sprint 1).
