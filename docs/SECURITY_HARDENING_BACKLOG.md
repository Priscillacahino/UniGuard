# UniGuard — Backlog de hardening

## Implementado

- autenticação com e-mail verificado;
- vínculo institucional por membership;
- isolamento por instituição;
- auditoria append-only;
- retenção documentada;
- bloqueio de dados médicos não autorizados;
- limites de abuso no cliente e nas regras;
- Storage com acesso por titularidade e instituição;
- backup do Android desativado;
- tráfego sem TLS bloqueado no Android;
- CI com auditoria de dependências;
- Firebase Emulator Suite configurado.

## Próxima camada

Estas medidas ainda exigem configuração, backend ou teste:

1. Firebase App Check.
2. MFA para operadores.
3. Cloud Functions para rate limit autoritativo.
4. Auditoria crítica gerada no backend.
5. Testes automatizados das regras.
6. Monitoramento, alertas e backup operacional.
7. Política de resposta a incidentes.
8. Revisão jurídica e aprovação institucional.

## Critério de conclusão

O hardening será considerado concluído somente quando as medidas estiverem publicadas no ambiente correto, cobertas por testes e registradas no checklist de implantação.
