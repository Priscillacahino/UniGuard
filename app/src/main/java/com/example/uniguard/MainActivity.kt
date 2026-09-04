package com.example.uniguard

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.telephony.SmsManager
import android.view.MotionEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

class MainActivity : AppCompatActivity() {

    // Componentes da tela
    private lateinit var edtNumeroEmergencia: EditText
    private lateinit var btnSalvarNumero: Button
    private lateinit var btnSOS: Button
    private lateinit var txtAviso: TextView

    // Localização
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // Preferências para salvar o telefone
    private val preferencias by lazy {
        getSharedPreferences("UniGuardPrefs", Context.MODE_PRIVATE)
    }

    // Controle do botão SOS
    private val handlerSOS = Handler(Looper.getMainLooper())

    private var sosAcionado = false

    private val tempoParaAcionarSOS = 2000L

    // Pedido de permissões
    private val permissaoLauncher =
        registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissoes ->

            val localizacaoPermitida =
                permissoes[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                        permissoes[Manifest.permission.ACCESS_COARSE_LOCATION] == true

            val smsPermitido =
                permissoes[Manifest.permission.SEND_SMS] == true

            if (!smsPermitido) {
                Toast.makeText(
                    this,
                    "A permissão de SMS é necessária para enviar o alerta.",
                    Toast.LENGTH_LONG
                ).show()
            }

            if (!localizacaoPermitida) {
                Toast.makeText(
                    this,
                    "Sem permissão de localização, o alerta será enviado sem a localização.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_sos)

        // Inicializa os elementos da tela
        edtNumeroEmergencia =
            findViewById(R.id.edtNumeroEmergencia)

        btnSalvarNumero =
            findViewById(R.id.btnSalvarNumero)

        btnSOS =
            findViewById(R.id.btnSOS)

        txtAviso =
            findViewById(R.id.txtAviso)

        // Inicializa o serviço de localização
        fusedLocationClient =
            LocationServices.getFusedLocationProviderClient(this)

        // Recupera número salvo anteriormente
        carregarNumeroEmergencia()

        // Solicita permissões
        verificarPermissoes()

        // Botão para salvar telefone
        btnSalvarNumero.setOnClickListener {

            salvarNumeroEmergencia()

        }

        // Configura botão SOS
        configurarBotaoSOS()
    }

    // =========================================================
    // SALVAR NÚMERO DE EMERGÊNCIA
    // =========================================================

    private fun salvarNumeroEmergencia() {

        val numero =
            edtNumeroEmergencia.text
                .toString()
                .trim()

        val numeroLimpo =
            numero.replace(
                Regex("[^0-9+]"),
                ""
            )

        if (numeroLimpo.length < 8) {

            edtNumeroEmergencia.error =
                "Digite um número de telefone válido"

            edtNumeroEmergencia.requestFocus()

            return
        }

        preferencias
            .edit()
            .putString(
                "numero_emergencia",
                numeroLimpo
            )
            .apply()

        Toast.makeText(
            this,
            "Número de emergência salvo!",
            Toast.LENGTH_SHORT
        ).show()

        esconderTeclado()
    }

    // =========================================================
    // CARREGAR NÚMERO SALVO
    // =========================================================

    private fun carregarNumeroEmergencia() {

        val numeroSalvo =
            preferencias.getString(
                "numero_emergencia",
                ""
            )

        edtNumeroEmergencia.setText(numeroSalvo)
    }

    // =========================================================
    // PERMISSÕES
    // =========================================================

    private fun verificarPermissoes() {

        val permissoesNecessarias =
            mutableListOf<String>()

        if (
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {

            permissoesNecessarias.add(
                Manifest.permission.ACCESS_FINE_LOCATION
            )
        }

        if (
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {

            permissoesNecessarias.add(
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        }

        if (
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.SEND_SMS
            ) != PackageManager.PERMISSION_GRANTED
        ) {

            permissoesNecessarias.add(
                Manifest.permission.SEND_SMS
            )
        }

        if (permissoesNecessarias.isNotEmpty()) {

            permissaoLauncher.launch(
                permissoesNecessarias.toTypedArray()
            )
        }
    }

    // =========================================================
    // BOTÃO SOS
    // =========================================================

    @SuppressLint("ClickableViewAccessibility")
    private fun configurarBotaoSOS() {

        val animacaoPulso =
            AnimationUtils.loadAnimation(
                this,
                R.anim.pulsa_botao
            )

        btnSOS.setOnTouchListener { view, event ->

            when (event.action) {

                MotionEvent.ACTION_DOWN -> {

                    sosAcionado = false

                    btnSOS.startAnimation(animacaoPulso)

                    txtAviso.text =
                        "Continue pressionando..."

                    handlerSOS.postDelayed(
                        {

                            sosAcionado = true

                            btnSOS.clearAnimation()

                            txtAviso.text =
                                "SOS acionado!"

                            acionarSOS()

                        },
                        tempoParaAcionarSOS
                    )

                    true
                }

                MotionEvent.ACTION_UP,
                MotionEvent.ACTION_CANCEL -> {

                    handlerSOS.removeCallbacksAndMessages(null)

                    btnSOS.clearAnimation()

                    if (!sosAcionado) {

                        txtAviso.text =
                            "Mantenha pressionado por 2 segundos"
                    }

                    view.performClick()

                    true
                }

                else -> false
            }
        }
    }

    // =========================================================
    // ACIONAR SOS
    // =========================================================

    private fun acionarSOS() {

        val numero =
            preferencias.getString(
                "numero_emergencia",
                ""
            )

        if (numero.isNullOrBlank()) {

            Toast.makeText(
                this,
                "Cadastre primeiro um número de emergência.",
                Toast.LENGTH_LONG
            ).show()

            txtAviso.text =
                "Cadastre um número de emergência"

            return
        }

        Toast.makeText(
            this,
            "SOS acionado. Obtendo localização...",
            Toast.LENGTH_SHORT
        ).show()

        capturarCoordenadasEEnviar()
    }

    // =========================================================
    // CAPTURAR LOCALIZAÇÃO
    // =========================================================

    @SuppressLint("MissingPermission")
    private fun capturarCoordenadasEEnviar() {

        val permissaoFina =
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

        val permissaoAproximada =
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED

        if (!permissaoFina && !permissaoAproximada) {

            enviarSmsEmergencia(
                latitude = 0.0,
                longitude = 0.0
            )

            return
        }

        fusedLocationClient
            .lastLocation
            .addOnSuccessListener { location ->

                if (location != null) {

                    enviarSmsEmergencia(
                        latitude = location.latitude,
                        longitude = location.longitude
                    )

                } else {

                    Toast.makeText(
                        this,
                        "Não foi possível obter a localização. O SOS será enviado sem localização.",
                        Toast.LENGTH_LONG
                    ).show()

                    enviarSmsEmergencia(
                        latitude = 0.0,
                        longitude = 0.0
                    )
                }
            }
            .addOnFailureListener {

                enviarSmsEmergencia(
                    latitude = 0.0,
                    longitude = 0.0
                )
            }
    }

    // =========================================================
    // ENVIAR SMS
    // =========================================================

    private fun enviarSmsEmergencia(
        latitude: Double,
        longitude: Double
    ) {

        val numero =
            preferencias.getString(
                "numero_emergencia",
                ""
            )

        if (numero.isNullOrBlank()) {

            Toast.makeText(
                this,
                "Nenhum número de emergência cadastrado.",
                Toast.LENGTH_LONG
            ).show()

            return
        }

        val mensagem =

            if (
                latitude != 0.0 &&
                longitude != 0.0
            ) {

                """
                ALERTA SOS - UniGuard

                Preciso de ajuda.

                Minha última localização:
                https://maps.google.com/?q=$latitude,$longitude
                """.trimIndent()

            } else {

                """
                ALERTA SOS - UniGuard

                Preciso de ajuda.

                Não foi possível obter minha localização neste momento.
                """.trimIndent()
            }

        val permissaoSMS =
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.SEND_SMS
            ) == PackageManager.PERMISSION_GRANTED

        if (!permissaoSMS) {

            Toast.makeText(
                this,
                "Permissão para enviar SMS não concedida.",
                Toast.LENGTH_LONG
            ).show()

            verificarPermissoes()

            return
        }

        try {

            val smsManager =
                getSystemService(SmsManager::class.java)

            val partes =
                smsManager.divideMessage(mensagem)

            smsManager.sendMultipartTextMessage(
                numero,
                null,
                partes,
                null,
                null
            )

            Toast.makeText(
                this,
                "Alerta SOS enviado!",
                Toast.LENGTH_LONG
            ).show()

            txtAviso.text =
                "Alerta enviado"

            // Depois do SMS, abre o discador
            fazerLigacaoEmergencia()

        } catch (e: Exception) {

            Toast.makeText(
                this,
                "Não foi possível enviar o SMS: ${e.message}",
                Toast.LENGTH_LONG
            ).show()

            txtAviso.text =
                "Falha ao enviar alerta"
        }
    }

    // =========================================================
    // LIGAÇÃO DE EMERGÊNCIA
    // =========================================================

    private fun fazerLigacaoEmergencia() {

        val numero =
            preferencias.getString(
                "numero_emergencia",
                ""
            )

        if (numero.isNullOrBlank()) {
            return
        }

        try {

            val intent =
                Intent(
                    Intent.ACTION_DIAL
                )

            intent.data =
                Uri.parse(
                    "tel:$numero"
                )

            startActivity(intent)

        } catch (e: Exception) {

            Toast.makeText(
                this,
                "Não foi possível abrir o telefone.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    // =========================================================
    // ESCONDER TECLADO
    // =========================================================

    private fun esconderTeclado() {

        val view =
            currentFocus ?: return

        val teclado =
            getSystemService(
                Context.INPUT_METHOD_SERVICE
            ) as InputMethodManager

        teclado.hideSoftInputFromWindow(
            view.windowToken,
            0
        )

        view.clearFocus()
    }

    override fun onDestroy() {

        handlerSOS.removeCallbacksAndMessages(null)

        super.onDestroy()
    }
}