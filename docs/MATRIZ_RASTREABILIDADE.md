# Matriz de Rastreabilidade — UniGuard

> Esta matriz conecta requisitos, regras de negócio, implementação e documentação do **protótipo acadêmico UniGuard**. Ela não substitui testes formais nem homologação institucional.

## Objetivo

Permitir que cada requisito relevante possa ser rastreado até os principais artefatos que o suportam no repositório, facilitando auditoria, evolução e validação futura.

## Requisitos funcionais

| Requisito | Regra(s) relacionada(s) | Implementação / artefato | Evidência documental | Situação |
|---|---|---|---|---|
| RF01 — cadastro e autenticação | RN01 | `src/services/firebase.ts`, Firebase Auth | `docs/FIREBASE_SETUP.md` | Implementado |
| RF02 — e-mail verificado + vínculo ativo | RN01, RN02 | `firestore.rules` | `docs/FIREBASE_SETUP.md`, `SECURITY.md` | Implementado |
| RF03 — associação institucional | RN02, RN03 | `firestore.rules`, `memberships/{uid}`, `operators/{uid}` | `docs/ARQUITETURA.md` | Implementado |
| RF04 — localização autorizada | — | Web + Android, Google Play Services Location | `README.md`, `docs/ARQUITETURA.md` | Implementado |
| RF05 — criação de alerta SOS | RN04, RN05, RN06 | `src/services/alertRepository.ts`, `firestore.rules` | `README.md`, apresentação profissional | Implementado |
| RF06 — evidência fotográfica | RN07 | `firebase.ts`, Storage, regras de acesso | `SECURITY.md`, `docs/FIREBASE_SETUP.md` | Parcial |
| RF07 — operador vê apenas própria instituição | RN03 | `isActiveOperatorFor()` em `firestore.rules` | `SECURITY.md`, `docs/ARQUITETURA.md` | Implementado |
| RF08 — recebimento/visualização/status | RN09 | `src/services/alertRepository.ts`, `auditLogs` | `docs/CONTROLES_AUDITORIA_RETENCAO_ABUSO.md` | Parcial |
| RF09 — histórico de alertas | — | repositório de alertas e interface web | `README.md` | Implementado |
| RF10 — trilha de auditoria | RN09 | coleção `auditLogs`, `firestore.rules` | `SECURITY.md`, `docs/CONTROLES_AUDITORIA_RETENCAO_ABUSO.md` | Implementado |
| RF11 — controle contra abuso | RN04, RN05, RN06 | `src/services/abuseControl.ts` | `SECURITY.md`, matriz de riscos | Parcial |
| RF12 — limpeza de dados temporários | RN10, RN11 | `src/services/retention.ts` e políticas documentadas | `docs/CONTROLES_AUDITORIA_RETENCAO_ABUSO.md` | Parcial |

## Requisitos não funcionais

| Requisito | Implementação / controle | Evidência | Validação ainda necessária |
|---|---|---|---|
| RNF01 — controle por conta/perfil/instituição | Firebase Auth + Firestore Rules | `firestore.rules` | testes negativos com contas distintas |
| RNF02 — minimização e sem prontuário médico | validação de campos e bloqueio de `medicalNotes` | `firestore.rules`, `SECURITY.md` | revisão contínua de novos campos |
| RNF03 — auditoria append-only | `auditLogs`, sem update/delete pelo cliente | `firestore.rules` | teste integrado completo |
| RNF04 — alertas 90d / auditoria 365d | `retentionExpiresAt` | `retention.ts`, documentação | ativar TTL remoto e comprovar exclusões |
| RNF05 — evidência 30d / temporários 7d | política de retenção | documentação de controles | configurar ciclo de vida do Storage |
| RNF06 — evidência sem sobrescrita | regras de Storage/atualização controlada | `storage.rules`, `SECURITY.md` | teste negativo de overwrite |
| RNF07 — segregação institucional | `institutionId` + regras | `firestore.rules` | bateria completa de testes entre instituições |
| RNF08 — modo demonstrativo | fallback/local mode | Web/Android | validação funcional contínua |
| RNF09 — permissões mínimas/clareza | fluxo de permissões | app + documentação | revisão UX/acessibilidade |
| RNF10 — MySQL somente via API segura | decisão arquitetural | `docs/ARQUITETURA.md` | implementação futura |

## Regras de negócio e evidências

| Regra | Evidência técnica | Evidência documental | Próxima validação |
|---|---|---|---|
| RN01 | `hasVerifiedEmail()` | `FIREBASE_SETUP.md` | conta não verificada deve falhar |
| RN02 | `isActiveMemberOf(institutionId)` | `FIREBASE_SETUP.md` | membership ausente/inativo deve falhar |
| RN03 | `isActiveOperatorFor(institutionId)` | `SECURITY.md` | operador de instituição A não vê B |
| RN04 | `checkAlertAllowance()` | `CONTROLES_AUDITORIA_RETENCAO_ABUSO.md` | tentativa com alerta já ativo |
| RN05 | `maxAlertsPerWindow: 3` | idem | 4º alerta em 30 min deve ser bloqueado |
| RN06 | `cooldownSeconds: 60` | idem | novo alerta antes de 60s deve falhar |
| RN07 | regras de evidência | `SECURITY.md` | tentativa de sobrescrita |
| RN08 | exclusão/bloqueio de `medicalNotes` | `SECURITY.md` | tentativa de inserir campo legado |
| RN09 | `auditLogs` | documentação de auditoria | verificar eventos esperados ponta a ponta |
| RN10 | cliente sem permissão de delete | `SECURITY.md` | definir procedimento administrativo real |
| RN11 | migração/isolamento pré-piloto | `MATRIZ_RISCOS.md` | verificar documentos legados |
| RN12 | uso de dados fictícios | README/apresentação | manter política em todos os ambientes públicos |

## Pontos com maior necessidade de evidência futura

1. Android → Firebase → Central em um fluxo completo e documentado.
2. Segregação negativa entre duas instituições de teste.
3. TTL do Firestore efetivamente ativado e observado.
4. Ciclo de vida do Storage efetivamente configurado.
5. App Check e rate limiting em camada confiável.
6. Testes negativos para evidências, dados médicos e operadores inativos.

## Relação com outros documentos

- [`REQUISITOS.md`](REQUISITOS.md)
- [`ARQUITETURA.md`](ARQUITETURA.md)
- [`MATRIZ_RISCOS.md`](MATRIZ_RISCOS.md)
- [`CONTROLES_AUDITORIA_RETENCAO_ABUSO.md`](CONTROLES_AUDITORIA_RETENCAO_ABUSO.md)
- [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
- [`../SECURITY.md`](../SECURITY.md)

A matriz deve ser revisada sempre que um requisito mudar de status, um arquivo de implementação for substituído ou uma validação relevante for concluída.
