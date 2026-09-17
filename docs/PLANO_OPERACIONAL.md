# Plano Operacional — UniGuard

> Documento preparatório do protótipo acadêmico UniGuard. Define uma proposta de operação para eventual piloto futuro. Não representa aprovação institucional, SLA oficial ou autorização de uso real.

## 1. Objetivo
Estabelecer como o UniGuard poderia ser operado de forma controlada, auditável e previsível durante um eventual piloto institucional.

## 2. Escopo operacional
O fluxo operacional cobre:
1. autenticação do usuário;
2. validação de vínculo institucional;
3. acionamento do SOS;
4. recepção do alerta pela Central;
5. triagem;
6. atualização de status;
7. registro de auditoria;
8. encerramento;
9. retenção e tratamento posterior do registro.

## 3. Papéis propostos
### Responsável geral do projeto
- Priscilla Cahino;
- mantém documentação, requisitos, riscos, governança e evolução do protótipo.

### Administrador técnico — papel futuro
- configura ambiente;
- gerencia credenciais e integrações;
- acompanha disponibilidade e incidentes técnicos;
- não deve acessar dados operacionais sem necessidade.

### Operador da Central — papel futuro
- visualiza somente alertas da própria instituição;
- confirma recebimento;
- atualiza status;
- registra observações operacionais estritamente necessárias;
- não altera evidências nem dados de auditoria.

### Usuário
- utiliza credencial própria;
- aciona SOS quando necessário;
- autoriza permissões requeridas;
- pode cancelar alerta próprio enquanto aplicável.

## 4. Estados operacionais do alerta
- pendente;
- em_deslocamento;
- no_local;
- resolvido;
- cancelado_usuario.

Toda transição deve ser compatível com as regras versionadas e gerar auditoria quando aplicável.

## 5. Protocolo proposto de atendimento
1. alerta chega à Central;
2. operador verifica instituição, categoria, horário e localização disponível;
3. Central confirma recebimento;
4. operador classifica a necessidade de resposta conforme protocolo institucional futuro;
5. atendimento é acompanhado até conclusão;
6. encerramento registra status final e horário;
7. evento permanece sujeito à política de retenção.

## 6. Níveis de prioridade propostos
| Nível | Uso proposto | Exemplo |
|---|---|---|
| P1 | risco imediato à integridade | violência, ameaça, acidente grave |
| P2 | situação urgente com possibilidade de agravamento | perseguição, queda, área de risco |
| P3 | ocorrência operacional sem risco imediato | apoio preventivo ou situação já estabilizada |

A classificação final deverá ser validada pela instituição responsável por eventual piloto.

## 7. Início de operação
- confirmar acesso da Central;
- confirmar conectividade;
- confirmar autenticação;
- confirmar leitura do ambiente Firebase de teste;
- confirmar que apenas dados fictícios serão utilizados;
- registrar versão do sistema;
- confirmar canal alternativo para contingência.

## 8. Encerramento de operação
- revisar alertas ainda abertos;
- confirmar encerramentos;
- registrar incidentes ocorridos;
- revisar falhas ou degradações;
- registrar evidências técnicas necessárias;
- evitar exportações locais desnecessárias.

## 9. Monitoramento mínimo proposto
- disponibilidade do painel web;
- falhas de autenticação;
- falhas de leitura/escrita no Firebase;
- falhas de upload de evidência;
- erros de localização;
- volume anormal de alertas;
- eventos de auditoria ausentes;
- erros de build/deploy.

## 10. Critérios de escalonamento
Escalonamento deve ocorrer quando houver:
- indisponibilidade prolongada;
- suspeita de acesso indevido;
- exposição de dados;
- falha de segregação institucional;
- perda de auditoria;
- comportamento anormal de alertas;
- falha repetida em fluxo crítico.

## 11. Restrições
- o UniGuard não substitui canais oficiais de emergência;
- o modo demonstrativo local não deve ser tratado como fallback operacional real;
- dados pessoais reais não devem ser usados em testes públicos;
- nenhum piloto deve ocorrer sem autorização institucional e validação jurídica aplicável.

## 12. Evidências operacionais desejadas
- versão testada;
- data/hora;
- cenário;
- resultado;
- falhas;
- responsável pelo teste;
- artefatos/logs relacionados;
- decisão de correção ou aceite.

## 13. Documentos relacionados
- [PLANO_CONTINGENCIA.md](PLANO_CONTINGENCIA.md)
- [RUNBOOK_INCIDENTES.md](RUNBOOK_INCIDENTES.md)
- [PACOTE_LGPD_PREPARATORIO.md](PACOTE_LGPD_PREPARATORIO.md)
- [CHECKLIST_PILOTO.md](CHECKLIST_PILOTO.md)
- [MATRIZ_RISCOS.md](MATRIZ_RISCOS.md)