export const DEPARTMENTS = [
  'Department of Bangla',
  'Department of English',
  'Department of Philosophy',
  'Department of History',
  'Department of Economics',
  'Department of Sociology',
  'Department of Political Science',
  'Department of Law',
  'Department of Accounting',
  'Department of Geography',
  'Department of Mathematics',
  'Department of Islamic History',
  'Department of Computer Science and Engineering',
  'Department of Statistics',
  'Department of Management',
  'Department of Chemistry',
  'Department of Physics',
  'Department of Botany',
  'Department of Zoology',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export const COMMITTEE_DESIGNATIONS = [
  'President',
  'Vice President',
  'General Secretary',
  'Assistant General Secretary',
  'Treasurer',
  'Cultural Secretary',
  'Religious Affairs Secretary',
  'Executive Member',
];

export const EVENT_CATEGORIES = ['Puja', 'Cultural Program', 'Social Work'];

export const GALLERY_CATEGORIES = ['Pujas', 'Cultural Programs', 'Social Work'] as const;

export const NOTICE_TYPES = ['Notice', 'Constitution', 'Study Resource'] as const;

export const FESTIVAL_CATEGORIES = ['All', 'Pujas', 'Vratas/Broto', 'Cultural & Harmony'];

export const heroImage =
  'https://images.pexels.com/photos/35698236/pexels-photo-35698236.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600';

export const diyaImage =
  'https://images.pexels.com/photos/10182772/pexels-photo-10182772.jpeg?auto=compress&cs=tinysrgb&h=700&w=1200';

export const aboutImages = [
  'https://images.pexels.com/photos/8887006/pexels-photo-8887006.jpeg?auto=compress&cs=tinysrgb&h=600&w=800',
  'https://images.pexels.com/photos/32285696/pexels-photo-32285696.jpeg?auto=compress&cs=tinysrgb&h=600&w=800',
  'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&h=600&w=800',
];

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Festivals', href: '#festivals' },
  { label: 'Committee', href: '#committee' },
  { label: 'Directory', href: '#directory' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Books', href: '#books' },
  { label: 'Notices', href: '#notice' },
];

export const PAGE = {
  HOME: '',
  ADMIN: 'admin',
  JOIN_COMMITTEE: 'join-committee',
} as const;
