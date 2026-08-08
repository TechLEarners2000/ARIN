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