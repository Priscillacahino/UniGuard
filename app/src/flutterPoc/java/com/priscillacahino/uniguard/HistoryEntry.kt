package com.priscillacahino.uniguard

import android.app.Activity
import android.content.Intent
import android.widget.Button

internal object HistoryEntry {
    fun bind(activity: Activity) {
        activity.findViewById<Button>(R.id.btnFlutterHistory).setOnClickListener {
            activity.startActivity(Intent(activity, FlutterHistoryActivity::class.java))
        }
    }
}
