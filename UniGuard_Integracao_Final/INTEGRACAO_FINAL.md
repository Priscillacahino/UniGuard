# UniGuard — Integração final Android ↔ Firebase ↔ Central Web

## O que a auditoria confirmou

O repositório já possui:
- Android/Kotlin com botão SOS por pressão de 2 segundos;
- GPS via FusedLocationProviderClient;
- SMS com link do Google Maps;
- Firebase Authentication anônimo no Android;
- Firestore na coleção `emergencyAlerts`;
- Firebase Storage para fotografias/evidências;
- painel Web React/Vite;
- atualização de status pela Central;
- listener no Android para receber `pendente`, `em_deslocamento`, `no_local`, `resolvido` e `cancelado_usuario`.

Portanto, o foco agora não é reconstruir o projeto. É CONFIGURAR e VALIDAR o mesmo Firebase nas duas pontas.

## Bloqueadores encontrados

### 1. Android sem google-services.json
O arquivo `app/google-services.json` não está no repositório.
O próprio `app/build.gradle.kts` só ativa `com.google.gms.google-services` quando esse arquivo existe.

Ação:
1. Firebase Console > Configurações do projeto.
2. Adicionar/selecionar aplicativo Android.
3. Package name: `com.priscillacahino.uniguard`.
4. Baixar `google-services.json`.
5. Colocar em `app/google-services.json`.

> Não gere esse arquivo manualmente. Ele deve vir do projeto Firebase correto.

### 2. Vercel precisa apontar para o MESMO projeto Firebase
Configurar em Vercel > Project > Settings > Environment Variables:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Os valores devem corresponder ao mesmo projeto usado pelo `google-services.json`.

### 3. Métodos de autenticação
No Firebase Authentication habilitar:
- Anonymous (necessário para o Android);
- Email/Password (necessário para o operador da Central).

### 4. Operador da Central
As regras procuram:
`operators/{UID_DO_OPERADOR}`

Depois de criar o usuário de Email/Password no Firebase Authentication:
1. copie o UID;
2. no Firestore crie a coleção `operators`;
3. crie um documento com ID exatamente igual ao UID;
4. campos sugeridos:
   - name: "Operador Demonstração"
   - role: "security_operator"
   - active: true

### 5. Regras

> **Fonte oficial das regras:** use somente o arquivo `firestore.rules` da raiz do repositório. A cópia desta pasta foi removida para evitar divergência entre documentação e implantação.

Substituir as regras atuais pelo arquivo `firestore.rules` deste pacote.
Essa versão mantém o operador como responsável pelas mudanças operacionais e permite ao dono apenas cancelar seu próprio alerta.

Implantar:
`firebase deploy --only firestore:rules,storage`

### 6. Storage
Manter as regras atuais de `storage.rules`.
O Android envia a foto para:
`emergency-evidence/{alertId}.jpg`

## Teste de ponta a ponta

1. Executar o Android em aparelho/emulador com GPS.
2. Cadastrar telefone de emergência.
3. Pressionar SOS por 2 segundos.
4. Confirmar no Firestore a criação em `emergencyAlerts`.
5. Abrir a Central no Vercel e entrar com o usuário operador.
6. Confirmar que o alerta aparece.
7. Alterar para `em_deslocamento`.
8. Confirmar no Android: “Central confirmou: equipe em deslocamento”.
9. Alterar para `no_local`.
10. Confirmar no Android: “Equipe chegou ao local”.
11. Alterar para `resolvido`.
12. Confirmar no Android: “Ocorrência encerrada”.
13. Confirmar foto no Firebase Storage e URL no documento do alerta.

## Critério para considerar a versão acadêmica integrada

O MVP está integrado quando:
Android SOS → Firestore → Central Web → atualização de status → Android

funcionar com um único projeto Firebase e sem dados simulados no caminho principal.

## O que pode ficar como evolução futura

- MySQL/API própria;
- geofencing contínuo em background;
- FCM/push notifications;
- mapa de calor real;
- despacho automático de viatura;
- integração oficial UFPB/SAMU/PM;
- login institucional real via SIGAA/SSO.

Esses itens não precisam impedir a entrega acadêmica da versão integrada.
