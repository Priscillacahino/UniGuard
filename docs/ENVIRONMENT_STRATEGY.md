# UniGuard — Estratégia de ambientes

## Ambientes

### Desenvolvimento

Uso local com dados fictícios e Firebase Emulator Suite. Não utilizar dados pessoais reais.

### Homologação

Projeto Firebase separado do ambiente de produção, com contas de teste, instituições simuladas e regras atuais. Serve para validar a integração antes de qualquer piloto.

### Produção

Projeto Firebase exclusivo, com acesso administrativo restrito, backups, monitoramento, regras aprovadas e dados somente após autorização institucional.

## Regras de promoção

Uma versão somente deve avançar de ambiente após:

- CI aprovado;
- regras revisadas;
- ausência de segredos no repositório;
- checklist de privacidade preenchido;
- teste das permissões por perfil;
- plano de rollback documentado;
- registro da versão publicada.

## Configuração

O painel utiliza variáveis `VITE_FIREBASE_*`. O Android utiliza `google-services.json`, que não deve ser versionado neste repositório. Os valores devem ser configurados no ambiente correspondente.

## Rollback

Em caso de falha, interromper a publicação, preservar os logs, retornar à última versão aprovada e registrar o incidente. Não apagar dados para tentar corrigir uma falha sem backup e autorização.
