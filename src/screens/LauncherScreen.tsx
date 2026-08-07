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
