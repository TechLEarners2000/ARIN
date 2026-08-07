# ARIN — Full Source Code

> 34 files

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
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const ChatInput: React.FC = () => {
  const [text, setText] = useState('');
  const { sendMessage, themeColors } = useApp();

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View
        style={[
          styles.inputBox,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
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
          placeholder="Enter command..."
          placeholderTextColor={themeColors.onSurfaceVariant}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: themeColors.primaryContainer }]}
          onPress={handleSend}
          activeOpacity={0.8}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>SEND</Text>
        </TouchableOpacity>
      </View>
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
  sendButton: {
    height: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
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
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ARIN_SYSTEM_PROMPT, parseAiDirective } from '../services/aiDirective';
import { sendArduinoCommand } from '../services/arduinoService';
import { sendDeviceCommand } from '../services/deviceService';
import {
  fetchModels as fetchCloudModelsService,
  sendChatCompletion as sendCloudChatCompletion,
  testConnection as testCloudConnection,
} from '../services/cloudAiService';
import {
  fetchModels as fetchModelsService,
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
    setTimeout(() => setCurrentStage('idle'), 1500);
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
    const cloudReady = settings.cloudEnabled && settings.cloudStatus === 'connected';

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
      const localResponse = await sendChatCompletion(settings.localAiHost, settings.selectedModel, [
        { role: 'system', content: ARIN_SYSTEM_PROMPT },
        { role: 'user', content: text },
      ]);

      const rawText = localResponse.choices?.[0]?.message?.content ?? '';
      const directive = parseAiDirective(rawText);

      // Build the pipeline dynamically from the directive contents:
      // request -> local -> [cloud] -> [arduino] -> [device] -> response -> done
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
      path.push('response_received', 'done');
      setPipelinePath(path);
      setCurrentStage(
        directive.action === 'cloud'
          ? 'cloud_processing'
          : directive.action === 'arduino'
          ? 'arduino_executing'
          : directive.action === 'device'
          ? 'device_executing'
          : 'response_received'
      );

      if (directive.action === 'respond') {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 250));
        setTestLogs((prev) => [`[SYS] Local AI responded directly.`, ...prev]);
        finishWithReply(directive.response);
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
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const presetCommands = [
  'arduino-buzzer',
  'arduino-motor-F',
  'arduino-motor-B',
  'local-"HI"',
  'cloud-"HI"',
  'error-test',
  'builtin-torch-on',
  'builtin-torch-off',
  'cam-on',
  'call-1098712',
  'message-0987654-"hi"',
];

