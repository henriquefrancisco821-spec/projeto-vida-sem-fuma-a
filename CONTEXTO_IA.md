# Vida Sem Fumaça — Contexto do projeto para IA

> Atualizado em 14/11/2026 · Sprint 1 em andamento
>
> Este arquivo é a **fonte da verdade** do projeto. Ele fica na raiz do repositório e deve ser
> entregue a qualquer IA antes de pedir código. Se algo aqui mudar, a mudança entra no mesmo
> Pull Request que mudou o código.

---

## 0. Instruções para a IA (leia antes de tudo)

Você está ajudando estudantes de GTI (Senac Santo Amaro) a construir um projeto em grupo, dividido
em três equipes: Front-end, Back-end e Banco de dados. Cada equipe usa IA separadamente, então
**a única forma de as partes se encaixarem é todas seguirem este arquivo à risca**.

Regras obrigatórias:

1. **Não renomeie nada** que esteja neste arquivo: rotas, campos de JSON, tabelas, colunas,
   valores (`fuma`/`parou`, `cigarro`/`vontade`, `conquista`/`ajuda`), pastas e arquivos.
2. **Não invente** rotas, campos, tabelas ou bibliotecas que não estejam aqui. Se a tarefa
   precisar de algo novo, **pare e avise**: "isso não está no contrato, precisa ser combinado
   com as outras equipes".
3. **Antes de escrever código**, liste o que no código atual do aluno está diferente deste arquivo.
4. Os nomes no código (variáveis, funções, campos, tabelas) são **em português e em snake_case**
   no back-end e no banco. No front, os componentes seguem o padrão já existente (PascalCase).
5. **Segurança é requisito, não detalhe:** nunca coloque senha, chave ou token no código; nunca
   devolva `senha_hash` numa resposta; o usuário logado vem **sempre do token**, nunca de um id
   enviado pelo front (seção 7).
6. Explique o código em linguagem simples. Os alunos estão aprendendo.
7. Respeite as versões da seção 2. Não sugira trocar de framework ou biblioteca.

---

## 1. O projeto

**Vida Sem Fumaça** é um PWA (site instalável no celular) que apoia quem quer parar de fumar,
com foco no primeiro mês. Projeto Integrador do curso de GTI.

Dois perfis de usuário (personas do documento do PI):

| Perfil | Valor no sistema | Persona | O que o app faz |
| --- | --- | --- | --- |
| Ainda fuma e quer parar | `fuma` | Marcos, 38 anos, fuma há 20 anos | Plano de redução: **1 cigarro a menos por dia** até zerar |
| Já parou e quer se manter | `parou` | Beatriz, 25 anos, parou há 2 semanas | Sem limite; apoio contra os gatilhos e lembretes do seu porquê |

Requisitos funcionais (documento do PI, Quadro 3):

| Código | Requisito |
| --- | --- |
| RF01 | Cadastro e login do usuário |
| RF02 | Cadastro com consumo diário, preço do maço e motivo pessoal |
| RF03 | Registrar diariamente cigarros consumidos e crises de vontade |
| RF04 | Registrar os gatilhos associados à vontade de fumar |
| RF05 | Gerar e acompanhar o plano de redução gradual (perfil `fuma`) |
| RF06 | Calcular e exibir o tempo sem fumar e o dinheiro economizado |
| RF07 | Exibir os marcos de recuperação da saúde |
| RF08 | Botão de crise (SOS) com plano de enfrentamento e motivo pessoal |
| RF09 | Indicar UBS e CAPS AD mais próximos |
| RF10 | Comunidade de apoio entre usuários |
| RF11 | Lembretes e mensagens de incentivo |
| RF12 | Armazenar os dados de forma segura (LGPD) |

Requisitos não funcionais: interface simples (RNF01), contador e SOS funcionam sem internet
(RNF02), disponibilidade (RNF03), dados de saúde protegidos e uso anônimo (RNF04), funciona em
qualquer celular (RNF05), resposta rápida (RNF06), código em camadas e módulos (RNF07).

---

## 2. Arquitetura e tecnologias

Arquitetura em 3 camadas, cliente-servidor:

```
[Celular: PWA React] --HTTPS/JSON--> [API FastAPI] --SQLAlchemy--> [Banco SQLite/PostgreSQL]
```

