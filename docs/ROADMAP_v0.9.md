# Roadmap v0.9 — Validation & Security

Objetivo: levar o UniGuard ao máximo de prontidão técnica antes de depender de validação institucional/jurídica.

## Status do ciclo v0.9

**Fechado em 18/09/2026 para o escopo executável somente no repositório.** A versão `v0.9.0` consolida hardening de código, segurança, privacidade, configuração, acessibilidade estática, dados públicos e governança. Os itens remanescentes dependem de execução em ambiente real, testes controlados ou validação institucional/jurídica.

## Concluído no repositório
- Firebase Emulator para Firestore e Storage;
- testes negativos de segregação institucional;
- testes de usuário sem vínculo, e-mail não verificado e perfis inativos;
- proteção de evidência contra sobrescrita;
- auditoria append-only;
- headers de segurança web;
- minimização de permissões Android;
- App Check preparado no web e Android;
- backend confiável versionado para criação de SOS;
- rate limiting server-side com testes;
- chave de cutover `trustedBackendRequired`;
- auditor dry-run de dados legados;
- lifecycle de Storage preparado;
- documentação de TTL remoto;
- política de logs/mascaramento;
- plano operacional, contingência e incidentes;
- monitoramento/health check;
- rollback/recuperação;
- CI web, Android, Firebase e backend;
- build Android release validado pelo CI quando verde.

## Pronto para ativação, mas depende de credencial/projeto real
- deploy das Cloud Functions;
- registro/enforcement do Firebase App Check;
- ativação de TTL Firestore;
- aplicação do lifecycle do Storage;
- execução do auditor de dados legados no Firebase real;
- definição `trustedBackendRequired=true` após cutover dos clientes;
- configuração de alertas/monitoramento no ambiente real.

## Requer execução controlada
- E2E Android → backend/Firebase → Central → encerramento;
- perda de rede/Firebase;
- GPS e câmera negados;
- carga/desempenho;
- acessibilidade;
- recuperação/rollback ensaiado.

## Requer terceiros
- autorização institucional;
- responsáveis operacionais;
- protocolo oficial de resposta;
- validação jurídica/LGPD e papéis dos agentes;
- eventual RIPD formal;
- definição de SLA/SLO institucional.

## Critério para v1.0
A versão 1.0 só deve ser considerada após ativação dos controles remotos, E2E documentado, piloto controlado e validação institucional/jurídica.