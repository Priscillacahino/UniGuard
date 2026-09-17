# Checklist de Release — UniGuard

> Critérios mínimos para considerar uma versão acadêmica estável. Não equivale a aprovação de produção ou piloto institucional.

## 1. Código e build
- [ ] branch/commit identificado;
- [ ] testes web aprovados;
- [ ] TypeScript aprovado;
- [ ] build web aprovado;
- [ ] testes unitários Android aprovados;
- [ ] Android Lint aprovado;
- [ ] APK demonstrativo gerado;
- [ ] auditoria npm sem vulnerabilidade crítica conhecida.

## 2. Segurança
- [ ] testes Firebase Emulator aprovados;
- [ ] regras Firestore/Storage revisadas quando alteradas;
- [ ] nenhuma credencial ou segredo adicionado;
- [ ] permissões Android revisadas quando alteradas;
- [ ] headers web preservados;
- [ ] logging não expõe senha, token, telefone, e-mail ou localização exata sem necessidade.

## 3. Privacidade
- [ ] dados de demonstração são fictícios;
- [ ] nenhum campo médico/medicalNotes reintroduzido;
- [ ] nova coleta possui finalidade documentada;
- [ ] retenção revisada quando houver novo dado;
- [ ] mudanças de privacidade refletidas na documentação.

## 4. Requisitos e riscos
- [ ] requisito relacionado atualizado;
- [ ] matriz de rastreabilidade revisada;
- [ ] matriz de riscos revisada quando aplicável;
- [ ] checklist de piloto não recebeu conclusão sem evidência.

## 5. Documentação
- [ ] README coerente com o estado real;
- [ ] CHANGELOG atualizado;
- [ ] links principais funcionais;
- [ ] versão apresentada como acadêmica/demonstrativa quando aplicável.

## 6. Publicação
- [ ] tag/release aponta para commit pretendido;
- [ ] notas da release registram entregas e pendências;
- [ ] artefatos publicados não contêm dados pessoais reais;
- [ ] rollback possível para versão anterior.

## 7. Bloqueadores
A release deve ser interrompida se houver:
- falha de build/teste;
- vulnerabilidade crítica conhecida sem tratamento;
- quebra de segregação institucional;
- exposição de segredo;
- regressão em autenticação/autorização;
- documentação que represente como concluído algo ainda não validado.

## 8. Evidência
Registrar na release ou issue: commit, CI, resultados de teste, riscos aceitos e pendências.