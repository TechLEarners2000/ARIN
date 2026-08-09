package com.arin

import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.media.AudioManager
import android.net.Uri
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.provider.ContactsContract
import android.provider.MediaStore
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.Voice
import android.telephony.SmsManager
import java.util.Locale
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.hoho.android.usbserial.driver.CommonUsbSerialPort
import com.hoho.android.usbserial.driver.UsbSerialProber
import android.os.Handler
import android.os.Looper

class ArinNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ArinNative"

  // ---------------- Torch ----------------

  @ReactMethod
  fun setTorch(enabled: Boolean, promise: Promise) {
    val ctx = reactApplicationContext
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      promise.reject("UNSUPPORTED", "Torch requires Android 6.0+.")
      return
    }
    try {
      val manager = ctx.getSystemService(Context.CAMERA_SERVICE) as CameraManager
      val cameraId = manager.cameraIdList.firstOrNull { id ->
        val characteristics = manager.getCameraCharacteristics(id)
        characteristics.get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_BACK
      } ?: manager.cameraIdList.firstOrNull()
      if (cameraId == null) {
        promise.reject("NO_CAMERA", "No camera found.")
        return
      }
      manager.setTorchMode(cameraId, enabled)
      promise.resolve(enabled)
    } catch (e: Exception) {
      promise.reject("TORCH_FAILED", e.message)
    }
  }

  // ---------------- Open Camera ----------------

  @ReactMethod
  fun openCamera(promise: Promise) {
    val ctx = reactApplicationContext
    val intent = Intent(MediaStore.INTENT_ACTION_STILL_IMAGE_CAMERA).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      ctx.startActivity(intent)
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("CAMERA_OPEN_FAILED", e.message)
    }
  }

  // ---------------- Direct Call ----------------

  @ReactMethod
  fun callPhone(target: String, promise: Promise) {
    val ctx = reactApplicationContext
    val resolved = try {
      resolveContact(ctx, target)
    } catch (se: SecurityException) {
      promise.reject("CONTACT_PERMISSION", "READ_CONTACTS permission not granted — give a phone number instead.")
      return
    }
    if (resolved == null) {
      promise.reject("CONTACT_NOT_FOUND", "No contact found matching \"$target\".")
      return
    }
    val uri = Uri.parse("tel:${Uri.encode(resolved.number)}")
    try {
      val intent = Intent(Intent.ACTION_CALL, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
      promise.resolve(true)    } catch (e: Throwable) {
      // Fall back to the dialer if CALL_PHONE isn't granted.
      try {
        val dialIntent = Intent(Intent.ACTION_DIAL, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(dialIntent)
        promise.resolve(false)
      } catch (e2: Throwable) {
        promise.reject("CALL_FAILED", e2.message)
      }
    }
  }

  // ---------------- Direct SMS ----------------

  @ReactMethod
  fun sendSms(target: String, message: String, promise: Promise) {
    val ctx = reactApplicationContext
    val resolved = try {
      resolveContact(ctx, target)
    } catch (se: SecurityException) {
      promise.reject("CONTACT_PERMISSION", "READ_CONTACTS permission not granted — give a phone number instead.")
      return
    }
    if (resolved == null) {
      promise.reject("CONTACT_NOT_FOUND", "No contact found matching \"$target\".")
      return
    }
    try {
      val manager = SmsManager.getDefault()
      manager.sendTextMessage(resolved.number, null, message, null, null)
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("SMS_FAILED", e.message)
    }
  }

  // ---------------- Installed Apps ----------------

  @ReactMethod
  fun getInstalledApps(promise: Promise) {
    val ctx = reactApplicationContext
    val array: WritableArray = Arguments.createArray()

    val apps = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      ctx.packageManager.getInstalledApplications(PackageManager.ApplicationInfoFlags.of(0L))
    } else {
      @Suppress("DEPRECATION")
      ctx.packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
    }

    for (app in apps) {
      // Only include user-launchable apps (those with a launcher intent).
      if (ctx.packageManager.getLaunchIntentForPackage(app.packageName) != null) {
        val map: WritableMap = Arguments.createMap()
        val label = ctx.packageManager.getApplicationLabel(app)?.toString() ?: app.packageName
        map.putString("label", label)
        map.putString("packageName", app.packageName)
        array.pushMap(map)
      }
    }

    promise.resolve(array)
  }

  // ---------------- Contact Names (names only — numbers never leave device) ----------------

  @ReactMethod
  fun getContactNames(promise: Promise) {
    val ctx = reactApplicationContext
    val names = try {
      queryContacts(ctx)
    } catch (se: SecurityException) {
      promise.reject("CONTACT_PERMISSION", "READ_CONTACTS permission not granted.")
      return
    }
    val array: WritableArray = Arguments.createArray()
    val seen = mutableSetOf<String>()
    for (contact in names) {
      val name = contact.name.trim()
      if (name.isNotEmpty() && seen.add(name.lowercase())) {
        array.pushString(name)
      }
    }
    promise.resolve(array)
  }

  // ---------------- Launch App by name or package ----------------

  @ReactMethod
  fun launchApp(target: String, promise: Promise) {
    val ctx = reactApplicationContext
    val resolved = resolveApp(ctx, target)
    val intent = if (resolved != null) {
      ctx.packageManager.getLaunchIntentForPackage(resolved)
    } else {
      null
    }
    if (intent == null) {
      promise.reject("APP_NOT_FOUND", "No app found matching \"$target\"")
      return
    }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    try {
      ctx.startActivity(intent)
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("LAUNCH_FAILED", e.message)
    }
  }

  // ---------------- Wi-Fi Toggle & Fallback Settings ----------------

  @ReactMethod
  fun setWifi(enabled: Boolean, promise: Promise) {
    val ctx = reactApplicationContext
    try {
      @Suppress("DEPRECATION")
      val wifiManager = ctx.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
      @Suppress("DEPRECATION")
      val success = wifiManager?.setWifiEnabled(enabled) ?: false
      if (success) {
        promise.resolve("TOGGLED_DIRECTLY")
        return
      }
    } catch (_: Throwable) {
      // Fall through to open settings panel on Android 10+ or restricted devices
    }

    try {
      val intent = Intent(Settings.ACTION_WIFI_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
      promise.resolve("OPENED_SETTINGS")
    } catch (e: Throwable) {
      promise.reject("WIFI_FAILED", e.message)
    }
  }

  // ---------------- Bluetooth Toggle & Fallback Settings ----------------

  @ReactMethod
  fun setBluetooth(enabled: Boolean, promise: Promise) {
    val ctx = reactApplicationContext
    try {
      @Suppress("DEPRECATION")
      val adapter = BluetoothAdapter.getDefaultAdapter()
      if (adapter != null) {
        @Suppress("DEPRECATION")
        val success = if (enabled) adapter.enable() else adapter.disable()
        if (success) {
          promise.resolve("TOGGLED_DIRECTLY")
          return
        }
      }
    } catch (_: Throwable) {
      // Fall through to Bluetooth Settings
    }

    try {
      val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
      promise.resolve("OPENED_SETTINGS")
    } catch (e: Throwable) {
      promise.reject("BLUETOOTH_FAILED", e.message)
    }
  }

  // ---------------- Open Settings Screen ----------------

  @ReactMethod
  fun openSettings(target: String, promise: Promise) {
    val ctx = reactApplicationContext
    val trimmedTarget = target.lowercase().trim()

    // Check if opening App Info for a specific app (e.g. "spotify app info", "whatsapp", "camera app info")
    val isAppInfoRequest = trimmedTarget.contains("app info") || trimmedTarget.contains("app_info") || trimmedTarget.startsWith("app ")
    val cleanAppName = trimmedTarget.replace("app info", "").replace("app_info", "").replace("app", "").trim()

    var targetPackageName: String? = null
    if (isAppInfoRequest && cleanAppName.isNotEmpty()) {
      targetPackageName = resolveApp(ctx, cleanAppName)
    } else if (!isAppInfoRequest && !listOf("wifi", "bluetooth", "nfc", "airplane", "location", "gps", "display", "brightness", "battery", "power", "developer", "dev", "sound", "volume", "storage", "hotspot", "tethering", "settings").contains(trimmedTarget)) {
      // If target is an app name directly passed to openSettings (e.g. target="Spotify")
      targetPackageName = resolveApp(ctx, trimmedTarget)
    }

    val action = when {
      targetPackageName != null -> Settings.ACTION_APPLICATION_DETAILS_SETTINGS
      trimmedTarget.contains("wifi") -> Settings.ACTION_WIFI_SETTINGS
      trimmedTarget.contains("bluetooth") -> Settings.ACTION_BLUETOOTH_SETTINGS
      trimmedTarget.contains("nfc") -> Settings.ACTION_NFC_SETTINGS
      trimmedTarget.contains("airplane") -> Settings.ACTION_AIRPLANE_MODE_SETTINGS
      trimmedTarget.contains("location") || trimmedTarget.contains("gps") -> Settings.ACTION_LOCATION_SOURCE_SETTINGS
      trimmedTarget.contains("display") || trimmedTarget.contains("brightness") -> Settings.ACTION_DISPLAY_SETTINGS
      trimmedTarget.contains("battery") || trimmedTarget.contains("power") -> Intent.ACTION_POWER_USAGE_SUMMARY
      trimmedTarget.contains("developer") || trimmedTarget.contains("dev") -> Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS
      trimmedTarget.contains("sound") || trimmedTarget.contains("volume") -> Settings.ACTION_SOUND_SETTINGS
      trimmedTarget.contains("storage") -> Settings.ACTION_INTERNAL_STORAGE_SETTINGS
      trimmedTarget.contains("app_info") || trimmedTarget.contains("appinfo") -> Settings.ACTION_APPLICATION_DETAILS_SETTINGS
      trimmedTarget.contains("hotspot") || trimmedTarget.contains("tethering") -> Settings.ACTION_WIRELESS_SETTINGS
      else -> Settings.ACTION_SETTINGS
    }

    try {
      val intent = if (action == Settings.ACTION_APPLICATION_DETAILS_SETTINGS) {
        val pkg = targetPackageName ?: ctx.packageName
        Intent(action, Uri.fromParts("package", pkg, null)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      } else {
        Intent(action).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      ctx.startActivity(intent)
      promise.resolve(true)
    } catch (e: Throwable) {
      // Fall back to general settings if specific action fails
      try {
        val fallback = Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(fallback)
        promise.resolve(true)
      } catch (e2: Throwable) {
        promise.reject("SETTINGS_FAILED", e2.message)
      }
    }
  }

  // ---------------- Sound & Ringer Mode ----------------

  @ReactMethod
  fun setRingerMode(mode: String, promise: Promise) {
    val ctx = reactApplicationContext
    try {
      val audioManager = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      when (mode.uppercase().trim()) {
        "SILENT" -> {
          // Mute volume streams cleanly without triggering Do Not Disturb permission error
          val minVol = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) audioManager.getStreamMinVolume(AudioManager.STREAM_MUSIC) else 0
          audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, minVol, AudioManager.FLAG_SHOW_UI)
        }
        "VIBRATE" -> {
          try {
            audioManager.ringerMode = AudioManager.RINGER_MODE_VIBRATE
          } catch (_: Throwable) {
            val minVol = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) audioManager.getStreamMinVolume(AudioManager.STREAM_MUSIC) else 0
            audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, minVol, AudioManager.FLAG_SHOW_UI)
          }
        }
        else -> {
          try {
            audioManager.ringerMode = AudioManager.RINGER_MODE_NORMAL
          } catch (_: Throwable) {
            // ignore DND error
          }
        }
      }
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("RINGER_FAILED", e.message)
    }
  }

  // ---------------- Volume Adjustment & Direct Percentage ----------------

  @ReactMethod
  fun setVolumePercent(percent: Int, promise: Promise) {
    val ctx = reactApplicationContext
    try {
      val audioManager = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val clampedPercent = percent.coerceIn(0, 100)

      if (clampedPercent == 0) {
        val minVol = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) audioManager.getStreamMinVolume(AudioManager.STREAM_MUSIC) else 0
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, minVol, AudioManager.FLAG_SHOW_UI)
      } else {
        val maxVol = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
        val targetVol = (maxVol * clampedPercent / 100.0f).toInt().coerceIn(1, maxVol)
        audioManager.setStreamVolume(AudioManager.STREAM_MUSIC, targetVol, AudioManager.FLAG_SHOW_UI)
      }
      promise.resolve(clampedPercent)
    } catch (e: Throwable) {
      promise.reject("VOLUME_FAILED", e.message)
    }
  }

  @ReactMethod
  fun adjustVolume(direction: String, promise: Promise) {
    val ctx = reactApplicationContext
    try {
      val audioManager = ctx.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val dir = if (direction.uppercase().trim() == "UP") AudioManager.ADJUST_RAISE else AudioManager.ADJUST_LOWER
      audioManager.adjustStreamVolume(AudioManager.STREAM_MUSIC, dir, AudioManager.FLAG_SHOW_UI)
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("VOLUME_FAILED", e.message)
    }
  }

  // ---------------- Battery Status ----------------

  @ReactMethod
  fun getBatteryStatus(promise: Promise) {
    val ctx = reactApplicationContext
    try {
      val intent = ctx.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
      val level = intent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
      val scale = intent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
      val status = intent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1

      val pct = if (level >= 0 && scale > 0) (level * 100 / scale.toFloat()).toInt() else 0
      val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

      val map = Arguments.createMap()
      map.putInt("level", pct)
      map.putBoolean("isCharging", isCharging)
      promise.resolve(map)
    } catch (e: Throwable) {
      promise.reject("BATTERY_FAILED", e.message)
    }
  }

  // ---------------- Local Notifications ----------------

  @ReactMethod
  fun showNotification(title: String, body: String, promise: Promise) {
    val ctx = reactApplicationContext
    try {
      val notificationManager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
      val channelId = "arin_automation_channel"
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val channel = android.app.NotificationChannel(
          channelId,
          "ARIN Automations",
          android.app.NotificationManager.IMPORTANCE_DEFAULT
        )
        notificationManager.createNotificationChannel(channel)
      }
      val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        android.app.Notification.Builder(ctx, channelId)
      } else {
        @Suppress("DEPRECATION")
        android.app.Notification.Builder(ctx)
      }
      builder.setContentTitle(title)
        .setContentText(body)
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setAutoCancel(true)

      notificationManager.notify((System.currentTimeMillis() % 10000).toInt(), builder.build())
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("NOTIFICATION_FAILED", e.message)
    }
  }

  // ---------------- Offline Text-To-Speech (TTS) ----------------

  private var tts: TextToSpeech? = null
  private var ttsReady = false

  init {
    initTtsEngine(null)
  }

  private fun initTtsEngine(onReady: (() -> Unit)?) {
    tts = TextToSpeech(reactApplicationContext) { status ->
      if (status == TextToSpeech.SUCCESS) {
        val result = tts?.setLanguage(Locale.US)
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
          tts?.setLanguage(Locale.getDefault())
        }
        ttsReady = true
        onReady?.invoke()
      } else {
        android.util.Log.e("ArinNative", "TTS initialization failed with status: $status")
      }
    }
  }

  private fun applyVoiceGender(gender: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return
    try {
      val isMale = gender.lowercase() == "male"
      val voices = tts?.voices
      if (!voices.isNullOrEmpty()) {
        val targetName = if (isMale) "male" else "female"
        val match = voices.firstOrNull { voice ->
          !voice.isNetworkConnectionRequired && voice.name.lowercase().contains(targetName)
        } ?: voices.firstOrNull { voice ->
          voice.name.lowercase().contains(targetName)
        }
        if (match != null) {
          tts?.voice = match
        }
      }
    } catch (_: Throwable) {
      // fallback
    }
  }

  @ReactMethod
  fun speak(text: String, gender: String, promise: Promise) {
    val ctx = reactApplicationContext
    ctx.runOnUiQueueThread {
      try {
        if (tts == null || !ttsReady) {
          initTtsEngine {
            applyVoiceGender(gender)
            performSpeak(text, promise)
          }
        } else {
          applyVoiceGender(gender)
          performSpeak(text, promise)
        }
      } catch (e: Throwable) {
        promise.reject("TTS_FAILED", e.message)
      }
    }
  }

  private fun performSpeak(text: String, promise: Promise) {
    try {
      val params = Bundle()
      params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f)
      val res = tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "arin_tts_${System.currentTimeMillis()}")
      if (res == TextToSpeech.SUCCESS) {
        promise.resolve(true)
      } else {
        android.util.Log.e("ArinNative", "TTS speak failed code: $res")
        promise.reject("TTS_SPEAK_ERROR", "TTS speak returned code $res")
      }
    } catch (e: Throwable) {
      promise.reject("TTS_SPEAK_FAILED", e.message)
    }
  }

  @ReactMethod
  fun stopSpeaking(promise: Promise) {
    try {
      tts?.stop()
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("TTS_STOP_FAILED", e.message)
    }
  }

  // ---------------- Speech-To-Text (STT) ----------------
  // Prefers on-device offline recognition. Falls back to online if the
  // device does not have an offline model installed.

  private var speechRecognizer: SpeechRecognizer? = null
  private var activeSttPromise: Promise? = null

  @ReactMethod
  fun startListening(promise: Promise) {
    val ctx = reactApplicationContext
    ctx.runOnUiQueueThread {
      try {
        if (!SpeechRecognizer.isRecognitionAvailable(ctx)) {
          promise.reject(
            "STT_UNAVAILABLE",
            "Speech recognizer not available on this device. Enable microphone permissions."
          )
          return@runOnUiQueueThread
        }

        activeSttPromise?.reject("CANCELLED", "New recognition requested.")
        activeSttPromise = promise

        if (speechRecognizer == null) {
          // Prefer offline / on-device recognition when available
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && SpeechRecognizer.isOnDeviceRecognitionAvailable(ctx)) {
            speechRecognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(ctx)
          } else if (SpeechRecognizer.isRecognitionAvailable(ctx)) {
            // Offline model not installed — fall back to online recognition
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(ctx)
          } else {
            promise.reject(
              "OFFLINE_STT_UNAVAILABLE",
              "No speech recognition available. Install an offline language pack: " +
                "Settings → General Management → Language & Input → On-device speech recognition → Download."
            )
            return@runOnUiQueueThread
          }
        }

        speechRecognizer?.setRecognitionListener(object : RecognitionListener {
          override fun onReadyForSpeech(params: Bundle?) {}
          override fun onBeginningOfSpeech() {}
          override fun onRmsChanged(rmsdB: Float) {}
          override fun onBufferReceived(buffer: ByteArray?) {}
          override fun onEndOfSpeech() {}
          override fun onError(error: Int) {
            val msg = when (error) {
              SpeechRecognizer.ERROR_AUDIO -> "Audio recording error."
              SpeechRecognizer.ERROR_CLIENT -> "Client error."
              SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions."
              SpeechRecognizer.ERROR_NETWORK -> "Network error."
              SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout."
              SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized."
              SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognizer busy."
              SpeechRecognizer.ERROR_SERVER -> "Server error."
              SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input."
              else -> "Speech recognition error: $error"
            }
            activeSttPromise?.reject("STT_ERROR", msg)
            activeSttPromise = null
          }

          override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull() ?: ""
            activeSttPromise?.resolve(text)
            activeSttPromise = null
          }

          override fun onPartialResults(partialResults: Bundle?) {}
          override fun onEvent(eventType: Int, params: Bundle?) {}
        })

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
          putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
          putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault().toString())
          putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }

        speechRecognizer?.startListening(intent)
      } catch (e: Throwable) {
        promise.reject("STT_FAILED", e.message)
      }
    }
  }

  @ReactMethod
  fun stopListening(promise: Promise) {
    val ctx = reactApplicationContext
    ctx.runOnUiQueueThread {
      try {
        speechRecognizer?.stopListening()
        promise.resolve(true)
      } catch (e: Throwable) {
        promise.reject("STT_STOP_FAILED", e.message)
      }
    }
  }

  // ---------------- Fuzzy App Resolution ----------------

  private data class AppMatch(val label: String, val packageName: String)

  /** Best-effort resolve of a user-spoken app name or package to a real installable package. */
  private fun resolveApp(ctx: Context, target: String): String? {
    val trimmed = target.trim()
    if (trimmed.isEmpty()) return null

    // Exact package always wins — cheap and unambiguous.
    if (ctx.packageManager.getLaunchIntentForPackage(trimmed) != null) {
      return trimmed
    }

    val apps = queryLaunchableApps(ctx)
    if (apps.isEmpty()) return null

    val want = normalized(trimmed)
    val wantTokens = want.split(Regex("\\s+")).filter { it.isNotEmpty() }
    val wantSoundex = soundex(wantTokens.firstOrNull() ?: want)

    var best: AppMatch? = null
    var bestScore = -1.0

    for (app in apps) {
      // Match against label AND package trailing segment (e.g. "youtube",
      // "spotify.music") so both "Spotify" and "spotify" hit com.spotify.music.
      val labelNorm = normalized(app.label)
      val pkgKey = normalized(app.packageName.substringAfterLast('.').replace('.', ' '))

      var score = scoreMatch(labelNorm, want, wantTokens, wantSoundex)
      if (score < 0) {
        score = scoreMatch(pkgKey, want, wantTokens, wantSoundex)
      }
      if (score > bestScore) {
        bestScore = score
        best = app
      }
    }

    return if (bestScore > 40.0) best?.packageName else null
  }

  private fun scoreMatch(
    candidate: String,
    want: String,
    wantTokens: List<String>,
    wantSoundex: String
  ): Double {
    if (candidate.isEmpty()) return -1.0
    val tokens = candidate.split(Regex("\\s+")).filter { it.isNotEmpty() }
    var score = -1.0
    when {
      candidate == want -> score = 100.0
      tokens.contains(want) || wantTokens.contains(candidate) -> score = 90.0
      tokens.any { it.startsWith(want) } || wantTokens.any { wt -> tokens.any { it.startsWith(wt) } } -> score = 80.0
      else -> {
        val bestTokenDist: Double = if (wantTokens.isEmpty() || tokens.isEmpty()) {
          Double.MAX_VALUE
        } else {
          wantTokens.minOf { wt ->
            tokens.minOf { tok -> levenshtein(wt, tok).toDouble() / maxOf(wt.length, tok.length) }
          }
        }
        val minNormDist = minOf(
          levenshtein(want, candidate).toDouble() / maxOf(want.length, candidate.length),
          bestTokenDist
        )
        if (minNormDist <= 0.30) {
          score = 85.0 - (minNormDist / 0.30) * 30.0
        } else if (
          want.length >= 3 &&
          soundex(tokens.firstOrNull() ?: candidate) == wantSoundex
        ) {
          score = 50.0
        }
      }
    }
    return score
  }

  private fun queryLaunchableApps(ctx: Context): List<AppMatch> {
    val result = mutableListOf<AppMatch>()
    val apps = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      ctx.packageManager.getInstalledApplications(PackageManager.ApplicationInfoFlags.of(0L))
    } else {
      @Suppress("DEPRECATION")
      ctx.packageManager.getInstalledApplications(PackageManager.GET_META_DATA)
    }
    for (app in apps) {
      if (ctx.packageManager.getLaunchIntentForPackage(app.packageName) != null) {
        val label = ctx.packageManager.getApplicationLabel(app)?.toString() ?: app.packageName
        result.add(AppMatch(label, app.packageName))
      }
    }
    return result
  }

  // ---------------- Fuzzy Contact Resolution ----------------

  private data class ContactMatch(val name: String, val number: String)

  private fun isPhoneNumber(target: String): Boolean =
    target.count { it.isDigit() } >= 5

  /**
   * Resolve a user-supplied target (name or number) to a real contact number.
   * Matching tiers, best wins: exact name -> token match -> prefix -> fuzzy
   * (Levenshtein) -> phonetic (Soundex). Returns null when nothing is close.
   */
  private fun resolveContact(ctx: Context, target: String): ContactMatch? {
    val trimmed = target.trim()
    if (trimmed.isEmpty()) return null
    if (isPhoneNumber(trimmed)) return ContactMatch(trimmed, trimmed)

    val contacts = queryContacts(ctx)
    if (contacts.isEmpty()) return null

    val want = normalized(trimmed)
    val wantTokens = want.split(Regex("\\s+")).filter { it.isNotEmpty() }
    val wantSoundex = soundex(wantTokens.firstOrNull() ?: want)

    var best: ContactMatch? = null
    var bestScore = -1.0

    for (contact in contacts) {
      val nameNorm = normalized(contact.name)
      if (nameNorm.isEmpty()) continue
      val tokens = nameNorm.split(Regex("\\s+")).filter { it.isNotEmpty() }

      var score: Double = -1.0

      when {
        nameNorm == want -> score = 100.0
        tokens.contains(want) || wantTokens.contains(nameNorm) -> score = 90.0
        tokens.any { it.startsWith(want) } || wantTokens.any { wt -> tokens.any { it.startsWith(wt) } } -> score = 80.0
        else -> {
          val minNormDist = minOf(
            levenshtein(want, nameNorm).toDouble() / maxOf(want.length, nameNorm.length),
            wantTokens.minOf { wt ->
              tokens.minOf { tok -> levenshtein(wt, tok).toDouble() / maxOf(wt.length, tok.length) }
            }
          )
          if (minNormDist <= 0.30) {
            // Close enough to accept ("jon" ~ "John", "karinI" ~ "Karthik").
            // Score between 55 (borderline) and 85 (near exact) so the closest
            // candidate wins while clearly weaker ones are still accepted.
            score = 85.0 - (minNormDist / 0.30) * 30.0
          } else if (
            want.length >= 3 &&
            soundex(tokens.firstOrNull() ?: nameNorm) == wantSoundex
          ) {
            // Phonetic fallback: "areen" ~ "Arin", "rajnish" ~ "Rajan" — dist
            // can be high even when spoken names sound identical.
            score = 50.0
          }
        }
      }

      if (score > bestScore) {
        bestScore = score
        best = contact
      }
    }

    return if (bestScore > 40.0) best else null
  }

  private fun queryContacts(ctx: Context): List<ContactMatch> {
    val result = mutableListOf<ContactMatch>()
    val projection = arrayOf(
      ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME,
      ContactsContract.CommonDataKinds.Phone.NUMBER
    )
    val cursor = ctx.contentResolver.query(
      ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
      projection,
      null,
      null,
      ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME
    ) ?: return result

    cursor.use {
      val nameIdx = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)
      val numIdx = it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)
      while (it.moveToNext()) {
        val name = it.getString(nameIdx) ?: continue
        val number = it.getString(numIdx) ?: continue
        result.add(ContactMatch(name, number))
      }
    }
    return result
  }

  private fun normalized(s: String): String =
    s.lowercase().replace(Regex("[^a-z0-9\\s]"), "").trim()

  private fun levenshtein(a: String, b: String): Int {
    if (a.isEmpty()) return b.length
    if (b.isEmpty()) return a.length
    val dp = Array(a.length + 1) { IntArray(b.length + 1) }
    for (i in 0..a.length) dp[i][0] = i
    for (j in 0..b.length) dp[0][j] = j
    for (i in 1..a.length) {
      for (j in 1..b.length) {
        val cost = if (a[i - 1] == b[j - 1]) 0 else 1
        dp[i][j] = minOf(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
      }
    }
    return dp[a.length][b.length]
  }

  /** Classic American Soundex — maps similar-sounding names to the same key. */
  private fun soundex(input: String): String {
    val s = input.lowercase().replace(Regex("[^a-z]"), "")
    if (s.isEmpty()) return ""
    val sb = StringBuilder()
    sb.append(s[0].uppercase())
    var prev = soundexDigit(s[0])
    for (i in 1 until s.length) {
      val c = s[i]
      if (c == 'h' || c == 'w') continue
      val d = soundexDigit(c)
      if (d != prev && d != '0') {
        sb.append(d)
        prev = d
      }
    }
    return (sb.toString() + "000").substring(0, 4)
  }

  private fun soundexDigit(c: Char): Char = when (c) {
    'b', 'f', 'p', 'v' -> '1'
    'c', 'g', 'j', 'k', 'q', 's', 'x', 'z' -> '2'
    'd', 't' -> '3'
    'l' -> '4'
    'm', 'n' -> '5'
    'r' -> '6'
    else -> '0'
  }

  // ---------------- USB-OTG Serial (Arduino) ----------------

  private var usbSerialPort: CommonUsbSerialPort? = null
  private var usbSerialThread: Thread? = null
  private var usbSerialRunning = false
  private val usbHandler = Handler(Looper.getMainLooper())

  private val defaultProber = UsbSerialProber.getDefaultProber()

  private fun emitSerialEvent(eventName: String, params: WritableMap?) {
    reactApplicationContext
      .getJSModule(com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  @ReactMethod
  fun listUsbDevices(promise: Promise) {
    try {
      val usbManager = reactApplicationContext.getSystemService(Context.USB_SERVICE) as UsbManager
      val result = Arguments.createArray()
      for (device in usbManager.deviceList.values) {
        val port = defaultProber.probeDevice(device)
        if (port != null) {
          val info = Arguments.createMap()
          info.putString("name", device.productName ?: device.deviceName)
          info.putString("address", device.deviceName)
          info.putInt("vendorId", device.vendorId)
          info.putInt("productId", device.productId)
          info.putInt("deviceClass", device.deviceClass)
          result.pushMap(info)
        }
      }
      promise.resolve(result)
    } catch (e: Throwable) {
      promise.reject("USB_LIST_FAILED", e.message)
    }
  }

  @ReactMethod
  fun connectUsbSerial(vendorId: Int, productId: Int, promise: Promise) {
    try {
      val ctx = reactApplicationContext
      val usbManager = ctx.getSystemService(Context.USB_SERVICE) as UsbManager

      // Find the matching device
      val device = usbManager.deviceList.values.firstOrNull {
        it.vendorId == vendorId && it.productId == productId
      }
      if (device == null) {
        promise.reject("USB_DEVICE_NOT_FOUND", "USB device not found. Check the cable is connected.")
        return
      }

      // Disconnect any existing session
      disconnectUsbSerialInternal()

      // Probe for the correct driver
      val driver = defaultProber.probeDevice(device)
      if (driver == null) {
        promise.reject("USB_DRIVER_NOT_FOUND", "No compatible driver for this USB device.")
        return
      }

      if (driver.ports.isEmpty()) {
        promise.reject("USB_NO_PORTS", "USB device has no serial ports.")
        return
      }

      val port = driver.ports[0] as CommonUsbSerialPort

      // Open and configure
      val connection = usbManager.openDevice(device)
      if (connection == null) {
        promise.reject("USB_PERMISSION_DENIED", "USB permission denied. Check device authorization.")
        return
      }

      port.open(connection)
      port.setParameters(115200, 8, CommonUsbSerialPort.STOPBITS_1, CommonUsbSerialPort.PARITY_NONE)

      usbSerialPort = port
      usbSerialRunning = true

      // Start background read thread
      usbSerialThread = Thread({
        val buf = ByteArray(256)
        val lineBuf = StringBuilder()
        while (usbSerialRunning) {
          try {
            val len = port.read(buf, 100)
            if (len > 0) {
              val chunk = String(buf, 0, len)
              for (c in chunk) {
                if (c == '\n' || c == '\r') {
                  val line = lineBuf.toString().trim()
                  if (line.isNotEmpty()) {
                    val event = Arguments.createMap()
                    event.putString("data", line)
                    usbHandler.post { emitSerialEvent("SerialData", event) }
                  }
                  lineBuf.clear()
                } else {
                  lineBuf.append(c)
                }
              }
            }
          } catch (e: Throwable) {
            if (usbSerialRunning) {
              usbSerialRunning = false
              usbHandler.post {
                val event = Arguments.createMap()
                event.putString("error", e.message ?: "Read error")
                emitSerialEvent("SerialDisconnect", event)
              }
            }
            break
          }
        }
      }, "USB-Serial-Read").also { it.isDaemon = true; it.start() }

      // Emit connected event
      val event = Arguments.createMap()
      event.putString("name", device.productName ?: device.deviceName)
      event.putInt("vendorId", vendorId)
      event.putInt("productId", productId)
      usbHandler.post { emitSerialEvent("SerialConnect", event) }

      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("USB_CONNECT_FAILED", e.message)
    }
  }

  @ReactMethod
  fun disconnectUsbSerial(promise: Promise) {
    try {
      disconnectUsbSerialInternal()
      val event = Arguments.createMap()
      event.putString("reason", "user_disconnect")
      usbHandler.post { emitSerialEvent("SerialDisconnect", event) }
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("USB_DISCONNECT_FAILED", e.message)
    }
  }

  private fun disconnectUsbSerialInternal() {
    usbSerialRunning = false
    try { usbSerialThread?.interrupt() } catch (_: Throwable) {}
    usbSerialThread = null
    try { usbSerialPort?.close() } catch (_: Throwable) {}
    usbSerialPort = null
  }

  @ReactMethod
  fun writeSerial(data: String, promise: Promise) {
    val port = usbSerialPort
    if (port == null || !usbSerialRunning) {
      promise.reject("USB_NOT_CONNECTED", "Arduino not connected.")
      return
    }
    try {
      val payload = (data.trim() + "\n").toByteArray()
      port.write(payload, 1000)
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.reject("USB_WRITE_FAILED", e.message)
    }
  }

  @ReactMethod
  fun isUsbConnected(promise: Promise) {
    promise.resolve(usbSerialRunning && usbSerialPort != null)
  }
}
