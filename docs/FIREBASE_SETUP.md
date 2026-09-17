# Configuração do Firebase — UniGuard

Este guia conecta o aplicativo Android e a Central Web ao mesmo projeto Firebase. Sem essa configuração, o sistema permanece em modo de demonstração e não deve receber dados reais.

## 1. Projeto e aplicativos

1. Acesse o Firebase Console.
2. Selecione o projeto correto do UniGuard.
3. Cadastre o aplicativo Web e mantenha as variáveis de ambiente configuradas na Vercel.
4. Cadastre o aplicativo Android usando o pacote:
   `com.priscillacahino.uniguard`
5. Baixe o `google-services.json` diretamente do Firebase e coloque-o apenas localmente em `app/google-services.json`.
6. Não publique esse arquivo no GitHub.

## 2. Autenticação

Mantenha ativado:

- **E-mail/senha**.

Não use autenticação anônima como identidade principal. Usuários anônimos não devem criar alertas institucionais nem acessar dados do sistema.

A conta só poderá operar depois de:

1. confirmar o endereço de e-mail;
2. receber um vínculo institucional ativo;
3. utilizar o aplicativo com a instituição autorizada.

O Google Login não é obrigatório nesta etapa.

## 3. Configuração de variáveis da aplicação Web

Configure na Vercel ou no ambiente local:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

As regras do Firebase não devem ser substituídas por regras coladas de versões antigas ou por regras de outro projeto.

## 4. Operador da Central

1. Em **Authentication > Usuários**, crie uma conta com E-mail/senha.
2. Confirme o e-mail da conta.
3. Copie o UID.
4. No Firestore, crie ou atualize:
   `operators/{UID}`
5. Use, no mínimo:

```text
name: "Operador UniGuard"
role: "security_operator"
active: true
institutionId: "ufpb-demo"
```

O operador só poderá visualizar e administrar alertas da mesma `institutionId`.

Para suspender o acesso, altere:

```text
active: false
```

Não altere o UID do documento.

## 5. Usuário institucional

O cadastro de e-mail cria apenas a credencial. A autorização institucional deve ser concedida separadamente por um administrador ou processo institucional.

Depois de criar o usuário em **Authentication > Usuários**:

1. copie o UID;
2. no Firestore, crie:
   `memberships/{UID}`
3. adicione:

```text
active: true
institutionId: "ufpb-demo"
```

Para suspender o usuário, use `active: false`. Não conceda acesso criando documentos diretamente no aplicativo.

## 6. Publicação das regras

Na raiz do repositório, publique somente os arquivos oficiais:

```bash
firebase deploy --only firestore:rules,storage
```

Os arquivos utilizados são:

- `firestore.rules`
- `storage.rules`

Depois da publicação, confira no console se a versão ativa corresponde ao commit atual do repositório.

## 7. Retenção e eliminação

O sistema grava `retentionExpiresAt` para apoiar a retenção:

- alertas: 90 dias;
- auditoria: 365 dias;
- evidências: 30 dias;
- dados locais temporários: 7 dias.

Esses campos não eliminam dados sozinhos. Antes de um piloto real, configure:

- TTL do Firestore para as coleções aplicáveis;
- ciclo de vida do Firebase Storage;
- limpeza de dados locais;
- procedimento para exceções legais e incidentes;
- registro administrativo da eliminação.

Não armazene dados médicos ou anotações clínicas. O campo `medicalNotes` é bloqueado pelas regras atuais.

## 8. Validação mínima antes do piloto

O piloto só deve ser considerado integrado depois de comprovar, usando contas de teste:

1. usuário de uma instituição não acessa alertas de outra;
2. operador inativo não acessa a Central;
3. usuário sem e-mail verificado não acessa dados;
4. cadastro sem `memberships/{UID}` não cria alerta;
5. o recebimento da Central gera `receiptStatus` e auditoria;
6. uma evidência enviada não pode ser substituída;
7. alertas em excesso são bloqueados ou encaminhados para análise.

Use apenas dados fictícios durante a validação.