| Camada | Tecnologia | Versão | Equipe |
| --- | --- | --- | --- |
| Front-end | React + Vite, PWA com service worker próprio (`public/sw.js`) | React 18, Vite 5 | Henrique e Felipe |
| Back-end | Python + FastAPI + Uvicorn | Python 3.11+, FastAPI 0.162 | Yago e Oliver |
| Banco | SQLAlchemy 2 (estilo `Mapped`/`mapped_column`) | SQLAlchemy 2.1 | Daniel e Leonardo |
| Banco em desenvolvimento | SQLite (arquivo `vida_sem_fumaca.db`) | — | — |
| Banco na entrega | PostgreSQL no Amazon RDS (troca só a `DATABASE_URL` no `.env`) | — | — |
| Senha | bcrypt | 5.0 | Back |
| Token de login | JWT (PyJWT), algoritmo HS256, validade 7 dias | 2.15 | Back |
| Hospedagem (Sprint 5) | AWS: RDS, API em contêiner Docker, front no S3 + CloudFront | — | Todos |

Bibliotecas do back-end (`backend/requirements.txt`):

```
fastapi==0.162.0
uvicorn[standard]==0.54.0
SQLAlchemy==2.1.8
python-dotenv==1.2.4
bcrypt==5.0.0
PyJWT==2.15.1
email-validator==2.3.0
tzdata==2026.6
```

---

## 3. Estrutura de pastas

```
projeto/
├── CONTEXTO_IA.md            ← este arquivo
├── README.md
├── .gitignore                ← ignora .env, .venv, *.db, node_modules, dist
├── docs/
│   └── projeto-logico.md     ← modelo lógico do banco (equipe Banco)
├── backend/
│   ├── requirements.txt
│   ├── .env.example          ← modelo do .env (sem segredos)
│   ├── .env                  ← NUNCA vai para o GitHub
│   ├── criar_banco.py        ← cria as tabelas a partir dos modelos
│   └── app/
│       ├── __init__.py
│       ├── main.py           ← cria a API, CORS, inclui os routers, rota /health
│       ├── database.py       ← engine, SessionLocal, Base, get_db
│       ├── models.py         ← tabelas (equipe Banco)
│       ├── schemas.py        ← formatos de entrada/saída (Pydantic)
│       ├── seguranca.py      ← hash de senha, token JWT, usuario_atual
│       ├── regras.py         ← regras de negócio (plano, cálculos)
│       ├── datas.py          ← fuso de São Paulo
│       └── routers/
│           ├── auth.py       ← /auth/cadastro, /auth/login            (S1)
│           ├── usuarios.py   ← /usuarios/me, /usuarios/{id}/seguir    (S1, S4)
│           ├── progresso.py  ← /progresso, /plano/hoje, /conquistas   (S2)
│           ├── registros.py  ← /registros                             (S2)
│           ├── crises.py     ← /crises                                (S3)
│           ├── unidades.py   ← /unidades                              (S3)
│           ├── publicacoes.py← /publicacoes e comentários             (S4)
│           └── conteudos.py  ← /conteudos                             (S4)
└── frontend/
    ├── index.html
    ├── .env                  ← VITE_API_URL=http://127.0.0.1:8000 (NUNCA vai para o GitHub)
    ├── public/
    │   ├── manifest.webmanifest
    │   ├── icon.svg          ← adicionar também icon-192.png e icon-512.png
    │   └── sw.js             ← service worker (offline)
    └── src/
        ├── main.jsx
        ├── App.jsx           ← troca de telas
        ├── state.jsx         ← ÚNICO lugar que fala com a API (ou com o localStorage)
        ├── utils.js          ← formatação, datas, listas de gatilhos e metas
        ├── styles.css
        ├── components/       ← Icons, Avatar, BottomNav, Modal, ReasonCard
        └── screens/          ← Login, Cadastro, Home, Comunidade, Sos, Progresso, Perfil
```

Regra do front: **as telas nunca chamam `fetch` diretamente.** Toda comunicação com a API passa
pelas funções do `state.jsx`. Enquanto uma rota não estiver pronta, a função correspondente
continua usando o localStorage.

---

## 4. Regras de negócio

### 4.1 Cadastro e login
- Login por **e-mail** e senha. O e-mail é guardado em minúsculas e é único.
- O **apelido** é o nome exibido no app e na comunidade (o app pode ser usado de forma anônima).
- Senha: de 8 a 72 caracteres, guardada **só como hash bcrypt**.
- O cadastro envia as 4 etapas de uma vez (perfil, consumo, gatilhos, porquê) e já devolve o token.

### 4.2 Datas e fuso horário
- O banco guarda datas e horas em **UTC**.
- Tudo que depende de "hoje" (limite do dia, fumados hoje, gráfico da semana) é calculado no
  fuso **America/Sao_Paulo**. Nunca use `toISOString()` no front para descobrir "hoje": isso usa
  UTC e faz o dia virar às 21h.
