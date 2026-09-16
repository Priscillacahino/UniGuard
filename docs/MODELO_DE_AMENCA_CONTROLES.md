# Modelo de ameaça dos quatro controles

## Limite do que é garantido pelo cliente

O navegador e o APK podem ser modificados por quem os controla. Por isso, o bloqueio local de
rajada é deliberadamente tratado como contenção de UX. A autorização verdadeira fica nas regras
do Firestore/Storage, que exigem e-mail verificado, vínculo ativo e partição institucional.

A confirmação “recebido pela central” só é verdadeira quando o operador ativo grava
`receiptStatus: recebido_pela_central`, `centralReceiptAt` e `centralReceiptByUid`. A
operação também grava `alert_received` no mesmo batch. Um usuário não pode alterar esses
campos.

## Campos proibidos

O campo `medicalNotes` foi removido do tipo, dos formulários, do perfil de demonstração, da
sanitização de legado e da allowlist das regras. O bloqueio deve ser mantido em qualquer
integração futura, inclusive SSO, API, importação e painel administrativo.

## Evidência e privacidade

Fotos não são embutidas no Firestore. O cliente envia a evidência para um caminho derivado do
ID do alerta, com limite de tamanho e leitura condicionada ao titular ou operador da mesma
instituição. A expiração do Storage é independente do TTL do documento; ambos precisam ser
monitorados.
