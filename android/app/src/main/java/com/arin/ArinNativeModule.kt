package com.arin

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.net.Uri
import android.os.Build
import android.provider.ContactsContract
import android.provider.MediaStore
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

  // ---------------- Launch App by package ----------------

  @ReactMethod
  fun launchApp(packageName: String, promise: Promise) {
    val ctx = reactApplicationContext
    val intent = ctx.packageManager.getLaunchIntentForPackage(packageName)
    if (intent == null) {
      promise.reject("APP_NOT_FOUND", "No launchable activity found for $packageName")
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
