package com.priscillacahino.uniguard

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/** Ponte somente leitura, restrita a dados sintéticos da POC. */
class FlutterHistoryActivity : FlutterActivity() {
    private var historyChannel: MethodChannel? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        historyChannel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.priscillacahino.uniguard/history",
        ).also { channel ->
            channel.setMethodCallHandler { call, result ->
                when (call.method) {
                    "loadHistory" -> result.success(mapOf(
                        "mode" to "demo",
                        "items" to listOf(
                            mapOf("protocol" to "DEMO-003", "category" to "Apoio no trajeto",
                                "status" to "Em acompanhamento", "date" to "14/10/2026 09:10"),
                            mapOf("protocol" to "DEMO-002", "category" to "Pedido de apoio",
                                "status" to "Encerrado", "date" to "13/10/2026 18:30"),
                            mapOf("protocol" to "DEMO-001", "category" to "Orientação",
                                "status" to "Encerrado", "date" to "12/10/2026 15:00"),
                        ),
                    ))
                    "closeHistory" -> {
                        result.success(null)
                        finish()
                    }
                    else -> result.notImplemented()
                }
            }
        }
    }

    override fun cleanUpFlutterEngine(flutterEngine: FlutterEngine) {
        historyChannel?.setMethodCallHandler(null)
        historyChannel = null
        super.cleanUpFlutterEngine(flutterEngine)
    }
}
