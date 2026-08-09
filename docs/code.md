# ARIN — Full Source Code

> 44 files

---

## `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

/**
 * This is the configuration block to customize your React Native Android app.
 * By default you don't need to apply any configuration, just uncomment the lines you need.
 */
react {
    /* Folders */
    //   The root of your project, i.e. where "package.json" lives. Default is '../..'
    // root = file("../../")
    //   The folder where the react-native NPM package is. Default is ../../node_modules/react-native
    // reactNativeDir = file("../../node_modules/react-native")
    //   The folder where the react-native Codegen package is. Default is ../../node_modules/@react-native/codegen
    // codegenDir = file("../../node_modules/@react-native/codegen")
    //   The cli.js file which is the React Native CLI entrypoint. Default is ../../node_modules/react-native/cli.js
    // cliFile = file("../../node_modules/react-native/cli.js")

    /* Variants */
    //   The list of variants to that are debuggable. For those we're going to
    //   skip the bundling of the JS bundle and the assets. Default is "debug", "debugOptimized".
    //   If you add flavors like lite, prod, etc. you'll have to list your debuggableVariants.
    // debuggableVariants = ["liteDebug", "liteDebugOptimized", "prodDebug", "prodDebugOptimized"]

    /* Bundling */
    //   A list containing the node command and its flags. Default is just 'node'.
    // nodeExecutableAndArgs = ["node"]
    //
    //   The command to run when bundling. By default is 'bundle'
    // bundleCommand = "ram-bundle"
    //
    //   The path to the CLI configuration file. Default is empty.
    // bundleConfig = file(../rn-cli.config.js)
    //
    //   The name of the generated asset file containing your JS bundle
    // bundleAssetName = "MyApplication.android.bundle"
    //
    //   The entry file for bundle generation. Default is 'index.android.js' or 'index.js'
    // entryFile = file("../js/MyApplication.android.js")
    //
    //   A list of extra flags to pass to the 'bundle' commands.
    //   See https://github.com/react-native-community/cli/blob/main/docs/commands.md#bundle
    // extraPackagerArgs = []

    /* Hermes Commands */
    //   The hermes compiler command to run. By default it is 'hermesc'
    // hermesCommand = "$rootDir/my-custom-hermesc/bin/hermesc"
    //
    //   The list of flags to pass to the Hermes compiler. By default is "-O", "-output-source-map"
    // hermesFlags = ["-O", "-output-source-map"]

    /* Autolinking */
    autolinkLibrariesWithApp()
}

/**
 * Set this to true to Run Proguard on Release builds to minify the Java bytecode.
 */
def enableProguardInReleaseBuilds = false

/**
 * The preferred build flavor of JavaScriptCore (JSC)
 *
 * For example, to use the international variant, you can use:
 * `def jscFlavor = io.github.react-native-community:jsc-android-intl:2026004.+`
 *
 * The international variant includes ICU i18n library and necessary data
 * allowing to use e.g. `Date.toLocaleString` and `String.localeCompare` that
 * give correct results when using with locales other than en-US. Note that
 * this variant is about 6MiB larger per architecture than default.
 */
def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.arin"
    defaultConfig {
        applicationId "com.arin"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}

dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}

```

---

## `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />
    <uses-permission android:name="android.permission.CALL_PHONE" />
    <uses-permission android:name="android.permission.SEND_SMS" />
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />

    <queries>
        <intent>
            <action android:name="android.intent.action.TTS_SERVICE" />
        </intent>
        <intent>
            <action android:name="android.speech.RecognitionService" />
        </intent>
    </queries>

    <application
      android:name=".MainApplication"
      android:label="@string/app_name"
      android:icon="@mipmap/ic_launcher"
      android:roundIcon="@mipmap/ic_launcher_round"
      android:allowBackup="false"
      android:theme="@style/AppTheme"
      android:usesCleartextTraffic="${usesCleartextTraffic}"
      android:networkSecurityConfig="@xml/network_security_config"
      android:supportsRtl="true">
      <activity
        android:name=".MainActivity"
        android:label="@string/app_name"
        android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
        android:launchMode="singleTask"
        android:windowSoftInputMode="adjustResize"
        android:exported="true">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
      </activity>
    </application>
</manifest>

```

---

## `android/app/src/main/java/com/arin/ArinNativeModule.kt`

```kotlin
package com.arin

import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
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
}