- As respostas da API trazem datas em ISO 8601 com fuso: `2026-11-13T10:00:00-03:00`.

### 4.3 Data de início
- Perfil `fuma`: a data de início é o momento do cadastro.
- Perfil `parou`: `data_inicio = agora − dias_sem_fumar`.
- Ao trocar de perfil (`PATCH /usuarios/me`), a data de início vira o momento da troca.

### 4.4 Plano de redução (perfil `fuma`)
- `dia_plano = (dias inteiros desde a data de início, no fuso de SP) + 1`
- `limite_hoje = máximo(0, cigarros_por_dia − dia_plano)`
- Exemplo com 20 por dia: dia 1 → 19, dia 7 → 13, dia 20 → 0.
- `data_alvo = data_inicio + (cigarros_por_dia − 1) dias` (dia em que o limite chega a 0),
  calculada no cadastro e salva em `meta.data_alvo`.
- Quando o limite chega a 0, o front sugere trocar para o perfil `parou`.

### 4.5 Apoio (perfil `parou`)
- Sem limite diário (`limite_hoje = null`).
- `GET /plano/hoje` devolve os gatilhos, o motivo e uma mensagem de apoio do dia, baseada num
  dos gatilhos do usuário.

### 4.6 Cálculos do progresso (os dois perfis)
- `segundos_sem_fumar` = agora − último registro de `cigarro` (sem nenhum: desde a data de início).
- `dias_decorridos` = (agora − data de início) em dias, com fração.
- `cigarros_evitados = máximo(0, arredondar(cigarros_por_dia × dias_decorridos − cigarros_fumados_desde_o_início))`
- `economia = cigarros_evitados × preco_maco ÷ cigarros_por_maco` (2 casas decimais).
- `vontades_vencidas` = quantidade de registros do tipo `vontade`.
- Marcos de saúde, atingidos por `segundos_sem_fumar`:

| Marco | Tempo | Texto |
| --- | --- | --- |
| 1 | 20 minutos | Batimentos e pressão começam a voltar ao normal |
| 2 | 12 horas | O monóxido de carbono no sangue volta ao normal |
| 3 | 2 dias | Olfato e paladar começam a melhorar |
| 4 | 2 semanas | A circulação melhora e caminhar fica mais fácil |
| 5 | 3 meses | A função dos pulmões aumenta |
| 6 | 1 ano | O risco de doença do coração cai pela metade |

### 4.7 Comunidade
- Categorias: `conquista` ou `ajuda`. O autor aparece só pelo apelido.
- Apoiar e seguir são **alternâncias**: chamar de novo desfaz.
- Ninguém segue a si mesmo. Só o autor apaga a própria publicação.

### 4.8 Fora da API no MVP
- A checklist "Metas de hoje" da home continua só no aparelho (localStorage).
- Recuperação de senha por e-mail e notificações push ficam para depois da entrega.

---

## 5. Banco de dados (modelo lógico final)

15 tabelas. Tipos no padrão SQLAlchemy. `PK` = chave primária, `FK` = chave estrangeira.

