import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiDirective } from './aiDirective';

const SCHEDULED_JOBS_KEY = '@arin_scheduled_jobs';

export interface ScheduledJob {
  id: string;
  fireAtIso: string;
  directive: AiDirective;
  createdAtIso: string;
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

async function readJobs(): Promise<ScheduledJob[]> {
  try {
    const raw = await AsyncStorage.getItem(SCHEDULED_JOBS_KEY);
    return raw ? (JSON.parse(raw) as ScheduledJob[]) : [];
  } catch {
    return [];
  }
}

async function writeJobs(jobs: ScheduledJob[]): Promise<void> {
  await AsyncStorage.setItem(SCHEDULED_JOBS_KEY, JSON.stringify(jobs));
}

/**
 * Persist a job and arm an in-memory timer for it. If fireAtIso is already in
 * the past (e.g. clock skew, or the user said "in 5 seconds"), it fires almost
 * immediately rather than being dropped.
 */
export async function scheduleJob(
  directive: AiDirective,
  fireAtIso: string,
  onFire: (directive: AiDirective) => void
): Promise<ScheduledJob> {
  const job: ScheduledJob = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fireAtIso,
    directive,
    createdAtIso: new Date().toISOString(),
  };
  const jobs = await readJobs();
  jobs.push(job);
  await writeJobs(jobs);
  armTimer(job, onFire);
  return job;
}

function armTimer(job: ScheduledJob, onFire: (directive: AiDirective) => void) {
  const delayMs = Math.max(0, new Date(job.fireAtIso).getTime() - Date.now());
  const handle = setTimeout(async () => {
    timers.delete(job.id);
    await removeJob(job.id);
    onFire(job.directive);
  }, delayMs);
  timers.set(job.id, handle);
}

async function removeJob(id: string): Promise<void> {
  const jobs = await readJobs();
  await writeJobs(jobs.filter((j) => j.id !== id));
}

/**
 * Call once at app startup (e.g. in AppProvider's mount effect). Re-arms any
 * jobs that are still in the future, and immediately fires any that were due
 * while the app was closed.
 */
export async function rearmPersistedJobs(onFire: (directive: AiDirective) => void): Promise<void> {
  const jobs = await readJobs();
  for (const job of jobs) {
    if (new Date(job.fireAtIso).getTime() <= Date.now()) {
      await removeJob(job.id);
      onFire(job.directive);
    } else {
      armTimer(job, onFire);
    }
  }
}

export async function listPendingJobs(): Promise<ScheduledJob[]> {
  return readJobs();
}

export async function cancelJob(id: string): Promise<void> {
  const handle = timers.get(id);
  if (handle) {
    clearTimeout(handle);
    timers.delete(id);
  }
  await removeJob(id);
}
