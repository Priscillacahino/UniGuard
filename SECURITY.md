# Política de Segurança — UniGuard

> **Status:** protótipo acadêmico em desenvolvimento. O UniGuard não deve ser utilizado como serviço real de emergência sem validação técnica, jurídica, institucional e operacional.

Este documento reúne os controles de segurança atualmente previstos e implementados no repositório, além das condições mínimas que ainda precisam ser atendidas antes de qualquer piloto institucional.

## 1. Escopo

A política se aplica aos componentes do UniGuard presentes neste repositório:

- aplicativo Android em Kotlin;
- protótipo web e painel da Central;
- Firebase Authentication;
- Cloud Firestore;
- Firebase Storage;
- dados demonstrativos e documentação técnica;
- integrações futuras previstas para backend/API.

O modelo relacional MySQL incluído no projeto é uma referência para evolução futura e **não deve ser acessado diretamente pelo aplicativo cliente**.

## 2. Princípios adotados

O projeto adota como princípios:

- **menor privilégio:** cada perfil acessa somente o necessário;
- **isolamento institucional:** dados são particionados por `institutionId`;
- **identidade verificável:** a credencial só é considerada apta após verificação de e-mail e vínculo institucional ativo;
- **minimização de dados:** o sistema evita coleta desnecessária de informações pessoais;
- **auditabilidade:** eventos relevantes são registrados em trilha específica;
- **retenção limitada:** dados operacionais possuem prazos definidos;
- **defesa contra abuso:** o cliente aplica limites de criação de alertas;
- **evidência protegida:** arquivos enviados não podem ser sobrescritos pelo cliente;
- **segregação entre usuário e operador:** permissões são separadas por perfil e instituição.

## 3. Autenticação e autorização

### Implementado no projeto

- autenticação por **e-mail e senha** no Firebase Authentication;
- exigência de **e-mail verificado** para operação institucional;
- autorização separada da criação da credencial;
- vínculo institucional por `memberships/{uid}`;
- operadores cadastrados em `operators/{uid}`;
- uso de `active: true/false` para ativação ou suspensão de usuários e operadores;
- associação de usuários e operadores a uma `institutionId`;
- rejeição de autenticação anônima como identidade principal para alertas institucionais.

### Regra de segurança

Criar uma conta não concede automaticamente acesso institucional. O usuário precisa ter:

1. conta autenticada;
2. e-mail verificado;
3. vínculo institucional ativo;
4. `institutionId` compatível com o recurso acessado.

## 4. Isolamento entre instituições

As regras atuais utilizam `institutionId` para impedir que usuários ou operadores de uma instituição acessem dados de outra.

Devem permanecer segregados, entre outros:

- alertas;
- eventos de auditoria;
- evidências;
- operadores;
- vínculos institucionais.

Antes de um piloto, é obrigatório comprovar com contas de teste que não existe leitura, escrita, confirmação de recebimento ou acesso a evidências entre instituições diferentes.

## 5. Auditoria

A coleção `auditLogs` é tratada como **append-only no cliente**.

Eventos documentados atualmente:

- `alert_created`;
- `alert_received`;
- `alert_viewed`;
- `alert_status_changed`;
- `alert_cancelled_by_user`;
- `evidence_uploaded`.

Cada registro deve incluir, quando aplicável:

- `institutionId`;
- `alertId`;
- `actorUid`;
- tipo do ator;
- data/hora;
- `retentionExpiresAt`.

A edição ou exclusão direta de logs pelo cliente não é permitida.

## 6. Evidências e Firebase Storage

As evidências associadas aos alertas seguem regras específicas:

- upload somente quando autorizado;
- vínculo com o alerta correspondente;
- associação com a mesma instituição;
- **proibição de sobrescrita pelo cliente**;
- retenção prevista de 30 dias;
- exclusão remota dependente de política de ciclo de vida do bucket.

Uma versão real deve restringir o acesso às evidências apenas aos perfis autorizados e manter registro auditável das operações administrativas.

## 7. Retenção e eliminação

Prazos documentados no projeto:

| Tipo de dado | Prazo previsto | Mecanismo |
| --- | ---: | --- |
| Alertas no Firestore | 90 dias | `retentionExpiresAt` + TTL |
| Auditoria | 365 dias | `retentionExpiresAt` + TTL |
| Evidências no Storage | 30 dias | ciclo de vida do bucket |
| Cache de alertas encerrados no navegador | 7 dias | limpeza local |
| Fotos temporárias no Android | 7 dias | limpeza local |

