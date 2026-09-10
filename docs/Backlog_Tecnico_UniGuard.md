# Backlog Técnico Consolidado — UniGuard

**Responsável pelo projeto:** Priscilla Cahino  
**Data da consolidação:** 10 de setembro de 2026  
**Estágio declarado:** protótipo acadêmico avançado / MVP demonstrativo em desenvolvimento

## 1. Critério de classificação

Este backlog distingue quatro situações para evitar confundir material criado com funcionalidade implantada:

- **Produzido:** código, documento, protótipo ou base de dados já criado.
- **Publicado:** item incluído no repositório ou em ambiente acessível.
- **Integrado e testado:** funcionamento comprovado no fluxo completo.
- **Planejado:** requisito ainda sem implementação comprovada.

Um item só recebe o status **Concluído** quando a entrega necessária para o estágio demonstrativo está produzida e pode ser verificada. Recursos que dependem de Firebase, backend ou instituição permanecem **Parcialmente concluídos** até o teste ponta a ponta.

## 2. Resumo executivo

| Classificação | Quantidade | Leitura correta |
|---|---:|---|
| Concluído no estágio demonstrativo | 15 | Entregas produzidas que já sustentam a demonstração do conceito |
| Parcialmente concluído | 14 | Há código, estrutura ou protótipo, mas falta integração ou comprovação completa |
| Pendente prioritário | 13 | Necessário para transformar a demonstração em MVP validado |
| Futuro / fora do MVP atual | 8 | Não deve bloquear a apresentação inicial |

## 3. Concluído no estágio demonstrativo

| ID | Entrega | Evidência disponível | Publicação |
|---|---|---|---|
| C01 | Definição do problema, proposta e público do UniGuard | Documentação e apresentação | Produzida |
| C02 | Cenário demonstrativo baseado em campus universitário | README e protótipos | Produzido |
| C03 | Identidade visual e arquitetura inicial da experiência | Mockups e interfaces | Produzida |
| C04 | Protótipo web em React 19, TypeScript, Vite e Tailwind | Código do protótipo | Declarado no projeto |
| C05 | Alternância entre visão do aplicativo e Painel de Segurança | Protótipo web | Produzida |
| C06 | Seleção demonstrativa de campus e identificação do usuário | Protótipo web | Produzida |
| C07 | Interface do botão SOS e seleção da categoria da emergência | Web, Android e mockups | Produzida |
| C08 | Geolocalização pelo navegador e exibição da última localização | Protótipo web | Produzida em modo demonstrativo |
| C09 | Captura de imagem mediante permissão | Protótipo web | Produzida em modo demonstrativo |
| C10 | Histórico e status demonstrativo de alertas | Protótipo web | Produzido com dados locais |
| C11 | Mapa Leaflet, pontos seguros e alertas simulados | Protótipo web | Produzido |
| C12 | Modelo de banco MySQL | SQL com tabelas, relacionamentos, views e dados fictícios | Produzido |
| C13 | Base demonstrativa de indicadores | Planilha/CSV com 240 alertas fictícios | Produzida |
| C14 | Apresentação profissional atualizada | Arquivo de apresentação | Produzida |
| C15 | README completo e documentação inicial | README atualizado | Produzido; envio ao repositório precisa ser confirmado |

## 4. Parcialmente concluído

| ID | Entrega | O que já existe | O que falta para concluir | Prioridade |
|---|---|---|---|---|
| PC01 | Aplicativo Android em Kotlin | Estrutura Android, `minSdk 24`, `targetSdk 35`, Java 17/Kotlin | Compilação e teste integral na versão consolidada | Alta |
| PC02 | Configuração Firebase no Android | Dependências e código preparados | Incluir `app/google-services.json` e validar o projeto correto | Crítica |
| PC03 | Configuração Firebase na aplicação web | Código espera variáveis `VITE_FIREBASE_*` | Configurar ambiente e confirmar leitura/escrita | Crítica |
| PC04 | Fluxo Android de emergência | Código declarado para SOS → localização → SMS → foto → Firestore | Executar e registrar teste real ponta a ponta | Crítica |
| PC05 | Coleção de alertas no Firestore | Estrutura `emergencyAlerts` prevista | Confirmar regras, gravação e persistência | Crítica |
| PC06 | Atualização operacional do alerta | Estados `em_deslocamento`, `no_local` e `resolvido` previstos | Confirmar sincronização painel → Android | Crítica |
| PC07 | Painel da Segurança | Central demonstrativa com mapa, alertas e status | Autenticação, perfis, dados reais e rotina institucional | Alta |
| PC08 | Cadastro e autenticação | Telas e fluxo demonstrativo | Autenticação segura, recuperação e gestão de sessão | Alta |
| PC09 | Registro de localização | Localização atual e última localização demonstrativas | Política de frequência, precisão, retenção e teste em campo | Alta |
| PC10 | Evidências da ocorrência | Captura de imagem prevista/produzida em demonstração | Armazenamento seguro, permissão, acesso e descarte | Alta |
| PC11 | Banco MySQL operacional | Schema, views e dados fictícios | Criar API/backend; o aplicativo não deve acessar MySQL diretamente | Média |
| PC12 | Regras de segurança do Firestore | Arquivo `firestore.rules` foi preparado | Aplicar, revisar e testar permissões | Crítica |
| PC13 | Documentação de integração | `INTEGRACAO_FINAL.md` e `CHECKLIST.md` foram preparados | Publicar, executar e registrar resultados | Alta |
| PC14 | Hospedagem web | Hospedagem Vercel declarada | Confirmar projeto, domínio, variáveis e versão publicada | Alta |