| Tabela | Colunas |
| --- | --- |
| `usuario` | `id_usuario` PK · `email` String(120) único · `senha_hash` String(255) · `apelido` String(40) · `perfil` String(10) (`fuma`/`parou`) · `data_inicio` DateTime (UTC) · `data_cadastro` DateTime · `motivo` Text · `foto_motivo` Text nulo · `foto_perfil` Text nulo · `lembretes` Boolean padrão falso |
| `meta` | `id_meta` PK · `id_usuario` FK · `tipo` String(20) (`reducao`/`manutencao`) · `consumo_inicial` Integer · `meta_diaria` Integer nulo · `preco_maco` Numeric(6,2) · `cigarros_por_maco` Integer padrão 20 · `data_alvo` Date nulo · `status` String(20) (`ativa`/`encerrada`) |
| `gatilho_usuario` | `id_gatilho_usuario` PK · `id_usuario` FK · `gatilho` String(40) |
| `registro_consumo` | `id_registro` PK · `id_usuario` FK · `tipo` String(10) (`cigarro`/`vontade`) · `data_hora` DateTime · `quantidade` Integer (cigarro ≥ 1, vontade = 0) · `gatilho` String(40) nulo · `nivel_vontade` Integer 1–5 nulo |
| `registro_crise` | `id_crise` PK · `id_usuario` FK · `data_hora` DateTime · `intensidade` Integer 1–5 · `estrategia` String(60) · `resultado` String(30) (`venceu`/`fumou`) |
| `conquista` | `id_conquista` PK · `titulo` String(80) · `descricao` Text · `tipo` String(20) (`saude`) · `criterio` String(80) (segundos sem fumar, ex.: `1200`) |
| `usuario_conquista` | `id_usuario` PK/FK · `id_conquista` PK/FK · `data_obtida` DateTime |
| `publicacao` | `id_publicacao` PK · `id_usuario` FK · `texto` String(500) · `data_hora` DateTime · `categoria` String(20) (`conquista`/`ajuda`) · `foto` Text nulo |
| `comentario` | `id_comentario` PK · `id_publicacao` FK · `id_usuario` FK · `texto` String(300) · `data_hora` DateTime |
| `apoio` | `id_usuario` PK/FK · `id_publicacao` PK/FK |
| `seguidor` | `id_seguidor` PK/FK → usuario · `id_seguido` PK/FK → usuario |
| `unidade_saude` | `id_unidade` PK · `nome` String(120) · `tipo` String(10) (`UBS`/`CAPS AD`) · `endereco` String(200) · `telefone` String(20) nulo · `latitude` Float · `longitude` Float |
| `usuario_unidade` | `id_usuario` PK/FK · `id_unidade` PK/FK |
| `conteudo` | `id_conteudo` PK · `titulo` String(120) · `categoria` String(40) · `resumo` Text · `data_publicacao` Date nulo |
| `usuario_conteudo` | `id_usuario` PK/FK · `id_conteudo` PK/FK |

Observações:
- A quantidade de apoios **não é uma coluna**: é a contagem (`COUNT`) da tabela `apoio`.
- A quantidade de comentários também é contagem.
- Dados iniciais (seed): os 6 marcos da seção 4.6 em `conquista`, uma amostra de UBS e CAPS AD
  de São Paulo em `unidade_saude` e 5 conteúdos educativos em `conteudo`.
- Nunca guardar dados reais de pessoas em testes. Só dados inventados.

---

## 6. Contrato da API

### 6.1 Regras gerais
- Endereço em desenvolvimento: `http://127.0.0.1:8000`. Testes em `http://127.0.0.1:8000/docs`.
- JSON em português, snake_case. Dinheiro como número (`12.50`). Datas em ISO 8601 com fuso.
- Rotas com **Token** exigem o cabeçalho `Authorization: Bearer <access_token>`.
- Erros sempre como `{"detail": "mensagem"}`.

| Código | Quando |
| --- | --- |
| 200 / 201 / 204 | Sucesso (201 = criado, 204 = apagado, sem corpo) |
| 400 | Pedido impossível (ex.: seguir a si mesmo) |
| 401 | Sem token, token inválido ou vencido → front volta para o login |
| 403 | Tentando mexer no que não é seu |
| 404 | Não existe |
| 409 | Conflito (e-mail já cadastrado) |
| 422 | Campo inválido (o FastAPI responde sozinho) |

### 6.2 Validações

| Campo | Regra |
| --- | --- |
| `email` | E-mail válido, único |
| `senha` | 8 a 72 caracteres |
| `apelido` | 2 a 40 caracteres |
| `perfil` | `fuma` ou `parou` |
| `cigarros_por_dia` | 1 a 100 |
| `preco_maco` | 1 a 100, até 2 casas decimais |
| `cigarros_por_maco` | 1 a 40, padrão 20 |
| `dias_sem_fumar` | 0 a 3650 (só no perfil `parou`) |
| `gatilhos` | Até 15 textos de até 40 caracteres |
| `motivo` | 3 a 140 caracteres |
| `nivel_vontade`, `intensidade` | 1 a 5 |
| `texto` da publicação / do comentário | 1 a 500 / 1 a 300 caracteres |
| Fotos | Data URL de imagem já reduzida pelo front, até 700.000 caracteres (~500 KB) |

### 6.3 Rotas (22)

