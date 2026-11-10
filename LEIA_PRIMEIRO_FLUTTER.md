# UniGuard | Flutter + Kotlin - prova de conceito 0.1.0

**Prova de conceito integrada à branch `main` em 16/10/2026; validação em dispositivo ainda pendente.**
Base: commit `e9c9c2e035017fa9dc2d7e6468b347ec595bc14a` da `main`.
O build opt-in usa identificador Android próprio (`.flutterpoc`) e nome `UniGuard POC`. Para atender ao AAR do Flutter, somente essa variante compila contra API 36; o build Kotlin padrão continua em API 35 e o `minSdk` permanece 24. Os builds POC usam Jetifier desativado e reservam 4 GB de heap ao daemon Gradle.
O código está na `main` e permanece opt-in: o build Kotlin padrão não depende do Flutter. O CI executa análise, testes Flutter e builds Kotlin/Flutter comparativos.

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
Pré-requisitos: Flutter 3.47.7 estável, Android SDK Platforms 35 e 36, Build-Tools 35.0.0, Command-line Tools e JDK 21. O projeto usa AGP 8.9.1 e Gradle 8.11.1 para suporte ao `compileSdk 36`. Execute na raiz do repositório. No Windows, prepare o ambiente e depois compare os APKs:

```powershell
# Preparar SDK Android, licenças, JDK 21 e Flutter 3.47.7 em pasta separada:
.\scripts\prepare_flutter_android_windows.ps1 -InstallFlutterCiVersion

# Validar e comparar os APKs Kotlin e Flutter:
.\scripts\build_flutter_poc.ps1 -Compare
```

Para executar apenas a análise e os testes Flutter, sem Android SDK, use `.\scripts\build_flutter_poc.ps1 -CheckOnly`. O script completo verifica a versão Flutter, JDK 21 e os pacotes Android necessários antes de iniciar a compilação. No Linux/macOS, use o script Python indicado abaixo.
O script cria o invólucro Android do módulo pelo próprio Flutter, executa análise e testes, gera AARs e compila APKs de debug e release.
Interrompe em caso de erro. Não instala APKs automaticamente e não executa Git. Os APKs e logs ficam em `.poc_build\results`.
O SDK e as dependências exigem internet. Versões efetivas aparecem na saída de flutter --version e flutter doctor.
O build opt-in acrescenta o sufixo `.flutterpoc` ao `applicationId`, para instalar em paralelo com o UniGuard.
Instale o APK somente em emulador ou aparelho de teste.
APK de teste esperado: `.poc_build/results/uniguard-flutter-poc-debug.apk`.

No Linux/macOS: `python3 scripts/build_flutter_poc.py --compare`.

## Comparação e reversão
Sem `-PUNIGUARD_FLUTTER_POC=true`, não entram Activity, layout ou dependências Flutter.
Compilação Kotlin padrão: `gradlew.bat :app:assembleDebug` (Windows).
Para comparar tamanho, copie o APK padrão antes de compilar a POC: ambos usam o mesmo caminho de saída.
Para manter o build Android somente Kotlin, não use `-PUNIGUARD_FLUTTER_POC=true`. A integração está na `main`, mas permanece desativada por padrão.

## Validação automatizada concluída

A execução automatizada aprovada em outubro/2026 validou o Flutter 3.47.7, os cinco testes Flutter, a geração dos AARs e os builds Kotlin padrão e Flutter (debug/release). Esta branch atualiza AGP/Gradle/Kotlin para compatibilidade com API 36; a nova combinação precisa passar novamente pelo CI antes de ser incorporada.

Consulte os resultados desta atualização em [GitHub Actions](https://github.com/Priscillacahino/UniGuard/actions/workflows/ci.yml?query=branch%3Achore%2Fflutter-sdk-gradle-api36).

## Validação manual e evolução ainda necessárias
1. Abrir "Histórico demonstrativo", conferir os três registros e o aviso de simulação.
2. Atualizar, voltar pela seta e pelo botão Android, reabrir, girar a tela e retomar do segundo plano.
3. Testar tela estreita, fonte ampliada, TalkBack e ausência de rede.
4. Comparar APKs, tempo de primeira abertura e memória; não há medições nesta entrega.
5. Validar ausência de regressão do fluxo Kotlin em ambiente controlado, sem enviar pedidos reais.
6. Antes de dados reais: projetar leitura autenticada por usuário/instituição, revalidar sessão, tratar revogação e offline, testar regras Firebase e impedir exposição cruzada.
7. Antes de distribuição: compilar release com shrinking e validar instalação/retorno em dispositivo.

## Estado correto para apresentação
"UniGuard utiliza Kotlin no Android e React/TypeScript na web. Flutter/Dart está presente em uma prova de conceito add-to-app que demonstra uma tela de histórico com dados fictícios. A POC não substitui o aplicativo Kotlin."
Os testes automatizados passam no CI do PR; validação em dispositivo, acessibilidade e desempenho seguem pendentes. A POC não representa Flutter em produção nem uma migração completa para multiplataforma.

Fontes técnicas:
- https://docs.flutter.dev/add-to-app
- https://docs.flutter.dev/add-to-app/android/project-setup
- https://docs.flutter.dev/add-to-app/android/add-flutter-screen
