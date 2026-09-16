# Controles de auditoria, retenção e abuso

Este documento define o comportamento mínimo do UniGuard para um piloto institucional. Os
controles de segurança são aplicados nas regras do Firestore; a interface local é apenas uma
camada de usabilidade.

## Auditoria

A coleção `auditLogs` é append-only no cliente: criação, alteração e exclusão de eventos são
controladas por regras. Os eventos implementados são:

- `alert_created`: alerta criado pelo usuário ou simulação autorizada da central;
- `alert_received`: confirmação transacional de recebimento pela central;
- `alert_viewed`: operador abriu o detalhe do alerta;
- `alert_status_changed`: despacho, chegada ao local ou encerramento;
- `alert_cancelled_by_user`: cancelamento feito pelo titular;
- `evidence_uploaded`: upload de evidência autorizado.

Cada evento contém `institutionId`, `alertId`, `actorUid`, tipo de ator, horário e
`retentionExpiresAt`. Não existe edição ou exclusão pelo navegador. A permissão de leitura é
restrita ao operador ativo da instituição ou ao próprio ator do evento.

## Retenção e eliminação

| Dado | Prazo padrão | Mecanismo |
| --- | ---: | --- |
| Alerta operacional no Firestore | 90 dias | TTL em `emergencyAlerts.retentionExpiresAt` |
| Auditoria | 365 dias | TTL em `auditLogs.retentionExpiresAt` |
| Evidência fotográfica no Storage | 30 dias | regra de ciclo de vida do bucket `emergency-evidence/` |
| Cache de alertas no navegador | 7 dias para ocorrências encerradas | limpeza local na inicialização |
| Fotos locais do Android | 7 dias | limpeza do diretório privado do aplicativo |

Para ativar a eliminação remota, habilite duas políticas TTL no banco correto:

```bash
gcloud firestore fields ttls update retentionExpiresAt \
  --collection-group=emergencyAlerts --enable-ttl

gcloud firestore fields ttls update retentionExpiresAt \
  --collection-group=auditLogs --enable-ttl
```

O Storage precisa de uma regra de ciclo de vida equivalente a 30 dias para o prefixo
`emergency-evidence/`. Faça a configuração no bucket de produção e confirme o relatório de
exclusões. O TTL do Firestore é assíncrono; não deve ser apresentado ao titular como exclusão
instantânea.

O cliente não recebe permissão de `delete`. Exclusões antecipadas, solicitações de titular,
bloqueios legais e restaurações devem passar por um processo administrativo/auditável usando
Admin SDK. Antes de um piloto, dados antigos sem `institutionId` ou
`retentionExpiresAt` devem ser migrados ou isolados; as novas regras não os tornam visíveis.

## Dados médicos

O perfil não possui mais `medicalNotes`, tipo sanguíneo, alergias ou diagnóstico. A categoria
`saude_desmaio` representa somente o tipo operacional da ocorrência. A interface e as regras
também rejeitam o antigo campo `medicalNotes`. O texto do alerta deve descrever a situação
necessária para o atendimento, nunca criar um prontuário.

## Controle contra abuso

O aplicativo bloqueia:

- mais de um alerta ativo por usuário;
- mais de 3 alertas em uma janela de 30 minutos;
- novo alerta durante 60 segundos após o anterior.

O mesmo limite é aplicado no navegador e no Android, com mensagem de bloqueio e sem disparar
nova captura, SMS ou gravação. Esses limites locais não são uma fronteira de segurança contra
um cliente adulterado. Para produção, habilite Firebase App Check e mova a criação do alerta
para uma função/API confiável com rate limit por UID, instituição, IP/dispositivo e alertas
duplicados; mantenha os limites locais como resposta rápida de UX.

## Checklist de ativação

1. Provisionar `memberships/{uid}` e `operators/{uid}` somente por administração/SSO, sempre
   com `institutionId` e `active: true`.
2. Habilitar as duas políticas TTL e o ciclo de vida do Storage.
3. Migrar ou descartar, sob procedimento documentado, documentos legados sem partição.
4. Testar que um usuário de uma instituição não lê, grava, confirma ou vê evidência de outra.
5. Testar conta não verificada, vínculo inativo, rajada de alertas e tentativa de inserir
   `medicalNotes`.
