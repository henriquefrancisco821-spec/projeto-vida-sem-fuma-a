# Mudanças no front (19/11/2026)

Ajustes para alinhar o protótipo ao `CONTEXTO_IA.md` antes da ligação com a API.
Testado num navegador simulando celular, aberto pelo IP da rede (http), com 17 verificações.

## Alinhamento com a API
- **Login por e-mail** (`Login.jsx`): o campo "Usuário" virou "E-mail", com validação.
- **Senha de 8 a 72 caracteres** (`Login.jsx`), igual à API. Antes eram 4.
- **Apelido no cadastro** (`Cadastro.jsx`, etapa 1): "Como quer ser chamado na comunidade?".
  É o nome exibido no app. Sem apelido, o botão Continuar fica desativado.
- **Mensagem de login errado** igual à da API: "E-mail ou senha incorretos."
- `state.jsx`: usuários guardados pelo e-mail (minúsculo). A chave do localStorage mudou
  para `vsf:v2`, então contas criadas na versão antiga não aparecem mais.

## Bugs corrigidos
- **App quebrava no celular pelo IP da rede**: `crypto.randomUUID()` só existe em HTTPS/localhost.
  Trocado por `newId()` (`utils.js`).
- **"Hoje" virava às 21h**: o app usava `toISOString()` (UTC). Agora usa a data local
  com `dateKey()` (`utils.js`, `Home.jsx`, `Progresso.jsx`).
- **Plano de redução**: agora é **1 cigarro a menos por dia** (`dailyLimit` em `utils.js`).
  No dia em que o limite chega a zero, a home mostra "Hoje é o seu dia de parar!".
- **Contraste na etapa 1 do cadastro**: o texto branco em fundo cinza ficou escuro (`styles.css`).
- **Ícones PNG 192 e 512** para o iPhone e para instalar o PWA (`public/`, `manifest`, `index.html`).
- **Depois de sair e entrar de novo**, o app abria na última tela (Perfil). Agora abre na Home (`App.jsx`).

## Tela SOS
- **Cronômetro de 5 minutos** com a fase da respiração (Inspire 4s, Segure 2s, Solte 4s),
  no mesmo ritmo da animação do círculo.
- **Botão do CVV 188** (`tel:188`), como no protótipo do Figma e no documento do PI.
- **"Acabei fumando"** ao lado de "Resisti à vontade". Os dois perguntam a intensidade (1 a 5)
  e salvam a crise (`addCrise` no `state.jsx`), no formato da rota `POST /crises`.
  "Acabei fumando" também registra o cigarro no diário.

## O que fica para a integração com a API
- `state.jsx` ainda guarda a senha no aparelho (marcado como PROVISÓRIO). Ela sai quando
  `login()` e `register()` passarem a chamar `POST /auth/login` e `POST /auth/cadastro`.
- "Seguir" ainda usa o nome do autor; com a API passa a usar `id_usuario`.
