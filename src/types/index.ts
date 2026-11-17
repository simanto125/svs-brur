export interface Member {
  id: string;
  name: string;
  department: string;
  batch: string;
  blood_group: string | null;
  phone: string | null;
  whatsapp: string | null;
  permanent_address: string | null;
  photo_url: string | null;
  facebook_url: string | null;
  role: 'Current Member' | 'Alumni';
  created_at: string;
}

export interface PendingMember {
  id: string;
  name: string;
  department: string;
  batch: string;
  blood_group: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  permanent_address: string | null;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  university: string | null;
  department: string;
  batch: string;
  phone: string | null;
  blood_group: string | null;
  photo_url: string | null;
  highlight: boolean;
  facebook_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface PendingCommittee {
  id: string;
  name: string;
  designation: string;
  department: string;
  batch: string;
  phone: string | null;
  blood_group: string | null;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Advisor {
  id: string;
  name: string;
  academic_designation: string;
  department: string;
  photo_url: string | null;
  blessing: string | null;
  facebook_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string | null;
  status: 'upcoming' | 'past';
  category: string;
  image_url: string | null;
  video_url: string | null;
  report_url: string | null;
  created_at: string;
}

export interface Festival {
  id: string;
  bangla_title: string;
  english_title: string;
  category: 'Pujas' | 'Vratas/Broto' | 'Cultural & Harmony';
  description: string;
  significance: string;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  title: string | null;
  image_url: string;
  category: 'Pujas' | 'Cultural Programs' | 'Social Work';
  sort_order: number;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  type: 'Notice' | 'Constitution' | 'Study Resource';
  description: string | null;
  file_url: string | null;
  file_size: string | null;
  download_count: number;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  pdf_url: string;
  status: 'pending' | 'approved';
  submitted_by: string | null;
  download_count: number;
  created_at: string;
}

export interface PastCommitteeMember {
  id: string;
  year: string;
  name: string;
  designation: string;
  department: string;
  batch: string | null;
  photo_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Settings {
  committee_window_open: boolean;
  admin_passkey: string;
  committee_passcode: string;
}
