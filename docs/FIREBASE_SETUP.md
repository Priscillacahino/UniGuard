# Conectar o Android ao painel web

O Android e o painel usam a coleção `emergencyAlerts` do mesmo projeto Firebase. Sem configuração, o projeto permanece em modo de demonstração.

## Configuração do Firebase

1. Crie um projeto no Firebase Console.
2. Em **Authentication**, habilite **Anônimo** (aplicativo Android) e **E-mail/senha** (operadores do painel).
3. Crie o Firestore e ative o Storage.
4. Cadastre um aplicativo Android com o pacote `com.example.uniguard`.
5. Baixe `google-services.json` e coloque em `app/google-services.json`. Esse arquivo está ignorado pelo Git.
6. Cadastre um aplicativo web e copie a configuração para `.env.local`, seguindo `.env.example`.

## Cadastrar um operador do piloto

1. Em Authentication, crie o usuário de e-mail/senha que acessará o painel.
2. Copie o UID desse usuário.
3. No Firestore, crie a coleção `operators`.
4. Crie um documento cujo ID seja exatamente o UID do operador.
5. O documento pode conter `name`, `campusId` e `active: true`.

As regras não permitem que o navegador se transforme em operador sozinho.

## Publicar as regras

Com a Firebase CLI instalada e autenticada, execute na raiz:

```powershell
firebase use --add
firebase deploy --only firestore:rules,storage
```

## Teste integrado

1. Rode `npm install` e `npm run dev`.
2. Entre no painel com o operador cadastrado.
3. Instale o Android em um aparelho físico.
4. Cadastre um telefone de teste e segure o SOS.
5. A ocorrência deve surgir no painel em tempo real.
6. Altere o status no painel e confira o retorno no Android.
7. Capture uma foto e verifique o anexo na ocorrência.

## Limite desta primeira integração

Este fluxo é adequado para piloto controlado. Antes de operação real, troque o pacote `com.example.uniguard`, implemente identidade institucional, limite operadores por campus, revise retenção/LGPD e teste indisponibilidade do Firebase, SMS e GPS.
