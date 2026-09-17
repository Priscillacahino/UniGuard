# Pacote LGPD Preparatório — UniGuard

> Documento preparatório para futura avaliação jurídica, de privacidade e institucional. Não constitui parecer jurídico, RIPD aprovado, definição definitiva de base legal ou autorização para tratamento de dados reais.

## 1. Objetivo
Organizar os elementos de privacidade do UniGuard antes de qualquer piloto com pessoas reais.

## 2. Princípios adotados
- finalidade;
- adequação;
- necessidade;
- minimização;
- transparência;
- segurança;
- prevenção;
- não discriminação;
- responsabilização e prestação de contas.

## 3. Inventário preliminar de dados
| Categoria | Exemplos | Finalidade proposta | Sensibilidade | Retenção planejada | Acesso esperado |
|---|---|---|---|---|---|
| Identificação | nome, e-mail, identificador | autenticação e vínculo | pessoal | conforme vínculo/necessidade | titular e administração autorizada |
| Vínculo institucional | institutionId, campus, perfil | autorização e segregação | pessoal | enquanto necessário | sistema e perfis autorizados |
| Contato | telefone e contato de emergência | suporte ao atendimento | pessoal | mínimo necessário | perfis autorizados |
| Localização | latitude, longitude, nome do local | localizar ocorrência | alto impacto de privacidade | alerta: 90 dias, sujeito a validação | titular e Central autorizada |
| Evidência | fotografia vinculada ao alerta | contextualização da ocorrência | alto impacto de privacidade | 30 dias, sujeito a lifecycle | titular e Central autorizada |
| Dados operacionais | categoria, status, protocolo, horários | gestão da ocorrência | pessoal/contextual | 90 dias | perfis autorizados |
| Auditoria | ator, ação, horário, alerta | rastreabilidade e segurança | pessoal/técnico | 365 dias | administração autorizada |

## 4. Dados proibidos ou evitados
- prontuário médico;
- diagnóstico;
- histórico clínico;
- medicalNotes;
- dados não relacionados à finalidade de segurança;
- cópias desnecessárias de documentos;
- credenciais em texto claro.

## 5. Matriz finalidade × dado
### Autenticação
Dados mínimos: e-mail, UID e estado de verificação.

### Autorização institucional
Dados mínimos: UID, institutionId, status ativo e papel.

### SOS
Dados mínimos: protocolo, categoria, horário, localização disponível e estado do alerta.

### Evidência
Somente quando autorizada e necessária ao fluxo.

### Auditoria
Somente metadados necessários para responsabilização e investigação.

## 6. Bases legais — apenas para futura validação
A base legal aplicável NÃO está definida por este documento. A instituição e assessoria jurídica/DPO deverão avaliar a hipótese correta para cada tratamento, considerando finalidade, natureza do serviço, relação com os titulares e contexto institucional.

Antes de piloto, registrar para cada operação:
- finalidade;
- titular;
- dado;
- agente de tratamento;
- hipótese legal validada;
- prazo de retenção;
- compartilhamentos;
- canal de exercício de direitos.

## 7. Papéis LGPD — pendentes de validação
A definição de controlador, operador, encarregado e eventuais corresponsabilidades depende da configuração institucional futura. O projeto não atribui esses papéis unilateralmente.

## 8. Transparência — minuta de conteúdo
Um futuro aviso de privacidade deve informar, em linguagem clara:
- quem trata os dados;
- para quais finalidades;
- quais dados são coletados;
- quando localização e câmera são usadas;
- com quem os dados podem ser compartilhados;
- prazos de retenção;
- medidas gerais de segurança;
- direitos dos titulares;
- canal de contato;
- limitações do serviço;
- alterações relevantes da política.

## 9. Direitos dos titulares — procedimento preparatório
Antes de piloto, deve existir canal para:
- confirmação da existência de tratamento;
- acesso;
- correção;
- informação sobre compartilhamentos;
- eliminação quando aplicável;
- revisão de decisões automatizadas quando aplicável;
- demais direitos previstos na legislação.

Fluxo proposto:
1. receber solicitação;
2. autenticar o solicitante;
3. registrar protocolo;
4. localizar dados;
5. avaliar restrições legais;
6. executar resposta;
7. registrar evidência do atendimento.

## 10. Privacy by Design
Checklist:
- coletar somente o necessário;
- acesso por menor privilégio;
- segregation por institutionId;
- não incluir dados clínicos;
- retenção com prazo definido;
- evidência sem sobrescrita;
- auditoria append-only;
- dados de teste fictícios;
- permissões solicitadas no contexto;
- novas funcionalidades passam por revisão de privacidade.

## 11. Preparação de RIPD/DPIA
Um futuro relatório formal deve incluir:
- descrição do tratamento;
- necessidade e proporcionalidade;
- riscos aos titulares;
- medidas de mitigação;
- fluxo de dados;
- fornecedores/suboperadores;
- transferências;
- retenção;
- incidentes;
- risco residual;
- aprovação formal.

## 12. Incidente de dados pessoais
Em caso de suspeita:
- conter;
- preservar evidências;
- identificar dados/titulares potencialmente afetados;
- avaliar impacto;
- registrar cronologia;
- submeter decisão de comunicação à instituição e responsável jurídico/DPO;
- corrigir causa;
- atualizar controles.

## 13. Compartilhamento
Nenhum compartilhamento com universidade, segurança pública, saúde ou terceiros deve ser presumido. Integrações reais exigem finalidade, autorização institucional, requisitos técnicos, base legal e responsabilidades definidas.

## 14. Testes e demonstrações
- usar dados fictícios;
- evitar imagens de pessoas reais;
- evitar localização associada a pessoa identificável;
- não usar dados sensíveis;
- limpar dados demonstrativos quando não necessários.

## 15. Pendências que exigem terceiros
- validação das bases legais;
- definição formal dos agentes de tratamento;
- aprovação do aviso de privacidade;
- aprovação de RIPD quando aplicável;
- definição do encarregado/canal institucional;
- autorização para piloto;
- avaliação de contratos e fornecedores.

## 16. Documentos relacionados
- [PLANO_OPERACIONAL.md](PLANO_OPERACIONAL.md)
- [PLANO_CONTINGENCIA.md](PLANO_CONTINGENCIA.md)
- [RUNBOOK_INCIDENTES.md](RUNBOOK_INCIDENTES.md)
- [MATRIZ_RACI.md](MATRIZ_RACI.md)
- [CHECKLIST_PILOTO.md](CHECKLIST_PILOTO.md)
- [../SECURITY.md](../SECURITY.md)