package com.backgroundloggerapp

import android.app.*
import android.content.Context
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.util.Base64
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.ByteArrayOutputStream

@RequiresApi(Build.VERSION_CODES.LOLLIPOP)
class ScreenRecordService : Service() {

    private var isRecording = false
    private var recordingThread: Thread? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(1, createNotification())
        startStreamingAudio()
        return START_STICKY
    }

    private fun createNotification(): Notification {
        val channelId = "audio_stream_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Audio Stream",
                NotificationManager.IMPORTANCE_LOW
            )
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Streaming Microphone Audio")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .build()
    }

    private fun startStreamingAudio() {
        if (isRecording) return
        isRecording = true

        recordingThread = Thread {
            val sampleRate = 16000
            val bufferSize = AudioRecord.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )
            val audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                sampleRate,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize
            )

            val buffer = ByteArray(bufferSize)
            audioRecord.startRecording()

            val reactContext =
                (application as ReactApplication).reactNativeHost.reactInstanceManager.currentReactContext

            while (isRecording) {
                val read = audioRecord.read(buffer, 0, buffer.size)
                if (read > 0 && reactContext != null) {
                    val chunk = ByteArrayOutputStream().apply {
                        write(buffer, 0, read)
                    }.toByteArray()

                    val base64Chunk = Base64.encodeToString(chunk, Base64.NO_WRAP)
                    val map = Arguments.createMap().apply {
                        putString("chunk", base64Chunk)
                    }
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("AudioStreamData", base64Chunk)
                }
            }

            audioRecord.stop()
            audioRecord.release()
        }

        recordingThread?.start()
    }

    override fun onDestroy() {
        isRecording = false
        recordingThread?.interrupt()
        recordingThread = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