| Sprint | Método e rota | Acesso | Resposta |
| --- | --- | --- | --- |
| 0 | `GET /health` | Pública | `{"status": "ok", "banco": "conectado"}` |
| 1 | `POST /auth/cadastro` | Pública | 201 `Token` |
| 1 | `POST /auth/login` | Pública | 200 `Token` |
| 1 | `GET /usuarios/me` | Token | 200 `Usuario` |
| 1 | `PATCH /usuarios/me` | Token | 200 `Usuario` |
| 2 | `GET /progresso` | Token | 200 `Progresso` |
| 2 | `GET /plano/hoje` | Token | 200 `Plano` |
| 2 | `POST /registros` | Token | 201 `Registro` |
| 2 | `GET /registros?dias=7` | Token | 200 lista de `Registro` (1 a 90 dias, mais novo primeiro) |
| 2 | `GET /conquistas` | Token | 200 lista de `Conquista` |
| 3 | `POST /crises` | Token | 201 `Crise` |
| 3 | `GET /unidades?lat=&lng=&tipo=&limite=10` | Pública | 200 lista de `Unidade` (mais perto primeiro) |
| 3 | `POST /unidades/{id}/salvar` | Token | 200 `{"salva": true}` (alterna) |
| 4 | `GET /publicacoes?categoria=&pagina=1` | Token | 200 `Feed` (20 por página) |
| 4 | `POST /publicacoes` | Token | 201 `Publicacao` |
| 4 | `DELETE /publicacoes/{id}` | Token | 204 (403 se não for o autor) |
| 4 | `POST /publicacoes/{id}/apoio` | Token | 200 `{"apoiado": true, "qtd_apoios": 25}` (alterna) |
| 4 | `GET /publicacoes/{id}/comentarios` | Token | 200 lista de `Comentario` (mais antigo primeiro) |
| 4 | `POST /publicacoes/{id}/comentarios` | Token | 201 `Comentario` |
| 4 | `POST /usuarios/{id}/seguir` | Token | 200 `{"seguindo": true}` (alterna; 400 se for você mesmo) |
| 4 | `GET /conteudos?categoria=` | Pública | 200 lista de `Conteudo` |
| 4 | `POST /conteudos/{id}/salvar` | Token | 200 `{"salvo": true}` (alterna) |

### 6.4 Formatos (JSON)

**Entrada de `POST /auth/cadastro`**
```json
{
  "email": "marcos@exemplo.com",
  "senha": "minhasenha123",
  "apelido": "Marcos",
  "perfil": "fuma",
  "cigarros_por_dia": 20,
  "preco_maco": 12.50,
  "cigarros_por_maco": 20,
  "dias_sem_fumar": null,
  "gatilhos": ["Café", "Estresse"],
  "motivo": "Pela minha filha e pela minha saúde",
  "foto_motivo": null
}
```

**Entrada de `POST /auth/login`**
```json
{ "email": "marcos@exemplo.com", "senha": "minhasenha123" }
```
Erro de login: sempre `401 {"detail": "E-mail ou senha incorretos."}`, exista ou não o e-mail.

**`Token`** (resposta de cadastro e login)
```json
{ "access_token": "eyJhbGciOi...", "token_type": "bearer", "usuario": { "...": "formato Usuario" } }
```

**`Usuario`**
```json
{
  "id_usuario": 1,
  "email": "marcos@exemplo.com",
  "apelido": "Marcos",
  "perfil": "fuma",
  "data_inicio": "2026-11-13T10:00:00-03:00",
  "cigarros_por_dia": 20,
  "preco_maco": 12.5,
  "cigarros_por_maco": 20,
  "data_alvo": "2026-12-02",
  "gatilhos": ["Café", "Estresse"],
  "motivo": "Pela minha filha e pela minha saúde",
  "foto_motivo": null,
  "foto_perfil": null,
  "lembretes": false
}
```

**Entrada de `PATCH /usuarios/me`** (só os campos que mudaram; todos opcionais)
```json
{ "apelido": "Marcão", "motivo": "Para correr com meu filho", "foto_motivo": null,
  "foto_perfil": null, "lembretes": true, "perfil": "parou" }
```
`apelido`, `motivo`, `lembretes` e `perfil` não aceitam `null`.

**`Progresso`**
```json
{
  "perfil": "fuma",
  "data_inicio": "2026-11-13T10:00:00-03:00",
  "dia_jornada": 4,
  "segundos_sem_fumar": 7200,
  "cigarros_evitados": 12,
  "economia": 7.50,
  "marcos_atingidos": 1,
  "limite_hoje": 16,
  "fumados_hoje": 3,
  "vontades_vencidas": 5
}
```

**`Plano`** — perfil `fuma`:
```json
{ "perfil": "fuma", "dia_plano": 4, "limite_hoje": 16, "fumados_hoje": 3,
  "reduzidos_ate_hoje": 4, "data_alvo": "2026-12-02", "mensagem": "Hoje o limite é 16. Amanhã, 15." }
```
Perfil `parou`:
```json
{ "perfil": "parou", "gatilhos": ["Festas", "Ansiedade"], "motivo": "Pela minha saúde",
  "mensagem": "Festas são um dos seus gatilhos. Tenha um plano antes de sair." }
```