## 5. Pendente prioritário para o MVP validado

| Ordem | ID | Pendência | Critério de aceite |
|---:|---|---|---|
| 1 | P01 | Consolidar todos os arquivos na versão principal | GitHub contém código, README, regras, documentação e artefatos corretos |
| 2 | P02 | Configurar um único projeto Firebase para Android e web | Ambos acessam o mesmo ambiente sem credenciais expostas |
| 3 | P03 | Aplicar e testar regras de acesso | Usuário comum não acessa dados de terceiros; agente acessa apenas o necessário |
| 4 | P04 | Executar o fluxo ponta a ponta | SOS criado no Android aparece no painel e recebe atualização de status |
| 5 | P05 | Criar casos de teste formais | Casos positivos, negativos, permissões negadas, falta de rede e localização indisponível documentados |
| 6 | P06 | Registrar evidências dos testes | Capturas, horários, resultados esperados/obtidos e falhas conhecidas |
| 7 | P07 | Desenhar o fluxo operacional completo | Fluxo define abertura, triagem, aceite, deslocamento, chegada, resolução e encerramento |
| 8 | P08 | Especificar integralmente o painel da segurança | Perfis, filtros, mapa, fila, detalhe, evidências, histórico, auditoria e relatórios definidos |
| 9 | P09 | Criar matriz de riscos e requisitos da LGPD | Dados, finalidade, base legal, acesso, retenção, descarte, incidentes e responsáveis mapeados |
| 10 | P10 | Definir controles de auditoria | Ações relevantes registram usuário, data, alteração e justificativa |
| 11 | P11 | Realizar simulação controlada | Cenários fictícios percorrem o fluxo e alimentam indicadores verificáveis |
| 12 | P12 | Validar com potenciais usuários | Questionário com estudantes/servidores e registro das conclusões |
| 13 | P13 | Preparar piloto institucional | Escopo, responsabilidades, limites e autorização formal definidos |

## 6. Futuro ou fora do MVP atual

| ID | Item | Motivo para não bloquear o MVP |
|---|---|---|
| F01 | Integração oficial com UFPB ou outra instituição | Depende de autorização e parceria |
| F02 | Integração direta com Polícia, SAMU ou outros órgãos | Exige acordos, protocolos e validação jurídica |
| F03 | Monitoramento contínuo de todos os usuários | Eleva riscos técnicos, jurídicos e de privacidade |
| F04 | Inteligência artificial para previsão de ocorrências | Depende de base real, qualidade de dados e governança |
| F05 | Operação simultânea em diversas instituições | Deve vir após piloto validado |
| F06 | Publicação nas lojas de aplicativos | Deve ocorrer após estabilidade, políticas e testes |
| F07 | Pagamento e licenciamento automatizados | Não é necessário para comprovar o produto inicial |
| F08 | Uso de dados reais de ocorrências | Depende de autorização, anonimização e governança |

## 7. Próximo ciclo recomendado

### Marco 1 — Consolidação técnica

- Reunir os arquivos produzidos nas conversas.
- Atualizar a versão principal do projeto.
- Configurar Firebase no Android e na aplicação web.
- Aplicar as regras de segurança.

### Marco 2 — Validação funcional

- Executar casos de teste.
- Comprovar SOS → painel → atualização → encerramento.
- Registrar limitações conhecidas e resultados.

### Marco 3 — Segurança, operação e LGPD

- Criar matriz de riscos e requisitos da LGPD.
- Finalizar o fluxo operacional.
- Especificar o painel institucional e a trilha de auditoria.

### Marco 4 — Apresentação e valorização

- Atualizar README e documentação técnica com evidências.
- Consolidar dossiê de autoria e evolução.
- Finalizar pitch comercial e modelos de preço.
- Reavaliar o valor do UniGuard como MVP validado.

## 8. Indicadores demonstrativos já disponíveis

Os números abaixo são fictícios e devem ser identificados como simulação:

| Indicador | Valor demonstrativo |
|---|---:|
| Alertas registrados | 240 |
| Alertas pendentes | 39 |
| Alertas resolvidos | 102 |
| Tempo médio de atendimento | 10,5 minutos |

Esses dados comprovam a existência da base analítica, mas não representam desempenho real do UniGuard nem dados da UFPB.

## 9. Conclusão do diagnóstico

O UniGuard não está apenas na fase de ideia. Já possui identidade, documentação, protótipos, código web, estrutura Android, modelo de dados, painel demonstrativo e base analítica. A principal lacuna atual é a **comprovação integrada do fluxo completo**.

Até que Firebase, aplicativo e painel sejam configurados e testados conjuntamente, a apresentação correta é:

> **Protótipo acadêmico avançado e MVP demonstrativo em desenvolvimento, com arquitetura e componentes preparados para integração e validação.**

O projeto não deve ser divulgado como serviço de emergência ativo nem como solução oficialmente adotada por qualquer instituição.