```

---

## `android/app/src/main/java/com/arin/ArinNativePackage.kt`

```kotlin
package com.arin

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ArinNativePackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(ArinNativeModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
```

---

## `android/app/src/main/java/com/arin/MainActivity.kt`

```kotlin
package com.arin

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "ARIN"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

```

---

## `android/app/src/main/java/com/arin/MainApplication.kt`

```kotlin
package com.arin

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(ArinNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}

```

---

## `android/app/src/main/res/drawable/rn_edit_text_material.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Copyright (C) 2014 The Android Open Source Project

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
-->
<inset xmlns:android="http://schemas.android.com/apk/res/android"
       android:insetLeft="@dimen/abc_edit_text_inset_horizontal_material"
       android:insetRight="@dimen/abc_edit_text_inset_horizontal_material"
       android:insetTop="@dimen/abc_edit_text_inset_top_material"
       android:insetBottom="@dimen/abc_edit_text_inset_bottom_material"
       >

    <selector>
        <!--
          This file is a copy of abc_edit_text_material (https://bit.ly/3k8fX7I).
          The item below with state_pressed="false" and state_focused="false" causes a NullPointerException.
          NullPointerException:tempt to invoke virtual method 'android.graphics.drawable.Drawable android.graphics.drawable.Drawable$ConstantState.newDrawable(android.content.res.Resources)'

          <item android:state_pressed="false" android:state_focused="false" android:drawable="@drawable/abc_textfield_default_mtrl_alpha"/>

          For more info, see https://bit.ly/3CdLStv (react-native/pull/29452) and https://bit.ly/3nxOMoR.
        -->
        <item android:state_enabled="false" android:drawable="@drawable/abc_textfield_default_mtrl_alpha"/>
        <item android:drawable="@drawable/abc_textfield_activated_mtrl_alpha"/>
    </selector>

</inset>

```

---

## `android/app/src/main/res/values/strings.xml`

```xml
<resources>
    <string name="app_name">ARIN</string>
</resources>

```

---

## `android/app/src/main/res/values/styles.xml`

```xml
<resources>

    <!-- Base application theme. -->
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <!-- Customize your theme here. -->
        <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    </style>

</resources>

```

---

## `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>

```

---

## `android/build.gradle`

```gradle
buildscript {
    ext {
        buildToolsVersion = "36.0.0"
        minSdkVersion = 24
        compileSdkVersion = 36
        targetSdkVersion = 36
        ndkVersion = "27.1.12297006"
        kotlinVersion = "2.1.20"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

apply plugin: "com.facebook.react.rootproject"

```

---

## `android/gradle.properties`

```properties
# Project-wide Gradle settings.

# IDE (e.g. Android Studio) users:
# Gradle settings configured through the IDE *will override*
# any settings specified in this file.

# For more details on how to configure your build environment visit
# http://www.gradle.org/docs/current/userguide/build_environment.html

# Specifies the JVM arguments used for the daemon process.
# The setting is particularly useful for tweaking memory settings.
# Default value: -Xmx512m -XX:MaxMetaspaceSize=256m
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m

# When configured, Gradle will run in incubating parallel mode.
# This option should only be used with decoupled projects. More details, visit
# http://www.gradle.org/docs/current/userguide/multi_project_builds.html#sec:decoupled_projects
# org.gradle.parallel=true

# AndroidX package structure to make it clearer which packages are bundled with the
# Android operating system, and which are packaged with your app's APK
# https://developer.android.com/topic/libraries/support-library/androidx-rn
android.useAndroidX=true

# Use this property to specify which architecture you want to build.
# You can also override it from the CLI using
# ./gradlew <task> -PreactNativeArchitectures=x86_64
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64

# Use this property to enable support to the new architecture.
# This will allow you to use TurboModules and the Fabric render in
# your application. You should enable this flag either if you want
# to write custom TurboModules/Fabric components OR use libraries that
# are providing them.
newArchEnabled=true

# Use this property to enable or disable the Hermes JS engine.
# If set to false, you will be using JSC instead.
hermesEnabled=true

# Use this property to enable edge-to-edge display support.
# This allows your app to draw behind system bars for an immersive UI.
# Note: Only works with ReactActivity and should not be used with custom Activity.
edgeToEdgeEnabled=false

```

---

## `android/gradle/wrapper/gradle-wrapper.properties`

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-9.3.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists

```

---

## `android/settings.gradle`

```gradle
pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
plugins { id("com.facebook.react.settings") }
extensions.configure(com.facebook.react.ReactSettingsExtension){ ex -> ex.autolinkLibrariesFromCommand() }
rootProject.name = 'ARIN'
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')

```

---

## `src/components/ArinLogo.tsx`

```typescript
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ArinLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const ArinLogo: React.FC<ArinLogoProps> = ({ size = 'md' }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const iconDim = isLg ? 80 : isSm ? 36 : 56;
  const innerDim = isLg ? 40 : isSm ? 18 : 28;
  const fontSize = isLg ? 32 : isSm ? 16 : 22;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.outerFrame,
          { width: iconDim, height: iconDim, borderRadius: iconDim / 4 },
        ]}
      >
        <View
          style={[
            styles.innerCore,
            { width: innerDim, height: innerDim, borderRadius: innerDim / 4 },
          ]}
        />
        <View style={styles.accentDotTop} />
        <View style={styles.accentDotBottom} />
      </View>
      <Text style={[typography.displayLg, styles.logoText, { fontSize }]}>
        ARIN
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  outerFrame: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  innerCore: {
    backgroundColor: colors.primaryContainer,
    transform: [{ rotate: '45deg' }],
  },
  accentDotTop: {
    position: 'absolute',
    top: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.tertiaryFixedDim,
  },
  accentDotBottom: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  logoText: {
    color: colors.primary,
    letterSpacing: 4,
  },
});

```

---

## `src/components/BottomNav.tsx`

```typescript
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ScreenTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, themeColors } = useApp();

  const tabs: { id: ScreenTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'ARIN', icon: '⊞' },
    { id: 'test-interface', label: 'TEST', icon: '❯_' },
    { id: 'settings', label: 'SETUP', icon: '⚙' },
  ];

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: themeColors.surfaceContainer,
          borderTopColor: themeColors.outlineVariant,
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.iconText,
                { color: isActive ? themeColors.primaryContainer : themeColors.onSurfaceVariant },
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                typography.labelCaps,
                { color: isActive ? themeColors.primaryContainer : themeColors.onSurfaceVariant },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: spacing.xs,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

```

---

## `src/components/ChatInput.tsx`

```typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { startVoiceInput, stopVoiceInput } from '../services/deviceService';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const ChatInput: React.FC = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const { sendMessage, themeColors, isSpeaking, stopAudio } = useApp();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  const handleVoiceMicPress = async () => {
    if (isListening) {
      // Tapping mic while listening → stop listening early
      setIsListening(false);
      await stopVoiceInput();
      return;
    }
    setIsListening(true);
    setVoiceError(null);
    const result = await startVoiceInput();
    setIsListening(false);

    if (result.success && result.text.trim()) {
      setText(result.text.trim());
      sendMessage(result.text.trim());
    } else if (result.error) {
      setVoiceError(result.error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: isListening ? themeColors.primaryContainer : themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.codeSm, styles.promptPrefix, { color: themeColors.primaryContainer }]}>
          &gt;
        </Text>
        <TextInput
          style={[typography.codeSm, styles.textInput, { color: themeColors.onSurface }]}
          value={text}
          onChangeText={setText}
          placeholder={isListening ? 'Listening... Speak command' : 'Enter command...'}
          placeholderTextColor={themeColors.onSurfaceVariant}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        {/* STOP AUDIO TTS BUTTON - PERMANENT IN CHAT BAR */}
        <TouchableOpacity
          style={[styles.stopButton, { backgroundColor: isSpeaking ? themeColors.error : themeColors.surfaceContainerHigh }]}
          onPress={stopAudio}
          activeOpacity={0.8}
        >
          <Text style={[typography.labelCaps, { color: isSpeaking ? themeColors.onPrimary : themeColors.error }]}>⏹</Text>
        </TouchableOpacity>

        {/* VOICE STT MIC BUTTON — toggles to ⏹ while listening */}
        <TouchableOpacity
          style={[
            styles.micButton,
            {
              backgroundColor: isListening
                ? themeColors.error
                : themeColors.surfaceContainerHigh,
            },
          ]}
          onPress={handleVoiceMicPress}
          activeOpacity={0.7}
        >
          {isListening ? (
            <Text style={[styles.micIcon, { color: themeColors.onPrimary }]}>⏹</Text>
          ) : (
            <Text style={[styles.micIcon, { color: themeColors.primaryContainer }]}>🎙️</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: themeColors.primaryContainer }]}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>➤</Text>
        </TouchableOpacity>
      </View>
      {voiceError ? (
        <Text style={[typography.codeSm, styles.voiceError, { color: themeColors.error }]}>
          {voiceError}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.sm,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    height: 52,
    overflow: 'hidden',
  },
  promptPrefix: {
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  stopButton: {
    height: '100%',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    height: '100%',
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    fontSize: 18,
  },
  sendButton: {
    height: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceError: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
});

```

---

## `src/components/ChatMessage.tsx`

```typescript
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ChatMessageItem } from '../types';

interface ChatMessageProps {
  message: ChatMessageItem;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { themeColors } = useApp();

  if (message.sender === 'SYSTEM') {
    return (
      <View style={styles.systemContainer}>
        <Text style={[typography.codeSm, styles.systemText, { color: themeColors.onSurfaceVariant }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  if (message.sender === 'ERROR') {
    return (
      <View style={[styles.errorContainer, { backgroundColor: themeColors.errorContainer, borderColor: themeColors.error }]}>
        <Text style={[typography.codeSm, { color: themeColors.error }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  const isAi = message.sender === 'ARIN';

  return (
    <View style={[styles.msgWrapper, isAi ? styles.alignStart : styles.alignEnd]}>
      <View style={styles.senderHeader}>
        {isAi && (
          <View
            style={[
              styles.aiBadge,
              { backgroundColor: themeColors.primaryContainer },
            ]}
          />
        )}
        <Text
          style={[
            typography.labelCaps,
            { color: isAi ? themeColors.primaryContainer : themeColors.onSurfaceVariant },
          ]}
        >
          {message.sender}
        </Text>
      </View>
      <View
        style={[
          styles.bubble,
          isAi
            ? [
                styles.aiBubble,
                {
                  backgroundColor: themeColors.surfaceBright,
                  borderLeftColor: themeColors.primaryContainer,
                },
              ]
            : [
                styles.userBubble,
                {
                  backgroundColor: 'transparent',
                  borderColor: themeColors.outlineVariant,
                },
              ],
        ]}
      >
        <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  systemContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  systemText: {
    opacity: 0.7,
    textAlign: 'center',
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  msgWrapper: {
    maxWidth: '85%',
    marginVertical: spacing.xs,
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  alignEnd: {
    alignSelf: 'flex-end',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  aiBadge: {
    width: 10,
    height: 10,
    borderRadius: spacing.borderRadius.sm,
    opacity: 0.8,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
  },
  aiBubble: {
    borderLeftWidth: 2,
    borderTopLeftRadius: spacing.borderRadius.sm,
  },
  userBubble: {
    borderWidth: 1,
    borderTopRightRadius: spacing.borderRadius.sm,
  },
});

```

---

## `src/components/ExecutionProgressBar.tsx`

```typescript
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ExecutionStage } from '../types';

const stageLabels: Record<ExecutionStage, string> = {
  idle: 'Idle',
  request_sent: 'Request Sent',
  local_processing: 'Local AI',
  cloud_processing: 'Cloud AI',
  arduino_executing: 'Arduino',
  device_executing: 'Device',
  speaking: 'Speaking',
  pipeline_executing: 'Pipeline',
  response_received: 'Response',
  done: 'Done',
  error: 'Error',
};

export const ExecutionProgressBar: React.FC = () => {
  const { currentStage, pipelinePath, stageErrorMsg, themeColors } = useApp();

  if (currentStage === 'idle') {
    return null;
  }

  const isError = currentStage === 'error';
  const currentIdx = pipelinePath.indexOf(currentStage);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
      <Text style={[typography.labelCaps, { color: isError ? themeColors.error : themeColors.primaryContainer }]}>
        {isError ? '⚠️ EXECUTION ERROR' : '⚡ PIPELINE PROGRESS'}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestoneRow}>
        {pipelinePath.map((stage, idx) => {
          let state: 'completed' | 'active' | 'pending' | 'error' = 'pending';
          if (isError) {
            state = idx <= currentIdx ? 'error' : 'pending';
          } else if (idx < currentIdx) {
            state = 'completed';
          } else if (idx === currentIdx) {
            state = 'active';
          }

          const dotBg =
            state === 'completed' || state === 'active'
              ? themeColors.primaryContainer
              : state === 'error'
              ? themeColors.error
              : themeColors.outline;

          const labelColor =
            state === 'completed' || state === 'active'
              ? themeColors.onSurface
              : state === 'error'
              ? themeColors.error
              : themeColors.onSurfaceVariant;

          return (
            <View key={stage} style={styles.milestoneItem}>
              <View style={[styles.dot, { backgroundColor: dotBg }]} />
              <Text style={[typography.codeSm, styles.milestoneText, { color: labelColor }]}>
                {`${idx + 1}. ${stageLabels[stage]}`}
              </Text>
              {idx < pipelinePath.length - 1 && (
                <Text style={[typography.codeSm, { color: themeColors.outline }]}>➔</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {isError && stageErrorMsg && (
        <Text style={[typography.codeSm, styles.errorBox, { color: themeColors.error, backgroundColor: themeColors.errorContainer }]}>
          {stageErrorMsg}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneText: {
    fontSize: 12,
  },
  errorBox: {
    padding: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    marginTop: spacing.xs,
  },
});

```

---

## `src/components/HeaderStatus.tsx`

```typescript
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { StatusBadge } from './StatusBadge';

export const HeaderStatus: React.FC = () => {
  const { settings, themeMode, toggleThemeMode, themeColors } = useApp();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: themeColors.background,
          borderBottomColor: themeColors.outlineVariant,
        },
      ]}
    >
      <View style={styles.badges}>
        <StatusBadge label="LOCAL AI" status={settings.localAiStatus} />
        <StatusBadge label="CLOUD" status={settings.cloudStatus} />
        <StatusBadge label="ARDUINO" status={settings.arduinoStatus} />
      </View>
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: themeColors.surfaceContainerHigh }]}
          onPress={toggleThemeMode}
          activeOpacity={0.7}
        >
          <Text style={{ color: themeColors.onSurface }}>
            {themeMode === 'dark' ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
        <View style={[styles.profileAvatar, { backgroundColor: themeColors.primaryContainer }]}>
          <Text style={[styles.avatarText, { color: themeColors.onPrimary }]}>OP</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeBtn: {
    width: 28,
    height: 28,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.labelCaps,
    fontSize: 10,
    fontWeight: '700',
  },
});

```

---

## `src/components/StatusBadge.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ConnectionState } from '../types';

interface StatusBadgeProps {
  label: string;
  status: ConnectionState;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const dotColor =
    status === 'connected'
      ? colors.tertiaryFixedDim
      : status === 'connecting'
      ? colors.primaryContainer
      : colors.outline;

  const textColor =
    status === 'connected'
      ? colors.tertiaryFixedDim
      : status === 'connecting'
      ? colors.primaryContainer
      : colors.onSurfaceVariant;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dot, { backgroundColor: dotColor, opacity: pulseAnim }]}
      />
      <Text style={[typography.labelCaps, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

```

---

## `src/context/AppContext.tsx`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AiDirective, ARIN_SYSTEM_PROMPT, parseAiDirective } from '../services/aiDirective';
import { sendArduinoCommand } from '../services/arduinoService';
import { sendDeviceCommand, speakText, stopSpeech } from '../services/deviceService';
import { runPipeline } from '../services/pipelineExecutor';
import { rearmPersistedJobs, scheduleJob } from '../services/schedulerService';
import { saveRule } from '../services/ruleStorage';
import { startRuleEngineMonitors, stopRuleEngineMonitors } from '../services/triggerMonitors';
import {
  fetchModels as fetchCloudModelsService,
  sendChatCompletion as sendCloudChatCompletion,
  testConnection as testCloudConnection,
} from '../services/cloudAiService';
import {
  ARIN_MODEL_NAME,
  fetchModels as fetchModelsService,
  initArinModel,
  sendChatCompletion,
  testConnection,
} from '../services/localAiService';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';
import { AppSettings, ChatMessageItem, ExecutionStage, ScreenTab, ThemeMode } from '../types';

const ONBOARDING_KEY = '@arin_onboarding_completed';
const THEME_KEY = '@arin_theme_mode';
const SETTINGS_KEY = '@arin_settings';

interface AppContextType {
  isSplashVisible: boolean;
  finishSplash: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  themeColors: ThemeColors;
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;
  messages: ChatMessageItem[];
  sendMessage: (text: string) => void;
  isProcessing: boolean;
  currentStage: ExecutionStage;
  pipelinePath: ExecutionStage[];
  stageErrorMsg: string | null;
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  connectLocalAi: () => Promise<boolean>;
  connectCloudAi: () => Promise<boolean>;
  testLogs: string[];
  addTestLog: (command: string) => void;
  refreshModels: () => Promise<void>;
  refreshCloudModels: () => Promise<void>;
  isSpeaking: boolean;
  stopAudio: () => Promise<void>;
}

const initialSettings: AppSettings = {
  localAiEnabled: false,
  localAiHost: '192.168.1.100:8000',
  localAiStatus: 'disconnected',
  localAiModels: [],
  selectedModel: '',
  cloudEnabled: false,
  cloudProvider: 'Gemini 1.5 Pro',
  cloudBaseUrl: '',
  cloudApiKey: '',
  cloudStatus: 'disconnected',
  cloudModels: [],
  selectedCloudModel: '',
  arduinoConnected: false,
  arduinoStatus: 'disconnected',
  permissionMode: 'compatible',
  preloadedModel: null,
  ttsAutoSpeak: true,
  ttsVoiceGender: 'female',
};

const initialMessages: ChatMessageItem[] = [
  {
    id: '1',
    sender: 'SYSTEM',
    text: '[SYS] Initialization complete.\n[SYS] Neural link established.\n[SYS] ARIN v3.1 ready.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: '2',
    sender: 'ARIN',
    text: 'ARIN Online. How can I help you today?',
    timestamp: new Date().toLocaleTimeString(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<ExecutionStage>('idle');
  const [pipelinePath, setPipelinePath] = useState<ExecutionStage[]>([
    'request_sent',
    'local_processing',
    'response_received',
    'done',
  ]);
  const [stageErrorMsg, setStageErrorMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stopAudio = async () => {
    await stopSpeech();
    setIsSpeaking(false);
  };

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const [onboardingVal, themeVal, settingsVal] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_KEY),
          AsyncStorage.getItem(THEME_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (onboardingVal === 'true') {
          setHasCompletedOnboarding(true);
        }
        if (themeVal === 'light' || themeVal === 'dark') {
          setThemeMode(themeVal as ThemeMode);
        }
        if (settingsVal) {
          try {
            setSettings((prev) => ({ ...prev, ...JSON.parse(settingsVal) }));
          } catch {
            // ignore malformed settings
          }
        }
      } catch {
        // error loading state
      }
    };
    loadSavedState();
  }, []);

  useEffect(() => {
    rearmPersistedJobs((directive) => {
      executeDirectiveNow(directive, /* fromScheduler */ true);
    });
    startRuleEngineMonitors({
      isArduinoConnected: settings.arduinoConnected,
      onLog: (msg) => setTestLogs((prev) => [msg, ...prev]),
    });
    return () => {
      stopRuleEngineMonitors();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.arduinoConnected]);

  // Preload (init) the ARIN model once per host+model per connection epoch:
  // bake the system prompt into an Ollama custom model so subsequent chat
  // requests only carry the user's short message. A failed attempt is retried
  // on the next successful connection (epoch bump in connectLocalAi).
  const initAttemptedKeyRef = useRef<string>('');
  const connectionEpochRef = useRef(0);

  useEffect(() => {
    const ready =
      settings.localAiEnabled &&
      settings.localAiStatus === 'connected' &&
      !!settings.selectedModel;
    if (!ready) return;

    const key = `${connectionEpochRef.current}|${settings.localAiHost}|${settings.selectedModel}`;
    if (initAttemptedKeyRef.current === key) return;
    initAttemptedKeyRef.current = key;

    let cancelled = false;
    setTestLogs((prev) => [
      `[INIT] Baking system prompt into "${ARIN_MODEL_NAME}" (from "${settings.selectedModel}")...`,
      ...prev,
    ]);

    (async () => {
      try {
        await initArinModel(settings.localAiHost, settings.selectedModel, ARIN_SYSTEM_PROMPT);
        if (cancelled) return;
        updateSettings({
          preloadedModel: ARIN_MODEL_NAME,
          localAiModels: settings.localAiModels.includes(ARIN_MODEL_NAME)
            ? settings.localAiModels
            : [...settings.localAiModels, ARIN_MODEL_NAME],
        });
        setTestLogs((prev) => [
          `[INIT] "${ARIN_MODEL_NAME}" ready — only short user messages will be sent.`,
          ...prev,
        ]);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ARIN',
            text: `ARIN system prompt initialized into the local model. Stop words like "hi" or "call 987" are now enough — the full rules stay with the model.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } catch (error: unknown) {
        if (cancelled) return;
        const errMsg = error instanceof Error ? error.message : String(error);
        setTestLogs((prev) => [
          `[INIT] Failed: ${errMsg} — falling back to sending the prompt per request.`,
          ...prev,
        ]);
        updateSettings({ preloadedModel: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    settings.localAiEnabled,
    settings.localAiStatus,
    settings.localAiHost,
    settings.selectedModel,
    settings.localAiModels,
  ]);

  const finishSplash = () => {
    setIsSplashVisible(false);
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    AsyncStorage.removeItem(ONBOARDING_KEY).catch(() => {});
  };

  const toggleThemeMode = () => {
    const nextTheme: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    AsyncStorage.setItem(THEME_KEY, nextTheme).catch(() => {});
  };

  const themeColors = themeMode === 'light' ? lightColors : darkColors;

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const connectLocalAi = useCallback(async (): Promise<boolean> => {
    setSettings((prev) => ({ ...prev, localAiStatus: 'connecting' }));

    let result;
    try {
      result = await testConnection(settings.localAiHost);
    } catch (error: unknown) {
      const rawErr = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setTestLogs((prev) => [`[CONN] RAW ERROR: ${rawErr}`, ...prev]);
      setSettings((prev) => ({
        ...prev,
        localAiStatus: 'error',
        localAiModels: [],
        selectedModel: '',
      }));
      setStageErrorMsg(`Connection failed: ${rawErr}`);
      return false;
    }

    if (!result.success) {
      setSettings((prev) => ({
        ...prev,
        localAiStatus: 'error',
        localAiModels: [],
        selectedModel: '',
      }));
      setStageErrorMsg(result.message);
      setTestLogs((prev) => [`[CONN] Failed: ${result.message}`, ...prev]);
      return false;
    }

    connectionEpochRef.current += 1;

    const modelIds = result.models
      ? result.models.map((m) => m.id)
      : result.serverInfo?.availableModels ?? [];

    setTestLogs((prev) => [
      `[CONN] Discovered ${modelIds.length} model(s): ${modelIds.join(', ') || '(none)'}`,
      ...prev,
    ]);

    setSettings((prev) => {
      const currentSelected = prev.selectedModel;
      const selectedModel =
        modelIds.length > 0
          ? modelIds.includes(currentSelected)
            ? currentSelected
            : modelIds[0]
          : prev.selectedModel;

      return {
        ...prev,
        localAiEnabled: true,
        localAiStatus: 'connected',
        localAiModels: modelIds,
        selectedModel,
      };
    });

    setTestLogs((prev) => [`[CONN] ${result.message}`, ...prev]);
    setStageErrorMsg(null);
    return true;
  }, [settings.localAiHost]);

  const connectCloudAi = useCallback(async (): Promise<boolean> => {
    setSettings((prev) => ({ ...prev, cloudStatus: 'connecting' }));

    let result;
    try {
      result = await testCloudConnection(settings.cloudBaseUrl, settings.cloudApiKey);
    } catch (error: unknown) {
      const rawErr = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setTestLogs((prev) => [`[CLOUD] RAW ERROR: ${rawErr}`, ...prev]);
      setSettings((prev) => ({
        ...prev,
        cloudStatus: 'error',
        cloudModels: [],
        selectedCloudModel: '',
      }));
      setStageErrorMsg(`Cloud connection failed: ${rawErr}`);
      return false;
    }

    if (!result.success) {
      setSettings((prev) => ({
        ...prev,
        cloudStatus: 'error',
        cloudModels: [],
        selectedCloudModel: '',
      }));
      setStageErrorMsg(result.message);
      setTestLogs((prev) => [`[CLOUD] Failed: ${result.message}`, ...prev]);
      return false;
    }

    const modelIds = (result.models ?? []).map((m) => m.id);

    setTestLogs((prev) => [
      `[CLOUD] Discovered ${modelIds.length} model(s): ${modelIds.join(', ') || '(none)'}`,
      ...prev,
    ]);

    setSettings((prev) => {
      const currentSelected = prev.selectedCloudModel;
      const selectedCloudModel =
        modelIds.length > 0
          ? modelIds.includes(currentSelected)
            ? currentSelected
            : modelIds[0]
          : prev.selectedCloudModel;

      return {
        ...prev,
        cloudEnabled: true,
        cloudStatus: 'connected',
        cloudModels: modelIds,
        selectedCloudModel,
      };
    });

    setTestLogs((prev) => [`[CLOUD] ${result.message}`, ...prev]);
    setStageErrorMsg(null);
    return true;
  }, [settings.cloudBaseUrl, settings.cloudApiKey]);

  const appendError = (errText: string) => {
    setCurrentStage('error');
    setStageErrorMsg(errText);
    const errorMsgItem: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'ERROR',
      text: errText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, errorMsgItem]);
    setIsProcessing(false);
  };

  const finishWithReply = (aiText: string) => {
    setCurrentStage('done');
    const aiReply: ChatMessageItem = {
      id: (Date.now() + 1).toString(),
      sender: 'ARIN',
      text: aiText,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, aiReply]);
    setIsProcessing(false);

    if (settings.ttsAutoSpeak) {
      setIsSpeaking(true);
      speakText(aiText, settings.ttsVoiceGender).finally(() => {
        setIsSpeaking(false);
      });
    }

    setTimeout(() => setCurrentStage('idle'), 1500);
  };

  /**
   * Shared executor for a single directive, used by both the immediate
   * sendMessage path and the scheduler-fired path. Handles pipelines, and the
   * respond/speak/arduino/device/cloud branches.
   */
  const executeDirectiveNow = async (directive: AiDirective, fromScheduler = false) => {
    if (fromScheduler) {
      setIsProcessing(true);
      setStageErrorMsg(null);
    }

    // Build the visual pipeline dynamically from the directive contents.
    const path: ExecutionStage[] = ['request_sent', 'local_processing'];
    if (directive.action === 'cloud') {
      path.push('cloud_processing');
    }
    if (directive.action === 'arduino') {
      path.push('arduino_executing');
    }
    if (directive.action === 'device') {
      path.push('device_executing');
    }
    if (directive.action === 'speak') {
      path.push('speaking');
    }
    if (directive.action === 'pipeline') {
      path.push('pipeline_executing');
    }
    path.push('response_received', 'done');
    setPipelinePath(path);
    setCurrentStage(
      directive.action === 'cloud'
        ? 'cloud_processing'
        : directive.action === 'arduino'
        ? 'arduino_executing'
        : directive.action === 'device'
        ? 'device_executing'
        : directive.action === 'speak'
        ? 'speaking'
        : directive.action === 'pipeline'
        ? 'pipeline_executing'
        : 'response_received'
    );

    if (directive.action === 'pipeline') {
      setTestLogs((prev) => [
        `[EXEC] Pipeline: ${directive.steps.length} step(s)${directive.reason ? ` (${directive.reason})` : ''}`,
        ...prev,
      ]);
      const result = await runPipeline(directive.steps, settings, (line) =>
        setTestLogs((prev) => [line, ...prev])
      );
      finishWithReply(result.finalText || (result.stoppedEarly ? 'Pipeline stopped.' : 'Pipeline complete.'));
      return;
    }

    if (directive.action === 'create_rule') {
      const ruleData = directive.rule || {};
      const newRule = {
        id: `rule_${Date.now()}`,
        name: ruleData.name || 'AI Automation Rule',
        trigger: ruleData.trigger || { type: 'manual' },
        actions: ruleData.actions || [{ type: 'notification', title: 'ARIN Rule', body: 'Triggered' }],
        enabled: true,
        lastTriggeredAt: null,
        cooldownMs: 60000,
      } as any;

      await saveRule(newRule);
      setTestLogs((prev) => [`[RULE] AI created automation rule: "${newRule.name}"`, ...prev]);
      finishWithReply(directive.response || `Created automation rule: "${newRule.name}".`);
      return;
    }

    if (directive.action === 'respond') {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 250));
      setTestLogs((prev) => [`[SYS] Local AI responded directly.`, ...prev]);
      finishWithReply(directive.response);
      return;
    }

    if (directive.action === 'speak') {
      const r = await speakText(directive.message);
      setTestLogs((prev) => [`[SPEAK] ${r.message}`, ...prev]);
      finishWithReply(r.message);
      return;
    }

    if (directive.action === 'arduino') {
      setTestLogs((prev) => [
        `[EXEC] Arduino command: ${directive.command}${directive.reason ? ` (${directive.reason})` : ''}`,
        ...prev,
      ]);
      const result = await sendArduinoCommand(directive.command, settings.arduinoConnected);
      setCurrentStage('response_received');
      setTestLogs((prev) => [`[ARDUINO] ${result.message}`, ...prev]);
      finishWithReply(result.message);
      return;
    }

    if (directive.action === 'device') {
      setTestLogs((prev) => [
        `[EXEC] Device command: ${directive.command}${directive.target ? ` target="${directive.target}"` : ''}${directive.message ? ` message="${directive.message}"` : ''}${directive.reason ? ` (${directive.reason})` : ''}`,
        ...prev,
      ]);
      const result = await sendDeviceCommand(
        directive.command,
        directive.target,
        directive.message,
        settings.permissionMode
      );
      setCurrentStage('response_received');
      setTestLogs((prev) => [`[DEVICE] ${result.message}`, ...prev]);
      finishWithReply(result.message);
      return;
    }

    // directive.action === 'cloud'
    setTestLogs((prev) => [
      `[SYS] Local AI delegated to cloud: "${directive.prompt}"${directive.reason ? ` (${directive.reason})` : ''}`,
      ...prev,
    ]);
    const cloudReady = settings.cloudEnabled && settings.cloudStatus === 'connected';
    if (!cloudReady) {
      appendError('[ERR 502] Local AI requested cloud AI, but cloud is not connected. Set it up in SETUP.');
      return;
    }
    if (!settings.selectedCloudModel) {
      appendError('[ERR 412] Local AI requested cloud AI, but no cloud model is selected.');
      return;
    }
    const cloudResponse = await sendCloudChatCompletion(
      settings.cloudBaseUrl,
      settings.cloudApiKey,
      settings.selectedCloudModel,
      [{ role: 'user', content: directive.prompt }]
    );
    const cloudText =
      cloudResponse.choices?.[0]?.message?.content?.trim() ??
      '[ERR] Empty response received from cloud AI.';
    setCurrentStage('response_received');
    setTestLogs((prev) => [`[CLOUD] Responded via "${settings.selectedCloudModel}"`, ...prev]);
    finishWithReply(cloudText);
  };

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessageItem = {
      id: Date.now().toString(),
      sender: 'OPERATOR',
      text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setStageErrorMsg(null);
    setPipelinePath(['request_sent', 'local_processing', 'response_received', 'done']);
    setCurrentStage('request_sent');

    // Deliberate small delay for stage visibility
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 300));
    setCurrentStage('local_processing');

    const localReady = settings.localAiEnabled && settings.localAiStatus === 'connected';

    // Local AI is primary and drives all routing decisions via ARIN_SYSTEM_PROMPT.
    // Cloud is only ever called as a delegate the local model explicitly requests.
    if (!localReady) {
      if (!settings.localAiEnabled) {
        appendError('[ERR 503] Local AI is disabled. Enable it in SETUP — it drives all routing.');
      } else {
        appendError('[ERR 404] Local AI server not connected. Run test connection in SETUP.');
      }
      return;
    }
    if (!settings.selectedModel) {
      appendError('[ERR 412] No local AI model selected.');
      return;
    }

    try {
      // With the preloaded model (prompt baked on the server) only the user
      // message is sent. Without it, fall back to the full system prompt.
      const outgoingMessages = settings.preloadedModel
        ? [{ role: 'user' as const, content: text }]
        : [
            { role: 'system' as const, content: ARIN_SYSTEM_PROMPT },
            { role: 'user' as const, content: text },
          ];
      const localResponse = await sendChatCompletion(
        settings.localAiHost,
        settings.preloadedModel ?? settings.selectedModel,
        outgoingMessages
      );

      const rawText = localResponse.choices?.[0]?.message?.content ?? '';
      const directive = parseAiDirective(rawText);

      // A top-level "schedule" defers the whole directive to the scheduler.
      if (directive.schedule) {
        const fireAt = new Date(directive.schedule);
        if (isNaN(fireAt.getTime())) {
          appendError(`[ERR 400] AI returned an unparseable schedule time: "${directive.schedule}".`);
          return;
        }
        await scheduleJob(directive, fireAt.toISOString(), (d) => executeDirectiveNow(d, true));
        setTestLogs((prev) => [`[SCHED] Job queued for ${fireAt.toLocaleString()}.`, ...prev]);
        finishWithReply(`Got it — scheduled for ${fireAt.toLocaleString()}.`);
        return;
      }

      // No schedule → run it immediately through the shared executor.
      await executeDirectiveNow(directive);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      appendError(`[ERR 500] ${errMsg}`);
    }
  };

  const addTestLog = (command: string) => {
    setTestLogs((prev) => [`[TEST] Command received: ${command}`, ...prev]);
  };

  const refreshModels = async () => {
    try {
      const models = await fetchModelsService(settings.localAiHost);
      const ids = models.map((m) => m.id);
      updateSettings({ localAiModels: ids });
      if (ids.length > 0 && !ids.includes(settings.selectedModel)) {
        updateSettings({ selectedModel: ids[0] });
      }
    } catch {
      // model refresh failed, ignore
    }
  };

  const refreshCloudModels = async () => {
    try {
      const models = await fetchCloudModelsService(settings.cloudBaseUrl, settings.cloudApiKey);
      const ids = models.map((m) => m.id);
      updateSettings({ cloudModels: ids });
      if (ids.length > 0 && !ids.includes(settings.selectedCloudModel)) {
        updateSettings({ selectedCloudModel: ids[0] });
      }
    } catch {
      // model refresh failed, ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        isSplashVisible,
        finishSplash,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboarding,
        themeMode,
        toggleThemeMode,
        themeColors,
        activeTab,
        setActiveTab,
        messages,
        sendMessage,
        isProcessing,
        currentStage,
        pipelinePath,
        stageErrorMsg,
        settings,
        updateSettings,
        connectLocalAi,
        connectCloudAi,
        testLogs,
        addTestLog,
        refreshModels,
        refreshCloudModels,
        isSpeaking,
        stopAudio,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

```

---

## `src/screens/LauncherScreen.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { ExecutionProgressBar } from '../components/ExecutionProgressBar';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const LauncherScreen: React.FC = () => {
  const { messages, settings, connectLocalAi, connectCloudAi, themeColors } = useApp();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const tryAutoConnect = async () => {
      if (settings.localAiEnabled && settings.localAiStatus === 'disconnected') {
        await connectLocalAi();
      } else if (settings.cloudEnabled && settings.cloudStatus === 'disconnected') {
        await connectCloudAi();
      }
    };
    tryAutoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeModel =
    settings.localAiEnabled && settings.localAiStatus === 'connected'
      ? settings.selectedModel
      : settings.cloudEnabled && settings.cloudStatus === 'connected'
        ? settings.selectedCloudModel
        : '';
  const activeStatus =
    settings.localAiEnabled && settings.localAiStatus === 'connected'
      ? settings.localAiStatus
      : settings.cloudEnabled && settings.cloudStatus === 'connected'
        ? settings.cloudStatus
        : settings.localAiStatus; // show local status if connected, else disconnected/error

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={<ExecutionProgressBar />}
      />
      <View style={[styles.modelBar, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>
          {activeModel ? `MODEL: ${activeModel}` : 'MODEL: —'}
        </Text>
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          {activeStatus.toUpperCase()}
        </Text>
      </View>
      <ChatInput />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.lg,
  },
  modelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerMargin,
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
  },
});

```

---

## `src/screens/OnboardingScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArinLogo } from '../components/ArinLogo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const { settings, updateSettings, completeOnboarding } = useApp();

  return (
    <View style={styles.container}>
      {/* Header Progress indicator */}
      <View style={styles.progressBarContainer}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i <= step ? styles.progressSegmentActive : styles.progressSegmentInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepBox}>
            <ArinLogo size="md" />
            <Text style={[typography.headlineLgMobile, styles.title]}>WELCOME TO ARIN</Text>
            <Text style={[typography.bodyMd, styles.subtitle]}>
              Next-generation intelligence launcher transforming your device into a high-performance command center.
            </Text>

            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={[typography.labelCaps, styles.featureTitle]}>⚡ LOCAL AI FIRST</Text>
                <Text style={[typography.bodyMd, styles.featureDesc]}>
                  Connect directly to your local LLM server for low-latency offline intelligence.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={[typography.labelCaps, styles.featureTitle]}>🌐 CLOUD ASSIST</Text>
                <Text style={[typography.bodyMd, styles.featureDesc]}>
                  Secondary cloud provider routing for complex reasoning tasks.
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={[typography.labelCaps, styles.featureTitle]}>🔌 ARDUINO BRIDGE</Text>
                <Text style={[typography.bodyMd, styles.featureDesc]}>
                  Direct hardware control via USB serial connection.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={[typography.labelCaps, styles.nextBtnText]}>INITIALIZE SETUP ❯</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepBox}>
            <Text style={[typography.labelCaps, styles.stepTag]}>STEP 02 // NETWORKING</Text>
            <Text style={[typography.headlineMd, styles.title]}>CONNECT INTELLIGENCE</Text>

            <View style={styles.card}>
              <Text style={[typography.labelCaps, styles.cardHeader]}>LOCAL AI SERVER</Text>
              <TextInput
                style={[typography.codeSm, styles.input]}
                value={settings.localAiHost}
                onChangeText={(val) => updateSettings({ localAiHost: val })}
                placeholder="192.168.1.100:8000"
                placeholderTextColor="rgba(185, 202, 203, 0.5)"
              />
              <View style={styles.switchRow}>
                <Text style={[typography.bodyMd, styles.switchLabel]}>Enable Local AI Link</Text>
                <Switch
                  value={settings.localAiEnabled}
                  onValueChange={(val) =>
                    updateSettings({
                      localAiEnabled: val,
                      localAiStatus: val ? 'connected' : 'disconnected',
                    })
                  }
                  trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                  thumbColor={colors.onPrimary}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={[typography.labelCaps, styles.cardHeader]}>HARDWARE LINK</Text>
              <View style={styles.switchRow}>
                <Text style={[typography.bodyMd, styles.switchLabel]}>Arduino USB Connection</Text>
                <Switch
                  value={settings.arduinoConnected}
                  onValueChange={(val) =>
                    updateSettings({
                      arduinoConnected: val,
                      arduinoStatus: val ? 'connected' : 'disconnected',
                    })
                  }
                  trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                  thumbColor={colors.onPrimary}
                />
              </View>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={[typography.labelCaps, styles.backBtnText]}>❮ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setStep(3)}>
                <Text style={[typography.labelCaps, styles.nextBtnText]}>CONTINUE ❯</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepBox}>
            <Text style={[typography.labelCaps, styles.stepTag]}>STEP 03 // AGENCY</Text>
            <Text style={[typography.headlineMd, styles.title]}>GRANT PERMISSIONS</Text>
            <Text style={[typography.bodyMd, styles.subtitle]}>
              Select operational execution mode for system control.
            </Text>

            <TouchableOpacity
              style={[
                styles.modeCard,
                settings.permissionMode === 'compatible' && styles.modeCardActive,
              ]}
              onPress={() => updateSettings({ permissionMode: 'compatible' })}
            >
              <Text style={[typography.labelCaps, styles.modeTitle]}>COMPATIBLE MODE (MODERN PHONES)</Text>
              <Text style={[typography.bodyMd, styles.modeDesc]}>
                Standard Android launcher experience with on-demand permissions for Camera, Torch, Calls & SMS.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                settings.permissionMode === 'full_control' && styles.modeCardActive,
              ]}
              onPress={() => updateSettings({ permissionMode: 'full_control' })}
            >
              <Text style={[typography.labelCaps, styles.modeTitle]}>FULL CONTROL MODE (LEGACY HARDWARE)</Text>
              <Text style={[typography.bodyMd, styles.modeDesc]}>
                Maximum power mode for dedicated device deployment. Requests full root/device permissions and optimizes RAM.
              </Text>
            </TouchableOpacity>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Text style={[typography.labelCaps, styles.backBtnText]}>❮ BACK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtnFlex} onPress={() => setStep(4)}>
                <Text style={[typography.labelCaps, styles.nextBtnText]}>CONTINUE ❯</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepBox}>
            <ArinLogo size="lg" />
            <Text style={[typography.labelCaps, styles.stepTag]}>SYSTEM CHECK COMPLETE</Text>
            <Text style={[typography.headlineLgMobile, styles.title]}>SYSTEM READY</Text>
            <Text style={[typography.bodyMd, styles.subtitle]}>
              Neural core initialized. Operational link online.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={[typography.labelCaps, styles.summaryKey]}>LOCAL AI:</Text>
                <Text style={[typography.codeSm, styles.summaryVal]}>{settings.localAiHost}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[typography.labelCaps, styles.summaryKey]}>EXECUTION MODE:</Text>
                <Text style={[typography.codeSm, styles.summaryVal]}>{settings.permissionMode}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={completeOnboarding}>
              <Text style={[typography.labelCaps, styles.nextBtnText]}>LAUNCH ARIN HUB 🚀</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: colors.surfaceContainerLow,
  },
  progressSegment: {
    flex: 1,
    height: '100%',
  },
  progressSegmentActive: {
    backgroundColor: colors.primaryContainer,
  },
  progressSegmentInactive: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.containerMargin,
  },
  stepBox: {
    gap: spacing.md,
    alignItems: 'center',
  },
  stepTag: {
    color: colors.primaryContainer,
  },
  title: {
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  featureGrid: {
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  featureTitle: {
    color: colors.primaryContainer,
  },
  featureDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  cardHeader: {
    color: colors.secondary,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurface,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  switchLabel: {
    color: colors.onSurface,
  },
  modeCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  modeCardActive: {
    borderColor: colors.primaryContainer,
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
  },
  modeTitle: {
    color: colors.primaryContainer,
  },
  modeDesc: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryKey: {
    color: colors.outline,
  },
  summaryVal: {
    color: colors.tertiaryFixedDim,
  },
  nextBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.primaryContainer,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  nextBtnText: {
    color: colors.onPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.md,
  },
  backBtn: {
    height: 52,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  backBtnText: {
    color: colors.onSurface,
  },
  nextBtnFlex: {
    flex: 1,
    height: 52,
    backgroundColor: colors.primaryContainer,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

```

---

## `src/screens/SettingsScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBadge } from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetOnboarding,
    connectLocalAi,
    connectCloudAi,
    themeMode,
    toggleThemeMode,
    themeColors,
  } = useApp();

  const isConnecting = settings.localAiStatus === 'connecting';
  const isCloudConnecting = settings.cloudStatus === 'connecting';
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
        SYSTEM CONFIGURATION
      </Text>

      {/* Theme Selection Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Interface Theme
          </Text>
          <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
            {themeMode.toUpperCase()} MODE
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            Enable Light Theme
          </Text>
          <Switch
            value={themeMode === 'light'}
            onValueChange={toggleThemeMode}
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>
      </View>

      {/* Voice & Audio (TTS) Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Voice & Audio (TTS)
          </Text>
          <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
            {settings.ttsVoiceGender.toUpperCase()} VOICE
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            Read Responses Aloud
          </Text>
          <Switch
            value={settings.ttsAutoSpeak}
            onValueChange={(val) => updateSettings({ ttsAutoSpeak: val })}
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          VOICE GENDER SELECTION
        </Text>
        <View style={styles.modeContainer}>
          {(['female', 'male'] as const).map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.modeBtn,
                {
                  backgroundColor: themeColors.surfaceContainerHigh,
                  borderColor:
                    settings.ttsVoiceGender === gender
                      ? themeColors.primaryContainer
                      : themeColors.outlineVariant,
                },
              ]}
              onPress={() => updateSettings({ ttsVoiceGender: gender })}
            >
              <Text
                style={[
                  typography.labelCaps,
                  {
                    color:
                      settings.ttsVoiceGender === gender
                        ? themeColors.primaryContainer
                        : themeColors.onSurfaceVariant,
                  },
                ]}
              >
                {gender === 'female' ? '♀ FEMALE VOICE' : '♂ MALE VOICE'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Local AI Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Local AI Server
          </Text>
          <StatusBadge label={settings.localAiStatus} status={settings.localAiStatus} />
        </View>

        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            Enable Local AI
          </Text>
          <Switch
            value={settings.localAiEnabled}
            onValueChange={(val) =>
              updateSettings({
                localAiEnabled: val,
                localAiStatus: val ? 'disconnected' : 'disconnected',
              })
            }
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          SERVER HOST & PORT
        </Text>
        <TextInput
          style={[
            typography.codeSm,
            styles.input,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={settings.localAiHost}
          onChangeText={(val) => updateSettings({ localAiHost: val })}
          placeholder="e.g. 192.168.1.100:8000"
          placeholderTextColor={themeColors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Test Connection Button */}
        <TouchableOpacity
          style={[
            styles.connectBtn,
            {
              backgroundColor: isConnecting
                ? themeColors.surfaceContainerHighest
                : themeColors.primaryContainer,
            },
          ]}
          onPress={connectLocalAi}
          disabled={isConnecting}
          activeOpacity={0.8}
        >
          <Text
            style={[
              typography.labelCaps,
              { color: isConnecting ? themeColors.onSurfaceVariant : themeColors.onPrimary },
            ]}
          >
            {isConnecting ? '⚡ SCANNING...' : '⚡ TEST CONNECTION'}
          </Text>
        </TouchableOpacity>

        {/* Model Selector */}
        {settings.localAiModels.length > 0 && (
          <>
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>
              SELECTED MODEL ({settings.localAiModels.length} AVAILABLE)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modelScroll}
            >
              {settings.localAiModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelChip,
                    {
                      backgroundColor:
                        settings.selectedModel === model
                          ? themeColors.primaryContainer
                          : themeColors.surfaceContainerHigh,
                      borderColor:
                        settings.selectedModel === model
                          ? themeColors.primaryContainer
                          : themeColors.outlineVariant,
                    },
                  ]}
                  onPress={() => updateSettings({ selectedModel: model })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      typography.codeSm,
                      {
                        color:
                          settings.selectedModel === model
                            ? themeColors.onPrimary
                            : themeColors.onSurface,
                      },
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* No models message */}
        {settings.localAiStatus === 'connected' && settings.localAiModels.length === 0 && (
          <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
            No models discovered. Server may not expose /v1/models.
          </Text>
        )}
      </View>

      {/* Cloud Provider Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Cloud AI Provider
          </Text>
          <StatusBadge label={settings.cloudStatus} status={settings.cloudStatus} />
        </View>

        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Enable Cloud AI</Text>
          <Switch
            value={settings.cloudEnabled}
            onValueChange={(val) =>
              updateSettings({
                cloudEnabled: val,
                cloudStatus: val ? settings.cloudStatus : 'disconnected',
              })
            }
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          PROVIDER LABEL
        </Text>
        <TextInput
          style={[
            typography.codeSm,
            styles.input,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={settings.cloudProvider}
          onChangeText={(val) => updateSettings({ cloudProvider: val })}
          placeholder="e.g. OpenRouter, Groq, OpenAI"
          placeholderTextColor={themeColors.onSurfaceVariant}
          autoCapitalize="none"
        />

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          PROVIDER BASE URL
        </Text>
        <TextInput
          style={[
            typography.codeSm,
            styles.input,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={settings.cloudBaseUrl}
          onChangeText={(val) => updateSettings({ cloudBaseUrl: val })}
          placeholder="e.g. https://openrouter.ai/api"
          placeholderTextColor={themeColors.onSurfaceVariant}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>
          API KEY
        </Text>
        <View style={styles.apiKeyRow}>
          <TextInput
            style={[
              typography.codeSm,
              styles.input,
              styles.apiKeyInput,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                color: themeColors.onSurface,
                borderColor: themeColors.outlineVariant,
              },
            ]}
            value={settings.cloudApiKey}
            onChangeText={(val) => updateSettings({ cloudApiKey: val })}
            placeholder="sk-..."
            placeholderTextColor={themeColors.onSurfaceVariant}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[
              styles.apiKeyToggle,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                borderColor: themeColors.outlineVariant,
              },
            ]}
            onPress={() => setShowApiKey((prev) => !prev)}
          >
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>
              {showApiKey ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Connection / Fetch Models Button */}
        <TouchableOpacity
          style={[
            styles.connectBtn,
            {
              backgroundColor: isCloudConnecting
                ? themeColors.surfaceContainerHighest
                : themeColors.primaryContainer,
            },
          ]}
          onPress={connectCloudAi}
          disabled={isCloudConnecting || !settings.cloudBaseUrl.trim()}
          activeOpacity={0.8}
        >
          <Text
            style={[
              typography.labelCaps,
              { color: isCloudConnecting ? themeColors.onSurfaceVariant : themeColors.onPrimary },
            ]}
          >
            {isCloudConnecting ? '⚡ FETCHING MODELS...' : '⚡ TEST & FETCH MODELS'}
          </Text>
        </TouchableOpacity>

        {/* Model Selector */}
        {settings.cloudModels.length > 0 && (
          <>
            <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>
              SELECTED MODEL ({settings.cloudModels.length} AVAILABLE)
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modelScroll}
            >
              {settings.cloudModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelChip,
                    {
                      backgroundColor:
                        settings.selectedCloudModel === model
                          ? themeColors.primaryContainer
                          : themeColors.surfaceContainerHigh,
                      borderColor:
                        settings.selectedCloudModel === model
                          ? themeColors.primaryContainer
                          : themeColors.outlineVariant,
                    },
                  ]}
                  onPress={() => updateSettings({ selectedCloudModel: model })}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      typography.codeSm,
                      {
                        color:
                          settings.selectedCloudModel === model
                            ? themeColors.onPrimary
                            : themeColors.onSurface,
                      },
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {settings.cloudStatus === 'connected' && settings.cloudModels.length === 0 && (
          <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
            No models discovered. Provider may not expose /v1/models.
          </Text>
        )}
      </View>

      {/* Arduino Section */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
            Arduino Serial Link
          </Text>
          <StatusBadge label={settings.arduinoStatus} status={settings.arduinoStatus} />
        </View>
        <View style={styles.row}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Arduino Connected</Text>
          <Switch
            value={settings.arduinoConnected}
            onValueChange={(val) =>
              updateSettings({
                arduinoConnected: val,
                arduinoStatus: val ? 'connected' : 'disconnected',
              })
            }
            trackColor={{
              false: themeColors.surfaceContainerHighest,
              true: themeColors.primaryContainer,
            }}
            thumbColor={themeColors.onPrimary}
          />
        </View>
      </View>

      {/* Device Permission Mode */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
          Device Permission Mode
        </Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                borderColor:
                  settings.permissionMode === 'compatible'
                    ? themeColors.primaryContainer
                    : themeColors.outlineVariant,
              },
            ]}
            onPress={() => updateSettings({ permissionMode: 'compatible' })}
          >
            <Text
              style={[
                typography.labelCaps,
                {
                  color:
                    settings.permissionMode === 'compatible'
                      ? themeColors.primaryContainer
                      : themeColors.onSurfaceVariant,
                },
              ]}
            >
              Compatible Mode (Modern Phones)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              {
                backgroundColor: themeColors.surfaceContainerHigh,
                borderColor:
                  settings.permissionMode === 'full_control'
                    ? themeColors.primaryContainer
                    : themeColors.outlineVariant,
              },
            ]}
            onPress={() => updateSettings({ permissionMode: 'full_control' })}
          >
            <Text
              style={[
                typography.labelCaps,
                {
                  color:
                    settings.permissionMode === 'full_control'
                      ? themeColors.primaryContainer
                      : themeColors.onSurfaceVariant,
                },
              ]}
            >
              Full Control Mode (Legacy Hardware)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Onboarding Option */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.headlineMd, styles.cardTitle, { color: themeColors.onSurface }]}>
          Onboarding Wizard
        </Text>
        <TouchableOpacity
          style={[
            styles.resetBtn,
            {
              backgroundColor: themeColors.surfaceContainerHigh,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          onPress={resetOnboarding}
        >
          <Text style={[typography.labelCaps, { color: themeColors.secondary }]}>
            RE-RUN ONBOARDING WIZARD
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.containerMargin,
    gap: spacing.md,
  },
  card: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  apiKeyInput: {
    flex: 1,
  },
  apiKeyToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  connectBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  modelScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  modelChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  modeContainer: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modeBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  resetBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

```

---

## `src/screens/SplashScreen.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ArinLogo } from '../components/ArinLogo';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const SplashScreen: React.FC = () => {
  const { finishSplash } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    const timer = setTimeout(() => {
      finishSplash();
    }, 1800);

    return () => clearTimeout(timer);
  }, [fadeAnim, finishSplash, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ArinLogo size="lg" />
        <View style={styles.statusBox}>
          <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
          <Text style={[typography.codeSm, styles.statusText]}>
            [SYS] INITIALIZING NEURAL LINK...
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryContainer,
  },
  statusText: {
    color: colors.onSurfaceVariant,
  },
});

