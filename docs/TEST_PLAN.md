# Plano de testes — UniGuard

Este documento registra os testes necessários para validar o MVP acadêmico. Não use dados pessoais reais, números de terceiros ou serviços oficiais durante os testes.

## 1. Validação automática

Na raiz do projeto web:

```bash
npm ci
npm test
npm run lint
npm run build
```

Na raiz do projeto Android:

```bash
./gradlew testDebugUnitTest assembleDebug
```

Os mesmos comandos são executados pelo workflow `.github/workflows/ci.yml` a cada atualização da branch principal.

## 2. Pré-requisitos do teste integrado

- Firebase Authentication anônimo habilitado para o Android.
- Firebase Authentication por e-mail/senha habilitado para a central.
- Firestore e Storage criados no mesmo projeto Firebase.
- Regras `firestore.rules` e `storage.rules` publicadas.
- Documento `operators/{UID}` com `active: true` para o operador de teste.
- Variáveis `VITE_FIREBASE_*` configuradas no ambiente web.
- `app/google-services.json` obtido do mesmo projeto Firebase.
- Telefone de teste controlado pela própria equipe.

## 3. Casos essenciais

| ID | Cenário | Resultado esperado |
|---|---|---|
| SOS-01 | Manter o botão pressionado por menos de 2 segundos | Nenhum alerta é criado |
| SOS-02 | Manter o botão pressionado por 2 segundos | Um único alerta pendente é criado |
| SOS-03 | Negar localização | O alerta continua e informa localização indisponível |
| SOS-04 | Negar câmera | O alerta continua sem fotografia real |
| SOS-05 | Autorizar câmera | A imagem é salva no Storage e somente a URL fica no Firestore |
| SOS-06 | Estar sem Firebase | O aplicativo informa claramente o modo local |
| SOS-07 | Encerrar um alerta e disparar outro | Um novo protocolo é criado normalmente |
| AUTH-01 | Login com operador ativo | A central carrega os alertas permitidos |
| AUTH-02 | Login válido sem documento de operador | Acesso à central é negado |
| AUTH-03 | Operador com `active: false` | Acesso à central é negado |
| RULE-01 | Usuário ler alerta de outra pessoa | Firestore nega a leitura |
| RULE-02 | Usuário cancelar o próprio alerta | Apenas status e horário são alterados |
| RULE-03 | Operador alterar identificação/autoria do alerta | Firestore nega a alteração |
| RULE-04 | Excluir um alerta | Firestore nega a exclusão |
| FLOW-01 | Android criar alerta | A central web recebe o chamado |
| FLOW-02 | Central mudar para `em_deslocamento` | Android mostra equipe em deslocamento |
| FLOW-03 | Central mudar para `no_local` | Android mostra chegada da equipe |
| FLOW-04 | Central mudar para `resolvido` | Android encerra o acompanhamento e libera novo SOS |

## 4. Evidências da validação

Para cada rodada, registre:

- data e versão/commit testado;
- modelo e versão do Android;
- navegador usado na central;
- capturas sem dados pessoais;
- resultado de cada caso;
- erros encontrados e correções aplicadas.

## 5. Critério de aprovação do MVP acadêmico

O fluxo principal é considerado validado quando `SOS-01` a `SOS-07`, `AUTH-01` a `AUTH-03`, `RULE-01` a `RULE-04` e `FLOW-01` a `FLOW-04` passam no mesmo ambiente Firebase, sem dados simulados no caminho principal.
