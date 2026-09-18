# Release acadêmica v0.9.0 — UniGuard

Data de fechamento técnico: **18/09/2026**

## Escopo desta versão

A v0.9.0 consolida o maior nível de preparação que pode ser obtido apenas com código, documentação e automação do repositório, sem depender de teste de campo, autorização institucional ou validação jurídica externa.

### Incluído

- configuração institucional do Android externalizada para propriedades de build;
- validação estrita de entradas do backend confiável;
- remoção de dependências Android sem uso atual;
- modo DEMO protegido por flag explícita de ambiente;
- validação centralizada da configuração Firebase e flags web;
- melhorias estáticas de acessibilidade nos principais modais;
- Error Boundary para falhas inesperadas da aplicação web;
- evidências sem metadados personalizados e com regras restritivas no Storage;
- limpeza de código e comentários legados;
- alinhamento de versão entre web, Android, backend e documentação;
- dados públicos de contexto UFPB separados de dados operacionais do UniGuard;
- hardening de Firestore, Storage, auditoria, CI, privacidade e governança.

## O que esta versão não declara

A v0.9.0 **não representa produção, piloto institucional aprovado nem serviço oficial da UFPB**.

Continuam fora do escopo de fechamento desta versão:

- E2E Android → Firebase/backend → Central em ambiente real;
- testes de rede, GPS, câmera, desempenho, acessibilidade assistiva e estabilidade em dispositivos;
- deploy/cutover definitivo do backend confiável;
- App Check com enforcement no projeto real;
- TTL do Firestore e lifecycle do Storage ativados/comprovados remotamente;
- validação jurídica/LGPD institucional;
- protocolo oficial de atendimento e operação;
- autorização para piloto.

## Critério para evolução

A próxima evolução relevante deixa de ser apenas documental ou estática. O avanço para v1.0 depende de evidências produzidas em ambiente real, ativação dos controles remotos e validações externas aplicáveis.

## Referências internas

- [Status de prontidão](STATUS_DE_PRONTIDAO.md)
- [Checklist de piloto](CHECKLIST_PILOTO.md)
- [Roadmap v0.9](ROADMAP_v0.9.md)
- [Auditoria de código e segurança](AUDITORIA_CODIGO_SEGURANCA_2026-09-18.md)
- [Modelo de ameaças](MODELO_DE_AMENCA_CONTROLES.md)
- [Changelog](../CHANGELOG.md)