**Entrada de `POST /registros`**
```json
{ "tipo": "cigarro", "gatilho": "Estresse", "quantidade": 1 }
```
```json
{ "tipo": "vontade", "gatilho": "Café", "nivel_vontade": 4 }
```

**`Registro`**
```json
{ "id_registro": 31, "tipo": "cigarro", "gatilho": "Estresse", "quantidade": 1,
  "nivel_vontade": null, "data_hora": "2026-11-16T08:12:00-03:00" }
```

**`Conquista`**
```json
{ "id_conquista": 1, "titulo": "20 minutos", "descricao": "Batimentos e pressão começam a voltar ao normal",
  "segundos_necessarios": 1200, "atingida": true, "data_obtida": "2026-11-13T10:20:00-03:00" }
```

**Entrada de `POST /crises`** e **`Crise`**
```json
{ "intensidade": 4, "estrategia": "respiracao", "resultado": "venceu" }
```
```json
{ "id_crise": 8, "intensidade": 4, "estrategia": "respiracao", "resultado": "venceu",
  "data_hora": "2026-11-16T15:02:00-03:00" }
```
Valores de `estrategia`: `respiracao`, `agua`, `jogo`, `cvv`, `outra`.
Se `resultado` for `fumou`, o front também envia um `POST /registros` do tipo `cigarro`.

**`Unidade`** (`tipo` na URL: `UBS` ou `CAPS AD`; sem `tipo`, traz as duas)
```json
{ "id_unidade": 3, "nome": "UBS Santo Amaro", "tipo": "UBS", "endereco": "Rua Exemplo, 100",
  "telefone": "(11) 0000-0000", "latitude": -23.65, "longitude": -46.71, "distancia_km": 1.8 }
```

**`Feed`** e **`Publicacao`**
```json
{
  "itens": [
    {
      "id_publicacao": 7,
      "autor": { "id_usuario": 3, "apelido": "Ana", "foto_perfil": null, "dias_sem_fumar": 7 },
      "texto": "Passei pela primeira semana limpa!",
      "categoria": "conquista",
      "foto": null,
      "data_hora": "2026-11-16T09:00:00-03:00",
      "qtd_apoios": 24,
      "qtd_comentarios": 5,
      "apoiado_por_mim": false,
      "seguindo_autor": true,
      "minha": false
    }
  ],
  "pagina": 1,
  "tem_mais": true
}
```
Entrada de `POST /publicacoes`: `{ "texto": "...", "categoria": "ajuda", "foto": null }`

**`Comentario`**
```json
{ "id_comentario": 12, "autor": { "id_usuario": 5, "apelido": "João" },
  "texto": "Força! Bebe uma água e respira.", "data_hora": "2026-11-16T09:10:00-03:00" }
```
Entrada de `POST /publicacoes/{id}/comentarios`: `{ "texto": "..." }`

**`Conteudo`**
```json
{ "id_conteudo": 2, "titulo": "Por que a vontade passa em 5 minutos", "categoria": "fissura",
  "resumo": "...", "data_publicacao": "2026-11-10" }
```

---

## 7. Segurança (vale para todas as equipes)

1. **Anti-IDOR:** o usuário é sempre identificado pelo token (`Depends(usuario_atual)` no back).
   Rotas pessoais usam `/me`. Em rotas com `{id}`, conferir se o item pertence a quem está logado.
2. `senha_hash` nunca aparece em resposta nenhuma. A senha nunca é guardada no front.
3. A `SECRET_KEY` fica só no `.env`. Cada ambiente tem a sua. Gerar com:
   `python -c "import secrets; print(secrets.token_hex(32))"`
4. Ao validar o token, sempre informar o algoritmo (`algorithms=["HS256"]`), para recusar tokens sem assinatura.
5. CORS: só as origens listadas em `CORS_ORIGINS` no `.env`. Nunca `"*"`.
6. Nunca colar `.env`, senhas ou tokens no chat da IA, no Trello ou no WhatsApp.
7. O repositório é **público**: nada de dados reais de pessoas, nem em testes.

---

## 8. Ligação Front ↔ API (de-para)

O `state.jsx` traduz os nomes. O resto do front continua com os nomes atuais.

