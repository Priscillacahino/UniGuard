# Runbook de Incidentes — UniGuard

> Procedimento técnico e operacional preparatório. Deve ser validado antes de uso real.

## 1. Objetivo
Padronizar identificação, classificação, contenção, investigação, recuperação e registro de incidentes.

## 2. Severidade
| Severidade | Critério |
|---|---|
| SEV-1 | exposição de dados, falha de segregação, comprometimento de credenciais ou risco de falsa confirmação de emergência |
| SEV-2 | indisponibilidade de fluxo crítico, perda parcial de auditoria, falha repetida de SOS |
| SEV-3 | falha funcional com alternativa disponível |
| SEV-4 | defeito menor sem impacto em fluxo crítico |

## 3. Fluxo
1. detectar;
2. registrar horário e contexto;
3. classificar severidade;
4. conter;
5. preservar evidências;
6. identificar causa;
7. corrigir;
8. validar;
9. recuperar;
10. documentar lições aprendidas.

## 4. Registro mínimo
- ID do incidente;
- data/hora;
- severidade;
- ambiente;
- versão/commit;
- componente;
- descrição;
- dados potencialmente afetados;
- instituições potencialmente afetadas;
- medidas de contenção;
- causa;
- correção;
- evidências;
- necessidade de comunicação externa: pendente de validação jurídica;
- status final.

## 5. Incidentes de segurança
### Acesso indevido
- revogar acesso quando possível;
- preservar logs;
- identificar escopo;
- verificar institutionId;
- revisar regras;
- testar correção.

### Credencial exposta
- revogar/rotacionar;
- remover do histórico quando aplicável;
- avaliar logs;
- revisar repositório e pipelines.

### Segregação quebrada
- classificar como SEV-1;
- interromper ambiente afetado;
- identificar registros acessíveis;
- corrigir regras;
- executar testes negativos antes da retomada.

### Auditoria ausente
- interromper mudanças sensíveis se rastreabilidade estiver comprometida;
- verificar causa;
- preservar fontes alternativas de evidência.

## 6. Incidentes de privacidade
- minimizar acesso ao material;
- preservar evidência sem replicação desnecessária;
- identificar tipos de dados;
- identificar titulares potencialmente afetados;
- registrar finalidade original;
- submeter decisão de comunicação a responsável institucional/jurídico futuro.

## 7. Incidentes operacionais
### SOS não recebido
- não gerar confirmação falsa;
- registrar falha;
- testar conectividade, autenticação e regras;
- validar recuperação.

### Status divergente
- bloquear automações arriscadas;
- conferir fonte de verdade;
- preservar auditLogs;
- corrigir consistência.

## 8. Pós-incidente
- registrar causa raiz;
- registrar ação corretiva;
- registrar ação preventiva;
- relacionar requisito ou risco;
- atualizar testes quando necessário;
- atualizar documentação quando necessário.

## 9. Integração com GitHub
Defeitos técnicos não sensíveis podem ser registrados em Issues. Dados pessoais, credenciais, imagens ou detalhes de vulnerabilidade não devem ser publicados em issue pública.

## 10. Encerramento
Um incidente só deve ser encerrado quando:
- contenção concluída;
- correção validada;
- risco residual registrado;
- documentação atualizada;
- responsáveis cientes.