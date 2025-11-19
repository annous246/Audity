package com.backgroundloggerapp

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule

@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
class SpeechTranscribeService : Service() {

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(1, createNotification())
        startListening()
        return START_NOT_STICKY
    }

    private fun createNotification(): Notification {
        val channelId = "speech_transcribe_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Speech Transcription",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Listening for Speech")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .build()
    }

    private fun startListening() {
        if (isListening) return
        isListening = true

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        val recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }

        val reactContext =
            (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext

        val listener = object : RecognitionListener {
            override fun onResults(results: android.os.Bundle?) {
                val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
                text?.let { emitToJS(reactContext, it, false) }
                restartListening()
            }

            override fun onPartialResults(partialResults: android.os.Bundle?) {
                val text = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
                text?.let { emitToJS(reactContext, it, true) }
            }

            override fun onError(error: Int) {
                restartListening()
            }

            override fun onReadyForSpeech(params: android.os.Bundle?) {}
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {}
            override fun onEvent(eventType: Int, params: android.os.Bundle?) {}
        }

        speechRecognizer?.setRecognitionListener(listener)
        speechRecognizer?.startListening(recognizerIntent)
    }

    private fun restartListening() {
        speechRecognizer?.stopListening()
        speechRecognizer?.destroy()
        isListening = false
        startListening()
    }

    private fun emitToJS(reactContext: com.facebook.react.bridge.ReactContext?, text: String, partial: Boolean) {
        val event = if (partial) "TranscriptionPartial" else "TranscriptionResult"
        reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(event, text)
    }

    override fun onDestroy() {
        isListening = false
        speechRecognizer?.destroy()
        super.onDestroy()
          val reactContext = (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext
    reactContext?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        ?.emit("SpeechServiceStopped", true)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
