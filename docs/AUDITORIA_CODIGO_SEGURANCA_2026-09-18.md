# Auditoria de Código e Segurança — 18/09/2026

> Revisão estática do repositório UniGuard voltada a melhorias que não dependem de teste de campo, validação institucional ou operação real.

## Escopo revisado

- regras Firestore e Storage;
- autenticação/autorização web;
- backend confiável em Cloud Functions;
- CI;
- `.gitignore` e arquivos de configuração;
- documentação de integração;
- documentação de segurança, riscos e prontidão;
- organização de artefatos legados.

## Achados corrigidos nesta rodada

| Achado | Risco | Correção aplicada | Estado |
| --- | --- | --- | --- |
| Storage aceitava qualquer `image/*` | possibilidade de conteúdo ativo como SVG | allowlist JPEG/PNG/WebP | corrigido |
| Não havia teste explícito para SVG | regressão futura poderia passar despercebida | cenário negativo no Storage Emulator | corrigido |
| Perfil embutido no alerta tinha validação estrutural incompleta | campos malformados ou excessivos | tipos, limites e campos obrigatórios nas regras | corrigido |
| Testes não cobriam perfil malformado | regressão das validações | novos cenários negativos no Firestore Emulator | corrigido |
| Checkout do CI persistia credencial padrão | superfície desnecessária no runner | `persist-credentials: false` | corrigido |
| CI não verificava nomes comuns de arquivos sensíveis | commit acidental de chave/credencial | verificação automática no job web | corrigido |
| `.gitignore` não cobria vários formatos de chaves | risco de versionamento acidental | JKS/keystore/PEM/P12/PFX e JSON administrativos bloqueados | corrigido |
| Havia `bun.lock` e `package-lock.json` | divergência de gerenciador/lockfile | padronização em npm | corrigido |
| Documentação legada ainda citava Anonymous Auth | contradição com autenticação atual | documento substituído e cópia legada removida | corrigido |
| README ainda citava dados demonstrativos Excel/CSV | informação obsoleta | descrição atualizada para base pública CSV/SVG | corrigido |
| Segurança e checklist estavam desatualizados | percepção incorreta de maturidade | documentos sincronizados | corrigido |
| Não havia matriz consolidada de prontidão | dificuldade de separar implementado de validado | `STATUS_DE_PRONTIDAO.md` | corrigido |
| Modelo de ameaças era muito resumido | cobertura insuficiente de riscos residuais | matriz de ameaças ampliada | corrigido |
| Coordenadas aceitavam campos arbitrários | payload malformado ou excessivo | allowlist e limites para `lat/lng/accuracy/altitude/heading/speed` | corrigido |
| Painel assumia que o perfil do alerta sempre continha PII completa | incompatibilidade com backend minimizado | tipo `AlertUserProfile` e estados `Não informado` | corrigido |
| Telas/mapa assumiam GPS sempre disponível | risco de erro justamente em contingência | tratamento explícito de coordenadas ausentes | corrigido |
| Android não fixava MIME da evidência | incompatibilidade potencial com allowlist do Storage | upload Android define `image/jpeg` | corrigido |
| Exportação CSV continha nome, matrícula e coordenadas exatas | exposição desnecessária em arquivo exportado | exportação minimizada sem PII direta nem coordenadas exatas | corrigido |
| Modelo MySQL podia parecer equivalente à arquitetura atual | risco de uso conceitual inadequado | limites e requisitos de futura migração documentados | corrigido |
| Backend confiável aceitava `role` de perfil sem allowlist própria | cliente adulterado poderia gravar perfil fora do domínio esperado via Admin SDK | allowlist fechada + normalização + testes unitários | corrigido |
| Android não bloqueava explicitamente cleartext HTTP | risco de integração futura usar transporte sem TLS | `android:usesCleartextTraffic="false"` | corrigido |
| Headers web não incluíam HSTS | endurecimento HTTPS incompleto | HSTS por 2 anos + bloqueio de políticas cross-domain legadas | corrigido |
| CI não validava sintaxe do novo módulo de entrada do backend | regressão sintática poderia passar até execução do teste/import | `node --check inputValidation.js` adicionado | corrigido |
| `auditLogs.metadata` aceitava mapas arbitrários | dados excessivos/indevidos poderiam entrar na trilha append-only | allowlist de chaves, tipos e fontes + teste no Emulator | corrigido |

## Pontos revisados e mantidos

Os seguintes controles já estavam adequadamente estruturados e foram mantidos:

- e-mail verificado;
- membership/operator separado;
- segregação por `institutionId`;
- bloqueio de exclusão de alertas pelo cliente;
- auditoria append-only;
- backend confiável com App Check;
- rate limiting server-side;
- retenção modelada;
- proteção contra sobrescrita de evidência;
- minimização de dados médicos;
- headers de segurança web;
- testes Firebase Emulator;
- CI web/Android/backend.

## Itens que não podem ser encerrados somente por revisão estática

Permanecem pendentes porque exigem ambiente real, dispositivo, operação ou validação externa:

- E2E Android → Firebase → Central;
- deploy e cutover do backend confiável;
- enforcement do App Check;
- TTL Firestore;
- lifecycle do Storage;
- comportamento com perda de rede/GPS;
- testes de acessibilidade e desempenho em execução;
- validação jurídica/LGPD institucional;
- definição de operação e resposta ao SOS;
- autorização para piloto.

## Conclusão

A rodada reduziu inconsistências, superfícies de entrada e ambiguidades de documentação sem declarar como validado aquilo que ainda depende de ambiente real.

O status oficial deve ser lido em conjunto com:

- [STATUS_DE_PRONTIDAO.md](STATUS_DE_PRONTIDAO.md)
- [CHECKLIST_PILOTO.md](CHECKLIST_PILOTO.md)
- [MATRIZ_RISCOS.md](MATRIZ_RISCOS.md)
- [MODELO_DE_AMENCA_CONTROLES.md](MODELO_DE_AMENCA_CONTROLES.md)
- [SECURITY.md](../SECURITY.md)
