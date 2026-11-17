import Modal from '@/components/ui/Modal';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  url: string | null;
  title?: string;
}

export default function VideoModal({ open, onClose, url, title }: VideoModalProps) {
  if (!url) return null;
  return (
    <Modal open={open} onClose={onClose} label={title ?? 'Video'} size="xl">
      <div className="aspect-video w-full overflow-hidden rounded-b-3xl bg-navy-950">
        <iframe
          src={url}
          title={title ?? 'Embedded video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    </Modal>
  );
}
