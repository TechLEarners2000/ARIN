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
