package com.example.uniguard

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import io.ktor.client.*
import io.ktor.client.engine.android.*
import io.ktor.client.request.*

class MainActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val LOCATION_PERMISSION_REQ_CODE = 1000

    private val handlerCronometro = Handler(Looper.getMainLooper())
    private var sosDisparado = false

    // Inicializa o cliente HTTP Ktor de forma leve
    private val httpClient = HttpClient(Android)

    private val acaoDisparoSos = Runnable {
        sosDisparado = true
        verificarPermissaoEObterLocalizacao()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sos)

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        val botaoSos = findViewById<Button>(R.id.btnSOS)

        botaoSos.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    sosDisparado = false
                    handlerCronometro.postDelayed(acaoDisparoSos, 2000)
                    Toast.makeText(this, "Segure por 2 segundos para disparar...", Toast.LENGTH_SHORT).show()
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    handlerCronometro.removeCallbacks(acaoDisparoSos)
                    if (!sosDisparado) {
                        Toast.makeText(this, "Acionamento cancelado.", Toast.LENGTH_SHORT).show()
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun verificarPermissaoEObterLocalizacao() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
                LOCATION_PERMISSION_REQ_CODE
            )
        } else {
            capturarCoordenadasGPS()
        }
    }

    private fun capturarCoordenadasGPS() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedLocationClient.lastLocation.addOnSuccessListener { location: Location? ->
                if (location != null) {
                    val latitude = location.latitude
                    val longitude = location.longitude

                    // 🚀 Dispara a função assíncrona de envio para a Central
                    enviarDadosParaCentralWeb(latitude, longitude)
                } else {
                    Toast.makeText(this, "Sinal de GPS fraco. Ligue a localização do aparelho.", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun enviarDadosParaCentralWeb(lat: Double, lng: Double) {
        // Abre uma linha de execução em segundo plano (Background Thread) para não travar o app
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 📡 URL da API do seu painel Web ou servidor de testes
                // Substitua pelo endereço correto do seu backend futuramente
                val urlServidor = "https://vercel.app"

                httpClient.get(urlServidor)

                // Retorna para a tela principal para avisar o estudante do sucesso
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "🚨 ALERTA ENVIADO À CENTRAL!\nCoordenadas registradas com sucesso.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                // Se o servidor cair ou o celular estiver sem internet, exibe o aviso
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@MainActivity,
                        "⚠️ Alerta emitido localmente, mas houve falha de conexão com a Central.",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        httpClient.close() // Fecha o canal de rede ao fechar o app para economizar bateria
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_PERMISSION_REQ_CODE && grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            capturarCoordenadasGPS()
        }
    }
}
