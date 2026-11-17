import { Droplet, Facebook, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Avatar from '@/components/ui/Avatar';

interface ProfileData {
  name: string;
  designation?: string;
  academic_designation?: string;
  department: string;
  batch?: string | null;
  blood_group?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  permanent_address?: string | null;
  photo_url?: string | null;
  facebook_url?: string | null;
  university?: string | null;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  member: ProfileData | null;
}

export default function ProfileModal({ open, onClose, member }: ProfileModalProps) {
  if (!member) return null;

  return (
    <Modal open={open} onClose={onClose} label={`${member.name} — Profile`} size="lg">
      <div className="grid gap-0 sm:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center bg-navy-gradient p-6 text-center">
          <Avatar
            src={member.photo_url}
            name={member.name}
            className="h-32 w-32 ring-4 ring-saffron-400/40"
          />
          <h3 className="mt-4 font-display text-lg font-bold text-white">
            {member.name}
          </h3>
          {member.designation && (
            <p className="text-sm font-semibold text-saffron-300">
              {member.designation}
            </p>
          )}
          {member.academic_designation && (
            <p className="text-sm font-semibold text-saffron-300">
              {member.academic_designation}
            </p>
          )}
          {member.blood_group && (
            <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-300">
              <Droplet size={12} /> {member.blood_group}
            </span>
          )}
        </div>

        <div className="p-6">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-saffron-600">
            Details
          </h4>
          <dl className="space-y-3 text-sm">
            {member.university && (
              <div>
                <dt className="font-medium text-navy-500">University</dt>
                <dd className="text-navy-900">{member.university}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-navy-500">Department</dt>
              <dd className="text-navy-900">{member.department}</dd>
            </div>
            {member.batch && (
              <div>
                <dt className="font-medium text-navy-500">Batch / Session</dt>
                <dd className="text-navy-900">{member.batch}</dd>
              </div>
            )}
            {member.permanent_address && (
              <div>
                <dt className="flex items-center gap-1.5 font-medium text-navy-500">
                  <MapPin size={14} /> Address
                </dt>
                <dd className="text-navy-900">{member.permanent_address}</dd>
              </div>
            )}
          </dl>

          <h4 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-saffron-600">
            Contact
          </h4>
          <div className="flex flex-wrap gap-2">
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-2 text-xs font-semibold text-navy-700 transition hover:bg-navy-100"
              >
                <Phone size={14} /> Call
              </a>
            )}
            {member.whatsapp && (
              <a
                href={`https://wa.me/${member.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-2 text-xs font-semibold text-green-600 transition hover:bg-green-100"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                <Mail size={14} /> Email
              </a>
            )}
            {member.facebook_url && (
              <a
                href={member.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <Facebook size={14} /> Facebook
              </a>
            )}
          </div>

          {!member.phone && !member.whatsapp && !member.email && !member.facebook_url && (
            <p className="text-sm text-navy-400">No contact information available.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
