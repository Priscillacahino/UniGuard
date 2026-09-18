plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// O projeto continua compilando em modo demonstração antes da inclusão do
// google-services.json. Ao adicionar o arquivo do Firebase, a integração é ativada.
if (file("google-services.json").exists()) {
    apply(plugin = "com.google.gms.google-services")
}

android {
    namespace = "com.priscillacahino.uniguard"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.priscillacahino.uniguard"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.1.0"

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

    // 🗺️ Biblioteca Oficial do Google Maps para carregar os mapas na tela
    implementation("com.google.android.gms:play-services-maps:19.0.0")

    // Testes unitários básicos
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")

    // Provedores do Ktor Client para requisições HTTP
    implementation("io.ktor:ktor-client-android:2.3.11")
    implementation("io.ktor:ktor-client-core:2.3.11")

    // Backend compartilhado com o painel web
    implementation(platform("com.google.firebase:firebase-bom:34.2.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("com.google.firebase:firebase-storage")
    implementation("com.google.firebase:firebase-functions")
    implementation("com.google.firebase:firebase-appcheck-playintegrity")
    debugImplementation("com.google.firebase:firebase-appcheck-debug")
}
