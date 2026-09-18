# Banco de Dados MySQL — UniGuard

Este pacote traduz para MySQL 8+ o fluxo atual do UniGuard e amplia a estrutura para a futura central de segurança.

## Principais entidades
- `campuses`: campi e geofencing.
- `users`: estudante/docente/servidor/segurança/administrador.
- `user_devices`: dispositivos móveis vinculados ao usuário.
- `trusted_contacts`: contatos que recebem SMS.
- `safe_points`: guaritas, blocos iluminados e outros pontos seguros.
- `incident_categories`: categorias do SOS.
- `emergency_alerts`: núcleo da ocorrência.
- `location_history`: breadcrumbs e última localização conhecida.
- `alert_evidence`: foto/vídeo/áudio/documentos da ocorrência.
- `security_agents`: agentes da central.
- `patrol_units`: viaturas, motos e rondas.
- `dispatches`: despacho e atendimento em campo.
- `alert_status_history`: histórico de mudança de status.
- `audit_logs`: rastreabilidade e auditoria.

## Como executar
1. Abra MySQL Workbench, phpMyAdmin ou outro cliente MySQL 8+.
2. Abra `uniguard_mysql.sql`.
3. Execute o script completo.
4. O banco `uniguard` será criado com tabelas, chaves, índices, views, trigger e dados fictícios de teste.

## Observação de arquitetura
O app Android atual usa Firebase/Firestore para sincronização do SOS. O MySQL não deve ser acessado diretamente pelo aplicativo Android. Para uma versão final, use uma API/backend entre Android e MySQL (por exemplo, Spring Boot, Node.js/Express ou PHP/Laravel). Isso evita expor usuário e senha do banco dentro do APK e permite autenticação, validação, logs e controle de acesso.

## Compatibilidade com o fluxo atual
Os campos do alerta atual como `protocolNumber`, `userId`, `category`, `status`, `location`, `campusId`, `signalLost` e `source` foram mapeados para entidades relacionais do MySQL.


## Limites deste modelo de referência

Este esquema é **conceitual e educacional**. Ele não é a fonte de verdade da autenticação nem representa, sozinho, a arquitetura de segurança atual do UniGuard.

Na implementação atual:

- a identidade é gerenciada pelo Firebase Authentication;
- autorização e segregação são baseadas em `memberships/{uid}`, `operators/{uid}` e `institutionId`;
- alertas/evidências seguem regras do Firestore e Storage;
- retenção é modelada por `retentionExpiresAt` e políticas remotas;
- o backend confiável é a camada prevista para decisões server-side.

Por isso, a coluna `password_hash` presente no esquema deve ser tratada somente como referência de uma arquitetura relacional alternativa e **não deve ser usada em paralelo ao Firebase Authentication**.

Antes de qualquer migração futura para MySQL, o modelo precisa ser revisado para incluir explicitamente:

1. isolamento multi-instituição em todas as entidades aplicáveis;
2. autorização baseada em papéis e vínculo institucional;
3. retenção e eliminação equivalentes às políticas do projeto;
4. trilha de auditoria protegida;
5. minimização de dados pessoais;
6. acesso exclusivamente por API/backend, nunca diretamente pelo app;
7. migração de dados com validação de `institutionId`.

A arquitetura vigente e seus controles estão documentados em `docs/ARQUITETURA.md`, `SECURITY.md` e `docs/STATUS_DE_PRONTIDAO.md`.
