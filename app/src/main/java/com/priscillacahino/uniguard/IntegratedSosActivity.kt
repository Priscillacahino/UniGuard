package com.priscillacahino.uniguard

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
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
import com.google.firebase.Timestamp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.appcheck.FirebaseAppCheck
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.functions.FirebaseFunctions
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.StorageMetadata
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class IntegratedSosActivity : AppCompatActivity() {
    private lateinit var numberInput: EditText
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var authStatusText: TextView
    private lateinit var statusText: TextView
    private lateinit var sosButton: Button
    private lateinit var loginButton: Button
    private lateinit var registerButton: Button
    private val preferences by lazy { getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE) }
    private val handler = Handler(Looper.getMainLooper())
    private val locationClient by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private var activeAlertId: String? = null
    private var currentPhoto: File? = null
    private var statusListener: ListenerRegistration? = null
    private var authStateListener: FirebaseAuth.AuthStateListener? = null
    private var institutionAuthorized = false
    private var longPressCompleted = false
    private val holdAction = Runnable {
        longPressCompleted = true
        sosButton.clearAnimation()
        triggerSos()
    }

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
        HistoryEntry.bind(this) // POC opt-in; não modifica o fluxo de SOS.
        numberInput = findViewById(R.id.edtNumeroEmergencia)
        emailInput = findViewById(R.id.edtEmail)
        passwordInput = findViewById(R.id.edtSenha)
        authStatusText = findViewById(R.id.txtAuthStatus)
        statusText = findViewById(R.id.txtAviso)
        sosButton = findViewById(R.id.btnSOS)
        loginButton = findViewById(R.id.btnEntrar)
        registerButton = findViewById(R.id.btnCriarConta)
        numberInput.setText(preferences.getString(KEY_NUMBER, ""))
        findViewById<Button>(R.id.btnSalvarNumero).setOnClickListener { saveNumber() }
        purgeExpiredLocalEvidence()
        configureAppCheck()
        configureAuthentication()
        configureSosButton()
    }

    private fun firebaseConfigured(): Boolean = FirebaseApp.getApps(this).isNotEmpty()

    private fun configureAppCheck() {
        if (!firebaseConfigured()) return
        FirebaseAppCheck.getInstance()
            .installAppCheckProviderFactory(appCheckProviderFactory())
    }

    private fun configureAuthentication() {
        if (!firebaseConfigured()) {
            authStatusText.text = "Modo local: configure o Firebase para autenticação institucional."
            loginButton.isEnabled = false
            registerButton.isEnabled = false
            return
        }

        loginButton.setOnClickListener { loginInstitutionalAccount() }
        registerButton.setOnClickListener { registerInstitutionalAccount() }

        val listener = FirebaseAuth.AuthStateListener { auth ->
            handleAuthState(auth.currentUser)
        }
        authStateListener = listener
        FirebaseAuth.getInstance().addAuthStateListener(listener)
        handleAuthState(FirebaseAuth.getInstance().currentUser)
    }

    private fun handleAuthState(user: FirebaseUser?) {
        if (user == null) {
            institutionAuthorized = false
            authStatusText.text = "Faça login com e-mail verificado e vínculo institucional ativo."
            return
        }
        if (!user.isEmailVerified) {
            institutionAuthorized = false
            user.sendEmailVerification().addOnCompleteListener {
                FirebaseAuth.getInstance().signOut()
                authStatusText.text = "Confirme o e-mail recebido antes de usar o SOS."
            }
            return
        }
        verifyInstitutionalMembership(user)
    }

    private fun verifyInstitutionalMembership(user: FirebaseUser) {
        FirebaseFirestore.getInstance()
            .collection(MEMBERSHIPS)
            .document(user.uid)
            .get()
            .addOnSuccessListener { membership ->
                val active = membership.exists()
                    && membership.getBoolean("active") == true
                    && membership.getString("institutionId") == BuildConfig.INSTITUTION_ID
                institutionAuthorized = active
                if (active) {
                    authStatusText.text = "Conta verificada e vinculada à UFPB."
                } else {
                    FirebaseAuth.getInstance().signOut()
                    authStatusText.text = "Vínculo ainda não aprovado pela instituição."
                }
            }
            .addOnFailureListener {
                institutionAuthorized = false
                authStatusText.text = "Não foi possível validar o vínculo institucional."
            }
    }

    private fun loginInstitutionalAccount() {
        val email = emailInput.text.toString().trim().lowercase(Locale.ROOT)
        val password = passwordInput.text.toString()
        if (!email.contains("@") || password.length < 8) {
            authStatusText.text = "Informe e-mail válido e senha com pelo menos 8 caracteres."
            return
        }

        loginButton.isEnabled = false
        FirebaseAuth.getInstance()
            .signInWithEmailAndPassword(email, password)
            .addOnSuccessListener { credential ->
                val user = credential.user
                if (user == null) {
                    authStatusText.text = "Não foi possível carregar a conta."
                    return@addOnSuccessListener
                }
                if (!user.isEmailVerified) {
                    user.sendEmailVerification()
                    FirebaseAuth.getInstance().signOut()
                    authStatusText.text = "E-mail ainda não confirmado. Enviamos um novo link."
                } else {
                    verifyInstitutionalMembership(user)
                }
            }
            .addOnFailureListener {
                authStatusText.text = "Credenciais inválidas ou conta sem vínculo aprovado."
            }
            .addOnCompleteListener {
                loginButton.isEnabled = true
            }
    }

    private fun registerInstitutionalAccount() {
        val email = emailInput.text.toString().trim().lowercase(Locale.ROOT)
        val password = passwordInput.text.toString()
        if (!email.contains("@") || password.length < 8) {
            authStatusText.text = "Informe e-mail válido e senha com pelo menos 8 caracteres."
            return
        }

        registerButton.isEnabled = false
        FirebaseAuth.getInstance()
            .createUserWithEmailAndPassword(email, password)
            .addOnSuccessListener { credential ->
                val user = credential.user
                if (user == null) {
                    authStatusText.text = "Não foi possível criar a conta."
                    return@addOnSuccessListener
                }
                user.sendEmailVerification()
                    .addOnSuccessListener {
                        FirebaseAuth.getInstance().signOut()
                        authStatusText.text = "Conta criada. Confirme o e-mail e aguarde a aprovação institucional."
                    }
                    .addOnFailureListener {
                        FirebaseAuth.getInstance().signOut()
                        authStatusText.text = "Conta criada, mas o e-mail de confirmação não pôde ser enviado."
                    }
            }
            .addOnFailureListener {
                authStatusText.text = "Não foi possível criar a conta; o e-mail pode já estar cadastrado."
            }
            .addOnCompleteListener {
                registerButton.isEnabled = true
            }
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
                    handler.postDelayed(holdAction, HOLD_DURATION_MS)
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    handler.removeCallbacks(holdAction)
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
        if (BuildConfig.FLUTTER_HISTORY_ENABLED) {
            statusText.text = "Demonstração: o envio de alertas está desativado nesta POC."
            return
        }
        if (preferences.getString(KEY_NUMBER, "").isNullOrBlank()) {
            statusText.text = "Cadastre um número de emergência"
            return
        }
        if (firebaseConfigured() && (!institutionAuthorized || FirebaseAuth.getInstance().currentUser?.isEmailVerified != true)) {
            statusText.text = "Faça login com e-mail verificado antes de acionar o SOS"
            return
        }
        if (!canDispatchAlert()) return

        statusText.text = "SOS acionado. Enviando alerta..."
        if (!hasPermission(Manifest.permission.SEND_SMS)) smsPermission.launch(Manifest.permission.SEND_SMS)
        else requestLocationAndDispatch()
    }

    private fun canDispatchAlert(): Boolean {
        if (activeAlertId != null) {
            statusText.text = "Já existe um alerta ativo; aguarde a central."
            return false
        }
        val now = System.currentTimeMillis()
        val recent = alertTimestamps(now)
        if (recent.size >= MAX_ALERTS_PER_WINDOW) {
            val retrySeconds = ((recent.minOrNull()!! + ALERT_WINDOW_MS - now) / 1000L).coerceAtLeast(1L)
            statusText.text = "Limite de alertas atingido. Tente novamente em ${((retrySeconds + 59) / 60)} min."
            return false
        }
        val latest = recent.maxOrNull()
        if (latest != null && now - latest < ALERT_COOLDOWN_MS) {
            val retrySeconds = ((ALERT_COOLDOWN_MS - (now - latest)) / 1000L).coerceAtLeast(1L)
            statusText.text = "Aguarde ${retrySeconds}s antes de emitir outro alerta."
            return false
        }
        return true
    }

    private fun alertTimestamps(now: Long): List<Long> {
        return preferences.getString(KEY_ALERT_TIMESTAMPS, "")
            .orEmpty()
            .split(",")
            .mapNotNull { it.toLongOrNull() }
            .filter { it >= now - ALERT_WINDOW_MS }
    }

    private fun recordAlertTimestamp() {
        val now = System.currentTimeMillis()
        val values = (alertTimestamps(now) + now).takeLast(MAX_ALERTS_PER_WINDOW + 1)
        preferences.edit().putString(KEY_ALERT_TIMESTAMPS, values.joinToString(",")).apply()
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
        if (!canDispatchAlert()) return

        val id = UUID.randomUUID().toString()
        activeAlertId = id
        recordAlertTimestamp()
        val now = isoDate(System.currentTimeMillis())
        val authenticatedUid = if (firebaseConfigured()) {
            FirebaseAuth.getInstance().currentUser?.uid
        } else {
            null
        }
        val userId = authenticatedUid ?: deviceUserId()
        val alert = hashMapOf<String, Any?>(
            "id" to id,
            "institutionId" to BuildConfig.INSTITUTION_ID,
            "protocolNumber" to "SOS-${id.take(8).uppercase(Locale.ROOT)}",
            "userId" to userId,
            "userProfile" to mapOf(
                "id" to userId,
                "institutionId" to BuildConfig.INSTITUTION_ID,
                "name" to "Usuário do aplicativo Android",
                "documentNumber" to "Não informado",
                "role" to "estudante",
                "phone" to "Não informado",
                "email" to if (firebaseConfigured()) {
                    FirebaseAuth.getInstance().currentUser?.email.orEmpty()
                } else {
                    ""
                },
                "emergencyContactName" to "Contato de emergência",
                "emergencyContactPhone" to preferences.getString(KEY_NUMBER, ""),
                "emergencyContactRelation" to "Não informado",
                "department" to "Não informado",
                "registeredAt" to now,
            ),
            "category" to "urgencia_geral",
            "status" to "pendente",
            "receiptStatus" to "aguardando_central",
            "createdAt" to now,
            "updatedAt" to now,
            "retentionExpiresAt" to Timestamp(Date(System.currentTimeMillis() + ALERT_RETENTION_DAYS * DAY_MS)),
            "location" to mapOf("lat" to latitude, "lng" to longitude, "accuracy" to accuracy),
            "locationName" to "Localização enviada pelo Android",
            "isInsideCampus" to false,
            "campusId" to BuildConfig.DEFAULT_CAMPUS_ID,
            "campusName" to BuildConfig.DEFAULT_CAMPUS_NAME,
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
        if (!firebaseConfigured()) {
            toast("Modo local: configure o Firebase para conectar à central")
            return
        }

        val currentUser = FirebaseAuth.getInstance().currentUser
        if (currentUser == null || !currentUser.isEmailVerified || !institutionAuthorized) {
            activeAlertId = null
            statusText.text = "Alerta local enviado, mas falta autenticação institucional."
            return
        }

        val id = activeAlertId ?: return
        val authenticatedAlert = alert.toMutableMap().apply {
            put("authUid", currentUser.uid)
            put("institutionId", BuildConfig.INSTITUTION_ID)
        }
        if (BuildConfig.USE_TRUSTED_BACKEND) {
            val location = authenticatedAlert["location"] as? Map<*, *>
            val userProfile = authenticatedAlert["userProfile"] as? Map<*, *>
            val payload = hashMapOf<String, Any?>(
                "id" to id,
                "category" to authenticatedAlert["category"],
                "userName" to userProfile?.get("name"),
                "role" to userProfile?.get("role"),
                "location" to mapOf(
                    "lat" to location?.get("lat"),
                    "lng" to location?.get("lng"),
                ),
                "locationName" to authenticatedAlert["locationName"],
                "isInsideCampus" to authenticatedAlert["isInsideCampus"],
                "source" to "android",
            )
            FirebaseFunctions.getInstance()
                .getHttpsCallable("createEmergencyAlert")
                .call(payload)
                .addOnSuccessListener { listenForStatus(id) }
                .addOnFailureListener {
                    activeAlertId = null
                    statusText.text = "SMS enviado, mas o backend institucional está indisponível."
                }
            return
        }

        val firestore = FirebaseFirestore.getInstance()
        val alertReference = firestore.collection(ALERTS).document(id)
        val auditReference = firestore.collection(AUDIT_LOGS).document()
        val now = isoDate(System.currentTimeMillis())
        val audit = mapOf(
            "id" to auditReference.id,
            "institutionId" to BuildConfig.INSTITUTION_ID,
            "alertId" to id,
            "actorUid" to currentUser.uid,
            "actorType" to "user",
            "eventType" to "alert_created",
            "createdAt" to now,
            "retentionExpiresAt" to Timestamp(Date(System.currentTimeMillis() + AUDIT_RETENTION_DAYS * DAY_MS)),
            "metadata" to mapOf("source" to "android"),
        )

        firestore.runBatch { batch ->
            batch.set(alertReference, authenticatedAlert)
            batch.set(auditReference, audit)
        }.addOnSuccessListener {
            listenForStatus(id)
        }.addOnFailureListener {
            statusText.text = "SMS enviado, mas a central está indisponível."
        }
    }

    private fun listenForStatus(alertId: String) {
        statusListener?.remove()
        statusListener = FirebaseFirestore.getInstance().collection(ALERTS).document(alertId)
            .addSnapshotListener { snapshot, _ ->
                val status = snapshot?.getString("status")
                val receipt = snapshot?.getString("receiptStatus")
                val centralReceiptAt = snapshot?.getString("centralReceiptAt")
                statusText.text = when {
                    receipt == "recebido_pela_central" || centralReceiptAt != null ->
                        "Central confirmou o recebimento. Aguardando atendimento."
                    status == "em_deslocamento" -> "Central confirmou: equipe em deslocamento"
                    status == "no_local" -> "Equipe chegou ao local"
                    status == "resolvido" -> "Ocorrência encerrada"
                    status == "cancelado_usuario" -> "Ocorrência cancelada"
                    status == "pendente" -> "Alerta enviado; aguardando confirmação da central"
                    else -> return@addSnapshotListener
                }
                if (status == "resolvido" || status == "cancelado_usuario") {
                    activeAlertId = null
                    statusListener?.remove()
                    statusListener = null
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
        if (!firebaseConfigured()) return
        val user = FirebaseAuth.getInstance().currentUser ?: return
        val reference = FirebaseStorage.getInstance().reference.child("emergency-evidence/$id/evidence.jpg")
        val metadata = StorageMetadata.Builder()
            .setContentType("image/jpeg")
            .build()
        reference.putFile(Uri.fromFile(photo), metadata).continueWithTask { reference.downloadUrl }
            .addOnSuccessListener { url ->
                val firestore = FirebaseFirestore.getInstance()
                val alertReference = firestore.collection(ALERTS).document(id)
                val auditReference = firestore.collection(AUDIT_LOGS).document()
                val now = isoDate(System.currentTimeMillis())
                val audit = mapOf(
                    "id" to auditReference.id,
                    "institutionId" to BuildConfig.INSTITUTION_ID,
                    "alertId" to id,
                    "actorUid" to user.uid,
                    "actorType" to "user",
                    "eventType" to "evidence_uploaded",
                    "createdAt" to now,
                    "retentionExpiresAt" to Timestamp(Date(System.currentTimeMillis() + AUDIT_RETENTION_DAYS * DAY_MS)),
                    "metadata" to mapOf("source" to "android_camera"),
                )
                firestore.runBatch { batch ->
                    batch.update(
                        alertReference,
                        mapOf(
                            "photoUrl" to url.toString(),
                            "photoCapturedAt" to now,
                            "photoSource" to "camera_automatica",
                            "updatedAt" to now,
                        ),
                    )
                    batch.set(auditReference, audit)
                }.addOnSuccessListener {
                    photo.delete()
                    currentPhoto = null
                }
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
            toast("SMS de emergência enviado")
        } catch (_: Exception) {
            toast("Não foi possível enviar o SMS")
        }
    }

    private fun purgeExpiredLocalEvidence() {
        val folder = File(getExternalFilesDir(Environment.DIRECTORY_PICTURES), "UniGuard")
        val cutoff = System.currentTimeMillis() - LOCAL_EVIDENCE_RETENTION_DAYS * DAY_MS
        folder.listFiles()?.filter { it.isFile && it.lastModified() < cutoff }?.forEach { it.delete() }
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
        if (firebaseConfigured()) {
            authStateListener?.let { FirebaseAuth.getInstance().removeAuthStateListener(it) }
        }
        super.onDestroy()
    }

    companion object {
        private const val PREFERENCES = "UniGuardPrefs"
        private const val KEY_NUMBER = "numero_emergencia"
        private const val KEY_USER_ID = "device_user_id"
        private const val KEY_ALERT_TIMESTAMPS = "alert_timestamps"
        private const val MEMBERSHIPS = "memberships"
        private const val ALERTS = "emergencyAlerts"
        private const val AUDIT_LOGS = "auditLogs"
        private const val HOLD_DURATION_MS = 2_000L
        private const val LOCATION_TIMEOUT_MS = 10_000L
        private const val MAX_ALERTS_PER_WINDOW = 3
        private const val ALERT_WINDOW_MS = 30 * 60 * 1000L
        private const val ALERT_COOLDOWN_MS = 60 * 1000L
        private const val ALERT_RETENTION_DAYS = 90L
        private const val AUDIT_RETENTION_DAYS = 365L
        private const val LOCAL_EVIDENCE_RETENTION_DAYS = 7L
        private const val DAY_MS = 24 * 60 * 60 * 1000L
        internal fun sanitizeNumber(value: String) = value.replace(Regex("[^0-9+]"), "")
        internal fun isValidNumber(value: String) = value.matches(Regex("^\\+?[0-9]{10,15}$"))
    }
}
