export interface CommitteePortalConfig {
  enabled: boolean;
  deadline: string | null;
  adminEmail: string;
  adminPassword: string;
  committeePassword: string;
}

export interface CommitteeSubmission {
  id: string;
  name: string;
  role: string;
  session: string;
  phone: string;
  bloodGroup: string;
  photoUrl: string | null;
  bio: string;
  createdAt: string;
}

export const DEFAULT_COMMITTEE_CONFIG: CommitteePortalConfig = {
  enabled: true,
  deadline: null,
  adminEmail: 'admin@svs.org',
  adminPassword: 'admin123',
  committeePassword: 'committee2024',
};

const CONFIG_KEY = 'svs-committee-portal-config';
const SUBMISSIONS_KEY = 'svs-committee-submissions';
const EVENT_NAME = 'svs-committee-portal-updated';

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function notify(): void {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function getCommitteeConfig(): CommitteePortalConfig {
  return { ...DEFAULT_COMMITTEE_CONFIG, ...read<Partial<CommitteePortalConfig>>(CONFIG_KEY, {}) };
}

export function saveCommitteeConfig(config: CommitteePortalConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  notify();
}

export function getCommitteeSubmissions(): CommitteeSubmission[] {
  return read<CommitteeSubmission[]>(SUBMISSIONS_KEY, []);
}

export function addCommitteeSubmission(submission: Omit<CommitteeSubmission, 'id' | 'createdAt'>): CommitteeSubmission {
  const created: CommitteeSubmission = { ...submission, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([created, ...getCommitteeSubmissions()]));
  notify();
  return created;
}

export function deleteCommitteeSubmission(id: string): void {
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(getCommitteeSubmissions().filter((item) => item.id !== id)));
  notify();
}

export function subscribeToCommitteePortal(listener: () => void): () => void {
  window.addEventListener(EVENT_NAME, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT_NAME, listener);
    window.removeEventListener('storage', listener);
  };
}

export function isCommitteePortalOpen(config: CommitteePortalConfig): boolean {
  return config.enabled && (!config.deadline || new Date(config.deadline).getTime() >= Date.now());
}
