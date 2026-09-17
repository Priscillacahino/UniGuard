# Changelog — UniGuard

Todas as mudanças relevantes do projeto são registradas neste arquivo.

O formato segue, de maneira simplificada, a ideia do [Keep a Changelog](https://keepachangelog.com/), adaptada ao caráter acadêmico e evolutivo do UniGuard.

## [Não publicado]

### Adicionado

- matriz de riscos em `docs/MATRIZ_RISCOS.md`, com riscos técnicos, operacionais, de segurança, privacidade e governança;
- identificação de riscos bloqueadores para um futuro piloto institucional;
- templates padronizados de issue para bug e melhoria;
- template de pull request com checklist de testes, requisitos, segurança e privacidade;
- `CODEOWNERS` com Priscilla Cahino como responsável geral pela revisão do projeto;
- Dependabot configurado para dependências npm, Gradle e GitHub Actions;
- reorganização dos artefatos de apresentação, dados e imagens dentro de `docs/`;
- documentação detalhada de arquitetura em `docs/ARQUITETURA.md`.

### Alterado

- README atualizado para refletir a nova organização do repositório, arquitetura, gestão de riscos e governança;
- artefatos de apresentação movidos para `docs/apresentacao/`;
- bases demonstrativas movidas para `docs/dados/`;
- imagens principais movidas para `docs/imagens/`;
- metadados locais do Android Studio (`.idea/`) removidos do versionamento.

### Planejado

- validação ponta a ponta Android → Firebase → Central;
- testes negativos de isolamento entre instituições;
- ativação e comprovação dos TTLs no Firestore;
- configuração do ciclo de vida do Firebase Storage;
- Firebase App Check;
- rate limit em backend confiável;
- procedimentos administrativos de exclusão e incidentes;
- validação jurídica/LGPD e institucional antes de qualquer piloto real.

---

## [0.8.0] — 2026-09-17

### Adicionado

- apresentação profissional consolidada em PDF e PowerPoint;
- requisitos funcionais RF01–RF12;
- requisitos não funcionais RNF01–RNF10;
- regras de negócio RN01–RN12;
- página final de autoria e responsabilidade geral do projeto;
- documentação específica de controles de auditoria, retenção e abuso;
- guia atualizado de configuração Firebase;
- política formal de segurança em `SECURITY.md`;
- registro estruturado de evolução por meio deste `CHANGELOG.md`.

### Alterado

- apresentação profissional revisada para refletir o estado real do repositório;
- cadastro e autenticação passaram a ser apresentados com e-mail verificado e vínculo institucional ativo;
- documentação atualizada para refletir o isolamento por `institutionId`;
- status do projeto ajustado para **protótipo acadêmico avançado / MVP demonstrativo em desenvolvimento**, sem afirmar integração institucional concluída;
- roadmap atualizado para priorizar validação técnica, isolamento institucional, App Check, retenção remota e piloto institucional futuro.

### Segurança

- consolidação da autenticação por e-mail/senha;
- exigência de verificação de e-mail;
- autorização institucional por `memberships/{uid}`;
- controle de operadores por `operators/{uid}`;
- segregação entre instituições por `institutionId`;
- auditoria append-only para eventos relevantes;
- recebimento e mudança de status com trilha auditável;
- evidências protegidas contra sobrescrita pelo cliente;
- definição de retenção para alertas, auditoria, evidências e dados temporários;
- bloqueio de `medicalNotes` e remoção de dados médicos desnecessários;
- controle local contra abuso de alertas;
- documentação das limitações dos controles locais e da necessidade futura de App Check e rate limiting confiável.

### Documentação

- PDF profissional alinhado ao conteúdo atual do repositório;
- PowerPoint profissional alinhado ao PDF;
- inclusão de Priscilla Cahino como responsável geral pelo projeto;
- reforço da natureza acadêmica e demonstrativa do UniGuard;
- documentação de pendências reais antes de um piloto institucional.

---

## [0.7.0] — 2026-09

### Adicionado

- suporte a `institutionId` para segmentação institucional;
- estrutura de `memberships` para autorização de usuários;
- estrutura de `operators` para operadores da Central;
- eventos de auditoria associados a alertas e ações da Central;
- políticas de retenção por `retentionExpiresAt`;
- proteção de evidências no Firebase Storage;
- controles locais contra abuso e repetição de alertas.

### Alterado

- autenticação anônima deixou de ser tratada como identidade válida para alertas institucionais;
- fluxo de acesso passou a exigir e-mail verificado e vínculo institucional;
- documentação Firebase passou a diferenciar criação de credencial e autorização institucional;
- dados médicos desnecessários foram removidos da modelagem funcional do projeto.

### Segurança

- máximo de 1 alerta ativo por usuário;
- máximo de 3 alertas em 30 minutos;
- intervalo mínimo de 60 segundos entre alertas;
- auditoria de criação, recebimento, visualização, mudança de status, cancelamento e upload de evidência;
- separação de dados entre instituições;
- evidências sem permissão de sobrescrita pelo cliente.

---

## [0.6.0] — 2026-09

### Adicionado

- integração progressiva com Firebase Authentication, Firestore e Storage;
- configuração de ambiente para aplicativo Android e protótipo web;
- documentação para operador da Central;
- modo demonstrativo sem dependência obrigatória do Firebase;
- confirmação de recebimento e acompanhamento de status de alertas;
- estrutura de CI para validação do projeto.

### Alterado

- pacote Android consolidado como `com.priscillacahino.uniguard`;
- documentação técnica atualizada para refletir integração entre Android e web;
- regras do Firebase revisadas e endurecidas progressivamente.

---

## [0.5.0] — 2026-09

### Adicionado

- aplicativo Android em Kotlin;
- tela de SOS;
- permissões para localização, câmera, internet, SMS e vibração;
- Google Play Services Location;
- Google Maps;
- protótipo web hospedado na Vercel;
- painel demonstrativo da Central;
- modelo relacional MySQL para estudo e evolução futura;
- base de dados simulada para análises em Excel/CSV;
- prévia de indicadores demonstrativos;
- protótipo visual no Figma.

### Documentação

- README ampliado;
- fluxogramas;
- imagens do protótipo;
- documentação de banco de dados;
- apresentação profissional inicial.

---

## Observações de versionamento

As versões acima representam **marcos de evolução acadêmica do projeto** e não releases de produção.

O UniGuard permanece em desenvolvimento e não deve ser interpretado como serviço de emergência disponível para uso real.

Sempre que houver uma mudança relevante em arquitetura, segurança, requisitos, regras de negócio, autenticação, armazenamento ou experiência do usuário, este arquivo deve ser atualizado.
