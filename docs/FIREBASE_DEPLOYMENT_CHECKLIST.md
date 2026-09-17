# UniGuard — Checklist de publicação do Firebase

## Antes da publicação

- [ ] Confirmar o projeto Firebase e o ambiente de destino.
- [ ] Confirmar que não existem dados pessoais reais de teste.
- [ ] Fazer backup/exportação autorizada dos dados existentes.
- [ ] Criar pelo menos uma instituição de teste.
- [ ] Criar um usuário com membership ativa.
- [ ] Criar um operador ativo da mesma instituição.
- [ ] Confirmar que os e-mails de teste estão verificados.
- [ ] Revisar as variáveis do painel e o `google-services.json` do Android.
- [ ] Executar os testes das regras com o Emulator Suite.

## Publicação

```bash
firebase login
firebase use <PROJECT_ID>
firebase deploy --only firestore:rules,storage
```

## Pós-publicação

- [ ] Usuário sem membership não acessa alertas.
- [ ] Usuário da instituição A não acessa alertas da instituição B.
- [ ] Usuário não altera status operacional.
- [ ] Usuário só cancela o próprio alerta.
- [ ] Operador só acessa a própria instituição.
- [ ] Auditoria não pode ser alterada ou excluída.
- [ ] Evidência de um alerta não pode ser lida por outro vínculo.
- [ ] Upload acima de 5 MB é rejeitado.
- [ ] Upload que não seja imagem é rejeitado.
- [ ] O mesmo arquivo não pode ser sobrescrito.
- [ ] O painel recebe o alerta e a atualização de status chega ao cliente.

A publicação não substitui a validação jurídica, institucional e operacional.
