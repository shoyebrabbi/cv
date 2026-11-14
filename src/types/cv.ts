export interface ContactItem {
  id: string;
  label: string;
  url: string;
  type: 'location' | 'phone' | 'email' | 'website' | 'linkedin' | 'github' | 'custom';
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
export type SkillsMode = 'table' | 'pills' | 'grid' | 'bars';
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
  | 'tech-mono';

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

export interface PortfolioSettings {
  availabilityText: string;
  availabilityActive: boolean;
  showSectionNumbers?: boolean;
  accentTheme?: PortfolioAccentTheme;
  metrics: PortfolioMetricItem[];
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
  headerAlign?: 'auto' | 'left' | 'center';
  showHeader?: boolean;
  showHeaderDivider?: boolean;
  showTitle?: boolean;
  showContacts?: boolean;
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


