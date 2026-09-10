# UniGuard â€” IntegraÃ§Ã£o final Android â†” Firebase â†” Central Web

## O que a auditoria confirmou

O repositÃ³rio jÃ¡ possui:
- Android/Kotlin com botÃ£o SOS por pressÃ£o de 2 segundos;
- GPS via FusedLocationProviderClient;
- SMS com link do Google Maps;
- Firebase Authentication anÃ´nimo no Android;
- Firestore na coleÃ§Ã£o `emergencyAlerts`;
- Firebase Storage para fotografias/evidÃªncias;
- painel Web React/Vite;
- atualizaÃ§Ã£o de status pela Central;
- listener no Android para receber `pendente`, `em_deslocamento`, `no_local`, `resolvido` e `cancelado_usuario`.

Portanto, o foco agora nÃ£o Ã© reconstruir o projeto. Ã‰ CONFIGURAR e VALIDAR o mesmo Firebase nas duas pontas.

## Bloqueadores encontrados

### 1. Android sem google-services.json
O arquivo `app/google-services.json` nÃ£o estÃ¡ no repositÃ³rio.
O prÃ³prio `app/build.gradle.kts` sÃ³ ativa `com.google.gms.google-services` quando esse arquivo existe.

AÃ§Ã£o:
1. Firebase Console > ConfiguraÃ§Ãµes do projeto.
2. Adicionar/selecionar aplicativo Android.
3. Package name: `com.priscillacahino.uniguard`.
4. Baixar `google-services.json`.
5. Colocar em `app/google-services.json`.

> NÃ£o gere esse arquivo manualmente. Ele deve vir do projeto Firebase correto.

### 2. Vercel precisa apontar para o MESMO projeto Firebase
Configurar em Vercel > Project > Settings > Environment Variables:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

Os valores devem corresponder ao mesmo projeto usado pelo `google-services.json`.

### 3. MÃ©todos de autenticaÃ§Ã£o
No Firebase Authentication habilitar:
- Anonymous (necessÃ¡rio para o Android);
- Email/Password (necessÃ¡rio para o operador da Central).

### 4. Operador da Central
As regras procuram:
`operators/{UID_DO_OPERADOR}`

Depois de criar o usuÃ¡rio de Email/Password no Firebase Authentication:
1. copie o UID;
2. no Firestore crie a coleÃ§Ã£o `operators`;
3. crie um documento com ID exatamente igual ao UID;
4. campos sugeridos:
   - name: "Operador DemonstraÃ§Ã£o"
   - role: "security_operator"
   - active: true

### 5. Regras
Substituir as regras atuais pelo arquivo `firestore.rules` deste pacote.
Essa versÃ£o mantÃ©m o operador como responsÃ¡vel pelas mudanÃ§as operacionais e permite ao dono apenas cancelar seu prÃ³prio alerta.

Implantar:
`firebase deploy --only firestore:rules,storage`

### 6. Storage
Manter as regras atuais de `storage.rules`.
O Android envia a foto para:
`emergency-evidence/{alertId}.jpg`

## Teste de ponta a ponta

1. Executar o Android em aparelho/emulador com GPS.
2. Cadastrar telefone de emergÃªncia.
3. Pressionar SOS por 2 segundos.
4. Confirmar no Firestore a criaÃ§Ã£o em `emergencyAlerts`.
5. Abrir a Central no Vercel e entrar com o usuÃ¡rio operador.
6. Confirmar que o alerta aparece.
7. Alterar para `em_deslocamento`.
8. Confirmar no Android: â€œCentral confirmou: equipe em deslocamentoâ€.
9. Alterar para `no_local`.
10. Confirmar no Android: â€œEquipe chegou ao localâ€.
11. Alterar para `resolvido`.
12. Confirmar no Android: â€œOcorrÃªncia encerradaâ€.
13. Confirmar foto no Firebase Storage e URL no documento do alerta.

## CritÃ©rio para considerar a versÃ£o acadÃªmica integrada

O MVP estÃ¡ integrado quando:
Android SOS â†’ Firestore â†’ Central Web â†’ atualizaÃ§Ã£o de status â†’ Android

funcionar com um Ãºnico projeto Firebase e sem dados simulados no caminho principal.

## O que pode ficar como evoluÃ§Ã£o futura

- MySQL/API prÃ³pria;
- geofencing contÃ­nuo em background;
- FCM/push notifications;
- mapa de calor real;
- despacho automÃ¡tico de viatura;
- integraÃ§Ã£o oficial UFPB/SAMU/PM;
- login institucional real via SIGAA/SSO.

Esses itens nÃ£o precisam impedir a entrega acadÃªmica da versÃ£o integrada.

