plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// O projeto continua compilando em modo demonstração antes da inclusão do
// google-services.json. Ao adicionar o arquivo do Firebase, a integração é ativada.
if (file("google-services.json").exists() &&
    providers.gradleProperty("UNIGUARD_FLUTTER_POC").orNull != "true") {
    apply(plugin = "com.google.gms.google-services")
}

android {
    namespace = "com.priscillacahino.uniguard"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.priscillacahino.uniguard"
        minSdk = 24
        targetSdk = 35
        versionCode = 9
        versionName = "0.9.0"

        val useTrustedBackend = (project.findProperty("UNIGUARD_USE_TRUSTED_BACKEND")?.toString() ?: "false").toBoolean()
        val institutionId = project.findProperty("UNIGUARD_INSTITUTION_ID")?.toString()?.takeIf { it.isNotBlank() } ?: "ufpb-demo"
        val defaultCampusId = project.findProperty("UNIGUARD_DEFAULT_CAMPUS_ID")?.toString()?.takeIf { it.isNotBlank() } ?: "campus_1_joao_pessoa"
        val defaultCampusName = project.findProperty("UNIGUARD_DEFAULT_CAMPUS_NAME")?.toString()?.takeIf { it.isNotBlank() } ?: "Campus I - João Pessoa"

        fun quoted(value: String) = "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

        buildConfigField("boolean", "USE_TRUSTED_BACKEND", useTrustedBackend.toString())
        buildConfigField("String", "INSTITUTION_ID", quoted(institutionId))
        buildConfigField("String", "DEFAULT_CAMPUS_ID", quoted(defaultCampusId))
        buildConfigField("String", "DEFAULT_CAMPUS_NAME", quoted(defaultCampusName))

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Componentes core estáveis do Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.activity:activity-ktx:1.8.2")

    // Interface gráfica nativa sem dependências cruzadas pesadas
    implementation("com.google.android.material:material:1.10.0")

    // Módulo oficial de GPS para o botão SOS do UniGuard
    implementation("com.google.android.gms:play-services-location:21.0.1")

    // Testes unitários básicos
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")

    // Backend compartilhado com o painel web
    implementation(platform("com.google.firebase:firebase-bom:34.2.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-functions")
    implementation("com.google.firebase:firebase-appcheck-playintegrity")
    debugImplementation("com.google.firebase:firebase-appcheck-debug")
}

// Prova de conceito opt-in; o build padrão permanece Kotlin.
val flutterPocEnabled = providers.gradleProperty("UNIGUARD_FLUTTER_POC").orNull == "true"
android {
    buildFeatures { buildConfig = true }
    defaultConfig {
        buildConfigField("boolean", "FLUTTER_HISTORY_ENABLED", flutterPocEnabled.toString())
        if (flutterPocEnabled) {
            applicationIdSuffix = ".flutterpoc"
            versionNameSuffix = "-flutter-poc"
            ndk { abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86_64") }
        }
    }
    if (flutterPocEnabled) {
        sourceSets.getByName("debug").res.srcDir("src/flutterPoc/res")
        sourceSets.getByName("release").res.srcDir("src/flutterPoc/res")
    }
    sourceSets.getByName("main") {
        java.srcDir(if (flutterPocEnabled) "src/flutterPoc/java" else "src/nativeOnly/java")
        if (flutterPocEnabled) manifest.srcFile("src/flutterPoc/AndroidManifest.xml")
    }
}
if (flutterPocEnabled) {
    dependencies {
        add("debugImplementation", "com.priscillacahino.uniguardpoc.uniguard_history:flutter_debug:1.0.0")
        add("releaseImplementation", "com.priscillacahino.uniguardpoc.uniguard_history:flutter_release:1.0.0")
    }
}
