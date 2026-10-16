import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const historyChannel = MethodChannel('com.priscillacahino.uniguard/history');
void main() => runApp(const HistoryApp());

class HistoryApp extends StatelessWidget {
  const HistoryApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    debugShowCheckedModeBanner: false,
    title: 'UniGuard - Histórico demonstrativo',
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff0b3156)),
      scaffoldBackgroundColor: const Color(0xfff4f7fb),
    ),
    home: const HistoryScreen(),
  );
}

class HistoryItem {
  final String protocol, category, status, date;
  const HistoryItem(this.protocol, this.category, this.status, this.date);
  factory HistoryItem.fromMap(Map<Object?, Object?> data) {
    String field(String name) {
      final value = data[name];
      if (value is! String || value.isEmpty) {
        throw const FormatException('Registro inválido');
      }
      return value;
    }

    return HistoryItem(
      field('protocol'),
      field('category'),
      field('status'),
      field('date'),
    );
  }
}

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});
  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen>
    with WidgetsBindingObserver {
  List<HistoryItem> _items = [];
  bool _loading = true;
  String? _error;
  int _request = 0;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _load();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _load();
  }

  Future<void> _load() async {
    final request = ++_request;
    setState(() {
      _loading = true;
      _error = null;
      _items = [];
    });
    try {
      final data = await historyChannel
          .invokeMapMethod<Object?, Object?>('loadHistory')
          .timeout(const Duration(seconds: 10));
      if (data == null || data['mode'] != 'demo' || data['items'] is! List) {
        throw const FormatException('Resposta inválida');
      }
      final items = (data['items'] as List).map((item) {
        if (item is! Map) throw const FormatException('Registro inválido');
        return HistoryItem.fromMap(Map<Object?, Object?>.from(item));
      }).toList();
      if (!mounted || request != _request) return;
      setState(() {
        _items = items;
        _loading = false;
      });
    } catch (_) {
      if (!mounted || request != _request) return;
      setState(() {
        _loading = false;
        _error = 'Não foi possível carregar o histórico. Abra esta tela pelo aplicativo Android e tente novamente.';
      });
    }
  }

  Future<void> _close() async {
    try {
      await historyChannel
          .invokeMethod<void>('closeHistory')
          .timeout(const Duration(seconds: 3));
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Use o botão Voltar do Android para retornar.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      leading: IconButton(
        onPressed: _close,
        tooltip: 'Voltar ao UniGuard',
        icon: const Icon(Icons.arrow_back),
      ),
      title: const Text('Histórico de alertas'),
      actions: [
        IconButton(
          onPressed: _loading ? null : _load,
          tooltip: 'Atualizar histórico',
          icon: const Icon(Icons.refresh),
        ),
      ],
    ),
    body: SafeArea(
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: const Color(0xffe6edf6),
            child: const Text(
              'DEMONSTRAÇÃO • Dados fictícios.\nEsta tela não envia alertas nem aciona atendimento.',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                      semanticsLabel: 'Carregando histórico',
                    ),
                  )
                : _error != null
                ? SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        Text(_error!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _load,
                          child: const Text('Tentar novamente'),
                        ),
                      ],
                    ),
                  )
                : _items.isEmpty
                ? const Center(child: Text('Nenhum alerta demonstrativo.'))
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final item = _items[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.protocol,
                                style: Theme.of(context).textTheme.labelLarge,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                item.category,
                                style: Theme.of(context).textTheme.titleMedium,
                              ),
                              const SizedBox(height: 8),
                              Text(item.date),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  const Icon(Icons.info_outline, size: 18),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(item.status)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    ),
  );
}
