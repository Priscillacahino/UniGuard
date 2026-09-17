# UniGuard — Segurança e governança

## Escopo

Este documento descreve os controles implementados no protótipo e separa o que está preparado no código daquilo que ainda depende de configuração, aprovação institucional e teste integrado.

## Controles implementados no código

- Autenticação por e-mail e senha.
- Exigência de e-mail verificado.
- Vínculo institucional por `memberships/{uid}`.
- Perfil de operador separado em `operators/{uid}`.
- Isolamento por `institutionId`.
- Usuário limitado aos próprios alertas.
- Operador limitado aos alertas da própria instituição.
- Auditoria append-only.
- Proibição de alteração e exclusão de registros de auditoria pelo cliente.
- Remoção de campos médicos não autorizados.
- Retenção com `retentionExpiresAt`.
- Limite de um alerta ativo por usuário.
- Limite de três alertas em trinta minutos.
- Intervalo mínimo de sessenta segundos.
- Evidência no Storage limitada a imagens de até 5 MB.
- Evidência criada uma única vez e sem sobrescrita.
- Segredos mantidos fora do repositório por variáveis de ambiente.

## Dados que não devem ser usados

Não utilizar dados reais de estudantes, servidores, documentos, contatos, imagens ou localização durante demonstrações públicas. Os arquivos analíticos do projeto são simulados.

## Pendências para uso institucional

- Publicar as regras no projeto Firebase correto.
- Provisionar instituições, memberships e operadores por processo administrativo.
- Validar o fluxo Android → Firebase → painel → encerramento.
- Definir controlador, operador, finalidade, base legal e prazos com a instituição.
- Realizar revisão jurídica, de segurança, acessibilidade e continuidade.
- Definir canal de suporte e procedimento para incidentes.

## Critério de comunicação

Até que as pendências sejam concluídas, o UniGuard deve ser apresentado como protótipo acadêmico avançado/MVP demonstrativo, e não como serviço de emergência operacional.
