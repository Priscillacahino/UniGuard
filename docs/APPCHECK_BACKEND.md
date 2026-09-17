# App Check e Backend Confiável — UniGuard

> Preparação técnica para endurecimento de produção. A ativação real exige acesso autorizado ao Firebase Console/Google Cloud.

## Estado preparado
- Web: inicialização condicional de App Check com `VITE_FIREBASE_APPCHECK_SITE_KEY`;
- Android: App Check com Debug Provider em desenvolvimento e Play Integrity em release;
- Backend: `createEmergencyAlert` exige App Check válido (`enforceAppCheck: true`);
- Firestore: chave `settings/security.trustedBackendRequired` permite bloquear criação direta de alertas pelos clientes;
- CI: testes de regras e rate limiting.

## Sequência recomendada de ativação
1. registrar o app web no App Check;
2. registrar o app Android com Play Integrity;
3. validar tokens sem enforcement;
4. implantar as Cloud Functions;
5. testar `createEmergencyAlert` com contas de teste;
6. definir `settings/security.trustedBackendRequired = true` usando credencial administrativa;
7. ativar enforcement do App Check nos produtos Firebase usados;
8. executar novamente a suíte E2E;
9. monitorar erros e taxa de rejeição.

## Importante
Não ativar enforcement antes de confirmar que web, Android e backend estão emitindo/aceitando tokens corretamente. Isso poderia bloquear usuários legítimos.

## Rate limiting confiável
O backend mantém estado em `rateLimits/{uid}` e aplica:
- máximo de 3 alertas em 30 minutos;
- cooldown de 60 segundos;
- bloqueio quando já existe alerta ativo;
- validação de e-mail verificado;
- validação de membership ativo;
- associação automática à `institutionId` do servidor.

## Chave de corte
`settings/security.trustedBackendRequired` não é legível nem gravável por clientes. Quando `true`, o Firestore deixa de aceitar criação direta de alertas por web/Android e a criação deve ocorrer pelo backend Admin SDK.

## Pendência externa inevitável
A ativação final depende de credenciais administrativas e configuração no projeto Firebase real.