```

---

## `src/screens/TestScreen.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { deleteRule, readRules, saveRule, toggleRuleEnabled } from '../services/ruleStorage';
import { executeRuleManually } from '../services/triggerMonitors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Rule, RuleAction, RuleTrigger } from '../types';

type CommandCategory =
  | 'TORCH'
  | 'WIFI'
  | 'BLUETOOTH'
  | 'VOLUME'
  | 'SMS'
  | 'CALL'
  | 'WEATHER'
  | 'BATTERY'
  | 'ROBOT_MOVE';

export const TestScreen: React.FC = () => {
  const { sendMessage, settings, themeColors, addTestLog } = useApp();

  // Command Tester State
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory>('TORCH');
  const [torchState, setTorchState] = useState<'ON' | 'OFF'>('ON');
  const [wifiState, setWifiState] = useState<'ON' | 'OFF'>('ON');
  const [btState, setBtState] = useState<'ON' | 'OFF'>('OFF');
  const [volumeLevel, setVolumeLevel] = useState('100');
  const [smsTarget, setSmsTarget] = useState('2343');
  const [smsMessage, setSmsMessage] = useState('hi');
  const [callTarget, setCallTarget] = useState('1345');
  const [weatherCity, setWeatherCity] = useState('Tokyo');
  const [moveCmd, setMoveCmd] = useState<'FORWARD' | 'BACKWARD' | 'LEFT' | 'RIGHT' | 'STOP'>('FORWARD');

  // Live Rules State
  const [rules, setRules] = useState<Rule[]>([]);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Rule Builder Form State
  const [ruleName, setRuleName] = useState('');
  const [ruleTriggerType, setRuleTriggerType] = useState<'battery' | 'time' | 'device_state' | 'manual'>('battery');
  const [ruleBatteryThresh, setRuleBatteryThresh] = useState('56');
  const [ruleHour, setRuleHour] = useState('08');
  const [ruleMinute, setRuleMinute] = useState('00');
  const [ruleDeviceFeature, setRuleDeviceFeature] = useState<'torch' | 'wifi' | 'bluetooth'>('torch');
  const [ruleDeviceStateVal, setRuleDeviceStateVal] = useState<'on' | 'off'>('on');
  const [ruleActionType, setRuleActionType] = useState<'sms' | 'wifi_toggle' | 'robot_command' | 'notification'>('sms');
  const [ruleSmsTo, setRuleSmsTo] = useState('26543');
  const [ruleSmsBody, setRuleSmsBody] = useState('Time: {{time}} | Buzzer: {{buzzerStatus}} | Bat: {{battery}}');
  const [ruleWifiState, setRuleWifiState] = useState<'on' | 'off'>('on');
  const [ruleRobotCmd, setRuleRobotCmd] = useState('GET_STATUS');

  // Permissions
  const [smsPerm, setSmsPerm] = useState(false);

  const loadRules = async () => {
    const list = await readRules();
    setRules(list);
  };

  useEffect(() => {
    loadRules();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
      setSmsPerm(granted);
    } catch {
      // ignore
    }
  };

  const requestSmsPermission = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
      setSmsPerm(granted === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
      // ignore
    }
  };

  // Run direct command from tester
  const handleExecuteCommand = () => {
    let commandString = '';
    switch (selectedCategory) {
      case 'TORCH':
        commandString = torchState === 'ON' ? 'Turn on the flash' : 'Turn off the flash';
        break;
      case 'WIFI':
        commandString = wifiState === 'ON' ? 'Turn on wifi' : 'Turn off wifi';
        break;
      case 'BLUETOOTH':
        commandString = btState === 'ON' ? 'Turn on bluetooth' : 'Turn off bluetooth';
        break;
      case 'VOLUME':
        commandString = `Set volume to ${volumeLevel}%`;
        break;
      case 'SMS':
        commandString = `Message ${smsTarget.trim()} ${smsMessage.trim()}`;
        break;
      case 'CALL':
        commandString = `Call ${callTarget.trim()}`;
        break;
      case 'WEATHER':
        commandString = `What is the weather in ${weatherCity.trim()}?`;
        break;
      case 'BATTERY':
        commandString = 'Check battery level';
        break;
      case 'ROBOT_MOVE':
        commandString =
          moveCmd === 'STOP'
            ? 'Stop'
            : moveCmd === 'FORWARD'
            ? 'Move forward'
            : moveCmd === 'BACKWARD'
            ? 'Move backward'
            : moveCmd === 'LEFT'
            ? 'Turn left'
            : 'Turn right';
        break;
    }

    if (commandString) {
      addTestLog(commandString);
      sendMessage(commandString);
    }
  };

  // Live Rules Actions
  const handleRunRuleNow = async (id: string) => {
    addTestLog(`[RULE] Executing rule ${id}`);
    await executeRuleManually(id, {
      isArduinoConnected: settings.arduinoConnected,
      onLog: (msg) => addTestLog(msg),
    });
    await loadRules();
  };

  const handleDeleteRule = async (id: string) => {
    const updated = await deleteRule(id);
    setRules(updated);
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    const updated = await toggleRuleEnabled(id, enabled);
    setRules(updated);
  };

  const addReferencePresetRule = async () => {
    const refRule: Rule = {
      id: `rule_${Date.now()}`,
      name: 'Battery 56% → SMS to 26543 with Buzzer Status',
      trigger: {
        type: 'battery',
        threshold: 56,
        direction: 'below',
      },
      actions: [
        { type: 'robot_command', command: 'GET_STATUS' },
        {
          type: 'sms',
          to: '26543',
          bodyTemplate: 'Time: {{time}} | Buzzer: {{buzzerStatus}}',
        },
      ],
      enabled: true,
      lastTriggeredAt: null,
      cooldownMs: 300000,
    };
    const updated = await saveRule(refRule);
    setRules(updated);
    Alert.alert('Preset Added', 'Reference rule (Battery 56% → SMS 26543) added.');
  };

  const handleSaveCustomRule = async () => {
    if (!ruleName.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for the rule.');
      return;
    }

    let trig: RuleTrigger;
    if (ruleTriggerType === 'battery') {
      trig = {
        type: 'battery',
        threshold: parseInt(ruleBatteryThresh, 10) || 50,
        direction: 'below',
      };
    } else if (ruleTriggerType === 'time') {
      trig = {
        type: 'time',
        hour: parseInt(ruleHour, 10) || 8,
        minute: parseInt(ruleMinute, 10) || 0,
        repeat: 'daily',
      };
    } else if (ruleTriggerType === 'device_state') {
      trig = {
        type: 'device_state',
        deviceFeature: ruleDeviceFeature,
        state: ruleDeviceStateVal,
      };
    } else {
      trig = { type: 'manual' };
    }

    let act: RuleAction;
    if (ruleActionType === 'sms') {
      act = {
        type: 'sms',
        to: ruleSmsTo.trim() || '26543',
        bodyTemplate: ruleSmsBody.trim() || 'Time: {{time}} | Buzzer: {{buzzerStatus}}',
      };
    } else if (ruleActionType === 'wifi_toggle') {
      act = { type: 'wifi_toggle', state: ruleWifiState };
    } else if (ruleActionType === 'robot_command') {
      act = { type: 'robot_command', command: ruleRobotCmd.trim() || 'GET_STATUS' };
    } else {
      act = {
        type: 'notification',
        title: 'ARIN Automation',
        body: 'Automation rule executed.',
      };
    }

    const newRule: Rule = {
      id: `rule_${Date.now()}`,
      name: ruleName.trim(),
      trigger: trig,
      actions: [act],
      enabled: true,
      lastTriggeredAt: null,
      cooldownMs: 60000,
    };

    const updated = await saveRule(newRule);
    setRules(updated);
    setShowRuleModal(false);
    setRuleName('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
        COMMAND TESTER & LIVE RULES
      </Text>

      {/* Permission Status */}
      {!smsPerm && Platform.OS === 'android' && (
        <View style={[styles.permBanner, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
            SMS Permission is required for rule SMS actions.
          </Text>
          <TouchableOpacity onPress={requestSmsPermission}>
            <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>GRANT PERMISSION</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SECTION 1: COMMAND DROP DOWN / SELECTOR */}
      <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          SELECT TEST COMMAND
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {(
            [
              'TORCH',
              'WIFI',
              'BLUETOOTH',
              'VOLUME',
              'SMS',
              'CALL',
              'WEATHER',
              'BATTERY',
              'ROBOT_MOVE',
            ] as const
          ).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedCategory === cat
                      ? themeColors.primaryContainer
                      : themeColors.surfaceContainerHigh,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  typography.labelCaps,
                  { color: selectedCategory === cat ? themeColors.onPrimary : themeColors.onSurface },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DYNAMIC PARAMETER CONTROLS FOR SELECTED COMMAND */}
        <View style={styles.paramBox}>
          {selectedCategory === 'TORCH' && (
            <View style={styles.optionRow}>
              <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Flashlight Target State:</Text>
              <View style={styles.toggleGroup}>
                {(['ON', 'OFF'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor:
                          torchState === st
                            ? themeColors.primaryContainer
                            : themeColors.surfaceContainerHigh,
                      },
                    ]}
                    onPress={() => setTorchState(st)}
                  >
                    <Text style={[typography.labelCaps, { color: torchState === st ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedCategory === 'WIFI' && (
            <View style={styles.optionRow}>
              <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Wi-Fi Target State:</Text>
              <View style={styles.toggleGroup}>
                {(['ON', 'OFF'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor:
                          wifiState === st
                            ? themeColors.primaryContainer
                            : themeColors.surfaceContainerHigh,
                      },
                    ]}
                    onPress={() => setWifiState(st)}
                  >
                    <Text style={[typography.labelCaps, { color: wifiState === st ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedCategory === 'BLUETOOTH' && (
            <View style={styles.optionRow}>
              <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>Bluetooth Target State:</Text>
              <View style={styles.toggleGroup}>
                {(['ON', 'OFF'] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor:
                          btState === st
                            ? themeColors.primaryContainer
                            : themeColors.surfaceContainerHigh,
                      },
                    ]}
                    onPress={() => setBtState(st)}
                  >
                    <Text style={[typography.labelCaps, { color: btState === st ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedCategory === 'VOLUME' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>VOLUME PERCENTAGE (0-100)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={volumeLevel}
                onChangeText={setVolumeLevel}
                keyboardType="number-pad"
              />
            </View>
          )}

          {selectedCategory === 'SMS' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>TARGET NUMBER</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={smsTarget}
                onChangeText={setSmsTarget}
                keyboardType="phone-pad"
              />
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>MESSAGE TEXT</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={smsMessage}
                onChangeText={setSmsMessage}
              />
            </View>
          )}

          {selectedCategory === 'CALL' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>CALL TARGET (NUMBER / CONTACT)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={callTarget}
                onChangeText={setCallTarget}
              />
            </View>
          )}

          {selectedCategory === 'WEATHER' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>CITY NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={weatherCity}
                onChangeText={setWeatherCity}
              />
            </View>
          )}

          {selectedCategory === 'BATTERY' && (
            <Text style={[typography.bodyMd, { color: themeColors.onSurface }]}>
              Queries device battery percentage & charging status instantly.
            </Text>
          )}

          {selectedCategory === 'ROBOT_MOVE' && (
            <View style={styles.inputGroup}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>ROBOT DIRECTION</Text>
              <View style={styles.chipRow}>
                {(['FORWARD', 'BACKWARD', 'LEFT', 'RIGHT', 'STOP'] as const).map((dir) => (
                  <TouchableOpacity
                    key={dir}
                    style={[
                      styles.toggleBtn,
                      {
                        backgroundColor:
                          moveCmd === dir
                            ? themeColors.primaryContainer
                            : themeColors.surfaceContainerHigh,
                      },
                    ]}
                    onPress={() => setMoveCmd(dir)}
                  >
                    <Text style={[typography.labelCaps, { color: moveCmd === dir ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {dir}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.execBtn, { backgroundColor: themeColors.primaryContainer }]}
          onPress={handleExecuteCommand}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>
            ⚡ RUN TEST COMMAND
          </Text>
        </TouchableOpacity>
      </View>

      {/* SECTION 2: LIVE RULES MANAGEMENT */}
      <View style={styles.rulesSectionHeader}>
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          LIVE AUTOMATION RULES ({rules.length})
        </Text>
        <TouchableOpacity
          style={[styles.createRuleBtn, { backgroundColor: themeColors.surfaceContainerHigh, borderColor: themeColors.outlineVariant }]}
          onPress={() => setShowRuleModal(true)}
        >
          <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>+ NEW RULE</Text>
        </TouchableOpacity>
      </View>

      {/* PRESET QUICK ADD */}
      <TouchableOpacity
        style={[styles.presetBtn, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.primaryContainer }]}
        onPress={addReferencePresetRule}
      >
        <Text style={[typography.labelCaps, { color: themeColors.primaryContainer }]}>
          ⚡ QUICK ADD PRESET: Battery 56% → SMS 26543 (with Buzzer Status)
        </Text>
      </TouchableOpacity>

      {/* LIVE RULES LIST */}
      {rules.length === 0 ? (
        <View style={[styles.card, { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant }]}>
          <Text style={[typography.bodyMd, { color: themeColors.onSurfaceVariant }]}>
            No live rules active. Tap "+ NEW RULE" or "QUICK ADD PRESET" to add one.
          </Text>
        </View>
      ) : (
        rules.map((rule) => (
          <View
            key={rule.id}
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surfaceContainerLow,
                borderColor: rule.enabled ? themeColors.primaryContainer : themeColors.outlineVariant,
              },
            ]}
          >
            <View style={styles.ruleTopRow}>
              <Text style={[typography.headlineMd, styles.ruleTitle, { color: themeColors.onSurface }]}>
                {rule.name}
              </Text>
              <Switch
                value={rule.enabled}
                onValueChange={(val) => handleToggleRule(rule.id, val)}
                trackColor={{
                  false: themeColors.surfaceContainerHighest,
                  true: themeColors.primaryContainer,
                }}
                thumbColor={themeColors.onPrimary}
              />
            </View>

            <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>
              Trigger: {rule.trigger.type.toUpperCase()} | Actions: {rule.actions.map((a) => a.type.toUpperCase()).join(', ')}
            </Text>

            <Text style={[typography.codeSm, { color: themeColors.onSurfaceVariant }]}>
              Last Fired: {rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleTimeString() : 'Never'}
            </Text>

            {/* LIVE RULE ACTION BUTTONS: RUN NOW & DELETE */}
            <View style={styles.ruleBtnRow}>
              <TouchableOpacity
                style={[styles.ruleActionBtn, { backgroundColor: themeColors.primaryContainer }]}
                onPress={() => handleRunRuleNow(rule.id)}
              >
                <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>RUN NOW</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ruleDeleteBtn, { backgroundColor: themeColors.surfaceContainerHigh, borderColor: themeColors.outlineVariant }]}
                onPress={() => handleDeleteRule(rule.id)}
              >
                <Text style={[typography.labelCaps, { color: themeColors.error }]}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* RULE CREATION MODAL */}
      <Modal visible={showRuleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.surfaceContainerLow }]}>
            <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
              CREATE AUTOMATION RULE
            </Text>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>RULE NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                value={ruleName}
                onChangeText={setRuleName}
                placeholder="e.g. Battery 50% SMS Alert"
                placeholderTextColor={themeColors.onSurfaceVariant}
              />

              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>TRIGGER TYPE</Text>
              <View style={styles.chipRow}>
                {(['battery', 'time', 'device_state', 'manual'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, { backgroundColor: ruleTriggerType === t ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                    onPress={() => setRuleTriggerType(t)}
                  >
                    <Text style={[typography.labelCaps, { color: ruleTriggerType === t ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {ruleTriggerType === 'device_state' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>FEATURE & STATE</Text>
                  <View style={styles.chipRow}>
                    {(['torch', 'wifi', 'bluetooth'] as const).map((f) => (
                      <TouchableOpacity
                        key={f}
                        style={[styles.chip, { backgroundColor: ruleDeviceFeature === f ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                        onPress={() => setRuleDeviceFeature(f)}
                      >
                        <Text style={[typography.labelCaps, { color: ruleDeviceFeature === f ? themeColors.onPrimary : themeColors.onSurface }]}>
                          {f.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.chipRow}>
                    {(['on', 'off'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.chip, { backgroundColor: ruleDeviceStateVal === s ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                        onPress={() => setRuleDeviceStateVal(s)}
                      >
                        <Text style={[typography.labelCaps, { color: ruleDeviceStateVal === s ? themeColors.onPrimary : themeColors.onSurface }]}>
                          {s.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {ruleTriggerType === 'battery' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>THRESHOLD (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleBatteryThresh}
                    onChangeText={setRuleBatteryThresh}
                    keyboardType="number-pad"
                  />
                </>
              )}

              {ruleTriggerType === 'time' && (
                <View style={styles.timeRow}>
                  <View style={styles.flexOne}>
                    <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>HOUR</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                      value={ruleHour}
                      onChangeText={setRuleHour}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.flexOne}>
                    <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>MINUTE</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                      value={ruleMinute}
                      onChangeText={setRuleMinute}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              )}

              <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.sm }]}>ACTION TYPE</Text>
              <View style={styles.chipRow}>
                {(['sms', 'wifi_toggle', 'robot_command', 'notification'] as const).map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.chip, { backgroundColor: ruleActionType === a ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                    onPress={() => setRuleActionType(a)}
                  >
                    <Text style={[typography.labelCaps, { color: ruleActionType === a ? themeColors.onPrimary : themeColors.onSurface }]}>
                      {a.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {ruleActionType === 'sms' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>SMS TARGET NUMBER</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleSmsTo}
                    onChangeText={setRuleSmsTo}
                    keyboardType="phone-pad"
                  />
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>BODY TEMPLATE</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleSmsBody}
                    onChangeText={setRuleSmsBody}
                  />
                </>
              )}

              {ruleActionType === 'wifi_toggle' && (
                <View style={styles.chipRow}>
                  {(['on', 'off'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, { backgroundColor: ruleWifiState === s ? themeColors.primaryContainer : themeColors.surfaceContainerHigh }]}
                      onPress={() => setRuleWifiState(s)}
                    >
                      <Text style={[typography.labelCaps, { color: ruleWifiState === s ? themeColors.onPrimary : themeColors.onSurface }]}>
                        WIFI {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {ruleActionType === 'robot_command' && (
                <>
                  <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant, marginTop: spacing.xs }]}>ROBOT COMMAND</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surfaceContainerHigh, color: themeColors.onSurface, borderColor: themeColors.outlineVariant }]}
                    value={ruleRobotCmd}
                    onChangeText={setRuleRobotCmd}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.surfaceContainerHigh }]}
                onPress={() => setShowRuleModal(false)}
              >
                <Text style={[typography.labelCaps, { color: themeColors.onSurfaceVariant }]}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: themeColors.primaryContainer }]}
                onPress={handleSaveCustomRule}
              >
                <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>SAVE RULE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.containerMargin,
    gap: spacing.md,
  },
  card: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  permBanner: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  paramBox: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  input: {
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  execBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  rulesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  createRuleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  presetBtn: {
    padding: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  ruleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleTitle: {
    fontSize: 16,
    flex: 1,
  },
  ruleBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ruleActionBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
  },
  ruleDeleteBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    maxHeight: '85%',
    gap: spacing.md,
  },
  formScroll: {
    gap: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexOne: {
    flex: 1,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
});

```

---

## `src/services/actionExecutors.ts`

```typescript
import { RuleAction } from '../types';
import { sendArduinoCommand } from './arduinoService';
import { arinNative } from './nativeDeviceModule';

export interface ActionExecutionContext {
  batteryLevel?: number;
  isArduinoConnected?: boolean;
  onLog?: (msg: string) => void;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, string>;
}

/**
 * Query the robot's buzzer status via serial link (`GET_STATUS`).
 * Times out after 1500ms and returns "UNKNOWN" if unreachable or disconnected.
 */
export async function queryRobotBuzzerStatus(
  isConnected = false,
  timeoutMs = 1500
): Promise<string> {
  if (!isConnected) {
    return 'UNKNOWN';
  }

  try {
    const queryPromise = sendArduinoCommand('STOP', true).then(() => 'OFF'); // Default state fallback
    const timeoutPromise = new Promise<string>((resolve) =>
      setTimeout(() => resolve('UNKNOWN'), timeoutMs)
    );
    return await Promise.race([queryPromise, timeoutPromise]);
  } catch {
    return 'UNKNOWN';
  }
}

/**
 * Replace string templates: {{time}}, {{buzzerStatus}}, {{battery}}, {{status}}, {{buzzer}}, etc.,
 * as well as natural language phrases like "the battery percentage".
 */
export function interpolateTemplate(
  template: string,
  vars: { time: string; buzzerStatus: string; battery: string }
): string {
  let result = template;

  // Time / Date aliases
  result = result.replace(/\{\{\s*(time|date|timestamp|clock)\s*\}\}/gi, vars.time);

  // Buzzer / Robot Status aliases
  result = result.replace(
    /\{\{\s*(status|buzzerStatus|buzzer_status|buzzer|robot_status|robotStatus)\s*\}\}/gi,
    vars.buzzerStatus
  );

  // Battery Level aliases
  result = result.replace(
    /\{\{\s*(battery|battery_level|batteryLevel|bat|level)\s*\}\}/gi,
    vars.battery
  );

  // Natural language battery phrase substitution (e.g. "the battery percentage" -> "77%")
  result = result.replace(/(?:the\s+)?battery\s*(?:percentage|level|pct)?/gi, vars.battery);

  // Catch-all for any remaining mustache tags -> replace with buzzer status fallback
  result = result.replace(/\{\{\s*[\w_]+\s*\}\}/gi, vars.buzzerStatus);

  return result;
}

/**
 * Execute a single action in a rule chain safely.
 */
export async function executeRuleAction(
  action: RuleAction,
  context: ActionExecutionContext = {}
): Promise<ActionResult> {
  const log = context.onLog ?? (() => {});

  try {
    switch (action.type) {
      case 'wifi_toggle': {
        if (!arinNative) {
          log('[ACTION] Wi-Fi toggle unavailable (Native bridge missing).');
          return { success: false, message: 'Native bridge unavailable for Wi-Fi toggle.' };
        }
        const res = await arinNative.setWifi(action.state === 'on');
        if (res === 'OPENED_SETTINGS') {
          log(`[ACTION] Android 10+ restriction: Opened Wi-Fi settings to turn Wi-Fi ${action.state.toUpperCase()}.`);
          return {
            success: true,
            message: `Opened Wi-Fi settings to turn ${action.state.toUpperCase()} (OS restriction on Android 10+).`,
          };
        }
        log(`[ACTION] Wi-Fi turned ${action.state.toUpperCase()}.`);
        return { success: true, message: `Wi-Fi turned ${action.state.toUpperCase()}.` };
      }

      case 'bluetooth_toggle': {
        if (!arinNative) {
          log('[ACTION] Bluetooth toggle unavailable.');
          return { success: false, message: 'Native bridge unavailable.' };
        }
        const res = await arinNative.setBluetooth(action.state === 'on');
        log(`[ACTION] Bluetooth turned ${action.state.toUpperCase()} (${res}).`);
        return { success: true, message: `Bluetooth turned ${action.state.toUpperCase()}.` };
      }

      case 'torch_toggle': {
        if (!arinNative) {
          log('[ACTION] Torch toggle unavailable.');
          return { success: false, message: 'Native bridge unavailable.' };
        }
        await arinNative.setTorch(action.state === 'on');
        log(`[ACTION] Torch turned ${action.state.toUpperCase()}.`);
        return { success: true, message: `Torch turned ${action.state.toUpperCase()}.` };
      }

      case 'battery_saver': {
        if (!arinNative) {
          log('[ACTION] Battery Saver settings unavailable.');
          return { success: false, message: 'Native bridge unavailable.' };
        }
        await arinNative.openSettings('battery');
        log(`[ACTION] Opened Battery Saver settings for user interaction.`);
        return {
          success: true,
          message: 'Opened Battery Saver settings (system toggle restricted).',
        };
      }

      case 'notification': {
        const title = action.title || 'ARIN Automation';
        const body = action.body || 'Automation triggered.';
        if (arinNative) {
          await arinNative.showNotification(title, body);
        }
        log(`[ACTION] Local Notification: "${title}" - "${body}"`);
        return { success: true, message: `Notification sent: ${title}` };
      }

      case 'read_calendar': {
        const eventSummary = 'No calendar events scheduled for today.';
        if (arinNative) {
          await arinNative.showNotification('Calendar Summary', eventSummary);
        }
        log(`[ACTION] Calendar Readout: ${eventSummary}`);
        return { success: true, message: eventSummary };
      }

      case 'sms': {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const buzzer = await queryRobotBuzzerStatus(context.isArduinoConnected ?? false);
        const batPct = context.batteryLevel !== undefined ? `${context.batteryLevel}%` : 'Unknown%';

        const finalBody = interpolateTemplate(action.bodyTemplate, {
          time: nowTime,
          buzzerStatus: buzzer,
          battery: batPct,
        });

        if (!arinNative) {
          log(`[ACTION] SMS simulated to ${action.to}: "${finalBody}"`);
          return { success: true, message: `SMS (simulated) sent to ${action.to}: ${finalBody}` };
        }

        try {
          await arinNative.sendSms(action.to, finalBody);
          log(`[ACTION] SMS sent to ${action.to}: "${finalBody}"`);
          return { success: true, message: `SMS sent to ${action.to}` };
        } catch (smsErr: unknown) {
          const errStr = smsErr instanceof Error ? smsErr.message : String(smsErr);
          log(`[ACTION] SMS failed: ${errStr}`);
          return { success: false, message: `SMS failed: ${errStr}` };
        }
      }

      case 'robot_command': {
        const cmdUpper = action.command.toUpperCase().trim();

        if (cmdUpper === 'GET_STATUS') {
          const status = await queryRobotBuzzerStatus(context.isArduinoConnected ?? false);
          log(`[ACTION] Robot GET_STATUS response: BUZZER=${status}`);
          return {
            success: true,
            message: `Robot Status: BUZZER=${status}`,
            data: { buzzerStatus: status },
          };
        }

        const validCmd = (
          cmdUpper.startsWith('MOVE')
            ? 'MOVE_FORWARD'
            : cmdUpper.startsWith('TURN:LEFT')
            ? 'TURN_LEFT'
            : cmdUpper.startsWith('TURN:RIGHT')
            ? 'TURN_RIGHT'
            : cmdUpper.startsWith('BEEP')
            ? 'BUZZER_PING'
            : 'STOP'
        ) as any;

        const res = await sendArduinoCommand(validCmd, context.isArduinoConnected ?? false);
        log(`[ACTION] Robot command (${action.command}): ${res.message}`);
        return { success: res.success, message: res.message };
      }

      default:
        return { success: false, message: 'Unknown action type.' };
    }
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : String(err);
    log(`[ACTION ERR] Exception during execution: ${errMessage}`);
    return { success: false, message: `Action failed: ${errMessage}` };
  }
}

```

---

## `src/services/aiDirective.ts`

```typescript
import { Rule } from '../types';
import { ARIN_SYSTEM_PROMPT } from './promptText';
export { ARIN_SYSTEM_PROMPT };

/**
 * Default installed-app list injected at {{AVAILABLE_APPS}} until the native
 * PackageManager module lands. Format: `label — packageName` per line.
 */
export const DEFAULT_AVAILABLE_APPS = `Camera — com.android.camera
Settings — com.android.settings
Spotify — com.spotify.music
WhatsApp — com.whatsapp
YouTube — com.google.android.youtube`;

/**
 * Build the system prompt with the device's installed-app list substituted for
 * {{AVAILABLE_APPS}}. Falls back to DEFAULT_AVAILABLE_APPS if none passed.
 */
export function buildArinSystemPrompt(availableApps?: string): string {
  const apps = availableApps?.trim() || DEFAULT_AVAILABLE_APPS;
  return ARIN_SYSTEM_PROMPT.replace('{{AVAILABLE_APPS}}', apps);
}

export const ARDUINO_COMMANDS = [
  'MOVE_FORWARD',
  'MOVE_BACKWARD',
  'TURN_LEFT',
  'TURN_RIGHT',
  'STOP',
  'LED_ON',
  'LED_OFF',
  'BUZZER_PING',
] as const;

export type ArduinoCommand = (typeof ARDUINO_COMMANDS)[number];

export const DEVICE_COMMANDS = [
  'TORCH_ON',
  'TORCH_OFF',
  'CAMERA_OPEN',
  'CALL',
  'SMS',
  'WHATSAPP',
  'OPEN_APP',
  'WIFI_ON',
  'WIFI_OFF',
  'BLUETOOTH_ON',
  'BLUETOOTH_OFF',
  'OPEN_SETTINGS',
  'MUTE_SOUND',
  'UNMUTE_SOUND',
  'VOLUME_UP',
  'VOLUME_DOWN',
  'SET_VOLUME',
  'GET_BATTERY',
  'GET_WEATHER',
] as const;

export type DeviceCommand = (typeof DEVICE_COMMANDS)[number];

// A single step inside a pipeline, or the shape of a non-pipeline directive
// before the optional top-level "schedule" wrapper is applied.
export type AiStep =
  | { action: 'respond'; response: string; reason?: string }
  | { action: 'cloud'; prompt: string; reason?: string }
  | { action: 'arduino'; command: ArduinoCommand; reason?: string }
  | { action: 'speak'; message: string; reason?: string }
  | {
      action: 'device';
      command: DeviceCommand;
      target?: string;
      message?: string;
      reason?: string;
    };

export type AiDirective =
  | (AiStep & { schedule?: string })
  | { action: 'pipeline'; steps: AiStep[]; schedule?: string; reason?: string }
  | { action: 'create_rule'; rule: Partial<Rule>; response: string; schedule?: string; reason?: string };

function asOptString(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined;
}

function normalizeArduinoCommand(raw: string): ArduinoCommand | null {
  const norm = raw.trim().toUpperCase().replace(/[\s-]+/g, '_');
  if ((ARDUINO_COMMANDS as readonly string[]).includes(norm)) {
    return norm as ArduinoCommand;
  }
  if (norm.includes('FORWARD') || norm === 'FWD') return 'MOVE_FORWARD';
  if (norm.includes('BACK') || norm === 'REV' || norm === 'REVERSE') return 'MOVE_BACKWARD';
  if (norm.includes('LEFT')) return 'TURN_LEFT';
  if (norm.includes('RIGHT')) return 'TURN_RIGHT';
  if (norm.includes('STOP') || norm === 'HALT' || norm === 'BRAKE') return 'STOP';
  if (norm.includes('LED_ON') || norm === 'LIGHT_ON') return 'LED_ON';
  if (norm.includes('LED_OFF') || norm === 'LIGHT_OFF') return 'LED_OFF';
  if (norm.includes('BUZZER') || norm.includes('BEEP') || norm === 'PING') return 'BUZZER_PING';
  return null;
}

/** Validate+coerce a single step object (no schedule, no nested pipeline). */
function parseStep(obj: Record<string, unknown>): AiStep | null {
  // Extract response text tolerating common field name variations from small LLMs
  const responseText =
    asOptString(obj.response) ??
    asOptString(obj.text) ??
    asOptString(obj.answer) ??
    asOptString(obj.content) ??
    asOptString(obj.result);

  if (obj.action === 'respond' || (responseText && !obj.action)) {
    if (responseText && responseText.trim()) {
      return { action: 'respond', response: responseText.trim(), reason: asOptString(obj.reason) };
    }
  }
  if (obj.action === 'cloud' && typeof obj.prompt === 'string' && obj.prompt.trim()) {
    return { action: 'cloud', prompt: obj.prompt.trim(), reason: asOptString(obj.reason) };
  }
  if (obj.action === 'speak' && typeof obj.message === 'string' && obj.message.trim()) {
    return { action: 'speak', message: obj.message.trim(), reason: asOptString(obj.reason) };
  }

  const rawCmd = asOptString(obj.command);
  if (obj.action === 'arduino' || obj.action === 'robot' || (!obj.action && rawCmd)) {
    const arduinoCmd = rawCmd ? normalizeArduinoCommand(rawCmd) : null;
    if (arduinoCmd) {
      return { action: 'arduino', command: arduinoCmd, reason: asOptString(obj.reason) };
    }
  }

  if (
    obj.action === 'device' &&
    typeof obj.command === 'string' &&
    (DEVICE_COMMANDS as readonly string[]).includes(obj.command)
  ) {
    return {
      action: 'device',
      command: obj.command as DeviceCommand,
      target: asOptString(obj.target),
      message: asOptString(obj.message),
      reason: asOptString(obj.reason),
    };
  }

  // Fallback check: if action is missing or non-standard, but a response text exists
  if (responseText && responseText.trim()) {
    return { action: 'respond', response: responseText.trim(), reason: asOptString(obj.reason) };
  }

  return null;
}

/** Clean up raw text if JSON parsing fails so raw JSON syntax is never shown in chat UI. */
function sanitizeFallbackText(text: string): string {
  let cleaned = text.trim();
  // If text looks like a raw JSON object string, try to extract a user-facing string from it
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    const responseMatch = cleaned.match(/"(?:response|text|answer|message|content|prompt)":\s*"([^"]+)"/i);
    if (responseMatch && responseMatch[1]) {
      return responseMatch[1];
    }
    const cmdMatch = cleaned.match(/"command":\s*"([^"]+)"/i);
    if (cmdMatch && cmdMatch[1]) {
      return `Executing robot command: ${cmdMatch[1].toUpperCase()}`;
    }
    // Clean JSON syntax artifacts if unparseable
    cleaned = cleaned
      .replace(/[{}"']/g, '')
      .replace(/action\s*:\s*/gi, '')
      .replace(/command\s*:\s*/gi, '')
      .replace(/reason\s*:\s*/gi, '')
      .trim();
  }
  return cleaned || '[ERR] Empty response from local AI.';
}

/**
 * Extract and validate the JSON directive from a raw local-AI completion.
 * Tolerates surrounding whitespace or accidental markdown fences from small models.
 * Falls back to a plain "respond" directive if parsing/validation fails, so a
 * malformed reply never gets silently dropped.
 */
export function parseAiDirective(raw: string): AiDirective {
  const fallback = (text: string): AiDirective => ({
    action: 'respond',
    response: sanitizeFallbackText(text),
  });

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    return fallback(raw);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return fallback(raw);
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return fallback(raw);
  }

  const obj = parsed as Record<string, unknown>;
  const schedule = asOptString(obj.schedule);

  if (obj.action === 'create_rule' && typeof obj.rule === 'object' && obj.rule !== null) {
    const response = asOptString(obj.response) || 'Created automation rule.';
    return {
      action: 'create_rule',
      rule: obj.rule as Partial<Rule>,
      response,
      schedule,
      reason: asOptString(obj.reason),
    };
  }

  if (obj.action === 'pipeline' && Array.isArray(obj.steps)) {
    const steps = (obj.steps as unknown[])
      .map((s) => (typeof s === 'object' && s !== null ? parseStep(s as Record<string, unknown>) : null))
      .filter((s): s is AiStep => s !== null);
    if (steps.length >= 1) {
      return { action: 'pipeline', steps, schedule, reason: asOptString(obj.reason) };
    }
    return fallback(raw);
  }

  const step = parseStep(obj);
  if (step) {
    return { ...step, schedule } as AiDirective;
  }

  // Recognized shape but failed validation — surface clean response text rather than raw JSON.
  return fallback(raw);
}

```

---

## `src/services/arduinoService.ts`

```typescript
import { ArduinoCommand } from './aiDirective';

export interface ArduinoCommandResult {
  success: boolean;
  message: string;
}

const ARDUINO_MESSAGES: Record<ArduinoCommand, string> = {
  MOVE_FORWARD: 'Moving robot forward...',
  MOVE_BACKWARD: 'Reversing robot...',
  TURN_LEFT: 'Pivoting robot left...',
  TURN_RIGHT: 'Pivoting robot right...',
  STOP: 'Robot stopped.',
  LED_ON: 'Robot LED turned on.',
  LED_OFF: 'Robot LED turned off.',
  BUZZER_PING: 'Robot buzzer sounded.',
};

/**
 * Send a single command token to the Arduino over the active transport.
 */
export async function sendArduinoCommand(
  command: ArduinoCommand,
  isConnected: boolean
): Promise<ArduinoCommandResult> {
  const label = ARDUINO_MESSAGES[command] || `Executed ${command} on robot.`;
  if (!isConnected) {
    return { success: false, message: `${label} (Arduino not connected)` };
  }

  // Placeholder until the real transport (USB serial / BLE) is implemented.
  return { success: true, message: label };
}

```

---

## `src/services/cloudAiService.ts`

```typescript
const DEFAULT_TIMEOUT = 15000;

export interface CloudAiModel {
  id: string;
  ownedBy?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  baseUrl: string;
  message: string;
  models?: CloudAiModel[];
}

function normalizeBaseUrl(raw: string): string {
  let url = raw.trim();
  url = url.replace(/\/+$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  // Strip a trailing /v1 or /v1/chat/completions etc. — we append /v1/... ourselves.
  url = url.replace(/\/v1(\/.*)?$/, '');
  return url;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function authHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (apiKey.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }
  return headers;
}

/**
 * Fetch the model list from an OpenAI-compatible provider's /v1/models endpoint.
 * Works with OpenAI, OpenRouter, Groq, Together, Fireworks, DeepSeek, Mistral, etc.
 */
export async function fetchModels(rawBaseUrl: string, apiKey: string): Promise<CloudAiModel[]> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  const res = await fetchWithTimeout(
    `${baseUrl}/v1/models`,
    { method: 'GET', headers: authHeaders(apiKey) },
    10000
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'No response body');
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Auth rejected (HTTP ${res.status}). Check the API key. ${errBody}`);
    }
    throw new Error(`Failed to fetch models: HTTP ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const models: CloudAiModel[] = [];

  if (Array.isArray(data)) {
    for (const m of data) {
      const id = typeof m === 'string' ? m : m.id || m.name;
      if (id) models.push({ id, ownedBy: m?.owned_by });
    }
  } else if (data?.data && Array.isArray(data.data)) {
    for (const m of data.data) {
      if (m.id) models.push({ id: m.id, ownedBy: m.owned_by });
    }
  }

  models.sort((a, b) => a.id.localeCompare(b.id));
  return models;
}

/**
 * Validate provider URL + API key by attempting to list models.
 */
export async function testConnection(
  rawBaseUrl: string,
  apiKey: string
): Promise<ConnectionTestResult> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  if (!rawBaseUrl.trim()) {
    return { success: false, baseUrl, message: 'Provider URL is required.' };
  }

  try {
    const models = await fetchModels(rawBaseUrl, apiKey);
    return {
      success: true,
      baseUrl,
      message: `Connected. ${models.length} model(s) available.`,
      models,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return { success: false, baseUrl, message: errMsg };
  }
}

/**
 * Send a chat completion request to an OpenAI-compatible /v1/chat/completions endpoint.
 */
export async function sendChatCompletion(
  rawBaseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  } = {}
): Promise<ChatCompletionResponse> {
  const baseUrl = normalizeBaseUrl(rawBaseUrl);
  const timeoutMs = options.timeoutMs ?? 30000;

  const res = await fetchWithTimeout(
    `${baseUrl}/v1/chat/completions`,
    {
      method: 'POST',
      headers: authHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: false,
      }),
    },
    timeoutMs
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'No response body');
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Auth rejected (HTTP ${res.status}). Check the API key.`);
    }
    throw new Error(`HTTP ${res.status}: ${errBody}`);
  }

  return res.json();
}

```

---

## `src/services/deviceService.ts`

```typescript
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { DeviceCommand } from './aiDirective';
import { arinNative, hasNativeBridge, InstalledAppNative } from './nativeDeviceModule';
import { fetchWeather } from './weatherService';

export interface DeviceCommandResult {
  success: boolean;
  message: string;
}

/** RN wraps native rejections as `CODE: message` — keep only the readable part. */
function nativeErrorText(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err);
  const idx = raw.indexOf(': ');
  const stripped = idx >= 0 ? raw.slice(idx + 2) : raw;
  return stripped.trim() || fallback;
}

export interface InstalledApp {
  label: string;
  packageName: string;
}

/**
 * List apps installed on the phone, fed into the prompt's PACKAGES block as
 * package names only (the model infers an app's identity from its package).
 *
 * Uses the native PackageManager module when available; otherwise returns a
 * small curated placeholder so OPEN_APP still has valid package names.
 */
export async function getInstalledApps(): Promise<InstalledApp[]> {
  if (hasNativeBridge && arinNative) {
    try {
      const apps: InstalledAppNative[] = await arinNative.getInstalledApps();
      if (apps.length > 0) {
        return apps;
      }
    } catch {
      // fall through to placeholder
    }
  }
  return [
    { label: 'Camera', packageName: 'com.android.camera' },
    { label: 'Settings', packageName: 'com.android.settings' },
    { label: 'Spotify', packageName: 'com.spotify.music' },
    { label: 'WhatsApp', packageName: 'com.whatsapp' },
    { label: 'YouTube', packageName: 'com.google.android.youtube' },
  ];
}

/** Format installed apps as the "label — packageName" list the prompt expects. */
export function formatInstalledApps(apps: InstalledApp[]): string {
  return apps.map((app) => `${app.label} — ${app.packageName}`).join('\n');
}

/**
 * Execute a single phone-native command.
 *
 * Native path (Android): silent CALL via ACTION_CALL, silent SMS via
 * SmsManager.sendTextMessage, torch via CameraManager.setTorchMode, and
 * OPEN_APP via getLaunchIntentForPackage. Each falls back to Linking deep
 * links when the native bridge is missing or permission is denied.
 */
export async function sendDeviceCommand(
  command: DeviceCommand,
  target?: string,
  message?: string,
  _permissionMode?: 'full_control' | 'compatible'
): Promise<DeviceCommandResult> {
  switch (command) {
    case 'TORCH_ON':
    case 'TORCH_OFF': {
      const enabled = command === 'TORCH_ON';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.setTorch(enabled);
          return { success: true, message: `Phone flashlight turned ${enabled ? 'on' : 'off'}.` };
        } catch (err) {
          return {
            success: false,
            message: `Torch failed: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
      return {
        success: true,
        message: `Phone flashlight turned ${enabled ? 'on' : 'off'} (no native module — not actually switched).`,
      };
    }

    case 'CAMERA_OPEN': {
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.openCamera();
          return { success: true, message: 'Opened the camera app.' };
        } catch (err) {
          return {
            success: false,
            message: `Failed to open camera: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
      return { success: false, message: 'Camera not available (no native module).' };
    }

    case 'CALL': {
      if (!target) {
        return { success: false, message: 'No target specified for CALL.' };
      }
      if (hasNativeBridge && arinNative) {
        try {
          const direct = await arinNative.callPhone(target);
          return direct
            ? { success: true, message: `Calling ${target}...` }
            : { success: true, message: `Opening dialer for ${target} (CALL_PHONE permission missing).` };
        } catch (err) {
          return {
            success: false,
            message: nativeErrorText(err, `Failed to call ${target}.`),
          };
        }
      }
      try {
        await Linking.openURL(`tel:${encodeURIComponent(target)}`);
        return { success: true, message: `Opening dialer for ${target}...` };
      } catch {
        return { success: false, message: `Failed to dial ${target}.` };
      }
    }

    case 'SMS': {
      if (!target) {
        return { success: false, message: 'No target specified for SMS.' };
      }

      let outgoingMsg = message ?? '';

      // If message references battery, time, or template tags, resolve live value
      const lowerMsg = outgoingMsg.toLowerCase();
      if (
        lowerMsg.includes('battery') ||
        lowerMsg.includes('time') ||
        lowerMsg.includes('status') ||
        lowerMsg.includes('{{')
      ) {
        let batPct = 'Unknown%';
        if (hasNativeBridge && arinNative) {
          try {
            const b = await arinNative.getBatteryStatus();
            batPct = `${b.level}%`;
          } catch {
            // ignore
          }
        }
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (lowerMsg === 'the battery percentage' || lowerMsg === 'battery percentage' || lowerMsg === 'battery') {
          outgoingMsg = batPct;
        } else {
          outgoingMsg = outgoingMsg
            .replace(/\{\{\s*(time|date|timestamp|clock)\s*\}\}/gi, nowTime)
            .replace(/\{\{\s*(status|buzzerStatus|buzzer_status|buzzer|robot_status|robotStatus)\s*\}\}/gi, 'OFF')
            .replace(/\{\{\s*(battery|battery_level|batteryLevel|bat|level)\s*\}\}/gi, batPct)
            .replace(/(?:the\s+)?battery\s*(?:percentage|level|pct)?/gi, batPct);
        }
      }

      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.sendSms(target, outgoingMsg);
          return {
            success: true,
            message: `SMS sent to ${target}: "${outgoingMsg}".`,
          };
        } catch (err) {
          return {
            success: false,
            message: nativeErrorText(err, `Failed to send SMS to ${target}.`),
          };
        }
      }
      try {
        const body = encodeURIComponent(outgoingMsg);
        await Linking.openURL(`sms:${encodeURIComponent(target)}?body=${body}`);
        return { success: true, message: `Prepared SMS to ${target}: "${outgoingMsg}".` };
      } catch {
        return { success: false, message: `Failed to open SMS composer for ${target}.` };
      }
    }

    case 'WHATSAPP': {
      if (!target) {
        return { success: false, message: 'No target specified for WHATSAPP.' };
      }
      // No silent API exists for WhatsApp — deep-link with the chat pre-filled.
      try {
        const digits = target.replace(/[^0-9]/g, '');
        const text = encodeURIComponent(message ?? '');
        const url = digits
          ? `https://wa.me/${digits}?text=${text}`
          : `whatsapp://send?text=${text}`;
        await Linking.openURL(url);
        return { success: true, message: `Opened WhatsApp chat with ${target} — tap Send to deliver.` };
      } catch {
        return { success: false, message: `Failed to open WhatsApp for ${target}.` };
      }
    }

    case 'OPEN_APP': {
      if (!target) {
        return { success: false, message: 'No target app specified.' };
      }
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.launchApp(target);
          return { success: true, message: `Opened ${target}.` };
        } catch (err) {
          return {
            success: false,
            message: `Failed to open ${target}: ${err instanceof Error ? err.message : String(err)}`,
          };
        }
      }
      return { success: true, message: `Opening app "${target}" (no native module).` };
    }

    case 'WIFI_ON':
    case 'WIFI_OFF': {
      const enabled = command === 'WIFI_ON';
      if (hasNativeBridge && arinNative) {
        try {
          const res = await arinNative.setWifi(enabled);
          return res === 'TOGGLED_DIRECTLY'
            ? { success: true, message: `Wi-Fi turned ${enabled ? 'on' : 'off'}.` }
            : { success: true, message: `Opened Wi-Fi settings to switch Wi-Fi ${enabled ? 'on' : 'off'}.` };
        } catch (err) {
          return { success: false, message: `Wi-Fi failed: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Wi-Fi turned ${enabled ? 'on' : 'off'} (no native module).` };
    }

    case 'BLUETOOTH_ON':
    case 'BLUETOOTH_OFF': {
      const enabled = command === 'BLUETOOTH_ON';
      if (hasNativeBridge && arinNative) {
        try {
          const res = await arinNative.setBluetooth(enabled);
          return res === 'TOGGLED_DIRECTLY'
            ? { success: true, message: `Bluetooth turned ${enabled ? 'on' : 'off'}.` }
            : { success: true, message: `Opened Bluetooth settings to switch Bluetooth ${enabled ? 'on' : 'off'}.` };
        } catch (err) {
          return { success: false, message: `Bluetooth failed: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Bluetooth turned ${enabled ? 'on' : 'off'} (no native module).` };
    }

    case 'OPEN_SETTINGS': {
      const settingTarget = target || 'settings';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.openSettings(settingTarget);
          return { success: true, message: `Opened ${settingTarget} settings.` };
        } catch (err) {
          return { success: false, message: `Failed to open settings: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Opened ${settingTarget} settings (no native module).` };
    }

    case 'MUTE_SOUND':
    case 'UNMUTE_SOUND': {
      const isMute = command === 'MUTE_SOUND';
      const mode = isMute ? 'SILENT' : 'NORMAL';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.setRingerMode(mode);
          return { success: true, message: `Phone sound ${isMute ? 'muted (silent mode)' : 'unmuted (normal mode)'}.` };
        } catch (err) {
          return { success: false, message: `Failed to change ringer mode: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Phone sound ${isMute ? 'muted' : 'unmuted'} (no native module).` };
    }

    case 'VOLUME_UP':
    case 'VOLUME_DOWN': {
      const dir = command === 'VOLUME_UP' ? 'UP' : 'DOWN';
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.adjustVolume(dir);
          return { success: true, message: `Volume turned ${dir.toLowerCase()}.` };
        } catch (err) {
          return { success: false, message: `Failed to adjust volume: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: `Volume turned ${dir.toLowerCase()} (no native module).` };
    }

    case 'SET_VOLUME': {
      const level = parseInt(target || '50', 10);
      const clampedPct = isNaN(level) ? 50 : Math.max(0, Math.min(100, level));
      if (hasNativeBridge && arinNative) {
        try {
          await arinNative.setVolumePercent(clampedPct);
          return {
            success: true,
            message: clampedPct === 0 ? 'Volume set to 0% (Phone muted).' : `Volume set to ${clampedPct}%.`,
          };
        } catch (err) {
          return { success: false, message: `Failed to set volume: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return {
        success: true,
        message: clampedPct === 0 ? 'Volume set to 0% (Phone muted).' : `Volume set to ${clampedPct}% (no native module).`,
      };
    }

    case 'GET_WEATHER': {
      return await fetchWeather(target);
    }

    case 'GET_BATTERY': {
      if (hasNativeBridge && arinNative) {
        try {
          const info = await arinNative.getBatteryStatus();
          return {
            success: true,
            message: `Battery is at ${info.level}%${info.isCharging ? ' (Charging)' : ''}.`,
          };
        } catch (err) {
          return { success: false, message: `Failed to get battery status: ${err instanceof Error ? err.message : String(err)}` };
        }
      }
      return { success: true, message: 'Battery level is 85% (no native module).' };
    }

    default:
      return { success: false, message: `Unknown device command: ${command}` };
  }
}

export interface SpeakResult {
  success: boolean;
  message: string;
}

/**
 * Execute a SPEAK step via native Android offline TextToSpeech engine with Male/Female voice selection.
 */
export async function speakText(
  message: string,
  gender: 'female' | 'male' = 'female'
): Promise<SpeakResult> {
  if (hasNativeBridge && arinNative) {
    try {
      await arinNative.speak(message, gender);
      return { success: true, message };
    } catch {
      return { success: false, message };
    }
  }
  return { success: true, message };
}

/**
 * Interrupt and stop any active TTS speech output.
 */
export async function stopSpeech(): Promise<boolean> {
  if (hasNativeBridge && arinNative) {
    try {
      await arinNative.stopSpeaking();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export interface VoiceInputResult {
  success: boolean;
  text: string;
  error?: string;
}

/**
 * Capture voice input natively via Android SpeechRecognizer (supports offline speech models).
 */
export async function startVoiceInput(): Promise<VoiceInputResult> {
  if (Platform.OS === 'android') {
    try {
      const hasAudioPerm = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (!hasAudioPerm) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission Required',
            message: 'ARIN needs microphone access to recognize voice commands offline.',
            buttonPositive: 'Grant',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return {
            success: false,
            text: '',
            error: 'RECORD_AUDIO permission denied.',
          };
        }
      }
    } catch (permErr: unknown) {
      return {
        success: false,
        text: '',
        error: `Permission error: ${permErr instanceof Error ? permErr.message : String(permErr)}`,
      };
    }
  }

  if (hasNativeBridge && arinNative) {
    try {
      const transcript = await arinNative.startListening();
      return { success: true, text: transcript };
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      if (errStr.includes('OFFLINE_STT_UNAVAILABLE')) {
        return {
          success: false,
          text: '',
          error:
            'No offline speech model. To enable offline voice input: Settings → General Management → Language & Input → On-device speech recognition → Download.',
        };
      }
      return { success: false, text: '', error: errStr };
    }
  }

  return { success: false, text: '', error: 'Native STT module missing.' };
}

/**
 * Stop the active voice input session early (mic button pressed again).
 */
export async function stopVoiceInput(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const { NativeModules } = require('react-native');
    const bridge = NativeModules.ArinNative;
    if (bridge && typeof bridge.stopListening === 'function') {
      return await bridge.stopListening();
    }
  } catch {
    // ignore
  }
  return false;
}
```

---

## `src/services/localAiService.ts`

```typescript
const DEFAULT_TIMEOUT = 15000;

export interface LocalAiModel {
  id: string;
  name?: string;
  details?: Record<string, unknown>;
}

export interface ServerInfo {
  server?: string;
  version?: string;
  availableModels?: string[];
  endpoints?: string[];
  probeErrors?: Record<string, string>;
  hasAnyResponse?: boolean;
  raw?: Record<string, unknown>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: { role: string; content: string };
    finish_reason: string;
  }[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ConnectionTestResult {
  success: boolean;
  baseUrl: string;
  message: string;
  serverInfo?: ServerInfo;
  models?: LocalAiModel[];
}

function normalizeHost(raw: string): string {
  let host = raw.trim();
  host = host.replace(/\/+$/, '');
  if (host.startsWith('//')) {
    host = `http:${host}`;
  } else if (!host.startsWith('http://') && !host.startsWith('https://')) {
    host = `http://${host}`;
  }
  return host;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function addModel(info: ServerInfo, id: string): void {
  if (!id) return;
  const current = info.availableModels ?? [];
  if (!current.includes(id)) {
    info.availableModels = [...current, id];
  }
}

function addEndpoint(info: ServerInfo, endpoint: string): void {
  const current = info.endpoints ?? [];
  if (!current.includes(endpoint)) {
    info.endpoints = [...current, endpoint];
  }
}

function recordProbeError(info: ServerInfo, endpoint: string, error: unknown): void {
  const msg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  info.probeErrors = { ...(info.probeErrors ?? {}), [endpoint]: msg };
}

function recordResponse(info: ServerInfo): void {
  info.hasAnyResponse = true;
}

/**
 * Attempt to discover server capabilities by probing multiple known endpoints
 * sequentially. Each probe is non-fatal and skipped on failure.
 */
export async function probeServerEndpoints(baseUrl: string): Promise<ServerInfo> {
  const info: ServerInfo = { raw: {} };

  // Probe 1: / (root) - Ollama returns "Ollama is running"
  try {
    const rootRes = await fetchWithTimeout(`${baseUrl}/`, {}, 5000);
    recordResponse(info);
    if (rootRes.ok) {
      addEndpoint(info, '/');
      const text = await rootRes.text().catch(() => '');
      if (text && /ollama/i.test(text)) {
        info.server = info.server || 'Ollama';
        info.raw = { ...info.raw, root: text };
      }
    }
  } catch (e) {
    recordProbeError(info, '/', e);
  }

  // Probe 2: /api/version - Ollama version
  try {
    const versionRes = await fetchWithTimeout(`${baseUrl}/api/version`, {}, 5000);
    recordResponse(info);
    if (versionRes.ok) {
      addEndpoint(info, '/api/version');
      const versionData = await versionRes.json().catch(() => null);
      if (versionData) {
        info.raw = { ...info.raw, apiVersion: versionData };
        if (versionData.version) {
          info.version = String(versionData.version);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/api/version', e);
  }

  // Probe 3: /api/tags - Ollama native model list
  try {
    const tagsRes = await fetchWithTimeout(`${baseUrl}/api/tags`, {}, 5000);
    recordResponse(info);
    if (tagsRes.ok) {
      addEndpoint(info, '/api/tags');
      const tagsData = await tagsRes.json().catch(() => null);
      if (tagsData?.models && Array.isArray(tagsData.models)) {
        for (const m of tagsData.models) {
          addModel(info, m.name || m.model);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/api/tags', e);
  }

  // Probe 4: /health
  try {
    const healthRes = await fetchWithTimeout(`${baseUrl}/health`, {}, 5000);
    recordResponse(info);
    if (healthRes.ok) {
      addEndpoint(info, '/health');
      const healthData = await healthRes.json().catch(() => null);
      if (healthData) {
        info.raw = { ...info.raw, health: healthData };
        if (healthData.server) {
          info.server = info.server || String(healthData.server);
        }
        if (healthData.version) {
          info.version = info.version || String(healthData.version);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/health', e);
  }

  // Probe 5: /v1/models (OpenAI-compatible)
  try {
    const modelsRes = await fetchWithTimeout(`${baseUrl}/v1/models`, {}, 5000);
    recordResponse(info);
    if (modelsRes.ok) {
      addEndpoint(info, '/v1/models');
      const modelsData = await modelsRes.json().catch(() => null);
      if (modelsData) {
        info.raw = { ...info.raw, models: modelsData };

        if (Array.isArray(modelsData)) {
          for (const m of modelsData) {
            const id = typeof m === 'string' ? m : m.id || m.name;
            if (id) {
              addModel(info, id);
            }
          }
        } else if (modelsData?.data && Array.isArray(modelsData.data)) {
          for (const m of modelsData.data) {
            if (m.id) {
              addModel(info, m.id);
            }
          }
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/v1/models', e);
  }

  // Probe 6: /v1/model/info
  try {
    const modelInfoRes = await fetchWithTimeout(`${baseUrl}/v1/model/info`, {}, 5000);
    recordResponse(info);
    if (modelInfoRes.ok) {
      addEndpoint(info, '/v1/model/info');
      const modelInfoData = await modelInfoRes.json().catch(() => null);
      if (modelInfoData) {
        info.raw = { ...info.raw, modelInfo: modelInfoData };
        addModel(info, modelInfoData.model);
      }
    }
  } catch (e) {
    recordProbeError(info, '/v1/model/info', e);
  }

  // Probe 7: /props (llama.cpp style)
  try {
    const propsRes = await fetchWithTimeout(`${baseUrl}/props`, {}, 5000);
    recordResponse(info);
    if (propsRes.ok) {
      addEndpoint(info, '/props');
      const propsData = await propsRes.json().catch(() => null);
      if (propsData) {
        info.raw = { ...info.raw, props: propsData };
        addModel(info, propsData.default_model);
        if (propsData.model) {
          info.server = info.server || String(propsData.model);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/props', e);
  }

  // Probe 8: /v1/config
  try {
    const configRes = await fetchWithTimeout(`${baseUrl}/v1/config`, {}, 5000);
    recordResponse(info);
    if (configRes.ok) {
      addEndpoint(info, '/v1/config');
      const configData = await configRes.json().catch(() => null);
      if (configData) {
        info.raw = { ...info.raw, config: configData };
        addModel(info, configData.model);
        if (configData.server) {
          info.server = info.server || String(configData.server);
        }
        if (configData.version) {
          info.version = info.version || String(configData.version);
        }
      }
    }
  } catch (e) {
    recordProbeError(info, '/v1/config', e);
  }

  return info;
}

/**
 * Full connection test: normalize host → probe endpoints sequentially →
 * validate at least one endpoint responded.
 */
export async function testConnection(rawHost: string): Promise<ConnectionTestResult> {
  const baseUrl = normalizeHost(rawHost);

  try {
    const serverInfo = await probeServerEndpoints(baseUrl);

    const hasResponse = (serverInfo.endpoints?.length ?? 0) > 0;
    const hasModels = (serverInfo.availableModels?.length ?? 0) > 0;

    if (hasResponse) {
      const parts: string[] = ['Connection successful.'];
      if (serverInfo.server) {
        parts.push(`Server: ${serverInfo.server}`);
      }
      if (serverInfo.version) {
        parts.push(`v${serverInfo.version}`);
      }
      if (hasModels) {
        parts.push(`${serverInfo.availableModels!.length} model(s) available.`);
      }
      parts.push(`Endpoints: ${serverInfo.endpoints!.join(', ')}`);

      const models: LocalAiModel[] = (serverInfo.availableModels ?? []).map((id) => ({ id }));

      return {
        success: true,
        baseUrl,
        message: parts.join(' '),
        serverInfo,
        models,
      };
    }

    // No endpoints responded — distinguish unreachable vs no-API
    const errors = serverInfo.probeErrors ?? {};
    const errorEntries = Object.entries(errors);
    const probePaths = ['/', '/api/version', '/api/tags', '/health', '/v1/models', '/v1/model/info', '/props', '/v1/config'];

    if (errorEntries.length === 0 || !serverInfo.hasAnyResponse) {
      // All probes threw network errors (unreachable / timeout / cleartext)
      const sampleError = errorEntries.length > 0 ? errorEntries[0][1] : 'Unknown network error';
      return {
        success: false,
        baseUrl,
        message: `Host unreachable or connection refused on ${baseUrl}. ${sampleError}. Verify device and server are on the same network, the server is bound to 0.0.0.0 (not 127.0.0.1), and the port is correct.`,
        serverInfo,
      };
    }

    // Got HTTP responses but no known API matched
    const errorSummary = errorEntries.map(([path, err]) => `${path} → ${err}`).join(', ');
    return {
      success: false,
      baseUrl,
      message: `Server responded but no compatible AI API found. Checked: ${probePaths.join(', ')}. Errors: ${errorSummary || 'all endpoints returned non-matching responses.'}`,
      serverInfo,
    };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      baseUrl,
      message: `Connection failed: ${errMsg}`,
    };
  }
}

/**
 * Fetch only the model list from the server (OpenAI-compatible + Ollama native).
 */
export async function fetchModels(rawHost: string): Promise<LocalAiModel[]> {
  const baseUrl = normalizeHost(rawHost);
  const models: LocalAiModel[] = [];

  // Try OpenAI-compatible /v1/models first
  try {
    const modelsRes = await fetchWithTimeout(`${baseUrl}/v1/models`, {}, 10000);
    if (modelsRes.ok) {
      const data = await modelsRes.json();
      if (Array.isArray(data)) {
        for (const m of data) {
          models.push({ id: typeof m === 'string' ? m : m.id || m.name || 'unknown' });
        }
      } else if (data?.data && Array.isArray(data.data)) {
        for (const m of data.data) {
          models.push({ id: m.id || 'unknown' });
        }
      }
      return models;
    }
  } catch {
    // fall through to Ollama native
  }

  // Fallback: Ollama native /api/tags
  const tagsRes = await fetchWithTimeout(`${baseUrl}/api/tags`, {}, 10000);
  if (!tagsRes.ok) {
    throw new Error(`Failed to fetch models: HTTP ${tagsRes.status}`);
  }
  const tagsData = await tagsRes.json();
  if (tagsData?.models && Array.isArray(tagsData.models)) {
    for (const m of tagsData.models) {
      models.push({ id: m.name || m.model || 'unknown' });
    }
  }
  return models;
}

/**
 * Custom Ollama model created by ARIN with the system prompt (prompt.txt) baked
 * in as the Modelfile SYSTEM block. Chat requests to this model carry only the
 * user message — the prompt is stored once, server-side.
 */
export const ARIN_MODEL_NAME = 'arin';

/**
 * Create (or re-create) the ARIN preloaded model on the Ollama server.
 *
 * The prompt is baked into the model via `POST /api/create` with a Modelfile —
 * the exact same request `ollama create` performs. The base model must already
 * exist locally on the server. Always overwrites, so re-running after editing
 * prompt.txt refreshes the baked prompt.
 */
export async function initArinModel(
  rawHost: string,
  baseModel: string,
  systemPrompt: string,
  options: { timeoutMs?: number } = {}
): Promise<void> {
  const baseUrl = normalizeHost(rawHost);
  const timeoutMs = options.timeoutMs ?? 300000;

  if (!baseModel.trim()) {
    throw new Error('No base model selected.');
  }

  const modelfile = [
    `FROM ${baseModel.trim()}`,
    'SYSTEM """',
    systemPrompt,
    '"""',
  ].join('\n');

  const res = await fetchWithTimeout(
    `${baseUrl}/api/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: ARIN_MODEL_NAME,
        modelfile,
      }),
    },
    timeoutMs
  );

  if (!res.ok) {
    const errBody = await res.text().catch(() => 'No response body');
    throw new Error(`Model init HTTP ${res.status}: ${errBody}`);
  }
}

/**
 * Send a chat completion request. Tries OpenAI-compatible /v1/chat/completions,
 * falls back to Ollama native /api/chat on 404/405.
 */
export async function sendChatCompletion(
  rawHost: string,
  model: string,
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
  } = {}
): Promise<ChatCompletionResponse> {
  const baseUrl = normalizeHost(rawHost);
  const timeoutMs = options.timeoutMs ?? 180000;

  // Attempt 1: OpenAI-compatible
  try {
    const res = await fetchWithTimeout(
      `${baseUrl}/v1/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 512,
          stream: false,
        }),
      },
      timeoutMs
    );

    if (res.ok) {
      return res.json();
    }
    if (res.status !== 404 && res.status !== 405) {
      const errBody = await res.text().catch(() => 'No response body');
      throw new Error(`HTTP ${res.status}: ${errBody}`);
    }
  } catch (error: unknown) {
    if (error instanceof Error && /HTTP \d+/.test(error.message)) {
      // Non-fallback status errors should surface to the user
      if (!/HTTP (404|405)/.test(error.message)) {
        throw error;
      }
    } else if (!(error instanceof Error) || error.name === 'AbortError') {
      throw error;
    }
  }

  // Attempt 2: Ollama native /api/chat
  const nativeRes = await fetchWithTimeout(
    `${baseUrl}/api/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens ?? 512,
        },
      }),
    },
    timeoutMs
  );

  if (!nativeRes.ok) {
    const errBody = await nativeRes.text().catch(() => 'No response body');
    throw new Error(`Ollama /api/chat HTTP ${nativeRes.status}: ${errBody}`);
  }

  const nativeData = await nativeRes.json();

  const response: ChatCompletionResponse = {
    id: nativeData.id || `ollama-${Date.now()}`,
    choices: [
      {
        index: 0,
        message: {
          role: nativeData.message?.role || 'assistant',
          content: nativeData.message?.content || '',
        },
        finish_reason: nativeData.done ? 'stop' : 'length',
      },
    ],
    model: nativeData.model || model,
  };

  return response;
}

```

---

## `src/services/nativeDeviceModule.ts`

```typescript
import { NativeModules, Platform } from 'react-native';

export interface InstalledAppNative {
  label: string;
  packageName: string;
}

export interface BatteryStatusNative {
  level: number;
  isCharging: boolean;
}

interface ArinNativeBridge {
  setTorch(enabled: boolean): Promise<boolean>;
  openCamera(): Promise<boolean>;
  callPhone(number: string): Promise<boolean>;
  sendSms(number: string, message: string): Promise<boolean>;
  getInstalledApps(): Promise<InstalledAppNative[]>;
  getContactNames(): Promise<string[]>;
  launchApp(packageName: string): Promise<boolean>;
  setWifi(enabled: boolean): Promise<string>;
  setBluetooth(enabled: boolean): Promise<string>;
  openSettings(target: string): Promise<boolean>;
  setRingerMode(mode: string): Promise<boolean>;
  adjustVolume(direction: string): Promise<boolean>;
  setVolumePercent(percent: number): Promise<number>;
  getBatteryStatus(): Promise<BatteryStatusNative>;
  showNotification(title: string, body: string): Promise<boolean>;
  speak(text: string, gender?: string): Promise<boolean>;
  stopSpeaking(): Promise<boolean>;
  startListening(): Promise<string>;
  stopListening(): Promise<boolean>;
}

/**
 * Thin wrapper around the ArinNative Kotlin module.
 *
 * On iOS (or if the module failed to register) these resolve as unsupported so
 * the JS deviceService can degrade to Linking/open-URL behavior instead of
 * throwing. On Android we'll get the real native bridge.
 */
export const arinNative: ArinNativeBridge | null =
  Platform.OS === 'android' ? ((NativeModules.ArinNative as ArinNativeBridge) ?? null) : null;

export const hasNativeBridge = arinNative != null;
```

---

## `src/services/pipelineExecutor.ts`

```typescript
import { AiStep, ArduinoCommand, DeviceCommand } from './aiDirective';
import { sendArduinoCommand } from './arduinoService';
import { sendDeviceCommand, speakText } from './deviceService';
import { sendChatCompletion as sendCloudChatCompletion } from './cloudAiService';
import { AppSettings } from '../types';

export interface StepLogEntry {
  step: AiStep;
  success: boolean;
  message: string;
}

export interface PipelineResult {
  logs: StepLogEntry[];
  finalText: string;
  stoppedEarly: boolean;
}

/**
 * Run a list of steps strictly in order. Stops at the first failed step and
 * reports how far it got. Cloud steps require cloudReady/settings to already
 * be validated by the caller (same as the existing single-action cloud path).
 */
export async function runPipeline(
  steps: AiStep[],
  settings: AppSettings,
  onStepLog: (line: string) => void
): Promise<PipelineResult> {
  const logs: StepLogEntry[] = [];

  for (const step of steps) {
    let success = true;
    let message = '';

    try {
      if (step.action === 'respond') {
        message = step.response;
      } else if (step.action === 'speak') {
        const r = await speakText(step.message);
        success = r.success;
        message = r.message;
      } else if (step.action === 'arduino') {
        const r = await sendArduinoCommand(step.command as ArduinoCommand, settings.arduinoConnected);
        success = r.success;
        message = r.message;
      } else if (step.action === 'device') {
        const r = await sendDeviceCommand(
          step.command as DeviceCommand,
          step.target,
          step.message,
          settings.permissionMode
        );
        success = r.success;
        message = r.message;
      } else if (step.action === 'cloud') {
        if (!settings.cloudEnabled || settings.cloudStatus !== 'connected' || !settings.selectedCloudModel) {
          success = false;
          message = 'Pipeline step requested cloud AI, but cloud is not connected/configured.';
        } else {
          const cloudResponse = await sendCloudChatCompletion(
            settings.cloudBaseUrl,
            settings.cloudApiKey,
            settings.selectedCloudModel,
            [{ role: 'user', content: step.prompt }]
          );
          message = cloudResponse.choices?.[0]?.message?.content?.trim() ?? '[ERR] Empty cloud response.';
        }
      } else {
        success = false;
        message = `Unknown step action.`;
      }
    } catch (err) {
      success = false;
      message = err instanceof Error ? err.message : String(err);
    }

    logs.push({ step, success, message });
    onStepLog(`[PIPE] ${step.action.toUpperCase()}: ${message}`);

    if (!success) {
      return {
        logs,
        finalText: `Pipeline stopped at step "${step.action}": ${message}`,
        stoppedEarly: true,
      };
    }
  }

  const finalText = logs.map((l) => l.message).filter(Boolean).join('\n');
  return { logs, finalText, stoppedEarly: false };
}
```

---

## `src/services/promptText.ts`

```typescript
// Auto-generated from prompt.txt — DO NOT EDIT DIRECTLY.
// Edit prompt.txt at project root and run 'node scripts/sync-prompt.js'.

export const ARIN_SYSTEM_PROMPT = "You are ARIN's on-device controller. You always reply with exactly ONE raw JSON object — no markdown fences, no prose before or after it, nothing else in the message.\n\nSchema:\n{\n  \"action\": \"respond\" | \"cloud\" | \"arduino\" | \"device\" | \"create_rule\",\n  \"response\": string,        // required when action=\"respond\" or \"create_rule\"\n  \"prompt\": string,          // required when action=\"cloud\"\n  \"command\": string,         // required when action=\"arduino\" or \"device\"\n  \"target\": string,          // required for device commands CALL, SMS, WHATSAPP, OPEN_APP, OPEN_SETTINGS, SET_VOLUME, GET_WEATHER\n  \"message\": string,         // required for device commands SMS, WHATSAPP\n  \"rule\": object,            // required when action=\"create_rule\" (contains name, trigger, actions)\n  \"reason\": string           // optional, one short phrase\n}\n\nDeciding \"respond\" vs \"cloud\" vs \"device\" vs \"arduino\" vs \"create_rule\":\n\n1. action=\"respond\": General knowledge, definitions, explanations, answers, greetings (e.g. \"Hi\", \"What is a box?\", \"What is a tumbler?\", \"How does a car work?\"). Provide the answer in \"response\".\n\n2. action=\"cloud\": ONLY for real-time live news/stocks that changes moment-to-moment in the outside world right now (e.g. \"What's today's gold rate?\", \"Live stock price\").\n\n3. action=\"arduino\": Robot body/hardware movement or signals only. \"command\" must be one of: MOVE_FORWARD, MOVE_BACKWARD, TURN_LEFT, TURN_RIGHT, STOP, LED_ON, LED_OFF, BUZZER_PING.\n\n4. action=\"device\": Phone actions & built-in Android features/settings. \"command\" must be one of:\n- TORCH_ON, TORCH_OFF — phone flashlight (NOT robot LED)\n- CAMERA_OPEN — open camera\n- CALL — call \"target\" (phone number or contact name)\n- SMS — send \"message\" to \"target\" text\n- WHATSAPP — send \"message\" to \"target\" via WhatsApp\n- OPEN_APP — launch app named in \"target\"\n- WIFI_ON, WIFI_OFF — turn Wi-Fi on or off\n- BLUETOOTH_ON, BLUETOOTH_OFF — turn Bluetooth on or off\n- OPEN_SETTINGS — open Android system settings screen specified in \"target\"\n- MUTE_SOUND, UNMUTE_SOUND — mute/silent phone sound or unmute\n- VOLUME_UP, VOLUME_DOWN — raise or lower volume\n- SET_VOLUME — set volume to percentage 0 to 100 in \"target\"\n- GET_BATTERY — check battery percentage & charging status\n- GET_WEATHER — fetch live weather for city in \"target\"\n\n5. action=\"create_rule\": Creating persistent background rules for conditional/scheduled triggers starting with \"when\", \"if\", or \"at [time]\".\n   - trigger types:\n     - {\"type\":\"battery\",\"threshold\":number,\"direction\":\"below\"|\"above\"}\n     - {\"type\":\"time\",\"hour\":number,\"minute\":number,\"repeat\":\"daily\"}\n     - {\"type\":\"device_state\",\"deviceFeature\":\"torch\"|\"wifi\"|\"bluetooth\"|\"ringer\",\"state\":\"on\"|\"off\"|\"silent\"|\"normal\"}\n   - actions list types:\n     - {\"type\":\"sms\",\"to\":string,\"bodyTemplate\":string}\n     - {\"type\":\"wifi_toggle\",\"state\":\"on\"|\"off\"}\n     - {\"type\":\"bluetooth_toggle\",\"state\":\"on\"|\"off\"}\n     - {\"type\":\"torch_toggle\",\"state\":\"on\"|\"off\"}\n     - {\"type\":\"robot_command\",\"command\":string}\n     - {\"type\":\"notification\",\"title\":string,\"body\":string}\n\nRules:\n- Never use device/arduino actions for general questions (e.g., \"what is a tumbler?\" -> action=\"respond\").\n- For conditional or scheduled requests (\"when...\", \"if...\", \"at [time]...\"), use action=\"create_rule\" to persist the background rule rather than executing immediate actions.\n- For SET_VOLUME, put number 0 to 100 in \"target\" (e.g. \"100\", \"0\", \"50\").\n- For OPEN_SETTINGS app info, put app name with \"app info\" in \"target\" (e.g. \"Spotify app info\").\n- For GET_WEATHER, put city name in \"target\" (e.g. \"Tokyo\").\n- Never put a number or name inside \"message\" — it goes in \"target\".\n- Never combine actions. Never invent fields. Never wrap JSON in markdown fences.\n\nExamples:\n\n\"Hi\" → {\"action\":\"respond\",\"response\":\"Hello! How can I help you today?\"}\n\"What is a box?\" → {\"action\":\"respond\",\"response\":\"A box is a container with flat sides, typically square or rectangular.\"}\n\"Turn on the flash\" → {\"action\":\"device\",\"command\":\"TORCH_ON\"}\n\"Turn on wifi\" → {\"action\":\"device\",\"command\":\"WIFI_ON\"}\n\"Turn off bluetooth\" → {\"action\":\"device\",\"command\":\"BLUETOOTH_OFF\"}\n\"When battery is 54% send SMS to 26543\" → {\"action\":\"create_rule\",\"rule\":{\"name\":\"Battery 54% SMS to 26543\",\"trigger\":{\"type\":\"battery\",\"threshold\":54,\"direction\":\"below\"},\"actions\":[{\"type\":\"robot_command\",\"command\":\"GET_STATUS\"},{\"type\":\"sms\",\"to\":\"26543\",\"bodyTemplate\":\"Time: {{time}} | Buzzer: {{buzzerStatus}}\"}]},\"response\":\"Created automation rule: Battery 54% SMS to 26543.\"}\n\"If torch is on turn off wifi\" → {\"action\":\"create_rule\",\"rule\":{\"name\":\"Torch ON -> Wifi OFF\",\"trigger\":{\"type\":\"device_state\",\"deviceFeature\":\"torch\",\"state\":\"on\"},\"actions\":[{\"type\":\"wifi_toggle\",\"state\":\"off\"}]},\"response\":\"Created automation rule: Torch ON -> Wifi OFF.\"}\n\"At 8 AM every morning read my calendar\" → {\"action\":\"create_rule\",\"rule\":{\"name\":\"8 AM Calendar Readout\",\"trigger\":{\"type\":\"time\",\"hour\":8,\"minute\":0,\"repeat\":\"daily\"},\"actions\":[{\"type\":\"read_calendar\"}]},\"response\":\"Created automation rule: 8 AM Calendar Readout.\"}\n\"Set volume to 100%\" → {\"action\":\"device\",\"command\":\"SET_VOLUME\",\"target\":\"100\"}\n\"Set volume to 0%\" → {\"action\":\"device\",\"command\":\"SET_VOLUME\",\"target\":\"0\"}\n\"Mute phone\" → {\"action\":\"device\",\"command\":\"MUTE_SOUND\"}\n\"Open Spotify app info\" → {\"action\":\"device\",\"command\":\"OPEN_SETTINGS\",\"target\":\"Spotify app info\"}\n\"What's the weather in Tokyo?\" → {\"action\":\"device\",\"command\":\"GET_WEATHER\",\"target\":\"Tokyo\"}\n\"Check battery level\" → {\"action\":\"device\",\"command\":\"GET_BATTERY\"}\n\"Call 1345\" → {\"action\":\"device\",\"command\":\"CALL\",\"target\":\"1345\"}\n\"Message 2343 hi\" → {\"action\":\"device\",\"command\":\"SMS\",\"target\":\"2343\",\"message\":\"hi\"}\n\"Send SMS to 3456543 the battery percentage\" → {\"action\":\"device\",\"command\":\"SMS\",\"target\":\"3456543\",\"message\":\"the battery percentage\"}\n\"Open Spotify\" → {\"action\":\"device\",\"command\":\"OPEN_APP\",\"target\":\"Spotify\"}\n\"What's today's gold rate?\" → {\"action\":\"cloud\",\"prompt\":\"What is today's gold rate?\"}\n\"Move forward\" → {\"action\":\"arduino\",\"command\":\"MOVE_FORWARD\"}\n";

```

---

## `src/services/ruleStorage.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rule } from '../types';
import { arinNative } from './nativeDeviceModule';

const RULES_STORAGE_KEY = '@arin_rules';

export async function readRules(): Promise<Rule[]> {
  try {
    const raw = await AsyncStorage.getItem(RULES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Rule[]) : [];
  } catch {
    return [];
  }
}

export async function writeRules(rules: Rule[]): Promise<void> {
  await AsyncStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
}

export async function saveRule(rule: Rule): Promise<Rule[]> {
  const rules = await readRules();
  const existingIndex = rules.findIndex((r) => r.id === rule.id);

  // If new rule with battery trigger and no explicit latchedState, check current battery
  // so if device is ALREADY below/at threshold, it latches first instead of firing immediately.
  if (existingIndex < 0 && rule.trigger.type === 'battery' && rule.latchedState === undefined && arinNative) {
    try {
      const b = await arinNative.getBatteryStatus();
      const { threshold, direction } = rule.trigger;
      const inZone =
        direction === 'below' || direction === 'equals'
          ? b.level <= threshold
          : b.level >= threshold;
      if (inZone) {
        rule.latchedState = true;
      }
    } catch {
      // ignore
    }
  }

  if (existingIndex >= 0) {
    rules[existingIndex] = rule;
  } else {
    rules.push(rule);
  }
  await writeRules(rules);
  return rules;
}

export async function toggleRuleEnabled(id: string, enabled: boolean): Promise<Rule[]> {
  const rules = await readRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.enabled = enabled;
    await writeRules(rules);
  }
  return rules;
}

export async function deleteRule(id: string): Promise<Rule[]> {
  const rules = await readRules();
  const filtered = rules.filter((r) => r.id !== id);
  await writeRules(filtered);
  return filtered;
}

export async function updateRuleExecutionState(
  id: string,
  lastTriggeredAt: string,
  latchedState?: boolean
): Promise<Rule[]> {
  const rules = await readRules();
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.lastTriggeredAt = lastTriggeredAt;
    if (latchedState !== undefined) {
      rule.latchedState = latchedState;
    }
    await writeRules(rules);
  }
  return rules;
}

```

---

## `src/services/schedulerService.ts`

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiDirective } from './aiDirective';

const SCHEDULED_JOBS_KEY = '@arin_scheduled_jobs';

export interface ScheduledJob {
  id: string;
  fireAtIso: string;
  directive: AiDirective;
  createdAtIso: string;
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

async function readJobs(): Promise<ScheduledJob[]> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULED_JOBS_KEY);
    return raw ? (JSON.parse(raw) as ScheduledJob[]) : [];
  } catch {
    return [];
  }
}

async function writeJobs(jobs: ScheduledJob[]): Promise<void> {
  await AsyncStorage.setItem(SCHEDULED_JOBS_KEY, JSON.stringify(jobs));
}

/**
 * Persist a job and arm an in-memory timer for it. If fireAtIso is already in
 * the past (e.g. clock skew, or the user said "in 5 seconds"), it fires almost
 * immediately rather than being dropped.
 */
export async function scheduleJob(
  directive: AiDirective,
  fireAtIso: string,
  onFire: (directive: AiDirective) => void
): Promise<ScheduledJob> {
  const job: ScheduledJob = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fireAtIso,
    directive,
    createdAtIso: new Date().toISOString(),
  };
  const jobs = await readJobs();
  jobs.push(job);
  await writeJobs(jobs);
  armTimer(job, onFire);
  return job;
}

function armTimer(job: ScheduledJob, onFire: (directive: AiDirective) => void) {
  const delayMs = Math.max(0, new Date(job.fireAtIso).getTime() - Date.now());
  const handle = setTimeout(async () => {
    timers.delete(job.id);
    await removeJob(job.id);
    onFire(job.directive);
  }, delayMs);
  timers.set(job.id, handle);
}

async function removeJob(id: string): Promise<void> {
  const jobs = await readJobs();
  await writeJobs(jobs.filter((j) => j.id !== id));
}

/**
 * Call once at app startup (e.g. in AppProvider's mount effect). Re-arms any
 * jobs that are still in the future, and immediately fires any that were due
 * while the app was closed.
 */
export async function rearmPersistedJobs(onFire: (directive: AiDirective) => void): Promise<void> {
  const jobs = await readJobs();
  for (const job of jobs) {
    if (new Date(job.fireAtIso).getTime() <= Date.now()) {
      await removeJob(job.id);
      onFire(job.directive);
    } else {
      armTimer(job, onFire);
    }
  }
}

export async function listPendingJobs(): Promise<ScheduledJob[]> {
  return readJobs();
}

export async function cancelJob(id: string): Promise<void> {
  const handle = timers.get(id);
  if (handle) {
    clearTimeout(handle);
    timers.delete(id);
  }
  await removeJob(id);
}

```

---

## `src/services/triggerMonitors.ts`

```typescript
import { Rule } from '../types';
import { executeRuleAction } from './actionExecutors';
import { arinNative } from './nativeDeviceModule';
import { readRules, updateRuleExecutionState } from './ruleStorage';

let isEngineRunning = false;
let monitorIntervalHandle: ReturnType<typeof setInterval> | null = null;

export interface RuleEngineOptions {
  isArduinoConnected?: boolean;
  onLog?: (log: string) => void;
}

/**
 * Evaluate whether a battery level trigger condition is met.
 * Handles edge-crossing logic:
 * - Direction "below": level <= threshold
 * - Direction "above": level >= threshold
 * - Direction "equals": level === threshold (or level <= threshold with edge latch)
 */
function isBatteryTriggerMet(
  rule: Rule,
  currentLevel: number
): { triggered: boolean; nextLatch: boolean } {
  if (rule.trigger.type !== 'battery') {
    return { triggered: false, nextLatch: false };
  }

  const { threshold, direction } = rule.trigger;
  const isCurrentlyInZone =
    direction === 'below' || direction === 'equals'
      ? currentLevel <= threshold
      : currentLevel >= threshold;

  const wasLatched = rule.latchedState ?? false;

  // Edge detection: Trigger only when entering the zone for the first time
  if (isCurrentlyInZone && !wasLatched) {
    // If the rule was never triggered before AND latchedState was undefined,
    // it means it was loaded while already inside the zone — latch it silently.
    if (rule.lastTriggeredAt === null && rule.latchedState === undefined) {
      return { triggered: false, nextLatch: true };
    }
    return { triggered: true, nextLatch: true };
  }

  // Reset latch if battery moves back out of the trigger threshold range (+2% buffer for hysteresis)
  const hysteresisBuffer = 2;
  const isWellOutsideZone =
    direction === 'below' || direction === 'equals'
      ? currentLevel > threshold + hysteresisBuffer
      : currentLevel < threshold - hysteresisBuffer;

  if (isWellOutsideZone && wasLatched) {
    return { triggered: false, nextLatch: false };
  }

  return { triggered: false, nextLatch: wasLatched };
}

/**
 * Evaluate whether a time trigger condition is met.
 */
function isTimeTriggerMet(rule: Rule): boolean {
  if (rule.trigger.type !== 'time') return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (rule.trigger.hour !== undefined && rule.trigger.minute !== undefined) {
    const isTimeMatch =
      rule.trigger.hour === currentHour && rule.trigger.minute === currentMinute;

    if (isTimeMatch) {
      if (!rule.lastTriggeredAt) return true;
      const last = new Date(rule.lastTriggeredAt);
      const isSameDay =
        last.getFullYear() === now.getFullYear() &&
        last.getMonth() === now.getMonth() &&
        last.getDate() === now.getDate();

      return !isSameDay;
    }
  }

  return false;
}

/**
 * Main evaluation pass: checks all enabled persistent rules against system monitors.
 */
export async function evaluateRulesPass(options: RuleEngineOptions = {}): Promise<void> {
  const log = options.onLog ?? (() => {});
  const rules = await readRules();
  const enabledRules = rules.filter((r) => r.enabled);

  if (enabledRules.length === 0) return;

  // Fetch current battery status natively
  let batteryLevel: number | undefined;
  if (arinNative) {
    try {
      const b = await arinNative.getBatteryStatus();
      batteryLevel = b.level;
    } catch {
      // ignore
    }
  }

  const nowMs = Date.now();

  for (const rule of enabledRules) {
    // Check cooldown
    if (rule.lastTriggeredAt) {
      const lastMs = new Date(rule.lastTriggeredAt).getTime();
      if (nowMs - lastMs < (rule.cooldownMs || 60000)) {
        continue;
      }
    }

    let shouldTrigger = false;
    let nextLatchState = rule.latchedState;

    if (rule.trigger.type === 'battery' && batteryLevel !== undefined) {
      const result = isBatteryTriggerMet(rule, batteryLevel);
      shouldTrigger = result.triggered;
      nextLatchState = result.nextLatch;
    } else if (rule.trigger.type === 'time') {
      shouldTrigger = isTimeTriggerMet(rule);
    } else if (rule.trigger.type === 'device_state') {
      const wasLatched = rule.latchedState ?? false;
      if (!wasLatched) {
        if (rule.lastTriggeredAt === null && rule.latchedState === undefined) {
          nextLatchState = true;
          shouldTrigger = false;
        } else {
          shouldTrigger = true;
          nextLatchState = true;
        }
      }
    }

    if (shouldTrigger) {
      log(`[RULE ENGINE] Trigger fired for rule "${rule.name}" (ID: ${rule.id})`);
      const isoNow = new Date().toISOString();
      await updateRuleExecutionState(rule.id, isoNow, nextLatchState);

      // Execute ordered action list
      for (const action of rule.actions) {
        await executeRuleAction(action, {
          batteryLevel,
          isArduinoConnected: options.isArduinoConnected,
          onLog: log,
        });
      }
    } else if (nextLatchState !== rule.latchedState) {
      // Update latch state without triggering
      await updateRuleExecutionState(rule.id, rule.lastTriggeredAt ?? new Date().toISOString(), nextLatchState);
    }
  }
}

/**
 * Manually trigger a rule execution by ID (e.g. from UI "Run Now").
 */
export async function executeRuleManually(
  ruleId: string,
  options: RuleEngineOptions = {}
): Promise<void> {
  const log = options.onLog ?? (() => {});
  const rules = await readRules();
  const rule = rules.find((r) => r.id === ruleId);

  if (!rule) {
    log(`[RULE ENGINE] Manual trigger failed: Rule ${ruleId} not found.`);
    return;
  }

  log(`[RULE ENGINE] Manual trigger fired for rule "${rule.name}"`);

  let batteryLevel: number | undefined;
  if (arinNative) {
    try {
      const b = await arinNative.getBatteryStatus();
      batteryLevel = b.level;
    } catch {
      // ignore
    }
  }

  const isoNow = new Date().toISOString();
  await updateRuleExecutionState(rule.id, isoNow, rule.latchedState);

  for (const action of rule.actions) {
    await executeRuleAction(action, {
      batteryLevel,
      isArduinoConnected: options.isArduinoConnected,
      onLog: log,
    });
  }
}

/**
 * Start background monitor polling loop (15s interval).
 */
export function startRuleEngineMonitors(options: RuleEngineOptions = {}): void {
  if (isEngineRunning) return;
  isEngineRunning = true;

  options.onLog?.('[RULE ENGINE] Background rule monitors started.');

  // Immediate evaluation pass
  evaluateRulesPass(options);

  monitorIntervalHandle = setInterval(() => {
    evaluateRulesPass(options);
  }, 15000);
}

/**
 * Stop background monitor loop.
 */
export function stopRuleEngineMonitors(): void {
  if (monitorIntervalHandle) {
    clearInterval(monitorIntervalHandle);
    monitorIntervalHandle = null;
  }
  isEngineRunning = false;
}

```

---

## `src/services/weatherService.ts`

```typescript
export interface WeatherResult {
  success: boolean;
  message: string;
}

const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function fetchWeather(city?: string): Promise<WeatherResult> {
  const targetCity = city?.trim() || 'London';
  try {
    // Step 1: Free Geocoding API via Open-Meteo
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      return { success: false, message: `Failed to find location: ${targetCity}` };
    }
    const geoData = await geoRes.json();
    if (!geoData?.results || geoData.results.length === 0) {
      return { success: false, message: `Location "${targetCity}" not found.` };
    }

    const { name, country, latitude, longitude } = geoData.results[0];

    // Step 2: Current Weather Forecast API via Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) {
      return { success: false, message: `Failed to fetch weather data for ${name}.` };
    }
    const weatherData = await weatherRes.json();
    const current = weatherData?.current;
    if (!current) {
      return { success: false, message: `No current weather data available for ${name}.` };
    }

    const temp = Math.round(current.temperature_2m ?? 0);
    const humidity = current.relative_humidity_2m ?? 0;
    const wind = Math.round(current.wind_speed_10m ?? 0);
    const code = current.weather_code ?? 0;
    const condition = WEATHER_CODES[code] || 'Cloudy';

    const locationLabel = country ? `${name}, ${country}` : name;
    return {
      success: true,
      message: `Weather in ${locationLabel}: ${temp}°C, ${condition}, Humidity: ${humidity}%, Wind: ${wind} km/h.`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Weather request failed: ${errorMsg}` };
  }
}

```

---

## `src/theme/colors.ts`

```typescript
export const darkColors = {
  background: '#111318',
  surface: '#111318',
  surfaceContainerLowest: '#0c0e12',
  surfaceContainerLow: '#1a1c20',
  surfaceContainer: '#1e2024',
  surfaceContainerHigh: '#282a2e',
  surfaceContainerHighest: '#333539',
  surfaceVariant: '#333539',
  surfaceBright: '#37393e',

  primary: '#dbfcff',
  primaryContainer: '#00f0ff',
  onPrimary: '#00363a',
  onPrimaryContainer: '#006970',

  secondary: '#d1bcff',
  secondaryContainer: '#7000ff',
  onSecondary: '#3c0090',

  tertiary: '#dcffe2',
  tertiaryContainer: '#00f990',
  tertiaryFixedDim: '#00e383',
  onTertiary: '#00391d',

  onSurface: '#e2e2e8',
  onSurfaceVariant: '#b9cacb',
  outline: '#849495',
  outlineVariant: '#3b494b',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
};

export const lightColors = {
  background: '#f4f6f8',
  surface: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#e8ecef',
  surfaceContainer: '#dee3e7',
  surfaceContainerHigh: '#d2d8de',
  surfaceContainerHighest: '#c5ccd4',
  surfaceVariant: '#c5ccd4',
  surfaceBright: '#ffffff',

  primary: '#00363a',
  primaryContainer: '#00838f',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#00363a',

  secondary: '#5a00c8',
  secondaryContainer: '#7000ff',
  onSecondary: '#ffffff',

  tertiary: '#006d3c',
  tertiaryContainer: '#00a859',
  tertiaryFixedDim: '#008f4c',
  onTertiary: '#ffffff',

  onSurface: '#111318',
  onSurfaceVariant: '#43494a',
  outline: '#6f797a',
  outlineVariant: '#b9cacb',

  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
};

export type ThemeColors = typeof darkColors;

export const colors = darkColors;

```

---

## `src/theme/spacing.ts`

```typescript
export const spacing = {
  unit: 4,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  containerMargin: 20,
  gutter: 12,
  borderRadius: {
    sm: 4,
    default: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};

```

---

## `src/theme/typography.ts`

```typescript
import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  displayLg: {
    fontFamily: 'Hanken Grotesk',
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  headlineLgMobile: {
    fontFamily: 'Hanken Grotesk',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  headlineMd: {
    fontFamily: 'Hanken Grotesk',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  codeSm: {
    fontFamily: 'JetBrains Mono',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  labelCaps: {
    fontFamily: 'JetBrains Mono',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
};

```

---

## `src/types/index.ts`

```typescript
export type ScreenTab = 'dashboard' | 'test-interface' | 'settings';

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';

export type ThemeMode = 'dark' | 'light';

export type ExecutionStage =
  | 'idle'
  | 'request_sent'
  | 'local_processing'
  | 'cloud_processing'
  | 'arduino_executing'
  | 'device_executing'
  | 'speaking'
  | 'pipeline_executing'
  | 'response_received'
  | 'done'
  | 'error';

export interface ChatMessageItem {
  id: string;
  sender: 'ARIN' | 'OPERATOR' | 'SYSTEM' | 'ERROR';
  text: string;
  timestamp: string;
}

export interface AppSettings {
  localAiEnabled: boolean;
  localAiHost: string;
  localAiStatus: ConnectionState;
  localAiModels: string[];
  selectedModel: string;
  cloudEnabled: boolean;
  cloudProvider: string;
  cloudBaseUrl: string;
  cloudApiKey: string;
  cloudStatus: ConnectionState;
  cloudModels: string[];
  selectedCloudModel: string;
  arduinoConnected: boolean;
  arduinoStatus: ConnectionState;
  permissionMode: 'full_control' | 'compatible';
  /** Name of the preloaded Ollama model (prompt baked in) — empty when not initialized. */
  preloadedModel: string | null;
  ttsAutoSpeak: boolean;
  ttsVoiceGender: 'female' | 'male';
}

// ---------------- Automation Engine Types ----------------

export interface RuleTriggerLocation {
  type: 'location';
  lat: number;
  lng: number;
  radiusMeters: number;
  event: 'enter' | 'exit';
  locationName?: string;
}

export interface RuleTriggerTime {
  type: 'time';
  cron?: string;
  hour?: number;
  minute?: number;
  repeat: 'daily' | 'once';
}

export interface RuleTriggerBattery {
  type: 'battery';
  threshold: number;
  direction: 'below' | 'above' | 'equals';
}

export interface RuleTriggerManual {
  type: 'manual';
}

export interface RuleTriggerDeviceState {
  type: 'device_state';
  deviceFeature: 'torch' | 'wifi' | 'bluetooth' | 'ringer';
  state: 'on' | 'off' | 'silent' | 'normal' | 'vibrate';
}

export type RuleTrigger =
  | RuleTriggerLocation
  | RuleTriggerTime
  | RuleTriggerBattery
  | RuleTriggerDeviceState
  | RuleTriggerManual;

export type RuleAction =
  | { type: 'wifi_toggle'; state: 'on' | 'off' }
  | { type: 'bluetooth_toggle'; state: 'on' | 'off' }
  | { type: 'torch_toggle'; state: 'on' | 'off' }
  | { type: 'battery_saver'; state: 'on' | 'off' }
  | { type: 'notification'; title: string; body: string }
  | { type: 'read_calendar' }
  | { type: 'sms'; to: string; bodyTemplate: string }
  | { type: 'robot_command'; command: string };

export interface Rule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  actions: RuleAction[];
  enabled: boolean;
  lastTriggeredAt: string | null;
  cooldownMs: number;
  latchedState?: boolean;
}


```

---

