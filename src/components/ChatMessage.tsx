import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ChatMessageItem } from '../types';

interface ChatMessageProps {
  message: ChatMessageItem;
}

function formatDisplayText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/gi, '').replace(/```$/g, '').trim();
  }
  return cleaned;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { themeColors } = useApp();

  if (message.sender === 'SYSTEM') {
    return (
      <View style={styles.systemContainer}>
        <Text style={[typography.codeSm, styles.systemText, { color: themeColors.onSurfaceVariant }]}>
          {formatDisplayText(message.text)}
        </Text>
      </View>
    );
  }

  if (message.sender === 'ERROR') {
    return (
      <View style={[styles.errorContainer, { backgroundColor: themeColors.errorContainer, borderColor: themeColors.error }]}>
        <Text style={[typography.codeSm, { color: themeColors.error }]}>
          {formatDisplayText(message.text)}
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
          {formatDisplayText(message.text)}
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
