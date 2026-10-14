# UniGuard | Flutter + Kotlin - prova de conceito 0.1.0

**Prova de conceito para revisão por pull request. Ainda não integrada à branch principal nem validada em dispositivo.**
Base: main, commit 2fae8a064846e3baec6f0163da61c90e1b4bfde3, consultado em 14/10/2026.
O build opt-in usa identificador Android próprio (`.flutterpoc`) e nome `UniGuard POC`. Para atender ao AAR do Flutter, somente essa variante compila contra API 36; o build Kotlin padrão continua em API 35 e o `minSdk` permanece 24. Os builds POC usam Jetifier desativado e reservam 4 GB de heap ao daemon Gradle.
O código está nesta branch de revisão; o fluxo de CI executa a análise, os testes Flutter e builds Kotlin/Flutter comparativos.

## O que foi preparado
- Módulo Flutter/Dart para histórico demonstrativo, com carregamento, vazio, erro, atualização e retorno.
- Activity Kotlin hospedeira e ponte MethodChannel, somente leitura, com três registros fictícios.
- Botão "Histórico demonstrativo" na tela Android apenas quando a POC é habilitada.
- Tela Android rolável na POC para acomodar o novo acesso sem encobrir controles.
- Integração opt-in por AAR. Por padrão, a compilação não depende de Flutter.
- Cinco testes Flutter preparados, script local de compilação e roteiro de aceite.

No build padrão, SOS, GPS, SMS, câmera, login e Firebase mantêm a lógica original. No build Flutter da POC, o SOS fica bloqueado para impedir envio real de SMS ou alertas durante a demonstração.
O módulo NÃO consulta Firebase, não recebe credenciais e não cria alertas. A tela identifica os dados fictícios.
A POC não deve enviar SMS nem alertas: o acionamento SOS é bloqueado explicitamente nesse build.

## Como executar no Windows
Pré-requisitos: Flutter 3.47.7 estável no PATH, Android SDK, JDK 21 e Python 3. Execute na raiz do checkout desta branch.

```powershell
# Na raiz do repositório:
python scripts/build_flutter_poc.py
```

O script cria o invólucro Android do módulo pelo próprio Flutter, executa análise e testes, gera AARs e compila o APK de debug.
Interrompe em caso de erro. Não instala o APK automaticamente e não executa Git.
O SDK e as dependências exigem internet. Versões efetivas aparecem na saída de flutter --version e flutter doctor.
O build opt-in acrescenta o sufixo `.flutterpoc` ao `applicationId`, para instalar em paralelo com o UniGuard.
Instale o APK somente em emulador ou aparelho de teste.
APK esperado: `app/build/outputs/apk/debug/app-debug.apk`.

No Linux/macOS: `python3 scripts/build_flutter_poc.py`.

## Comparação e reversão
Sem `-PUNIGUARD_FLUTTER_POC=true`, não entram Activity, layout ou dependências Flutter.
Compilação Kotlin padrão: `gradlew.bat :app:assembleDebug` (Windows).
Para comparar tamanho, copie o APK padrão antes de compilar a POC: ambos usam o mesmo caminho de saída.
Para manter o build Android somente Kotlin, não use `-PUNIGUARD_FLUTTER_POC=true`. A `main` permanece inalterada até revisão e aprovação do PR.

## Validação automatizada concluída

A execução [38623377657](https://github.com/Priscillacahino/UniGuard/actions/runs/38623377657) passou em todos os jobs do CI: backend, web, Android + Flutter add-to-app, Firebase Emulator e Android. No job Android + Flutter foram aprovados o flutter analyze, os cinco testes Flutter, a geração dos AARs e os builds Kotlin padrão e Flutter (debug/release).

Artefatos da execução, incluindo APKs e logs comparativos: [uniguard-flutter-poc-validation](https://github.com/Priscillacahino/UniGuard/actions/runs/38623377657).

## Validação manual e evolução ainda necessárias
1. Abrir "Histórico demonstrativo", conferir os três registros e o aviso de simulação.
2. Atualizar, voltar pela seta e pelo botão Android, reabrir, girar a tela e retomar do segundo plano.
3. Testar tela estreita, fonte ampliada, TalkBack e ausência de rede.
4. Comparar APKs, tempo de primeira abertura e memória; não há medições nesta entrega.
5. Validar ausência de regressão do fluxo Kotlin em ambiente controlado, sem enviar pedidos reais.
6. Antes de dados reais: projetar leitura autenticada por usuário/instituição, revalidar sessão, tratar revogação e offline, testar regras Firebase e impedir exposição cruzada.
7. Antes de distribuição: compilar release com shrinking e validar instalação/retorno em dispositivo.
## Estado correto para apresentação
"UniGuard utiliza Kotlin no Android e React/TypeScript na web. Uma prova de conceito Flutter e Dart, integrada ao Android pelo modelo add-to-app para demonstrar o histórico, está em revisão.
Os testes automatizados são executados no CI do PR; a validação em dispositivo e qualquer uso com dados reais seguem pendentes."

O PDF principal continua correto ao apresentar Flutter como evolução proposta. Esta entrega não significa
que Flutter já esteja em produção ou que o aplicativo completo seja multiplataforma.

Fontes técnicas:
- https://docs.flutter.dev/add-to-app
- https://docs.flutter.dev/add-to-app/android/project-setup
- https://docs.flutter.dev/add-to-app/android/add-flutter-screen
