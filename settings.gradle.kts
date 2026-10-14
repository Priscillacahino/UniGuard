pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        if (providers.gradleProperty("UNIGUARD_FLUTTER_POC").orNull == "true") {
            maven { url = uri("https://storage.googleapis.com/download.flutter.io") }
            maven { url = uri("flutter_history/build/host/outputs/repo") }
        }
    }
}

rootProject.name = "UniGuard"
include(":app")
 