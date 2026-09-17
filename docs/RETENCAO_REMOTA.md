# Ativação de Retenção Remota — UniGuard

> Preparação técnica. A ativação real exige acesso autorizado ao projeto Firebase/Google Cloud.

## Firestore TTL
O campo versionado é `retentionExpiresAt`.

Devem receber TTL:
- collection group `emergencyAlerts` — política documental de 90 dias;
- collection group `auditLogs` — política documental de 365 dias.

A aplicação já grava `retentionExpiresAt`; falta apenas habilitar a política TTL no projeto real e comprovar exclusão em ambiente controlado.

## Firebase Storage
O arquivo `infra/storage-lifecycle.json` prepara exclusão de objetos sob `emergency-evidence/` após 30 dias.

Antes de aplicar:
1. confirmar o bucket correto;
2. revisar se existem outros objetos sob o mesmo prefixo;
3. aplicar lifecycle somente com credencial administrativa autorizada;
4. testar com objeto fictício;
5. registrar evidência da configuração.

## Dados locais
O Android já remove evidências locais expiradas conforme política de 7 dias.

## Auditoria legada
`functions/auditLegacyData.js` faz varredura somente leitura por padrão e aponta:
- documentos sem `institutionId`;
- documentos sem `retentionExpiresAt`;
- presença indevida de `medicalNotes`.

O script deliberadamente NÃO corrige dados automaticamente. Isso evita mutação destrutiva sem revisão.

## Critério de conclusão
Só marcar retenção remota como concluída após evidência no projeto Firebase real.