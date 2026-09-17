# Matriz de Riscos — UniGuard

> Documento de gestão de riscos do **protótipo acadêmico UniGuard**. A matriz considera o estado atual do repositório e deve ser revisada antes de qualquer piloto institucional. As classificações são qualitativas e não substituem avaliação jurídica, institucional, de segurança da informação ou testes formais.

## 1. Critérios de avaliação

### Probabilidade

| Nível | Definição |
| --- | --- |
| Baixa | Pouco provável nas condições atuais do protótipo |
| Média | Pode ocorrer em cenários plausíveis de uso ou configuração |
| Alta | Pode ocorrer com frequência ou depende de controle ainda não validado |

### Impacto

| Nível | Definição |
| --- | --- |
| Baixo | Efeito limitado à experiência demonstrativa, sem exposição relevante |
| Médio | Pode comprometer funcionalidade, dados ou confiabilidade do protótipo |
| Alto | Pode afetar segurança, privacidade, segregação institucional ou resposta a emergência |
| Crítico | Pode causar exposição relevante de dados, falsa sensação de segurança ou uso inadequado em cenário real |

### Tratamento

- **Evitar:** eliminar o cenário sempre que possível;
- **Mitigar:** reduzir probabilidade ou impacto por controles técnicos/processuais;
- **Transferir:** depender de serviço, contrato ou responsabilidade institucional devidamente formalizada;
- **Aceitar temporariamente:** risco conhecido aceito apenas durante a fase acadêmica/demonstrativa, com restrições documentadas.

---

## 2. Matriz consolidada

| ID | Risco | Probabilidade | Impacto | Nível | Controles atuais | Tratamento / próxima ação | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R01 | Usuário não autorizado criar ou consultar alertas institucionais | Média | Alto | Alto | Firebase Auth, e-mail verificado, `memberships/{uid}`, regras do Firestore | Validar contas sem vínculo e vínculos inativos | Parcialmente mitigado |
| R02 | Operador acessar dados de outra instituição | Média | Crítico | Crítico | `institutionId`, `operators/{uid}`, regras de segregação | Executar testes negativos entre duas instituições distintas | Parcialmente mitigado |
| R03 | Uso indevido ou repetitivo do botão SOS | Alta | Alto | Alto | 1 alerta ativo, 3 alertas/30 min, intervalo de 60 s | Implementar App Check e rate limit em backend confiável | Parcialmente mitigado |
| R04 | Cliente adulterado contornar limites locais contra abuso | Média | Alto | Alto | Limites no web/Android e regras de acesso | Mover criação sensível para função/API confiável | Aberto |
| R05 | Evidência fotográfica ser substituída após envio | Baixa | Alto | Médio | Regras do Storage impedem sobrescrita pelo cliente | Validar tentativa de substituição com conta de teste | Mitigado tecnicamente, pendente validação |
| R06 | Exposição indevida de imagem ou localização | Média | Crítico | Crítico | Controle por autenticação, instituição, finalidade documentada e inventário preliminar de dados | Validar regras, logs, permissões e processo de acesso institucional | Parcialmente mitigado |
| R07 | Armazenamento excessivo de dados pessoais | Média | Alto | Alto | Minimização de dados, bloqueio de `medicalNotes`, retenção definida | Ativar TTL e ciclo de vida remoto; revisar campos futuros | Parcialmente mitigado |
| R08 | Dados permanecerem após o prazo de retenção | Alta | Alto | Alto | `retentionExpiresAt` e prazos documentados | Ativar TTL Firestore e lifecycle do Storage; comprovar exclusão | Aberto |
| R09 | Dados médicos/diagnósticos serem inseridos indevidamente | Baixa | Alto | Médio | Campo `medicalNotes` removido/bloqueado e documentação proibitiva | Manter validações e revisar novos campos antes de releases | Mitigado |
| R10 | Falha de geolocalização ou localização imprecisa | Média | Alto | Alto | Permissões e uso de serviços de localização | Tratar indisponibilidade, precisão e comunicação clara ao usuário | Parcialmente mitigado |
| R11 | Usuário interpretar o protótipo como serviço oficial de emergência | Média | Crítico | Crítico | Avisos no README, documentação e apresentação | Manter avisos visíveis e não divulgar como serviço operacional | Mitigado documentalmente |
| R12 | Firebase indisponível durante um acionamento | Média | Alto | Alto | Modo demonstrativo local e plano de contingência documentado | Não tratar modo local como fallback operacional; validar estratégia real de disponibilidade e canais alternativos | Parcialmente preparado |
| R13 | Falha na sincronização Android → Firebase → Central | Média | Alto | Alto | Estrutura de integração e recibo/status implementados | Executar teste ponta a ponta e registrar evidências | Aberto |
| R14 | Operador inativo continuar com acesso | Baixa | Alto | Médio | Campo `active` em `operators/{uid}` | Testar revogação em sessão ativa e nova autenticação | Parcialmente mitigado |
| R15 | Conta com e-mail não verificado acessar recursos | Baixa | Alto | Médio | Verificação de e-mail exigida nas regras | Testar cenários negativos de autenticação | Parcialmente mitigado |
| R16 | Segredos ou arquivos sensíveis serem publicados no GitHub | Baixa | Crítico | Alto | `.gitignore`, `.env.example`, orientação para não versionar `google-services.json` | Manter secret scanning e revisão de PRs; rotacionar qualquer segredo exposto | Mitigado preventivamente |
| R17 | Dependências desatualizadas introduzirem vulnerabilidades | Média | Alto | Alto | CI e gerenciadores de dependência | Dependabot para npm, Gradle e GitHub Actions | Mitigação automatizada adicionada |
| R18 | Mudança de código quebrar fluxo crítico sem ser percebida | Média | Alto | Alto | Testes e workflow de CI existentes | Exigir checklist de PR e ampliar testes automatizados | Parcialmente mitigado |
| R19 | Logs de auditoria serem alterados ou apagados pelo cliente | Baixa | Alto | Médio | `auditLogs` append-only nas regras do cliente | Validar regras e manter ações administrativas auditáveis | Mitigado tecnicamente |
| R20 | Exclusão antecipada de dados ocorrer sem rastreabilidade | Média | Alto | Alto | Cliente sem `delete`; processo administrativo previsto | Implementar procedimento formal via Admin SDK/backend | Aberto |
| R21 | Dados legados sem `institutionId` escaparem da nova segregação | Média | Crítico | Crítico | Novas regras não devem tornar legado visível | Inventariar, migrar ou eliminar documentos legados antes do piloto | Aberto |
| R22 | Integração futura com MySQL expor banco diretamente ao cliente | Baixa | Crítico | Alto | Arquitetura documenta API/backend obrigatório | Nunca incluir credenciais MySQL em Android/web; implementar API segura | Controlado por arquitetura |
| R23 | Permissões de câmera/localização serem usadas sem compreensão do usuário | Média | Alto | Alto | Solicitação de permissões e finalidade descrita | Melhorar textos de consentimento/contexto e revisar UX | Parcialmente mitigado |
| R24 | Ausência de autorização institucional/jurídica para piloto real | Alta | Crítico | Crítico | Projeto explicitamente acadêmico, pacote LGPD preparatório, RACI, plano operacional e contingência | Obter validação institucional, operacional e jurídica antes de uso real | Bloqueador de piloto |

