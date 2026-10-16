import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:uniguard_history/main.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  final messenger =
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger;
  tearDown(() => messenger.setMockMethodCallHandler(historyChannel, null));
  testWidgets('recebe dados do host e solicita retorno ao Kotlin', (
    tester,
  ) async {
    var closed = false;
    messenger.setMockMethodCallHandler(historyChannel, (call) async {
      if (call.method == 'closeHistory') {
        closed = true;
        return null;
      }
      return {
        'mode': 'demo',
        'items': [
          {
            'protocol': 'DEMO-1',
            'category': 'Apoio',
            'status': 'Encerrado',
            'date': '14/10/2026',
          },
        ],
      };
    });
    await tester.pumpWidget(const HistoryApp());
    await tester.pumpAndSettle();
    expect(find.text('DEMO-1'), findsOneWidget);
    expect(find.textContaining('Dados fictícios'), findsOneWidget);
    await tester.tap(find.byTooltip('Voltar ao UniGuard'));
    await tester.pumpAndSettle();
    expect(closed, isTrue);
  });
  testWidgets('mostra estado vazio', (tester) async {
    messenger.setMockMethodCallHandler(
      historyChannel,
      (_) async => {'mode': 'demo', 'items': []},
    );
    await tester.pumpWidget(const HistoryApp());
    await tester.pumpAndSettle();
    expect(find.text('Nenhum alerta demonstrativo.'), findsOneWidget);
  });
  testWidgets('permite tentar novamente após falha da ponte', (tester) async {
    var fail = true;
    messenger.setMockMethodCallHandler(historyChannel, (_) async {
      if (fail) throw PlatformException(code: 'unavailable');
      return {'mode': 'demo', 'items': []};
    });
    await tester.pumpWidget(const HistoryApp());
    await tester.pumpAndSettle();
    expect(find.text('Tentar novamente'), findsOneWidget);
    fail = false;
    await tester.tap(find.text('Tentar novamente'));
    await tester.pumpAndSettle();
    expect(find.text('Nenhum alerta demonstrativo.'), findsOneWidget);
  });
  testWidgets('rejeita dados de modo real nesta prova', (tester) async {
    messenger.setMockMethodCallHandler(
      historyChannel,
      (_) async => {'mode': 'live', 'items': []},
    );
    await tester.pumpWidget(const HistoryApp());
    await tester.pumpAndSettle();
    expect(find.text('Tentar novamente'), findsOneWidget);
  });
  testWidgets('não estoura em tela estreita e fonte ampliada', (tester) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    messenger.setMockMethodCallHandler(
      historyChannel,
      (_) async => {'mode': 'demo', 'items': []},
    );
    await tester.pumpWidget(
      MaterialApp(
        home: MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(1.5)),
          child: const HistoryScreen(),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });
}
