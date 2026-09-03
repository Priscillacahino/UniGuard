plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.uniguard"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.uniguard"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = "11"
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
}
