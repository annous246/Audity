package com.backgroundloggerapp

import android.content.Context
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.app.Activity
import com.facebook.react.bridge.*

class ScreenRecorderModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ScreenRecorder"

    @ReactMethod
    fun requestPermission(promise: Promise) {
        promise.resolve(true) // no screen capture — audio only
    }

    @ReactMethod
    fun start(promise: Promise) {
        val intent = Intent(reactContext, ScreenRecordService::class.java)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O)
            reactContext.startForegroundService(intent)
        else
            reactContext.startService(intent)
        promise.resolve(true)
    }

    @ReactMethod
    fun stop(promise: Promise) {
        val intent = Intent(reactContext, ScreenRecordService::class.java)
        reactContext.stopService(intent)
        promise.resolve(true)
    }
}
