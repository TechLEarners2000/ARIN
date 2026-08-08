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
import android.provider.ContactsContract
import android.provider.MediaStore
import android.provider.Settings
import android.telephony.SmsManager
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
