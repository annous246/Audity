package com.backgroundloggerapp

import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.content.Context
import android.media.AudioManager
import android.util.Log
import com.facebook.react.bridge.Promise

class SpeechModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "SpeechModule"
    private fun pauseBackgroundAudio() {
    val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as android.media.AudioManager

    am.requestAudioFocus(
        null,
        android.media.AudioManager.STREAM_MUSIC,
        android.media.AudioManager.AUDIOFOCUS_GAIN_TRANSIENT // Pauses other apps
    )
    
    }
    private fun resumeBackgroundAudio() {
    val am = reactContext.getSystemService(Context.AUDIO_SERVICE) as android.media.AudioManager
    am.abandonAudioFocus(null)
    }
    @ReactMethod
    fun startService() {
        //start speech service -> stop background audio
        pauseBackgroundAudio()
        val intent = Intent(reactContext, SpeechTranscribeService::class.java)
        reactContext.startForegroundService(intent)
    }

  /*  @ReactMethod
    fun stopService() {
        resumeBackgroundAudio()
        val intent = Intent(reactContext, SpeechTranscribeService::class.java)
        reactContext.stopService(intent)
    }*/
    @ReactMethod
    fun stopService(promise: Promise) {
    try {
        resumeBackgroundAudio()
        val intent = Intent(reactContext, SpeechTranscribeService::class.java)
        val stopped = reactContext.stopService(intent) // returns true if service was running
        promise.resolve(stopped)
    } catch (e: Exception) {
        promise.reject("STOP_ERROR", e)
    }
}
}
