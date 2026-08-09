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
