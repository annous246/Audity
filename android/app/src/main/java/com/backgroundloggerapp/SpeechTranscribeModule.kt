package com.backgroundloggerapp

import android.content.Intent
import com.facebook.react.bridge.*

class SpeechTranscribeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SpeechTranscribe"

    @ReactMethod
    fun start(promise: Promise) {
        val intent = Intent(reactContext, SpeechTranscribeService::class.java)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O)
            reactContext.startForegroundService(intent)
        else
            reactContext.startService(intent)
        promise.resolve(true)
    }

    @ReactMethod
    fun stop(promise: Promise) {
        val intent = Intent(reactContext, SpeechTranscribeService::class.java)
        reactContext.stopService(intent)
        promise.resolve(true)
    }
}
