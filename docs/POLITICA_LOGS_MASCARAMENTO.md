# Política de Logs e Mascaramento — UniGuard

> Documento técnico do protótipo acadêmico. Define padrões internos de registro sem substituir política institucional de segurança ou privacidade.

## 1. Objetivo
Reduzir risco de exposição de dados pessoais e segredos em logs de navegador, Android, CI, Firebase ou ferramentas de diagnóstico.

## 2. Dados que não devem ser registrados em claro
- senha, token, chave, segredo ou credencial;
- e-mail completo;
- telefone completo;
- UID completo quando não for indispensável;
- latitude/longitude exatas;
- conteúdo de fotografia ou evidência;
- campos clínicos ou médicos;
- payload completo de alerta;
- dados de autenticação.

## 3. Mascaramento recomendado
| Dado | Exemplo de saída segura |
|---|---|
| e-mail | `p***@dominio.com` |
| telefone | `******1234` |
| UID | `abc1…9xyz` |
| coordenada | `-7.10,-34.80` ou classificação aproximada quando suficiente |
| protocolo | pode ser usado quando não revelar identidade |

## 4. Níveis
- `info`: eventos técnicos sem dados pessoais;
- `warn`: degradações e tentativas inválidas, sempre mascaradas;
- `error`: falhas técnicas, sem payloads completos ou credenciais;
- `debug`: desativado em produção ou restrito a dados fictícios.

## 5. Regras
1. não usar `console.log` com objetos de usuário ou alerta completos;
2. preferir IDs de correlação e protocolos;
3. nunca registrar senha ou token, mesmo em ambiente local;
4. erros vindos de serviços externos devem ser resumidos;
5. logs de CI não devem imprimir variáveis de ambiente sensíveis;
6. localização exata só pode aparecer quando indispensável à investigação autorizada;
7. logs de testes públicos devem usar dados fictícios;
8. qualquer novo logger deve passar por revisão de privacidade.

## 6. Retenção
A retenção de logs operacionais reais deverá ser definida antes de piloto. Até lá, não há autorização para conservar logs com dados pessoais reais.

## 7. Implementação no protótipo
O web inclui `src/services/safeLogger.ts`, que fornece mascaramento básico para campos sensíveis e evita serialização direta de objetos complexos. A utilidade deve ser preferida quando logging técnico for necessário.

## 8. Incidentes
Se um segredo ou dado pessoal for registrado indevidamente:
- interromper geração do log;
- restringir acesso;
- remover ou rotacionar credenciais quando aplicável;
- preservar apenas evidência mínima do incidente;
- registrar no runbook;
- revisar testes e código.

## 9. Limites
Esta política é preparatória e deve ser alinhada ao plano institucional de logging, SIEM, retenção e resposta a incidentes antes de uso real.