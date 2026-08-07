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
