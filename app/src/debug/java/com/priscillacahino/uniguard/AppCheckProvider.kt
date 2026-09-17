package com.priscillacahino.uniguard

import com.google.firebase.appcheck.AppCheckProviderFactory
import com.google.firebase.appcheck.debug.DebugAppCheckProviderFactory

fun appCheckProviderFactory(): AppCheckProviderFactory =
    DebugAppCheckProviderFactory.getInstance()
