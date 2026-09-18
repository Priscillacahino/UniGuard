# Changelog — UniGuard

Todas as mudanças relevantes do projeto são registradas neste arquivo.

O formato segue, de maneira simplificada, a ideia do [Keep a Changelog](https://keepachangelog.com/), adaptada ao caráter acadêmico e evolutivo do UniGuard.

## [Não publicado]

### Adicionado

- matriz de riscos em `docs/MATRIZ_RISCOS.md`, com riscos técnicos, operacionais, de segurança, privacidade e governança;
- identificação de riscos bloqueadores para um futuro piloto institucional;
- requisitos formalizados em `docs/REQUISITOS.md`, com RF01–RF12, RNF01–RNF10 e RN01–RN12;
- matriz de rastreabilidade em `docs/MATRIZ_RASTREABILIDADE.md`, conectando requisitos, regras, código, regras Firebase e evidências;
- checklist de prontidão para piloto em `docs/CHECKLIST_PILOTO.md`, com itens bloqueadores e critérios mínimos;
- templates padronizados de issue para bug e melhoria;
- template de pull request com checklist de testes, requisitos, segurança e privacidade;
- `CODEOWNERS` com Priscilla Cahino como responsável geral pela revisão do projeto;
- Dependabot configurado para dependências npm, Gradle e GitHub Actions;
- reorganização dos artefatos de apresentação, dados e imagens dentro de `docs/`;
- documentação detalhada de arquitetura em `docs/ARQUITETURA.md`;
- plano operacional preparatório em `docs/PLANO_OPERACIONAL.md`;
- plano de contingência em `docs/PLANO_CONTINGENCIA.md`;
- runbook de incidentes em `docs/RUNBOOK_INCIDENTES.md`;
- pacote LGPD preparatório em `docs/PACOTE_LGPD_PREPARATORIO.md`;
- matriz RACI preparatória em `docs/MATRIZ_RACI.md`;
- matriz formal de testes em `docs/MATRIZ_TESTES.md`;
- auditoria de permissões Android em `docs/AUDITORIA_PERMISSOES_ANDROID.md`;
- configuração `vercel.json` com headers de segurança web;
- configuração de Firebase Emulator para Firestore e Storage;
- testes reais de regras em `tests/firestoreRules.emulator.mjs` e `tests/storageRules.emulator.mjs`;
- política de logs e mascaramento em `docs/POLITICA_LOGS_MASCARAMENTO.md`;
- utilitário `safeLogger` e testes de mascaramento;
- checklist formal de release em `docs/CHECKLIST_RELEASE.md`;
- App Check preparado para web e Android;
- backend confiável em `functions/` com rate limiting server-side;
- endpoint `health` para observabilidade;
- chave `trustedBackendRequired` para cutover seguro;
- auditor dry-run de dados legados;
- lifecycle de Storage preparado em `infra/storage-lifecycle.json`;
- documentação de retenção remota, App Check/backend, monitoramento, rollback e roadmap v0.9.
- matriz consolidada de prontidão em `docs/STATUS_DE_PRONTIDAO.md`, separando implementação, validação automatizada e dependências externas;
- auditoria estática de código e segurança em `docs/AUDITORIA_CODIGO_SEGURANCA_2026-09-18.md`;
- cenários negativos no Firebase Emulator para SVG, perfil malformado e campos inválidos de geolocalização;
- validação reutilizável de perfis no backend confiável, com testes unitários;

### Alterado

- README atualizado para refletir a nova organização do repositório, arquitetura, gestão de riscos, requisitos, rastreabilidade, prontidão para piloto, operação, contingência, privacidade e governança;
- checklist de piloto atualizado com controles preparatórios operacionais, de incidentes e LGPD;
- matriz de riscos atualizada com planos de contingência e preparação de privacidade;
- artefatos de apresentação movidos para `docs/apresentacao/`;
- bases demonstrativas movidas para `docs/dados/`;
- imagens principais movidas para `docs/imagens/`;
- metadados locais do Android Studio (`.idea/`) removidos do versionamento;
- permissão Android `VIBRATE` removida por ausência de uso no código atual;
- permissões Android documentadas sob princípio de menor privilégio;
- aplicação web endurecida com CSP, anti-framing, `nosniff`, Referrer-Policy e Permissions-Policy;
- CI ampliado com job dedicado às regras Firebase no Emulator;
- CI ampliado com testes do backend e build Android release;
- rodada CI #175 concluída com sucesso em Web, Backend, Firebase Emulator e Android debug/release;
- fluxo Android legado removido, mantendo somente `IntegratedSosActivity`;
- regras Firestore simplificadas para reduzir custo de avaliação em updates.
- regras do Storage restritas a evidências JPEG, PNG e WebP, com rejeição explícita de SVG;
- regras do Firestore reforçadas com tipos, limites de tamanho e allowlists para perfil e geolocalização;
- interface preparada para perfis minimizados do backend confiável, sem exibir valores indefinidos;
- painel, histórico e mapa preparados para alertas sem coordenadas quando o GPS estiver indisponível;
- upload Android passa a declarar explicitamente `image/jpeg` para evidências fotográficas;
- exportação CSV do histórico minimizada, sem nome, matrícula, telefone ou coordenadas exatas;
- CI endurecido com checkout sem persistência de credenciais e bloqueio de nomes comuns de arquivos sensíveis;
- `.gitignore` ampliado para chaves, keystores e credenciais administrativas comuns;
- dependências web padronizadas em npm com remoção do `bun.lock` redundante;
- documentação legada de integração anônima removida e documentação canônica atualizada para e-mail verificado, vínculo institucional e `institutionId`;
- documentação do modelo MySQL esclarecida como referência conceitual, sem substituir a arquitetura Firebase atual;
- README, SECURITY, matriz de riscos e checklist de piloto sincronizados com o estado atual dos controles;
- backend confiável passa a rejeitar perfis fora da allowlist funcional;
- Android passa a bloquear tráfego HTTP em texto claro;
- headers web reforçados com HSTS e `X-Permitted-Cross-Domain-Policies: none`;
- CI passa a validar também a sintaxe do módulo de entrada do backend;
- metadados de `auditLogs` passam a usar allowlist de campos, tipos e fontes, com cenário negativo no Firebase Emulator.

### Planejado

- validação ponta a ponta Android → Firebase → Central;
- validação E2E no ambiente Firebase real;
- ativação e comprovação dos TTLs no Firestore;
- aplicação do ciclo de vida do Firebase Storage;
- enforcement do Firebase App Check;
- deploy do backend confiável e cutover dos clientes;
- procedimentos administrativos de exclusão com execução via camada confiável;
- validação externa do plano operacional e de contingência;
- validação jurídica das bases legais, agentes de tratamento, aviso de privacidade e eventual RIPD;
- autorização institucional antes de qualquer piloto real.

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
