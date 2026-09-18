# Integração atual — Android ↔ Firebase ↔ Central Web

> Documento operacional do **protótipo acadêmico UniGuard**. A integração é considerada preparada no repositório, mas só pode ser classificada como validada após teste ponta a ponta em um único ambiente Firebase real.

## Arquitetura de identidade atual

O UniGuard **não usa autenticação anônima como identidade institucional válida**.

Para acesso institucional são exigidos:

1. Firebase Authentication por e-mail/senha;
2. e-mail verificado;
3. vínculo ativo em `memberships/{uid}` para usuário;
4. registro ativo em `operators/{uid}` para operador;
5. `institutionId` compatível com o recurso acessado.

Criar uma credencial não cria automaticamente vínculo institucional.

## Componentes integrados no repositório

- Android/Kotlin;
- aplicação web React/Vite;
- Firebase Authentication;
- Cloud Firestore;
- Firebase Storage;
- regras de segregação por `institutionId`;
- auditoria;
- App Check preparado;
- Cloud Functions em `functions/`;
- rate limiting server-side;
- chave de cutover `trustedBackendRequired`;
- CI com testes web, Android, backend e Firebase Emulator.

## Configuração que permanece externa ao repositório

### Android

O arquivo `app/google-services.json` não deve ser versionado. Ele deve vir do projeto Firebase correto e permanecer local/seguro.

Package Android:

`com.priscillacahino.uniguard`

### Web/Vercel

As variáveis abaixo devem apontar para o mesmo projeto Firebase utilizado pelo Android:

- `VITE_FIREBASE_API_KEY`;
- `VITE_FIREBASE_AUTH_DOMAIN`;
- `VITE_FIREBASE_PROJECT_ID`;
- `VITE_FIREBASE_STORAGE_BUCKET`;
- `VITE_FIREBASE_MESSAGING_SENDER_ID`;
- `VITE_FIREBASE_APP_ID`;
- `VITE_FIREBASE_APPCHECK_SITE_KEY`;
- `VITE_USE_TRUSTED_BACKEND`.

Valores reais não devem ser publicados no GitHub.

## Backend confiável e cutover

O backend confiável já está versionado em `functions/`.

A transição para operação via backend deve ocorrer somente depois de:

1. deploy das Functions;
2. registro dos apps no App Check;
3. validação do fluxo real;
4. ativação de enforcement;
5. ativação controlada de `VITE_USE_TRUSTED_BACKEND`;
6. configuração de `settings/security.trustedBackendRequired = true` somente quando todos os clientes autorizados estiverem migrados.

Enquanto o cutover não ocorrer, o modo direto continua restrito pelas regras do Firestore/Storage e não deve ser interpretado como configuração final de produção.

## Regras

Fontes oficiais únicas:

- `firestore.rules`;
- `storage.rules`.

Não mantenha cópias paralelas dessas regras em outras pastas.

As evidências do Storage aceitam somente JPEG, PNG e WebP, com bloqueio de sobrescrita pelo cliente.

## Critério de validação ponta a ponta

Antes de classificar a integração como validada, comprovar e registrar evidências de:

1. autenticação com e-mail verificado;
2. vínculo institucional ativo;
3. criação do SOS;
4. criação do alerta na instituição correta;
5. recepção pela Central autorizada;
6. mudança de status por operador;
7. atualização percebida pelo cliente;
8. upload/leitura de evidência autorizada;
9. bloqueio cross-institution;
10. trilha de auditoria;
11. perda de rede/localização e recuperação;
12. bloqueio de conta/vínculo revogado.

## Itens que não devem bloquear a evolução acadêmica, mas continuam fora do escopo validado

- integração oficial com UFPB/SAMU/PM;
- SSO/SIGAA;
- geofencing contínuo em background;
- despacho automático;
- mapa de calor operacional real;
- infraestrutura institucional de alta disponibilidade.

## Status

**Implementado/preparado no repositório não significa validado em produção.**

A referência consolidada de estado é [STATUS_DE_PRONTIDAO.md](STATUS_DE_PRONTIDAO.md).
