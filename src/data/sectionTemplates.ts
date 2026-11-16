export interface SectionTemplate {
  id: string;
  title: string;
  badge: string;
  iconName: string;
  description: string;
  type: 'bullets' | 'paragraph' | 'references';
  content: string[];
}

export const PREBUILT_SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'sec_tpl_awards',
    title: 'AWARDS & HONORS',
    badge: 'Popular',
    iconName: 'Award',
    description: 'Academic honors, hackathons, and corporate recognition awards',
    type: 'bullets',
    content: [
      '<strong>Dean\'s Honor Roll (2022):</strong> Awarded for outstanding academic excellence and sustaining top-tier GPA performance.',
      '<strong>National Data Analytics Hackathon Finalist (2023):</strong> Built an automated predictive churn pipeline, ranking in Top 5 out of 120+ teams.',
      '<strong>Employee of the Quarter:</strong> Recognized for zero-downtime execution of enterprise database and ERP migration.',
    ],
  },
  {
    id: 'sec_tpl_publications',
    title: 'PUBLICATIONS & RESEARCH',
    badge: 'Academic',
    iconName: 'BookOpen',
    description: 'Peer-reviewed conference papers, journal articles, and technical research',
    type: 'bullets',
    content: [
      '<strong>IEEE Conference Paper:</strong> "Optimized Star Schema Modeling for Scalable High-Throughput Business Intelligence", IEEE Xplore, 2023.',
      '<strong>Technical Research:</strong> "Automated REST API Verification Frameworks using Postman and CI/CD Integrations", Global Tech Journal, 2024.',
    ],
  },
  {
    id: 'sec_tpl_volunteering',
    title: 'VOLUNTEERING & LEADERSHIP',
    badge: 'Community',
    iconName: 'HeartHandshake',
    description: 'Community initiatives, developer workshops, and social leadership',
    type: 'bullets',
    content: [
      '<strong>Lead Organizer, Tech Community Workshops:</strong> Facilitated 6 practical hands-on workshops on SQL, Power BI, and Software QA for 250+ aspiring engineers.',
      '<strong>Volunteer STEM Mentor:</strong> Mentored underprivileged youths in introductory programming logic, Git workflows, and digital literacy.',
    ],
  },
  {
    id: 'sec_tpl_references',
    title: 'PROFESSIONAL REFERENCES',
    badge: 'Standard 2-Col',
    iconName: 'Users',
    description: '2 professionally formatted reference cards with contact & affiliation',
    type: 'references',
    content: [
      '<strong>Dr. Md. Rafiqul Islam:</strong> Professor & Head, Dept. of CSE, Premier University | Email: rafiqul@example.edu.bd | Phone: +880 1711-XXXXXX',
      '<strong>Tanvir Ahmed:</strong> VP of Engineering, Enterprise Tech Solutions | Email: tanvir.ahmed@example.com | Phone: +880 1819-XXXXXX',
    ],
  },
  {
    id: 'sec_tpl_languages',
    title: 'LANGUAGE PROFICIENCY',
    badge: 'Global CEFR',
    iconName: 'Globe',
    description: 'Language fluency benchmarks (CEFR C1/C2 / Native bilingual)',
    type: 'bullets',
    content: [
      '<strong>English:</strong> Full Professional Proficiency (CEFR C1) · Fluent in technical documentation, client presentations, and business negotiations.',
      '<strong>Bengali:</strong> Native / Bilingual Proficiency · Native speaker with excellent written and verbal business communication.',
    ],
  },
  {
    id: 'sec_tpl_achievements',
    title: 'KEY ACHIEVEMENTS & MILESTONES',
    badge: 'High Impact',
    iconName: 'Sparkles',
    description: 'Quantified metrics and career milestones highlighted separately',
    type: 'bullets',
    content: [
      '<strong>50,000+ Records Automated:</strong> Built automated ETL pipelines eliminating 12+ weekly hours of manual reporting overhead.',
      '<strong>80+ Test Case Suite:</strong> Achieved 100% boundary testing coverage on core payment APIs with zero critical production bugs.',
      '<strong>100+ Enterprise Workstations:</strong> Successfully deployed centralized Active Directory and patch management policies.',
    ],
  },
];
