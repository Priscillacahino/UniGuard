# Requisitos do UniGuard

> Documento de referência dos requisitos do **protótipo acadêmico UniGuard**. Os status abaixo refletem o estado atual do repositório e não significam homologação para uso real.

## Legenda de status

- **Implementado** — existe suporte correspondente no repositório.
- **Parcial** — existe implementação relevante, mas ainda depende de integração, configuração remota ou validação complementar.
- **Planejado** — requisito definido, porém ainda não concluído no estado atual.

## Requisitos funcionais

| ID | Requisito | Prioridade | Status | Evidência principal |
|---|---|---|---|---|
| RF01 | Permitir cadastro e autenticação por e-mail e senha. | Alta | Implementado | Firebase Authentication e documentação de configuração. |
| RF02 | Exigir e-mail verificado e vínculo institucional ativo para operação institucional. | Alta | Implementado | `firestore.rules` e `docs/FIREBASE_SETUP.md`. |
| RF03 | Associar usuário e operador a uma instituição/campus por `institutionId`. | Alta | Implementado | `memberships/{uid}`, `operators/{uid}` e regras Firestore. |
| RF04 | Obter localização do dispositivo mediante permissão do usuário. | Alta | Implementado | Web/Android com geolocalização. |
| RF05 | Criar alerta SOS contendo categoria, data/hora e localização disponível. | Alta | Implementado | fluxo de alertas e `emergencyAlerts`. |
| RF06 | Permitir anexar evidência fotográfica quando houver autorização. | Média | Parcial | fluxo de Storage e campos de evidência; validação ponta a ponta ainda pendente. |
| RF07 | Permitir que operadores visualizem somente alertas da própria instituição. | Alta | Implementado | `isActiveOperatorFor(institutionId)` em `firestore.rules`. |
| RF08 | Registrar recebimento, visualização e mudanças de status do atendimento. | Alta | Parcial | regras, repositório de alertas e auditoria existentes; integração completa ainda precisa ser comprovada. |
| RF09 | Permitir acompanhamento e histórico de alertas. | Média | Implementado | protótipo web, repositório de alertas e estados operacionais. |
| RF10 | Registrar eventos relevantes em trilha de auditoria. | Alta | Implementado | coleção `auditLogs` e regras append-only. |
| RF11 | Bloquear criação abusiva ou excessivamente repetitiva de alertas. | Alta | Parcial | `src/services/abuseControl.ts`; proteção robusta em backend/App Check ainda pendente. |
| RF12 | Eliminar dados temporários locais conforme política de retenção. | Média | Parcial | mecanismos/documentação locais; retenção remota ainda requer configuração operacional. |

## Requisitos não funcionais

| ID | Requisito | Categoria | Prioridade | Status |
|---|---|---|---|---|
| RNF01 | Restringir acesso por conta, perfil e instituição autorizada. | Segurança | Alta | Implementado |
| RNF02 | Aplicar minimização de dados e não manter prontuário médico. | Privacidade | Alta | Implementado |
| RNF03 | Manter auditoria append-only para clientes. | Auditoria | Alta | Implementado |
| RNF04 | Adotar retenção prevista de 90 dias para alertas e 365 dias para auditoria. | Governança de dados | Alta | Parcial |
| RNF05 | Adotar retenção prevista de 30 dias para evidências e 7 dias para dados temporários locais. | Governança de dados | Média | Parcial |
| RNF06 | Impedir sobrescrita de evidências pelo cliente. | Integridade | Alta | Implementado |
| RNF07 | Impedir leitura ou alteração cruzada entre instituições. | Isolamento | Alta | Implementado em regras; testes negativos completos pendentes |
| RNF08 | Manter modo demonstrativo/local sem dependência obrigatória do Firebase. | Disponibilidade demonstrativa | Média | Implementado |
| RNF09 | Solicitar apenas permissões necessárias e apresentar confirmação clara ao usuário. | UX/Privacidade | Alta | Parcial |
| RNF10 | Caso o MySQL seja adotado futuramente, permitir acesso somente por API/backend seguro. | Arquitetura | Alta | Planejado |

## Regras de negócio

| ID | Regra | Status | Observação |
|---|---|---|---|
| RN01 | O usuário institucional deve possuir e-mail verificado. | Implementado | Validado pelas regras do Firestore. |
| RN02 | O usuário deve possuir vínculo institucional ativo com `institutionId`. | Implementado | `memberships/{uid}`. |
| RN03 | O operador acessa apenas dados da própria instituição. | Implementado | `operators/{uid}` + `institutionId`. |
| RN04 | Um usuário pode ter no máximo um alerta ativo. | Implementado no cliente | Ainda deve ser reforçado em backend confiável. |
| RN05 | Um usuário pode gerar no máximo 3 alertas em uma janela de 30 minutos. | Implementado no cliente | Política presente em `abuseControl.ts`. |
| RN06 | Deve existir intervalo mínimo de 60 segundos entre alertas. | Implementado no cliente | Política presente em `abuseControl.ts`. |
| RN07 | Evidências não podem ser substituídas pelo cliente após registro. | Implementado | Regras de Storage/Firestore. |
| RN08 | `medicalNotes` e dados clínicos não devem ser aceitos pelo sistema. | Implementado | Campo removido/bloqueado. |
| RN09 | Eventos de auditoria devem registrar ator, alerta, instituição e horário. | Implementado | `auditLogs`. |
| RN10 | Exclusão antecipada de dados deve ocorrer por processo administrativo auditável. | Planejado operacionalmente | Não deve ser feita diretamente pelo cliente. |
| RN11 | Dados legados sem `institutionId` ou `retentionExpiresAt` devem ser migrados ou isolados antes de piloto. | Planejado | Pré-condição de piloto. |
| RN12 | Validações públicas e acadêmicas devem utilizar apenas dados fictícios. | Implementado como política documental | Reforçado no README, SECURITY e materiais. |

## Dependências externas importantes

Alguns requisitos dependem de configuração fora do código versionado:

- projeto Firebase corretamente configurado;
- TTL remoto do Firestore ativado;
- ciclo de vida do Firebase Storage configurado;
- App Check;
- backend confiável para rate limiting robusto;
- contas de teste de instituições distintas;
- validações jurídicas, institucionais e operacionais antes de qualquer piloto real.

## Critério de leitura dos status

Um requisito marcado como **Implementado** significa que há suporte correspondente no repositório. Isso não equivale automaticamente a teste integrado, homologação, aprovação institucional ou prontidão para produção.

Para verificar o vínculo entre requisitos, código, regras e evidências, consulte [`MATRIZ_RASTREABILIDADE.md`](MATRIZ_RASTREABILIDADE.md).
