package com.example.uniguard

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.telephony.SmsManager
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.google.android.gms.location.CurrentLocationRequest
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.storage.FirebaseStorage
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class IntegratedSosActivity : AppCompatActivity() {
    private lateinit var numberInput: EditText
    private lateinit var statusText: TextView
    private lateinit var sosButton: Button
    private val preferences by lazy { getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE) }
    private val handler = Handler(Looper.getMainLooper())
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var activeAlertId: String? = null
    private var currentPhoto: File? = null
    private var statusListener: ListenerRegistration? = null
    private var longPressCompleted = false

    private val smsPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) {
        requestLocationAndDispatch()
    }
    private val locationPermission = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) {
        if (it.values.any { granted -> granted }) requestLocationAndDispatch()
        else dispatchAlert(null, null, null)
    }
    private val cameraPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { allowed ->
        if (allowed) openCamera() else toast("Alerta enviado sem fotografia")
    }
    private val takePicture = registerForActivityResult(ActivityResultContracts.TakePicture()) { saved ->
        if (saved) uploadEvidence() else currentPhoto?.delete()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sos)
        numberInput = findViewById(R.id.edtNumeroEmergencia)
        statusText = findViewById(R.id.txtAviso)
        sosButton = findViewById(R.id.btnSOS)
        numberInput.setText(preferences.getString(KEY_NUMBER, ""))
        findViewById<Button>(R.id.btnSalvarNumero).setOnClickListener { saveNumber() }
        configureSosButton()
    }

    private fun saveNumber() {
        val number = sanitizeNumber(numberInput.text.toString())
        if (!isValidNumber(number)) {
            numberInput.error = "Digite um número válido com DDD"
            return
        }
        preferences.edit().putString(KEY_NUMBER, number).apply()
        (getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager)
            .hideSoftInputFromWindow(numberInput.windowToken, 0)
        numberInput.clearFocus()
        toast("Número de emergência salvo")
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun configureSosButton() {
        val pulse = AnimationUtils.loadAnimation(this, R.anim.pulsa_botao)
        sosButton.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    longPressCompleted = false
                    sosButton.startAnimation(pulse)
                    statusText.text = "Continue pressionando..."
                    handler.postDelayed({
                        longPressCompleted = true
                        sosButton.clearAnimation()
                        triggerSos()
                    }, HOLD_DURATION_MS)
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    handler.removeCallbacksAndMessages(null)
                    sosButton.clearAnimation()
                    if (!longPressCompleted) statusText.text = "Mantenha pressionado por 2 segundos"
                    view.performClick()
                    true
                }
                else -> false
            }
        }
    }

    private fun triggerSos() {
        if (preferences.getString(KEY_NUMBER, "").isNullOrBlank()) {
            statusText.text = "Cadastre um número de emergência"
            return
        }
        statusText.text = "SOS acionado. Enviando alerta..."
        if (!hasPermission(Manifest.permission.SEND_SMS)) smsPermission.launch(Manifest.permission.SEND_SMS)
        else requestLocationAndDispatch()
    }

    @SuppressLint("MissingPermission")
    private fun requestLocationAndDispatch() {
        if (!hasPermission(Manifest.permission.ACCESS_FINE_LOCATION) &&
            !hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)) {
            locationPermission.launch(arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
            ))
            return
        }
        val cancellation = CancellationTokenSource()
        handler.postDelayed({ cancellation.cancel() }, LOCATION_TIMEOUT_MS)
        val request = CurrentLocationRequest.Builder()
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
            .setDurationMillis(LOCATION_TIMEOUT_MS)
            .setMaxUpdateAgeMillis(30_000)
            .build()
        locationClient.getCurrentLocation(request, cancellation.token)
            .addOnSuccessListener { dispatchAlert(it?.latitude, it?.longitude, it?.accuracy) }
            .addOnFailureListener { dispatchAlert(null, null, null) }
    }

    private fun dispatchAlert(latitude: Double?, longitude: Double?, accuracy: Float?) {
        if (activeAlertId != null) return
        val id = UUID.randomUUID().toString()
        activeAlertId = id
        val now = isoDate(System.currentTimeMillis())
        val alert = hashMapOf<String, Any?>(
            "id" to id,
            "protocolNumber" to "SOS-${id.take(8).uppercase()}",
            "userId" to deviceUserId(),
            "userProfile" to mapOf(
                "id" to deviceUserId(),
                "name" to "Usuário do aplicativo Android",
                "documentNumber" to "Não informado",
                "role" to "estudante",
                "phone" to "Não informado",
                "email" to "Não informado",
                "emergencyContactName" to "Contato de emergência",
                "emergencyContactPhone" to preferences.getString(KEY_NUMBER, ""),
                "emergencyContactRelation" to "Não informado",
                "department" to "Não informado",
                "registeredAt" to now,
            ),
            "category" to "urgencia_geral",
            "status" to "pendente",
            "createdAt" to now,
            "updatedAt" to now,
            "location" to mapOf("lat" to latitude, "lng" to longitude, "accuracy" to accuracy),
            "locationName" to "Localização enviada pelo Android",
            "isInsideCampus" to false,
            "campusId" to "campus_1_joao_pessoa",
            "campusName" to "Campus I - João Pessoa",
            "signalLost" to (latitude == null),
            "lastSignalTimestamp" to now,
            "source" to "android",
        )
        sendSms(latitude, longitude)
        publishToFirebase(alert)
        statusText.text = "Alerta enviado. Aguardando confirmação..."
        offerPhoto()
    }

    private fun publishToFirebase(alert: Map<String, Any?>) {
        if (FirebaseApp.getApps(this).isEmpty()) {
            toast("Modo local: configure o Firebase para conectar à central")
            return
        }
        val publish = {
            val authenticatedAlert = alert.toMutableMap().apply {
                put("authUid", FirebaseAuth.getInstance().currentUser?.uid)
            }
            FirebaseFirestore.getInstance().collection(ALERTS).document(activeAlertId!!)
                .set(authenticatedAlert)
                .addOnSuccessListener { listenForStatus(activeAlertId!!) }
                .addOnFailureListener { toast("SMS enviado, mas a central está indisponível") }
        }
        val auth = FirebaseAuth.getInstance()
        if (auth.currentUser != null) publish()
        else auth.signInAnonymously().addOnSuccessListener { publish() }
            .addOnFailureListener { toast("Não foi possível autenticar na central") }
    }

    private fun listenForStatus(alertId: String) {
        statusListener?.remove()
        statusListener = FirebaseFirestore.getInstance().collection(ALERTS).document(alertId)
            .addSnapshotListener { snapshot, _ ->
                statusText.text = when (snapshot?.getString("status")) {
                    "em_deslocamento" -> "Central confirmou: equipe em deslocamento"
                    "no_local" -> "Equipe chegou ao local"
                    "resolvido" -> "Ocorrência encerrada"
                    "cancelado_usuario" -> "Ocorrência cancelada"
                    "pendente" -> "Alerta recebido pela central"
                    else -> return@addSnapshotListener
                }
            }
    }

    private fun offerPhoto() {
        if (!packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)) return
        if (hasPermission(Manifest.permission.CAMERA)) openCamera()
        else cameraPermission.launch(Manifest.permission.CAMERA)
    }

    private fun openCamera() {
        try {
            val folder = File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), "UniGuard")
            check(folder.exists() || folder.mkdirs())
            currentPhoto = File(folder, "SOS_${System.currentTimeMillis()}.jpg")
            val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", currentPhoto!!)
            takePicture.launch(uri)
        } catch (_: Exception) {
            toast("Alerta enviado sem fotografia")
        }
    }

    private fun uploadEvidence() {
        val id = activeAlertId ?: return
        val photo = currentPhoto ?: return
        if (FirebaseApp.getApps(this).isEmpty()) return
        val reference = FirebaseStorage.getInstance().reference.child("emergency-evidence/$id.jpg")
        reference.putFile(Uri.fromFile(photo)).continueWithTask { reference.downloadUrl }
            .addOnSuccessListener { url ->
                FirebaseFirestore.getInstance().collection(ALERTS).document(id)
                    .update("photoUrl", url.toString(), "photoCapturedAt", isoDate(System.currentTimeMillis()))
            }
            .addOnFailureListener { toast("Foto mantida somente neste aparelho") }
    }

    private fun sendSms(latitude: Double?, longitude: Double?) {
        if (!hasPermission(Manifest.permission.SEND_SMS)) return
        val number = preferences.getString(KEY_NUMBER, "") ?: return
        val location = if (latitude != null && longitude != null)
            "https://maps.google.com/?q=$latitude,$longitude" else "Localização indisponível"
        try {
            val manager = getSystemService(SmsManager::class.java)
            val message = "ALERTA SOS - UniGuard\nPreciso de ajuda.\n$location"
            manager.sendMultipartTextMessage(number, null, manager.divideMessage(message), null, null)
            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))
        } catch (_: Exception) {
            toast("Não foi possível enviar o SMS")
        }
    }

    private fun deviceUserId(): String {
        preferences.getString(KEY_USER_ID, null)?.let { return it }
        return UUID.randomUUID().toString().also {
            preferences.edit().putString(KEY_USER_ID, it).apply()
        }
    }

    private fun hasPermission(permission: String) =
        ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    private fun toast(message: String) = Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    private fun isoDate(time: Long) =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.ROOT).format(Date(time))

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        statusListener?.remove()
        super.onDestroy()
    }

    companion object {
        private const val PREFERENCES = "UniGuardPrefs"
        private const val KEY_NUMBER = "numero_emergencia"
        private const val KEY_USER_ID = "device_user_id"
        private const val ALERTS = "emergencyAlerts"
        private const val HOLD_DURATION_MS = 2_000L
        private const val LOCATION_TIMEOUT_MS = 10_000L
        internal fun sanitizeNumber(value: String) = value.replace(Regex("[^0-9+]"), "")
        internal fun isValidNumber(value: String) = value.matches(Regex("^\\+?[0-9]{10,15}$"))
    }
}
