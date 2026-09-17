# Checklist de Prontidão para Piloto — UniGuard

> Checklist para orientar uma futura avaliação de prontidão do **UniGuard** antes de qualquer piloto institucional. O projeto permanece acadêmico e demonstrativo até que todos os itens críticos aplicáveis sejam comprovados.

## Como usar

- `[x]` concluído e evidenciado;
- `[ ]` pendente;
- itens marcados como **BLOQUEADOR** impedem considerar o sistema pronto para piloto real.

## 1. Integração funcional

- [ ] **BLOQUEADOR** — comprovar fluxo ponta a ponta Android → Firebase → Central.
- [ ] **BLOQUEADOR** — comprovar criação, recebimento, visualização, despacho e encerramento do alerta.
- [ ] comprovar anexação de evidência e associação correta ao alerta.
- [ ] comprovar histórico e atualização de status no cliente.
- [ ] comprovar funcionamento do modo demonstrativo sem Firebase.

## 2. Identidade e autorização

- [x] autenticação por e-mail/senha prevista e integrada no projeto.
- [x] exigência de e-mail verificado nas regras institucionais.
- [x] estrutura `memberships/{uid}` para vínculo institucional.
- [x] estrutura `operators/{uid}` para operadores.
- [ ] **BLOQUEADOR** — testar usuário sem e-mail verificado.
- [ ] **BLOQUEADOR** — testar usuário sem membership.
- [ ] **BLOQUEADOR** — testar membership inativo.
- [ ] **BLOQUEADOR** — testar operador inativo.

## 3. Isolamento entre instituições

- [x] `institutionId` incorporado às regras e estruturas principais.
- [x] operador limitado à própria instituição nas regras do Firestore.
- [ ] **BLOQUEADOR** — conta da instituição A não pode ler alertas da instituição B.
- [ ] **BLOQUEADOR** — conta da instituição A não pode criar/alterar dados em B.
- [ ] **BLOQUEADOR** — operador A não pode visualizar, confirmar ou alterar alerta de B.
- [ ] verificar evidências entre instituições distintas.

## 4. Auditoria

- [x] coleção `auditLogs` definida.
- [x] modelo append-only para clientes.
- [x] eventos principais documentados.
- [ ] validar `alert_created` ponta a ponta.
- [ ] validar `alert_received`.
- [ ] validar `alert_viewed`.
- [ ] validar `alert_status_changed`.
- [ ] validar `alert_cancelled_by_user`.
- [ ] validar `evidence_uploaded`.

## 5. Retenção e eliminação

- [x] `retentionExpiresAt` previsto para alertas e auditoria.
- [x] política documental: alertas 90 dias.
- [x] política documental: auditoria 365 dias.
- [x] política documental: evidências 30 dias.
- [x] política documental: dados temporários locais 7 dias.
- [ ] **BLOQUEADOR** — habilitar TTL do Firestore em `emergencyAlerts`.
- [ ] **BLOQUEADOR** — habilitar TTL do Firestore em `auditLogs`.
- [ ] **BLOQUEADOR** — configurar ciclo de vida do Firebase Storage.
- [ ] comprovar exclusão automática em ambiente de teste.
- [ ] definir procedimento administrativo para exclusão antecipada.
- [ ] definir tratamento para exceções legais e incidentes.

## 6. Evidências e integridade

- [x] cliente não deve sobrescrever evidência existente.
- [x] campos de evidência são controlados pelas regras.
- [ ] **BLOQUEADOR** — testar tentativa real de sobrescrita.
- [ ] validar autorização de upload por usuário/instituição.
- [ ] revisar metadados armazenados junto às evidências.

## 7. Privacidade e LGPD

- [x] `medicalNotes` removido/bloqueado.
- [x] ausência de prontuário médico como regra do projeto.
- [x] dados públicos/demonstrativos devem ser fictícios.
- [ ] **BLOQUEADOR** — validar juridicamente base legal, finalidade e papéis dos agentes de tratamento.
- [ ] definir aviso de privacidade aplicável ao piloto.
- [ ] definir canal para direitos dos titulares.
- [ ] revisar minimização de identificação, localização e imagem.
- [ ] definir processo de resposta a incidentes de dados pessoais.

