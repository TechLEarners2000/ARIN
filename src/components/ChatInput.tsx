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