### Observação importante

Os campos de expiração **não eliminam dados automaticamente por si só**. Antes de qualquer piloto, ainda precisam ser confirmadas no ambiente remoto:

- políticas TTL do Firestore;
- ciclo de vida do Firebase Storage;
- procedimentos administrativos para exclusão antecipada;
- tratamento de exceções legais e incidentes;
- migração ou isolamento de documentos legados sem `institutionId` ou `retentionExpiresAt`.

## 8. Dados médicos e minimização

O UniGuard não deve funcionar como prontuário médico.

O projeto atual:

- não utiliza `medicalNotes` como campo permitido;
- não prevê armazenamento de diagnóstico, alergias, tipo sanguíneo ou histórico clínico;
- permite apenas a classificação operacional necessária ao atendimento, como categoria de ocorrência;
- orienta que descrições de alerta contenham somente o necessário para o contexto da ocorrência.

## 9. Controle contra abuso

O cliente atualmente aplica os seguintes limites:

- máximo de **1 alerta ativo por usuário**;
- máximo de **3 alertas em 30 minutos**;
- intervalo mínimo de **60 segundos** entre novos alertas.

Esses limites reduzem abuso acidental e repetição indevida, mas **não são uma fronteira de segurança suficiente contra clientes modificados**.

Antes de um ambiente produtivo, devem ser adicionados:

- Firebase App Check;
- criação de alertas por função/API confiável;
- rate limit por UID;
- rate limit por instituição;
- análise de IP/dispositivo quando juridicamente e tecnicamente aplicável;
- detecção de alertas duplicados ou padrões anômalos.

## 10. Segredos e configuração

- `google-services.json` não deve ser versionado;
- chaves privadas, credenciais administrativas e segredos não devem ser incluídos no GitHub;
- variáveis da aplicação web devem ser configuradas por ambiente;
- regras do Firebase devem ser publicadas a partir das versões oficiais presentes no repositório;
- credenciais de administração devem ser usadas somente em backend ou processos administrativos controlados.

## 11. Modo demonstrativo

O projeto pode operar em modo demonstrativo quando o Firebase não está configurado.

Nesse cenário:

- utilizar somente dados fictícios;
- não inserir dados pessoais reais;
- não representar o sistema como serviço institucional oficial;
- não utilizar o protótipo como canal real de emergência.

## 12. Controles já presentes x pendências antes de piloto

### Já presentes no repositório

- autenticação por e-mail/senha;
- verificação de e-mail;
- vínculo institucional;
- `institutionId`;
- segregação usuário/operador;
- auditoria append-only;
- política de retenção documentada;
- bloqueio de dados médicos;
- proteção contra sobrescrita de evidências;
- limites locais contra abuso;
- documentação de configuração Firebase;
- regras do Firestore e Storage versionadas.

### Ainda precisam de comprovação/configuração operacional

- ativação dos TTLs no ambiente remoto;
- política de ciclo de vida do Storage;
- Firebase App Check;
- rate limit em backend confiável;
- testes negativos de isolamento institucional;
- validação ponta a ponta Android → Firebase → Central;
- processo administrativo de exclusão e incidentes;
- revisão jurídica/LGPD;
- autorização institucional para piloto.

## 13. Relato de vulnerabilidades

Como este é um projeto acadêmico em desenvolvimento, vulnerabilidades ou falhas identificadas devem ser relatadas de forma responsável à responsável geral pelo projeto antes de qualquer divulgação pública detalhada.

Ao relatar um problema, inclua:

- componente afetado;
- comportamento observado;
- passos mínimos para reprodução;
- impacto potencial;
- evidências sem dados pessoais reais;
- sugestão de mitigação, se houver.

Não utilize dados reais, não explore contas de terceiros e não execute testes destrutivos.

## 14. Responsabilidade geral

**Priscilla Cahino** é a responsável geral pelo projeto UniGuard, incluindo sua idealização, concepção, estruturação funcional, requisitos, regras de negócio, documentação e evolução do protótipo.

---

Este documento deve evoluir junto com o projeto. Qualquer alteração relevante em autenticação, autorização, retenção, auditoria, evidências ou arquitetura deve ser refletida aqui.
