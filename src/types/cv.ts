export interface ContactItem {
  id: string;
  label: string;
  url: string;
  type: 'location' | 'phone' | 'email' | 'website' | 'linkedin' | 'github' | 'custom';
  icon?: string;
}

export interface SkillRow {
  id: string;
  category: string;
  competencies: string;
}

export interface ExperienceBullet {
  id: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  date: string;
  location: string;
  bullets: ExperienceBullet[];
  forcePageBreak?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  url: string;
  technologies: string;
  description: string;
  forcePageBreak?: boolean;
}

export interface EducationData {
  degree: string;
  school: string;
  year: string;
  location: string;
  modules: string;
}

export interface CustomSection {
  id: string;
  title: string;
  type: 'bullets' | 'paragraph' | 'references';
  content: string[];
  forcePageBreak?: boolean;
}

export interface CVData {
  name: string;
  title: string;
  contacts: ContactItem[];
  summary: string;
  skills: SkillRow[];
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationData;
  certifications: string[];
  languages: string;
  strengths: string;
  customSections: CustomSection[];
}

export type PhotoPosition = 'right' | 'left' | 'center' | 'hide';
export type BodyColumns = '1col' | '2col-left' | '2col-right';
export type SectionHeadingStyle = 'accent-bar' | 'line' | 'pill' | 'solid' | 'double';
export type SkillsMode = 'table' | 'pills' | 'grid' | 'bars' | 'dots';
export type BulletStyle = 'bullet-disc' | 'bullet-square' | 'bullet-arrow' | 'bullet-check' | 'bullet-dash';
export type CVSectionId = 'summary' | 'skills' | 'experience' | 'projects' | 'credentials';
export type CVTemplateKey =
  | 'bd-corporate'
  | 'strict-ats'
  | 'original-master'
  | 'modern-split'
  | 'two-col-sidebar'
  | 'data-boxed'
  | 'compact-onepage'
  | 'dark-header'
  | 'exec-ats'
  | 'exec-sidebar'
  | 'swiss-grid'
  | 'tech-mono'
  | 'nordic-emerald'
  | 'royal-indigo'
  | 'elite-crimson'
  | 'wallstreet-ats';

export interface QRCodeSettings {
  enabled: boolean;
  url: string;
  position: 'header' | 'footer';
  size: number;
  label: string;
}

export interface SignatureSettings {
  enabled: boolean;
  image: string; // base64 or empty
  name: string;
  date: string;
  showDeclaration: boolean;
  declarationText: string;
}

export interface CVProfile {
  id: string;
  name: string;
  rolePreset: 'master' | 'data' | 'sqa' | 'netops' | 'custom';
  description: string;
  data: CVData;
  settings: StudioSettings;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  profileName: string;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Technical Test' | 'Offer' | 'Rejected';
  url?: string;
  notes?: string;
}

export interface PortfolioMetricItem {
  id: string;
  value: string;
  label: string;
}

export type PortfolioAccentTheme = 'auto' | 'cobalt' | 'emerald' | 'teal' | 'indigo' | 'rose';
export type PortfolioDesignStyle = 'bento' | 'editorial' | 'blueprint';

export type WebsiteSectionKey =
  | 'metrics'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'highlights'
  | 'contact';

export interface WebsiteProjectEnhancement {
  imageUrl?: string;
  galleryUrls?: string[];
  problem?: string;
  solution?: string;
  impact?: string;
  architectureSteps?: string[];
  deliverables?: string;
  beforeAfterImpact?: {
    beforeLabel: string;
    beforeValue: string;
    afterLabel: string;
    afterValue: string;
  };
  technicalSnippet?: {
    label: string;
    language: string;
    code: string;
  };
  embedMediaUrl?: string; // Power BI embed, YouTube demo, or live interactive preview
  liveDemoLabel?: string;
}

export interface PublicInquiry {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  targetRole?: string;
  createdAt: string;
  isRead?: boolean;
}

export interface PortfolioAnalyticsSummary {
  totalViews: number;
  pdfDownloads: number;
  roleClicks: Record<string, number>;
  lastVisitedAt?: string;
}

export interface WebsiteSpecializationCard {
  id: string;
  label: string;
  proof: string;
  metric: string;
}

