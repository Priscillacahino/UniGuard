# Status de Prontidão — UniGuard

> Documento-resumo do estado atual do **protótipo acadêmico UniGuard**. Ele diferencia implementação no repositório, validação automatizada, dependências de ambiente real e validações institucionais. Não representa autorização para uso como serviço real de emergência.

## Legenda

- **Implementado** — existe no código, configuração ou documentação versionada.
- **Validado automaticamente** — há teste/CI cobrindo o controle no ambiente de desenvolvimento ou Emulator.
- **Pendente em ambiente real** — exige Firebase/Vercel/dispositivo/infraestrutura real para comprovação.
- **Pendente institucional** — exige decisão, validação ou responsabilidade externa ao repositório.

## Matriz de prontidão

| Área | Estado atual | Evidência principal | O que falta |
| --- | --- | --- | --- |
| Autenticação por e-mail/senha | Implementado | `src/services/firebase.ts` | validação E2E no ambiente real |
| E-mail verificado | Implementado e coberto no Emulator | `firestore.rules`, testes Firebase | validar fluxo real de cadastro/recuperação |
| Vínculo institucional | Implementado e coberto no Emulator | `memberships/{uid}`, regras e testes | processo institucional de concessão/revogação |
| Operadores da Central | Implementado e coberto no Emulator | `operators/{uid}` | definição formal de operadores |
| Isolamento por `institutionId` | Implementado e coberto no Emulator | regras Firestore/Storage | validação E2E no projeto real |
| SOS web | Implementado | componentes e `alertRepository.ts` | teste ponta a ponta real |
| SOS Android | Implementado em protótipo | app Android | teste ponta a ponta real |
| Backend confiável | Implementado no repositório | `functions/` | deploy e cutover no Firebase real |
| Validação de entrada do backend | Implementada e coberta por teste unitário | `functions/inputValidation.js` | manter allowlists alinhadas ao domínio |
| Rate limiting server-side | Implementado e testado localmente | `functions/rateLimiter.js` e testes | validar após deploy |
| App Check | Preparado | web, Android e backend | registrar apps e ativar enforcement |
| Auditoria | Implementada no modelo/regras | `auditLogs` | comprovar eventos no fluxo E2E |
| Metadados de auditoria | Restringidos e cobertos no Emulator | `firestore.rules`, testes Firebase | atualizar allowlist apenas quando novos eventos exigirem |
| Evidências fotográficas | Implementadas com controle de acesso | `storage.rules` | validar fluxo real e lifecycle |
| Tipos de evidência | Restringidos | JPEG, PNG e WebP permitidos; outros bloqueados | acompanhar compatibilidade de dispositivos |
| Retenção Firestore | Modelada | `retentionExpiresAt` | ativar e comprovar TTL remoto |
| Retenção Storage | Preparada | `infra/storage-lifecycle.json` | aplicar lifecycle no bucket real |
| Minimização de dados | Implementada parcialmente | bloqueio de `medicalNotes`, documentação LGPD | revisão formal antes de piloto |
| Logs seguros | Implementados no web | `safeLogger.ts` e testes | ampliar uso conforme novos módulos |
| Contingência sem GPS | Tratada na interface | painel, histórico e mapa aceitam coordenadas ausentes | validar em dispositivo/rede real |
| Exportação de histórico | Minimizada | CSV sem nome, matrícula, telefone ou coordenadas exatas | revisar se novos campos forem adicionados |
| Headers web | Implementados | `vercel.json` | validar continuamente após mudanças de hospedagem |
| Bloqueio de cleartext no Android | Implementado | `AndroidManifest.xml` | manter em futuras integrações de rede |
| CI web | Implementado | testes, TypeScript, audit e build | manter verde |
| CI Android | Implementado | testes, lint, debug/release | manter verde |
| CI Firebase | Implementado | Firestore/Storage Emulator | manter cenários atualizados |
| Proteção contra arquivos sensíveis | Implementada no CI | verificação de arquivos rastreados | habilitar recursos nativos do GitHub quando disponíveis |
| Dados públicos de contexto | Implementados | `docs/DADOS_EVIDENCIAS_UFPB.md` e CSV | atualizar quando houver nova fonte confiável |
| Operação real de emergência | Não autorizada | avisos no README e documentação | protocolo institucional e validações externas |
| LGPD/jurídico institucional | Preparatório | pacote LGPD e matriz RACI | validação jurídica/DPO/instituição |
| Piloto institucional | Não pronto | `CHECKLIST_PILOTO.md` | concluir todos os bloqueadores |

## Controles que não devem ser interpretados como validados em produção

Os itens abaixo podem estar implementados no código sem estarem comprovados em operação real:

1. entrega do alerta Android → Firebase → Central;
2. latência e disponibilidade sob rede móvel real;
3. precisão de localização em diferentes áreas do campus;
4. revogação de acesso durante sessão ativa;
5. TTL do Firestore e lifecycle do Storage;
6. App Check com enforcement;
7. backend confiável após deploy e cutover;
8. capacidade operacional da Central;
9. resposta institucional ao SOS;
10. conformidade jurídica/LGPD para uma operação concreta.

## Critério de leitura do projeto

O UniGuard deve ser apresentado como **protótipo acadêmico avançado / MVP demonstrativo com controles técnicos versionados**, e não como sistema de emergência pronto para produção.

Um item só deve ser promovido de **pendente** para **validado** quando houver evidência correspondente: teste automatizado, execução em ambiente real, registro de CI ou validação formal aplicável.

## Documentos relacionados

- [Checklist de piloto](CHECKLIST_PILOTO.md)
- [Matriz de riscos](MATRIZ_RISCOS.md)
- [Modelo de ameaças](MODELO_DE_AMENCA_CONTROLES.md)
- [Matriz de testes](MATRIZ_TESTES.md)
- [Pacote LGPD preparatório](PACOTE_LGPD_PREPARATORIO.md)
- [Security](../SECURITY.md)