## 8. Controle contra abuso

- [x] máximo de 1 alerta ativo por usuário no controle local.
- [x] máximo de 3 alertas em 30 minutos no controle local.
- [x] cooldown de 60 segundos no controle local.
- [ ] **BLOQUEADOR** — implementar rate limiting em camada confiável/backend.
- [ ] **BLOQUEADOR** — habilitar Firebase App Check ou controle equivalente.
- [ ] testar rajada de alertas.
- [ ] testar cliente adulterado/simulação de bypass quando houver backend.

## 9. Segurança técnica

- [x] `SECURITY.md` presente.
- [x] regras Firestore específicas.
- [x] regras de Storage documentadas/versionadas.
- [x] `.env.example` sem credenciais reais.
- [x] `google-services.json` excluído do versionamento.
- [ ] executar revisão de dependências/vulnerabilidades.
- [ ] validar configuração Firebase ativa contra os arquivos versionados.
- [ ] revisar permissões Android para manter apenas as necessárias.
- [ ] revisar headers/configuração do ambiente web de produção.

## 10. Qualidade e testes

- [x] existe estrutura de testes automatizados para controles de segurança web.
- [ ] **BLOQUEADOR** — executar e registrar suíte de testes completa antes do piloto.
- [ ] criar/registrar testes de integração Firebase.
- [ ] validar comportamento com perda de rede.
- [ ] validar perda/negação de localização.
- [ ] validar câmera negada ou indisponível.
- [ ] realizar testes de acessibilidade.
- [ ] realizar testes de desempenho e estabilidade.
- [ ] registrar defeitos e evidências no GitHub Issues quando aplicável.

## 11. Dados legados

- [ ] **BLOQUEADOR** — identificar documentos legados sem `institutionId`.
- [ ] **BLOQUEADOR** — identificar documentos sem `retentionExpiresAt`.
- [ ] migrar, corrigir ou isolar esses registros sob procedimento documentado.
- [ ] confirmar que nenhum dado legado fica indevidamente acessível.

## 12. Operação institucional

- [ ] **BLOQUEADOR** — definir instituição responsável pelo piloto.
- [ ] **BLOQUEADOR** — definir responsáveis operacionais e níveis de acesso.
- [ ] **BLOQUEADOR** — definir protocolo de recebimento e resposta a SOS.
- [ ] definir horários/cobertura do serviço.
- [ ] definir contingência para indisponibilidade do sistema.
- [ ] definir critérios de escalonamento para serviços externos de emergência.
- [ ] definir comunicação clara de que o app não substitui canais oficiais, quando aplicável.

## 13. Governança

- [x] responsável geral do projeto identificado.
- [x] `CODEOWNERS` configurado.
- [x] templates de Issues e Pull Requests.
- [x] Dependabot configurado.
- [x] `CHANGELOG.md` mantido.
- [x] release acadêmica `v0.8.0` registrada.
- [ ] definir processo de aprovação para mudanças de segurança antes de piloto.
- [ ] definir responsáveis por incidentes e manutenção durante eventual piloto.

## Critério mínimo para considerar um piloto

O UniGuard **não deve ser classificado como pronto para piloto institucional enquanto houver qualquer item BLOQUEADOR pendente**.

Mesmo após os bloqueadores técnicos serem concluídos, a realização de um piloto depende de autorização institucional, avaliação jurídica/LGPD, protocolo operacional e definição explícita de responsabilidades.

## Documentos relacionados

- [`REQUISITOS.md`](REQUISITOS.md)
- [`MATRIZ_RASTREABILIDADE.md`](MATRIZ_RASTREABILIDADE.md)
- [`MATRIZ_RISCOS.md`](MATRIZ_RISCOS.md)
- [`ARQUITETURA.md`](ARQUITETURA.md)
- [`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
- [`../SECURITY.md`](../SECURITY.md)