export type WebsiteEditorTab =
  | 'hero'
  | 'metrics'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'credentials'
  | 'visibility';

export const DEFAULT_SPECIALIZATION_CARDS: WebsiteSpecializationCard[] = [
  {
    id: 'spec_data',
    label: 'Data & Power BI',
    proof: 'PostgreSQL · Star Schema · Automated ETL · 50,000+ Records',
    metric: '50,000+ Rows',
  },
  {
    id: 'spec_sqa',
    label: 'Software QA & API',
    proof: 'Postman CRUD · BVA/ECP · 80+ Test Cases · Jira Triage',
    metric: '80+ Cases',
  },
  {
    id: 'spec_netops',
    label: 'Enterprise IT',
    proof: 'Windows Server · Linux · ERP RBAC · 100+ Users Supported',
    metric: '100+ Users',
  },
];

export interface WebsiteContentOverrides {
  name?: string;
  title?: string;
  summary?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  kaggle?: string;
  leetcode?: string;
  hackerrank?: string;
  devto?: string;
  heroPhotoSrc?: string;
  skillsIntro?: string;
  skills?: SkillRow[];
  experienceIntro?: string;
  experiences?: ExperienceItem[];
  projectsIntro?: string;
  projects?: ProjectItem[];
  projectEnhancements?: Record<string, WebsiteProjectEnhancement>;
  hiddenSections?: WebsiteSectionKey[];
  education?: EducationData;
  certifications?: string[];
  languages?: string;
  strengths?: string;
  customSections?: CustomSection[];
  contactHeading?: string;
  contactSubtext?: string;
  specializations?: WebsiteSpecializationCard[];
}

export interface PortfolioSettings {
  availabilityText: string;
  availabilityActive: boolean;
  showSectionNumbers?: boolean;
  accentTheme?: PortfolioAccentTheme;
  designStyle?: PortfolioDesignStyle;
  metrics: PortfolioMetricItem[];
  websiteOverrides?: WebsiteContentOverrides;
}

export interface CustomTemplatePreset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  settingsSnapshot: Partial<StudioSettings>;
}

export interface StudioSettings {
  template: CVTemplateKey;
  customTemplateId?: string;
  photoPosition: PhotoPosition;
  headerStyle: 'right' | 'left' | 'center' | 'dark-banner' | 'hide';
  headerAlign?: 'auto' | 'left' | 'center' | 'right' | 'split';
  nameAlign?: 'auto' | 'left' | 'center' | 'right';
  contactAlign?: 'auto' | 'left' | 'center' | 'right';
  headerLayout?: 'stacked' | 'split';
  showHeader?: boolean;
  showHeaderDivider?: boolean;
  showTitle?: boolean;
  showContacts?: boolean;
  showContactIcons?: boolean;
  contactSeparator?: 'none' | 'dot' | 'pipe' | 'slash';
  showTimelineRail?: boolean;
  projectLayout?: 'cards' | 'compact-grid';
  bodyColumns: BodyColumns;
  sectionHeading: SectionHeadingStyle;
  skillsMode: SkillsMode;
  bulletStyle: BulletStyle;
  themePrimary: string;
  themeLight: string;
  themeBorder: string;
  cvTextColor?: string;
  cvPaperBg?: string;
  sidebarBg?: string;
  sidebarTextColor?: string;
  cvFont: string;
  fontSize: number;
  lineHeight: number;
  sectionGap: number;
  pagePadding: number;
  photoShape: string;
  photoSize: number;
  photoScale: number;
  photoPosX: number;
  photoPosY: number;
  photoSrc: string;
  pageSplitView: boolean;
  isEditMode: boolean;
  zoomLevel: number;
  portfolioMode: boolean;
  qrCode: QRCodeSettings;
  signature: SignatureSettings;
  sectionOrder?: CVSectionId[];
  hiddenSections?: CVSectionId[];
  sidebarWidthPercent?: number;
  sidebarSections?: CVSectionId[];
  sectionTitles?: Partial<Record<CVSectionId | 'certifications' | 'languages', string>>;
  showFooter?: boolean;
  footerNote?: string;
  footerRightText?: string;
  showFooterPageNum?: boolean;
  hideBrowserPrintChrome?: boolean;
  portfolio?: PortfolioSettings;
}