---

## 3. Riscos prioritários antes de um piloto

Os seguintes riscos devem ser tratados como **bloqueadores de piloto institucional**:

1. **R02 — isolamento entre instituições**: comprovar que usuários e operadores não conseguem acessar dados de outra `institutionId`;
2. **R03/R04 — abuso de alertas**: complementar controles locais com App Check e rate limiting confiável;
3. **R06 — privacidade de localização e evidências**: validar regras e processos de acesso;
4. **R08 — retenção remota**: ativar TTL no Firestore e lifecycle no Storage;
5. **R13 — integração ponta a ponta**: comprovar Android → Firebase → Central com contas de teste;
6. **R21 — dados legados**: migrar, isolar ou eliminar documentos sem partição institucional;
7. **R24 — autorização institucional/jurídica**: nenhuma implantação real deve ocorrer sem validação formal.

---

## 4. Riscos aceitos apenas na fase acadêmica

Enquanto o UniGuard permanecer como protótipo demonstrativo com dados fictícios, alguns riscos podem ser aceitos temporariamente, desde que não sejam apresentados como prontos para produção:

- indisponibilidade de serviços externos;
- ausência de SLA operacional;
- ausência de integração oficial com universidade ou serviços públicos;
- ausência de monitoramento 24x7;
- ausência de backend próprio para rate limit;
- ausência de validação de carga e desempenho em cenário real.

Essa aceitação deixa de ser válida no momento em que o projeto passar para piloto com usuários reais.

---

## 5. Responsabilidade e revisão

**Responsável geral pelo projeto:** Priscilla Cahino.

A matriz deve ser revisada sempre que houver mudança relevante em:

- autenticação ou autorização;
- Firebase/Firestore/Storage;
- geolocalização ou evidências;
- regras de negócio do SOS;
- modelo de dados;
- integrações externas;
- requisitos legais ou institucionais;
- implantação de piloto.

Documentos relacionados:

- [`PLANO_OPERACIONAL.md`](PLANO_OPERACIONAL.md)
- [`PLANO_CONTINGENCIA.md`](PLANO_CONTINGENCIA.md)
- [`RUNBOOK_INCIDENTES.md`](RUNBOOK_INCIDENTES.md)
- [`PACOTE_LGPD_PREPARATORIO.md`](PACOTE_LGPD_PREPARATORIO.md)
- [`MATRIZ_RACI.md`](MATRIZ_RACI.md)

- [`SECURITY.md`](../SECURITY.md)
- [`docs/ARQUITETURA.md`](ARQUITETURA.md)
- [`docs/CONTROLES_AUDITORIA_RETENCAO_ABUSO.md`](CONTROLES_AUDITORIA_RETENCAO_ABUSO.md)
- [`docs/FIREBASE_SETUP.md`](FIREBASE_SETUP.md)
- [`CHANGELOG.md`](../CHANGELOG.md)