| Front (`state.jsx`) | API | Observação |
| --- | --- | --- |
| `login` | `email` | |
| `name` | `apelido` | Campo novo no cadastro |
| `senha` | `senha` | Enviada só no cadastro/login; nunca guardada |
| `perfil` | `perfil` | `fuma` / `parou` |
| `cigsPerDay` | `cigarros_por_dia` | |
| `packPrice` | `preco_maco` | |
| `quitDays` | `dias_sem_fumar` | |
| `triggers` | `gatilhos` | |
| `reason` / `reasonPhoto` | `motivo` / `foto_motivo` | |
| `photo` | `foto_perfil` | |
| `reminders` | `lembretes` | |
| `startDate` (ms) | `data_inicio` (ISO) | `new Date(data_inicio).getTime()` |
| `logs[].type/trigger/qty/ts` | `tipo/gatilho/quantidade/data_hora` | |
| `posts[].author` | `autor.apelido` (+ `autor.id_usuario`) | |
| `posts[].type` | `categoria` | |
| `posts[].apoios/comentarios` | `qtd_apoios/qtd_comentarios` | |
| `supported`, `following` | `apoiado_por_mim`, `seguindo_autor` | Seguir é por `id_usuario`, não por nome |
| `computeStats()` | `GET /progresso` | |
| `dailyLimit()` | `GET /plano/hoje` | Nova regra: 1 a menos por dia |

O token fica guardado no aparelho e vai em toda chamada protegida. Resposta 401 → limpar o token e
voltar para a tela de login.

---

## 9. Mapa de rastreabilidade (o fluxo completo de cada função)

Use esta tabela para conferir se uma funcionalidade está ligada de ponta a ponta.

| RF | Funcionalidade | Tela (front) | Função no `state.jsx` | Rota (back) | Tabelas (banco) | Sprint |
| --- | --- | --- | --- | --- | --- | --- |
| RF01 | Login | `Login.jsx` | `login()` | `POST /auth/login` | `usuario` | 1 |
| RF01, RF02, RF04 | Cadastro em 4 etapas | `Cadastro.jsx` | `register()` | `POST /auth/cadastro` | `usuario`, `meta`, `gatilho_usuario` | 1 |
| RF11 | Perfil, porquê, lembretes | `Perfil.jsx` | `patchMe()` | `GET`/`PATCH /usuarios/me` | `usuario`, `meta` | 1 |
| RF03, RF04 | Registrar cigarro ou vontade | `Home.jsx` (modal) | `addLog()` | `POST /registros` | `registro_consumo` | 2 |
| RF06 | Contador, economia, evitados | `Home.jsx`, `Progresso.jsx` | `computeStats()` → API | `GET /progresso` | `usuario`, `meta`, `registro_consumo` | 2 |
| RF05 | Limite do dia / apoio | `Home.jsx` | `dailyLimit()` → API | `GET /plano/hoje` | `meta`, `gatilho_usuario`, `registro_consumo` | 2 |
| RF03 | Gráfico de 7 dias | `Progresso.jsx` | carregar registros | `GET /registros?dias=7` | `registro_consumo` | 2 |
| RF07 | Marcos de saúde | `Progresso.jsx` | `MILESTONES` → API | `GET /conquistas` | `conquista`, `usuario_conquista` | 2 |
| RF08 | Botão SOS | `Sos.jsx` | `registrarCrise()` (nova) | `POST /crises` | `registro_crise` | 3 |
| RF02, RF08 | Porquê no SOS sem internet | `Sos.jsx`, `ReasonCard.jsx` | usa `me` guardado no aparelho | `GET /usuarios/me` | `usuario` | 3 |
| RF09 | UBS e CAPS AD próximos | `Home.jsx` (card de ajuda) + tela de mapa | `buscarUnidades()` (nova) | `GET /unidades` | `unidade_saude`, `usuario_unidade` | 3 |
| RF10 | Feed e publicar | `Comunidade.jsx` | `addPost()` | `GET`/`POST /publicacoes` | `publicacao` | 4 |
| RF10 | Apoiar | `Comunidade.jsx` | `toggleSupport()` | `POST /publicacoes/{id}/apoio` | `apoio` | 4 |
| RF10 | Comentar | `Comunidade.jsx` | `comentar()` (nova) | `/publicacoes/{id}/comentarios` | `comentario` | 4 |
| RF10 | Seguir | `Comunidade.jsx` | `toggleFollow()` | `POST /usuarios/{id}/seguir` | `seguidor` | 4 |
| — | Conteúdos educativos | tela nova | `buscarConteudos()` (nova) | `GET /conteudos` | `conteudo`, `usuario_conteudo` | 4 |
| RF12, RNF04 | Segurança dos dados | todas | token em toda chamada | `usuario_atual` | `usuario.senha_hash` | 1 |
| — | Metas de hoje (checklist) | `Home.jsx` | `toggleGoal()` | (sem API) | (sem tabela) | — |

