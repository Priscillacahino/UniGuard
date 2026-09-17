# Plano de Contingência — UniGuard

> Documento preparatório para cenários de falha. Não configura plano oficial de continuidade de uma instituição.

## 1. Objetivo
Definir respostas previstas para indisponibilidades e degradações do protótipo antes de um eventual piloto.

## 2. Princípios
- segurança da pessoa tem prioridade sobre continuidade do software;
- não criar falsa sensação de disponibilidade;
- falha deve ser comunicada de forma clara;
- dados não devem ser duplicados sem necessidade;
- retomada deve preservar integridade e auditoria.

## 3. Cenários

### C01 — Sem internet no dispositivo
- informar indisponibilidade de envio;
- não afirmar que o SOS foi recebido;
- orientar uso do canal oficial definido pela futura instituição;
- registrar localmente apenas o mínimo necessário, se seguro e previsto.

### C02 — Firebase indisponível
- bloquear confirmação falsa de recebimento;
- indicar indisponibilidade;
- não usar modo demo como substituto da Central;
- registrar incidente técnico após restabelecimento.

### C03 — Painel da Central indisponível
- impedir interpretação de atendimento ativo;
- acionar canal alternativo definido para o piloto;
- registrar início e fim da indisponibilidade.

### C04 — Geolocalização negada ou indisponível
- informar claramente a ausência de localização;
- permitir somente fluxo compatível com o desenho aprovado;
- não inventar coordenadas;
- registrar estado de localização no alerta quando aplicável.

### C05 — Câmera negada ou indisponível
- manter evidência fotográfica como opcional;
- não bloquear SOS apenas pela ausência de foto;
- registrar ausência somente se necessário.

### C06 — Falha de autenticação
- negar acesso institucional;
- não liberar alerta institucional anônimo;
- oferecer instrução de recuperação de acesso.

### C07 — Suspeita de vazamento ou acesso indevido
- interromper acessos afetados quando tecnicamente possível;
- preservar evidências;
- registrar incidente;
- iniciar fluxo do RUNBOOK_INCIDENTES;
- avaliar necessidade de comunicação conforme validação jurídica futura.

### C08 — Falha de segregação entre instituições
- classificar como incidente crítico;
- interromper ambiente afetado;
- preservar logs;
- não retomar operação até correção e reteste.

### C09 — Volume anormal de alertas
- verificar abuso, automação ou falha;
- aplicar controles existentes;
- registrar evento;
- escalar para mecanismo confiável de rate limiting quando disponível.

### C10 — Erro de deploy
- interromper promoção da versão;
- manter última versão conhecida como estável quando disponível;
- executar rollback pelo processo de hospedagem;
- registrar causa.

## 4. Prioridades de recuperação
1. confidencialidade e segregação;
2. autenticação e autorização;
3. recebimento do SOS;
4. integridade do alerta;
5. auditoria;
6. evidências;
7. recursos secundários.

## 5. Objetivos preparatórios de recuperação
- RTO e RPO ainda não formalizados;
- antes de piloto, devem ser definidos pela instituição responsável;
- o projeto deve medir tempos reais em exercícios antes de prometer disponibilidade.

## 6. Retomada
A retomada exige:
- causa conhecida ou risco controlado;
- validação mínima do fluxo afetado;
- verificação de integridade;
- verificação de segregação;
- registro do incidente;
- confirmação de que não há alerta pendente perdido.

## 7. Exercícios recomendados
- perda de rede;
- queda do Firebase;
- indisponibilidade da Central;
- localização negada;
- câmera negada;
- tentativa de acesso cruzado;
- spam de SOS;
- falha de deploy;
- revogação de operador;
- restauração após incidente.

## 8. Limites
Nenhum procedimento deste documento substitui protocolo institucional, serviço público de emergência, política de continuidade ou orientação jurídica formal.