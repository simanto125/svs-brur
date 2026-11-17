export interface EmblemContent {
  badge: string;
  meta: string;
  heading: string;
  paragraphOne: string;
  paragraphTwo: string;
  paragraphThree: string;
}

export const DEFAULT_EMBLEM_CONTENT: EmblemContent = {
  badge: 'The Emblem',
  meta: 'BRUR Branch · Est. 2007',
  heading: 'Meaning & History',
  paragraphOne: 'The SVS emblem bears the image of Maa Saraswati — the Hindu goddess of wisdom, music, arts, and learning — seated on a lotus with her veena. The lotus symbolizes purity rising above worldly attachments, while the veena represents the harmony of knowledge and devotion.',
  paragraphTwo: 'Founded in 2007 at Begum Rokeya University, Rangpur, the Saraswata Vandana Samity was created by students seeking a spiritual home on campus — a place to honour the goddess of wisdom, preserve cultural heritage, and serve the community with compassion.',
  paragraphThree: 'The saffron-gold rays encircling the emblem signify the light of knowledge spreading outward, illuminating every student who joins the SVS family.',
};

const STORAGE_KEY = 'svs-emblem-content';
const CONTENT_EVENT = 'svs-emblem-content-updated';

export function getEmblemContent(): EmblemContent {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_EMBLEM_CONTENT;
    const parsed: Partial<EmblemContent> = JSON.parse(stored);
    return { ...DEFAULT_EMBLEM_CONTENT, ...parsed };
  } catch {
    return DEFAULT_EMBLEM_CONTENT;
  }
}

export function saveEmblemContent(content: EmblemContent): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent(CONTENT_EVENT));
}

export function subscribeToEmblemContent(listener: () => void): () => void {
  const handleUpdate = () => listener();
  window.addEventListener(CONTENT_EVENT, handleUpdate);
  window.addEventListener('storage', handleUpdate);
  return () => {
    window.removeEventListener(CONTENT_EVENT, handleUpdate);
    window.removeEventListener('storage', handleUpdate);
  };
}
