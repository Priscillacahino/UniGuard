# Plano de Monitoramento e Observabilidade — UniGuard

> Plano técnico preparatório para eventual ambiente real.

## Objetivo
Detectar indisponibilidade, falhas de segurança, regressões e comportamento anormal antes que comprometam o atendimento.

## Sinais mínimos
| Sinal | Fonte | Ação esperada |
|---|---|---|
| health backend indisponível | endpoint `health` | verificar Functions/Firebase |
| aumento de erros de autenticação | Auth/cliente | investigar configuração ou abuso |
| rejeições App Check | Firebase | validar clientes legítimos e ataques |
| bloqueios por rate limit | backend | identificar abuso/falha de UX |
| falhas de criação de SOS | backend/cliente | tratar como prioridade alta |
| falhas de evidência | Storage | revisar permissões e disponibilidade |
| ausência de audit log | Firestore | investigar imediatamente |
| falha de CI | GitHub Actions | impedir release |
| erro de build release | CI | impedir publicação |

## Health check
O backend possui endpoint `health` sem dados pessoais. Ele retorna apenas estado do serviço, versão técnica e timestamp.

## Logging
- usar dados mascarados;
- nunca registrar payload completo do alerta;
- nunca registrar token, senha ou segredo;
- usar protocolo/ID de correlação quando possível.

## Alertas operacionais sugeridos
- health falha repetidamente;
- taxa de erro de SOS acima do baseline;
- volume anormal por usuário/instituição;
- falha de segregação;
- erro de autorização inesperado após deploy;
- crescimento anormal de Storage/Firestore;
- CI da branch principal falhar.

## SLOs
Não há SLO/SLA oficial nesta fase. Valores devem ser definidos somente após medições de piloto e compromisso institucional.

## Evidência
Cada incidente relevante deve registrar commit/versão, horário, duração, impacto, causa e ação corretiva.