export const TestScreen: React.FC = () => {
  const [customCmd, setCustomCmd] = useState('');
  const { testLogs, addTestLog, sendMessage, themeColors } = useApp();

  const handleRunCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    addTestLog(cmd.trim());
    sendMessage(cmd.trim());
    setCustomCmd('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[typography.headlineMd, { color: themeColors.primaryContainer }]}>
        TEST INTERFACE (DEBUG)
      </Text>
      <Text style={[typography.bodyMd, styles.subtitle, { color: themeColors.onSurfaceVariant }]}>
        Raw Command Execution & Payload Inspector
      </Text>

      {/* Preset Command Chips */}
      <View style={styles.chipContainer}>
        <Text style={[typography.labelCaps, styles.sectionHeader, { color: themeColors.onSurfaceVariant }]}>
          PRESET TEST COMMANDS
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {presetCommands.map((cmd) => (
            <TouchableOpacity
              key={cmd}
              style={[
                styles.chip,
                {
                  backgroundColor: themeColors.surfaceContainerHigh,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
              onPress={() => handleRunCommand(cmd)}
              activeOpacity={0.7}
            >
              <Text style={[typography.codeSm, { color: themeColors.primaryContainer }]}>{cmd}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Custom Command Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            typography.codeSm,
            styles.customInput,
            {
              backgroundColor: themeColors.surfaceContainerLow,
              color: themeColors.onSurface,
              borderColor: themeColors.outlineVariant,
            },
          ]}
          value={customCmd}
          onChangeText={setCustomCmd}
          placeholder="Type raw command string..."
          placeholderTextColor={themeColors.onSurfaceVariant}
          onSubmitEditing={() => handleRunCommand(customCmd)}
        />
        <TouchableOpacity
          style={[styles.runBtn, { backgroundColor: themeColors.primaryContainer }]}
          onPress={() => handleRunCommand(customCmd)}
          activeOpacity={0.8}
        >
          <Text style={[typography.labelCaps, { color: themeColors.onPrimary }]}>SEND TEST</Text>
        </TouchableOpacity>
      </View>

      {/* Console Log Area */}
      <View
        style={[
          styles.logBox,
          {
            backgroundColor: themeColors.surfaceContainerLowest,
            borderColor: themeColors.outlineVariant,
          },
        ]}
      >
        <Text style={[typography.labelCaps, styles.logHeader, { color: themeColors.secondary }]}>
          LOG OUTPUT
        </Text>
        <FlatList
          data={testLogs}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={[typography.codeSm, styles.logLine, { color: themeColors.onSurface }]}>
              {item}
            </Text>
          )}
          ListEmptyComponent={
            <Text style={[typography.codeSm, styles.emptyText, { color: themeColors.onSurfaceVariant }]}>
              No test commands sent yet. Select a preset or type a command above.
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.containerMargin,
    gap: spacing.md,
  },
  subtitle: {
    marginTop: -spacing.xs,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  chipContainer: {
    gap: spacing.xs,
  },
  chipScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: spacing.borderRadius.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  runBtn: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBox: {
    flex: 1,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  logHeader: {
    marginBottom: spacing.sm,
  },
  logLine: {
    marginBottom: spacing.xs,
  },
  emptyText: {
    opacity: 0.5,
  },
});

```

---

## `src/services/aiDirective.ts`

```typescript
export const ARIN_SYSTEM_PROMPT = `You are ARIN's on-device controller. You always reply with exactly ONE raw JSON object — no markdown fences, no prose before or after it, nothing else in the message.

Schema:
{
  "action": "respond" | "cloud" | "arduino" | "device",
  "response": string,        // required when action="respond"
  "prompt": string,          // required when action="cloud"
  "command": string,         // required when action="arduino" or "device"
  "target": string,          // required for device commands CALL, SMS, WHATSAPP, OPEN_APP: a phone number or a contact/app name exactly as the user said it
  "message": string,         // required for device commands SMS, WHATSAPP: the exact text to send
  "reason": string           // optional, one short phrase
}

Deciding "respond" vs "cloud":
Silently ask yourself: "Could the correct answer to this be different depending on what moment in time it is, or does it depend on something happening in the outside world right now?" This covers prices, exchange rates, scores, weather, news, schedules, current officeholders, stock values, "latest" or "current" anything, or any fact that changes day to day. If yes → action="cloud". If the answer is fixed regardless of when it's asked (definitions, math, how-to, code, translation, general knowledge, conversation, explanations, creative writing) → action="respond". Judge this from the meaning of the request, not by matching trigger words.

You do not have live internet access directly — but action="cloud" IS your mechanism for getting current information, not a limitation you lack a workaround for. Never say or imply "I don't have internet access," "I can't check real-time data," or similar — always emit action="cloud" instead of disclaiming.

action="arduino": use when the user asks the physical ROBOT BODY to move or its onboard hardware to act. "command" must be exactly one of: MOVE_FORWARD, MOVE_BACKWARD, TURN_LEFT, TURN_RIGHT, STOP, LED_ON, LED_OFF, BUZZER_PING.

action="device": use when the user wants the ANDROID PHONE itself (not the robot body) to do something — flashlight, camera, calling, texting, or opening an app. "command" must be exactly one of:
- TORCH_ON, TORCH_OFF — phone flashlight
- CAMERA_OPEN — open the camera
- CALL — dial "target" (a phone number or saved contact name)
- SMS — send "message" as a text to "target" (a phone number)
- WHATSAPP — send "message" to "target" (a phone number or contact name) via WhatsApp
- OPEN_APP — open the app named in "target"

Rules for device commands:
- Never put a phone number or name inside "message" — it goes in "target".
- "message" must be the exact words the user wants sent, nothing added or paraphrased.
- If the user names a person instead of a number (e.g. "call Jay", "message Jay via whatsapp"), put the person's name as "target" exactly as given — the app resolves it to a contact.
- If the destination app for a text isn't stated, assume plain SMS. Only use WHATSAPP when the user says "whatsapp" (or clearly names the app).
- Distinguish TORCH (phone's own flashlight) from arduino's LED_ON/LED_OFF (robot's onboard LED) — "turn on the flash/torch/light on the phone" is device TORCH_ON; "turn on the robot's LED" is arduino LED_ON.

Never combine actions. Never invent fields. Never wrap the JSON in backticks or code fences. Never add commentary before or after it.

Examples:

"Turn on the flash" → {"action":"device","command":"TORCH_ON"}
"Open the camera" → {"action":"device","command":"CAMERA_OPEN"}
"Call 1345" → {"action":"device","command":"CALL","target":"1345"}
"Message 2343 hi" → {"action":"device","command":"SMS","target":"2343","message":"hi"}
"Send hi to 24553" → {"action":"device","command":"SMS","target":"24553","message":"hi"}
"Send hi to Jay via whatsapp" → {"action":"device","command":"WHATSAPP","target":"Jay","message":"hi"}
"Open Spotify" → {"action":"device","command":"OPEN_APP","target":"Spotify"}
"What's today's gold rate?" → {"action":"cloud","prompt":"What is today's gold rate?"}
"What's the capital of France?" → {"action":"respond","response":"The capital of France is Paris."}
"Move forward" → {"action":"arduino","command":"MOVE_FORWARD"}`;

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
] as const;

export type DeviceCommand = (typeof DEVICE_COMMANDS)[number];

export type AiDirective =
  | { action: 'respond'; response: string; reason?: string }
  | { action: 'cloud'; prompt: string; reason?: string }
  | { action: 'arduino'; command: ArduinoCommand; reason?: string }
  | {
      action: 'device';
      command: DeviceCommand;
      target?: string;
      message?: string;
      reason?: string;
    };

/**
 * Extract and validate the JSON directive from a raw local-AI completion.
 * Tolerates surrounding whitespace or accidental markdown fences from small models.
 * Falls back to a plain "respond" directive if parsing/validation fails, so a
 * malformed reply never gets silently dropped.
 */
export function parseAiDirective(raw: string): AiDirective {
  const fallback = (text: string): AiDirective => ({
    action: 'respond',
    response: text.trim() || '[ERR] Empty response from local AI.',
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

  if (obj.action === 'respond' && typeof obj.response === 'string') {
    return { action: 'respond', response: obj.response, reason: asOptString(obj.reason) };
  }

  if (obj.action === 'cloud' && typeof obj.prompt === 'string' && obj.prompt.trim()) {
    return { action: 'cloud', prompt: obj.prompt, reason: asOptString(obj.reason) };
  }

  if (
    obj.action === 'arduino' &&
    typeof obj.command === 'string' &&
    (ARDUINO_COMMANDS as readonly string[]).includes(obj.command)
  ) {
    return {
      action: 'arduino',
      command: obj.command as ArduinoCommand,
      reason: asOptString(obj.reason),
    };
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

  // Recognized shape but failed validation — surface as text rather than silently dropping.
  return fallback(raw);
}

function asOptString(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined;
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

/**
 * Send a single command token to the Arduino over the active transport.
 * TODO: wire to the real USB-serial/BLE link once that transport lands —
 * this stub only reports whether a link is currently marked connected.
 */
export async function sendArduinoCommand(
  command: ArduinoCommand,
  isConnected: boolean
): Promise<ArduinoCommandResult> {
  if (!isConnected) {
    return { success: false, message: 'Arduino not connected.' };
  }

  // Placeholder until the real transport (USB serial / BLE) is implemented.
  return { success: true, message: `Sent ${command} to Arduino.` };
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
import { Linking } from 'react-native';
import { DeviceCommand } from './aiDirective';

export interface DeviceCommandResult {
  success: boolean;
  message: string;
}

/**
 * Execute a single phone-native command via Android intents/deep links.
 *
 * Reality notes:
 * - CALL / SMS need CALL_PHONE / SEND_SMS permissions on the native side to fire
 *   silently; without them Android will show its own confirmation UI.
 * - WHATSAPP has no fully-silent API — we deep-link into wa.me with the message
 *   pre-filled and let the user tap Send. This is expected behavior.
 * - CAMERA_OPEN / OPEN_APP open an external screen by design.
 */
export async function sendDeviceCommand(
  command: DeviceCommand,
  target?: string,
  message?: string,
  permissionMode?: 'full_control' | 'compatible'
): Promise<DeviceCommandResult> {
  const confirm = permissionMode !== 'full_control';

  switch (command) {
    case 'TORCH_ON':
    case 'TORCH_OFF': {
      const state = command === 'TORCH_ON' ? 'on' : 'off';
      // TODO: wire to the native CameraManager.setTorchMode module once added.
      return {
        success: true,
        message: `Phone flashlight turned ${state}${confirm ? ' (requires native torch module)' : ''}.`,
      };
    }

    case 'CAMERA_OPEN': {
      try {
        await Linking.openURL('content://media/external/images/media');
        return { success: true, message: 'Opened camera/media viewer.' };
      } catch {
        return { success: false, message: 'Failed to open camera.' };
      }
    }

    case 'CALL': {
      if (!target) {
        return { success: false, message: 'No target specified for CALL.' };
      }
      try {
        await Linking.openURL(`tel:${encodeURIComponent(target)}`);
        return { success: true, message: `Dialing ${target}...` };
      } catch {
        return { success: false, message: `Failed to dial ${target}.` };
      }
    }

    case 'SMS': {
      if (!target) {
        return { success: false, message: 'No target specified for SMS.' };
      }
      try {
        const body = encodeURIComponent(message ?? '');
        await Linking.openURL(`sms:${encodeURIComponent(target)}?body=${body}`);
        return { success: true, message: `Prepared SMS to ${target}${message ? `: "${message}"` : ''}.` };
      } catch {
        return { success: false, message: `Failed to open SMS composer for ${target}.` };
      }
    }

    case 'WHATSAPP': {
      if (!target) {
        return { success: false, message: 'No target specified for WHATSAPP.' };
      }
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
      // TODO: resolve friendly app names to package deep links (e.g. spotify:, camera:).
      return {
        success: true,
        message: `Opening app "${target}"${confirm ? ' (requires confirm)' : ''}.`,
      };
    }

    default:
      return { success: false, message: `Unknown device command: ${command}` };
  }
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
  const timeoutMs = options.timeoutMs ?? 30000;

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
          max_tokens: options.maxTokens ?? 2048,
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
          num_predict: options.maxTokens ?? 2048,
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
}

```

---

