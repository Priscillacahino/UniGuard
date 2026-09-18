# Modelo de Ameaças e Controles — UniGuard

> Modelo de ameaça do protótipo acadêmico. O objetivo é deixar explícitas as fronteiras de confiança, os controles existentes e o risco residual antes de qualquer piloto.

## 1. Fronteiras de confiança

O navegador e o APK são considerados **clientes não confiáveis**: quem controla o dispositivo pode alterar o aplicativo, interceptar chamadas ou tentar enviar dados manipulados. Regras do Firebase, App Check e backend confiável são as fronteiras técnicas previstas para decisões de autorização e integridade.

O modo demonstrativo não é fronteira de segurança e não deve receber dados pessoais reais.

## 2. Principais ameaças

| ID | Ameaça | Vetor | Controle atual | Risco residual |
| --- | --- | --- | --- | --- |
| T01 | Acesso a alertas de outra instituição | consulta ou cliente adulterado | `institutionId`, membership/operator e regras | depende de E2E no projeto real |
| T02 | Criação abusiva de SOS | automação/rajada | limite local + backend com rate limit + App Check preparado | backend/enforcement ainda precisam de deploy |
| T03 | Falsificação de confirmação da Central | alteração direta do documento | regras restringem campos de recebimento a operador autorizado | validar sessão/revogação real |
| T04 | Sobrescrita de evidência | upload repetido | Storage permite criação única no caminho do alerta | exclusão administrativa deve permanecer auditável |
| T05 | Upload de conteúdo ativo disfarçado de imagem | MIME malicioso, como SVG | somente JPEG, PNG e WebP; teste Emulator bloqueia SVG | validação de conteúdo binário pode ser ampliada no backend |
| T06 | Exposição de localização/foto | leitura indevida | autenticação, vínculo e segregação institucional | operação real exige governança de acesso |
| T07 | Persistência excessiva de dados | TTL/lifecycle não aplicado | prazos e campos de retenção versionados | configuração remota ainda é obrigatória |
| T08 | Inserção de dados médicos desnecessários | novos campos/formulários | `medicalNotes` bloqueado e política de minimização | revisão deve acompanhar novos requisitos |
| T09 | Vazamento por logs | erros ou depuração | `safeLogger` mascara e-mail, telefone, UID e coordenadas | módulos novos precisam usar o logger seguro |
| T10 | Credencial/segredo publicado no Git | commit acidental | `.gitignore` + verificação de arquivos sensíveis no CI | secret scanning nativo é complementar |
| T11 | Cliente contornar regra de negócio | APK/web modificado | regras servidoras e backend confiável | cutover ainda não realizado |
| T12 | Alerta não chegar em situação real | perda de rede/Firebase/erro | plano de contingência e estados de erro | não há garantia operacional sem testes reais |
| T13 | Localização falsa ou imprecisa | GPS spoofing/baixa precisão | validação de intervalo e indicação de sinal/localização | anti-spoofing real não implementado |
| T14 | Conta válida permanecer ativa após perda de vínculo | sessão existente | consulta de membership/operator nas regras | testar revogação em sessão ativa |
| T15 | Dependência vulnerável | cadeia de suprimentos | Dependabot + `npm audit` + CI | vulnerabilidades futuras continuam possíveis |
| T16 | Manipulação de perfil via backend confiável | cliente envia `role` arbitrário e o Admin SDK ignora regras Firestore | allowlist fechada no backend + teste unitário | novos campos de domínio devem seguir a mesma regra |
| T17 | Transporte HTTP acidental no Android | integração futura aponta para endpoint sem TLS | `usesCleartextTraffic=false` | bibliotecas e endpoints futuros devem continuar em HTTPS |

## 3. Evidência e privacidade

Fotos não são embutidas no Firestore. A evidência é enviada para um caminho derivado do ID do alerta, com limite de tamanho e leitura condicionada ao titular ou operador da mesma instituição.

Formatos aceitos no Storage:

- `image/jpeg`;
- `image/png`;
- `image/webp`.

Conteúdos como `image/svg+xml` são rejeitados mesmo pertencendo à família `image/*`, reduzindo a superfície para conteúdo ativo.

## 4. Dados proibidos e minimização

O campo `medicalNotes` não deve ser reintroduzido. Integrações futuras, SSO, APIs, importações e painéis administrativos devem respeitar a mesma regra de minimização.

Dados públicos de contexto e dados operacionais do UniGuard são conjuntos separados. Dados de demonstração não devem ser apresentados como estatística real.

## 5. Controles que dependem de ambiente real

Ainda não são considerados comprovados em produção:

- enforcement do App Check;
- backend confiável após deploy;
- TTL do Firestore;
- lifecycle do Storage;
- revogação de acesso em sessões reais;
- comportamento sob perda de rede/GPS;
- disponibilidade e latência da Central;
- procedimentos administrativos e resposta institucional.

## 6. Regra para novas funcionalidades

Toda funcionalidade que introduzir novo dado pessoal, permissão, integração externa, campo de alerta ou papel de acesso deve responder antes do merge:

1. qual dado entra;
2. por que é necessário;
3. quem pode ler;
4. quem pode alterar;
5. quanto tempo fica armazenado;
6. como é auditado;
7. o que acontece se o cliente for adulterado;
8. qual teste automatizado ou evidência cobre o controle.
