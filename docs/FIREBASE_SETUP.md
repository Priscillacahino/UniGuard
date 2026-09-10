# ConfiguraÃ§Ã£o do Firebase â€” UniGuard

Este guia conecta o aplicativo Android e a Central Web ao **mesmo projeto Firebase**. Enquanto esta configuraÃ§Ã£o nÃ£o for concluÃ­da, o protÃ³tipo web continuarÃ¡ usando dados locais/simulados.

## 1. Criar ou selecionar o projeto

1. Acesse o Firebase Console.
2. Crie um projeto para o UniGuard ou selecione o projeto jÃ¡ existente.
3. Use esse mesmo projeto nas configuraÃ§Ãµes Android e Web.

## 2. Configurar o Android

1. Adicione um aplicativo Android ao projeto Firebase.
2. Informe o pacote `com.priscillacahino.uniguard`.
3. Baixe o arquivo oficial `google-services.json`.
4. Coloque-o localmente em `app/google-services.json`.
5. Sincronize o Gradle no Android Studio.

> O arquivo `google-services.json` nÃ£o deve ser criado manualmente nem publicado no GitHub. Ele precisa ser obtido diretamente no projeto Firebase correto.

## 3. Configurar a aplicaÃ§Ã£o Web

Cadastre um aplicativo Web no mesmo projeto Firebase. No ambiente local ou na Vercel, configure:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

NÃ£o publique valores de configuraÃ§Ã£o em arquivos versionados quando a implantaÃ§Ã£o utilizar variÃ¡veis de ambiente.

## 4. Ativar os serviÃ§os

1. Em Authentication, habilite **Anonymous** para o fluxo Android demonstrativo.
2. Habilite **Email/Password** para o operador da Central Web.
3. Crie o Firestore Database.
4. Ative o Firebase Storage.
5. Publique as regras do arquivo `firestore.rules` apÃ³s revisÃ¡-las.

## 5. Criar um operador demonstrativo

1. Crie o usuÃ¡rio do operador em Authentication usando Email/Password.
2. Copie o UID criado.
3. No Firestore, crie a coleÃ§Ã£o `operators`.
4. Crie um documento cujo ID seja o UID do operador.
5. Use os campos demonstrativos:

```text
name: "Operador DemonstraÃ§Ã£o"
role: "security_operator"
active: true
```

## 6. Validar a integraÃ§Ã£o

Execute o roteiro de `CHECKLIST.md` e o teste descrito em `INTEGRACAO_FINAL.md`. O MVP sÃ³ deve ser marcado como integrado quando este caminho for comprovado:

```text
Android SOS â†’ Firestore â†’ Central Web â†’ atualizaÃ§Ã£o de status â†’ Android
```

Registre capturas e resultados sem utilizar dados pessoais reais.

