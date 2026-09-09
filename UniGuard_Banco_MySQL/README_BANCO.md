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
