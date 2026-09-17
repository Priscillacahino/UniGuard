# Plano de Rollback e Recuperação — UniGuard

> Procedimento preparatório. Não substitui política institucional de continuidade.

## Objetivo
Permitir retorno controlado a uma versão conhecida quando uma atualização introduzir regressão.

## Web
1. identificar último deploy validado;
2. interromper promoção da versão defeituosa;
3. promover/reimplantar o commit anterior conhecido como estável;
4. executar smoke test;
5. registrar incidente.

## Android
1. não distribuir APK com CI vermelho;
2. preservar artefato da última release validada;
3. em piloto controlado, reinstalar versão anterior somente após avaliar compatibilidade de dados;
4. nunca fazer downgrade que exponha regras antigas incompatíveis com o backend.

## Firebase Rules
1. regras são versionadas no Git;
2. qualquer rollback deve usar um commit previamente validado pelo Emulator;
3. não restaurar regras que removam isolamento por `institutionId`, e-mail verificado ou proteção de evidência;
4. executar Emulator antes de deploy.

## Backend
1. manter funções versionadas;
2. rollback não deve desativar rate limiting ou App Check silenciosamente;
3. se o backend falhar, não reabrir escrita direta em produção sem decisão explícita e registro de risco;
4. verificar endpoint `health` após recuperação.

## Dados
Rollback de código não equivale a rollback de dados. Alterações em documentos precisam de plano próprio, backup e validação.

## Critério de recuperação
- CI verde;
- health disponível;
- autenticação válida;
- segregação preservada;
- criação/recebimento do SOS validado;
- auditoria íntegra.