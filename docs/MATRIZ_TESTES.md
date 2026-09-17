# Matriz de Testes — UniGuard

> Plano de testes do protótipo acadêmico. Os casos marcados como planejados ainda exigem execução e evidência antes de qualquer piloto.

## Legenda
- **Automatizado**: coberto atualmente por teste/CI;
- **Manual**: requer execução controlada;
- **Emulator**: recomendado com Firebase Emulator;
- **E2E**: exige fluxo integrado Android → Firebase → Central.

## 1. Identidade e autorização
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T01 | login com credenciais válidas | E2E | autenticação concluída | planejado |
| T02 | e-mail não verificado | Emulator/E2E | acesso institucional negado | coberto no Emulator; E2E pendente |
| T03 | usuário sem membership | Emulator/E2E | acesso institucional negado | coberto no Emulator; E2E pendente |
| T04 | membership inativo | Emulator/E2E | acesso institucional negado | coberto no Emulator; E2E pendente |
| T05 | operador inativo | Emulator/E2E | acesso da Central negado | coberto no Emulator; E2E pendente |

## 2. Isolamento institucional
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T06 | usuário A lê alerta de B | Emulator | negado | coberto |
| T07 | usuário A altera alerta de B | Emulator | negado | coberto |
| T08 | operador A lê alerta de B | Emulator | negado | coberto |
| T09 | operador A altera alerta de B | Emulator | negado | coberto |
| T10 | evidência de B acessada por A | Emulator | negado | coberto |

## 3. SOS e abuso
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T11 | segundo alerta com um ativo | Automatizado | bloqueado | coberto |
| T12 | 4º alerta em 30 min | Automatizado | bloqueado | coberto |
| T13 | alerta dentro de 60 s | Automatizado | bloqueado | coberto |
| T14 | limites independentes por usuário | Automatizado | comportamento isolado | coberto |
| T15 | rajada via cliente adulterado | E2E/backend | bloqueada por camada confiável | rate limiter backend testado; deploy/E2E pendente |

## 4. Localização, câmera e SMS
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T16 | localização permitida | Manual/E2E | coordenadas válidas | planejado |
| T17 | localização negada | Manual | alerta sem falsa coordenada | planejado |
| T18 | localização indisponível | Manual | degradação clara | planejado |
| T19 | câmera permitida | Manual/E2E | evidência opcional anexada | planejado |
| T20 | câmera negada | Manual | SOS continua sem foto | planejado |
| T21 | SMS permitido | Manual | mensagem enviada ao contato configurado | planejado |
| T22 | SMS negado | Manual | falha clara, sem falsa confirmação | planejado |

## 5. Firestore e Storage
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T23 | exclusão de alerta pelo cliente | Invariante/Emulator | negada | coberto no Emulator |
| T24 | sobrescrever evidência | Invariante/Emulator | negada | coberto no Emulator |
| T25 | upload > 5 MB | Invariante/Emulator | negado | coberto no Emulator |
| T26 | upload não-imagem | Invariante/Emulator | negado | coberto no Emulator |
| T27 | inserir medicalNotes | Invariante/Emulator | negado | coberto no Emulator |
| T28 | auditoria alterada/apagada | Emulator | negado | coberto |

## 6. Retenção
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T29 | alerta local encerrado > 7 dias | Automatizado | removido do cache | coberto |
| T30 | alerta ativo antigo | Automatizado | preservado | coberto |
| T31 | TTL emergencyAlerts | Firebase real | exclusão após política | pendente configuração |
| T32 | TTL auditLogs | Firebase real | exclusão após política | pendente configuração |
| T33 | lifecycle de evidências | Firebase real | exclusão conforme prazo | pendente configuração |

## 7. Contingência
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T34 | sem internet | Manual | sem confirmação falsa | planejado |
| T35 | Firebase indisponível | Manual/E2E | degradação clara | planejado |
| T36 | painel indisponível | Manual | contingência acionada | planejado |
| T37 | falha de deploy | Operacional | rollback documentado | planejado |

## 8. Web e CI
| ID | Cenário | Tipo | Resultado esperado | Status |
|---|---|---|---|---|
| T38 | testes web | CI | sucesso | coberto |
| T39 | TypeScript | CI | sem erro | coberto |
| T40 | auditoria crítica npm | CI | sem vulnerabilidade crítica conhecida | coberto |
| T41 | build web | CI | sucesso | coberto |
| T42 | testes Android | CI | sucesso | coberto |
| T43 | Android Lint | CI | sucesso | coberto |
| T44 | build APK debug | CI | sucesso | coberto |
| T45 | build APK release | CI | sucesso | integrado ao CI; validar rodada atual |
| T46 | backend rate limiting | CI | política aprovada | integrado ao CI; validar rodada atual |
| T47 | cutover trustedBackendRequired | Emulator | escrita direta bloqueada | coberto |

## 9. Critério de evidência
Cada execução futura deve registrar: versão/commit, ambiente, data, executor, resultado, evidência e defeito associado quando houver.

## 10. Prioridade
Antes de piloto, executar primeiro T02–T10, T16–T28 e T31–T36.