---

## 10. Como trabalhamos

### Sprints

| Sprint | Datas | Meta |
| --- | --- | --- |
| 0 | 06/11 a 12/11 | Fundação: API no ar, banco criado, front abrindo |
| 1 | 13/11 a 19/11 | Conta, login, cadastro e perfil |
| 2 | 20/11 a 26/11 | Home com progresso real e registros |
| 3 | 27/11 a 03/12 | SOS offline e mapa do SUS |
| 4 | 04/12 a 10/12 | Comunidade e conteúdos |
| 5 | 11/12 a 17/12 | Deploy na AWS, testes, apresentação |

### Git
- Ninguém envia direto para a `main`. Cada card do Trello vira uma branch: `s1-back-auth`,
  `s2-front-home`, `s1-banco-ajustes`.
- Commits começam pela sprint: `S1: cria rota de login`.
- Todo código entra por Pull Request revisado por outra equipe (Front revisa Back, Back revisa
  Banco, Banco revisa Front).
- Antes de todo `git add`: `git status -u`. O `.env` e o `.db` nunca podem aparecer.

### Definição de pronto (todo card)
- [ ] Funciona no celular
- [ ] Revisado por outra pessoa no Pull Request
- [ ] Nenhuma senha ou chave no código
- [ ] Testado no `/docs` (back) ou no navegador em modo celular (front)
- [ ] Nomes conferidos com este arquivo

### Checklist de integração (antes de pedir revisão)
- [ ] Os nomes de rotas, campos e tabelas são exatamente os deste arquivo
- [ ] A rota aparece no `/docs` e responde no formato da seção 6.4
- [ ] Os campos usados existem na tabela da seção 5
- [ ] O front chama a rota pelo `state.jsx`, com os nomes da seção 8
- [ ] Teste de ponta a ponta: ação na tela → resposta no `/docs` → linha nova no banco (SQLite Viewer)

---

## 11. Situação atual e pendências

**Feito:** documento do PI, protótipos no Figma, Trello, repositório, `.gitignore`,
`database.py`, protótipo navegável do front (salvando no aparelho), back-end da Sprint 1 escrito
e testado (cadastro, login, `/usuarios/me`).

**Pendências da Sprint 1:**
- Banco: aplicar as mudanças do modelo (seção 5) no `models.py`, começando por `usuario`.
- Back: subir `seguranca.py`, `schemas.py`, `regras.py`, `datas.py` e os routers `auth` e `usuarios`.
- Front: login por e-mail, campo apelido, senha com 8+, nova regra do plano, ligar
  `login()`, `register()` e `patchMe()` na API, guardar o token.
- Front (bugs): `crypto.randomUUID` não funciona pelo IP da rede local (usar gerador próprio);
  `todayKey()` usa UTC (usar a data local); contraste do texto branco na etapa 1 do cadastro;
  ícones PNG 192/512 para o iPhone.

**Decisões em aberto:**
- Trocar a navegação do front para `react-router` (o botão "voltar" do celular hoje fecha o app).
- Onde guardar o token no aparelho (localStorage no MVP; avaliar alternativas na Sprint 5).

---

## 12. Modelos de pedido para a IA

Cole este arquivo inteiro e depois um destes pedidos:

**Banco**
```
Siga o CONTEXTO_IA.md acima. Este é o meu models.py atual: [cole].
Tarefa: deixar o models.py igual à seção 5. Antes do código, liste as diferenças.
```

**Back-end**
```
Siga o CONTEXTO_IA.md acima. Estes são os arquivos atuais: [cole schemas.py, regras.py e o router].
Tarefa: criar a rota [ex.: GET /progresso] exatamente como nas seções 4 e 6.
Use usuario_atual para identificar o usuário. Antes do código, liste o que vai criar e alterar.
```

**Front-end**
```
Siga o CONTEXTO_IA.md acima. Estes são os arquivos atuais: [cole state.jsx e a tela].
Tarefa: trocar a função [ex.: login()] para chamar a rota da seção 6, traduzindo os nomes pela seção 8.
Não use fetch dentro das telas. Antes do código, liste as diferenças.
```

**Conferência de integração (qualquer equipe)**
```
Siga o CONTEXTO_IA.md acima. Confira se este código está de acordo com o contrato
(seções 5, 6 e 8). Liste cada divergência com: arquivo, o que está, o que deveria estar.
Não reescreva o código, só aponte.
```
