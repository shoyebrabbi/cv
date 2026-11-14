import { CVData, StudioSettings } from '../types/cv';

export const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,` + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" width="240" height="280">
    <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f8fafc"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="suitGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f2942"/>
            <stop offset="100%" stop-color="#1e3a5f"/>
        </linearGradient>
    </defs>
    <rect width="240" height="280" fill="url(#bgGrad)"/>
    <path d="M20,280 C20,210 65,195 120,195 C175,195 220,210 220,280 Z" fill="url(#suitGrad)"/>
    <polygon points="90,195 120,255 150,195" fill="#ffffff"/>
    <polygon points="75,195 120,260 95,280 55,220" fill="#0a1d30"/>
    <polygon points="165,195 120,260 145,280 185,220" fill="#0a1d30"/>
    <rect x="98" y="155" width="44" height="48" rx="14" fill="#d99b78"/>
    <ellipse cx="120" cy="112" rx="46" ry="56" fill="#e5aa87"/>
    <path d="M74,105 C72,62 92,46 125,46 C155,46 168,65 166,105 C162,78 148,66 120,66 C92,66 80,78 74,105 Z" fill="#1e293b"/>
    <path d="M76,120 C78,152 96,168 120,168 C144,168 162,152 164,120 C159,138 146,154 120,154 C94,154 81,138 76,120 Z" fill="#1e293b" opacity="0.9"/>
    <path d="M102,136 Q120,130 138,136 Q120,141 102,136 Z" fill="#1e293b"/>
    <circle cx="102" cy="106" r="4.2" fill="#1e293b"/>
    <circle cx="138" cy="106" r="4.2" fill="#1e293b"/>
    <path d="M92,96 Q102,92 111,96" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M129,96 Q138,92 148,96" stroke="#1e293b" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M108,142 Q120,148 132,142" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>
`);

export const INITIAL_CV_DATA: CVData = {
  name: "MD SHOYEB RABBI",
  title: "DATA ANALYST | SOFTWARE QA & IT SUPPORT SPECIALIST",
  contacts: [
    {
      id: "c1",
      label: "Chattogram, Bangladesh",
      url: "https://maps.google.com/?q=Chattogram,Bangladesh",
      type: "location",
    },
    {
      id: "c2",
      label: "+8801622517200",
      url: "tel:+8801622517200",
      type: "phone",
    },
    {
      id: "c3",
      label: "shoyebrabbi@gmail.com",
      url: "mailto:shoyebrabbi@gmail.com",
      type: "email",
    },
    {
      id: "c4",
      label: "shoyebrabbi.com",
      url: "https://shoyebrabbi.com",
      type: "website",
    },
    {
      id: "c5",
      label: "LinkedIn",
      url: "https://linkedin.com/in/shoyebrabbi",
      type: "linkedin",
    },
    {
      id: "c6",
      label: "GitHub",
      url: "https://github.com/shoyebrabbi",
      type: "github",
    },
  ],
  summary:
    "Dynamic and quality-driven Computer Science graduate (B.Sc. in CSIT) with 2+ years of hands-on professional industry experience bridging Data Analytics, Software Quality Assurance (SQA), and Enterprise IT Infrastructure. Highly skilled in relational database management, advanced SQL query design, and data integrity verification alongside interactive BI reporting with Power BI and automated ETL pipelines. Proven background in functional, regression, and cross-browser testing; REST API validation using Postman; and Jira defect lifecycle tracking across Agile/SDLC workflows. Experienced in providing enterprise IT support to 100+ active internal users, assisting client ERP/SaaS workflows, and administering Windows Server and Linux systems.",
  skills: [
    {
      id: "s1",
      category: "Data & Databases",
      competencies:
        "Advanced SQL (Complex Queries, Multi-table JOINs, Subqueries, Aggregations), PostgreSQL, Power BI (Star Schema, KPI Dashboards, DAX), Power Query (ETL Pipelines & Cleansing), Advanced Excel, Python (Data Processing & EDA).",
    },
    {
      id: "s2",
      category: "Software QA & Testing",
      competencies:
        "Manual Functional Testing, Regression, Smoke, Sanity, Integration, Test Case & Scenario Authoring, Boundary Value Analysis (BVA), Equivalence Class Partitioning (ECP), Requirements Traceability Matrix (RTM).",
    },
    {
      id: "s3",
      category: "API & Automation",
      competencies:
        "Postman (REST API Validation, JSON Schema & Payload Checks, HTTP Status Codes 2xx/4xx/5xx, Auth Headers & Tokens), Cypress (Foundational UI Automation & Assertions), Chrome DevTools (Console/Network).",
    },
    {
      id: "s4",
      category: "Enterprise & IT Systems",
      competencies:
        "ERP Business Workflows (Sales, Inventory, Billing), SaaS Architecture Basics, Windows Server Administration, Linux (Shell Navigation, Permissions), MikroTik Basics, CCNA Concepts, LAN/Switch Configuration.",
    },
    {
      id: "s5",
      category: "Tools & Methodologies",
      competencies:
        "Jira Software (Bug Life Cycle, Severity/Priority Triage), Git, GitHub, VS Code, SDLC, STLC, Agile/Scrum Methodologies, Cloud Hosting & Deployment (Render, Vercel, Netlify).",
    },
  ],
  experiences: [
    {
      id: "e1",
      role: "Junior Data Analyst & IT Support Specialist",
      company: "Rich Information Technology",
      date: "March 2021 - May 2023",
      location: "Chattogram, Bangladesh",
      bullets: [
        {
          id: "b1",
          text: "<strong>Data Analytics & DB Auditing:</strong> Managed client PostgreSQL/SQL databases; constructed complex multi-table JOINs, subqueries, and aggregations to reconcile operational records with 100% data integrity and accuracy.",
        },
        {
          id: "b2",
          text: "<strong>ETL & Power BI Reporting:</strong> Designed automated ETL pipelines utilizing Power Query to extract, clean, and transform multi-source business data; built interactive Power BI and Excel dashboards tracking key business metrics.",
        },
        {
          id: "b3",
          text: "<strong>Enterprise ERP & SaaS Systems:</strong> Diagnosed discrepancies between front-end UI inputs and backend database tables for client business management modules; audited role-based access control (RBAC) and ledger sync.",
        },
        {
          id: "b4",
          text: "<strong>Quality Assurance & Bug Tracking:</strong> Executed manual functional, smoke, and regression tests across internal business tools; logged and tracked defects in Jira with step-by-step reproduction logs, screenshots, and triage tags.",
        },
        {
          id: "b5",
          text: "<strong>IT & Systems Infrastructure:</strong> Delivered daily technical support to over 100 internal enterprise users; administered Windows Server, managed user privileges, configured LAN switches, and scheduled automated backups.",
        },
      ],
      forcePageBreak: false,
    },
    {
      id: "e2",
      role: "Technical Upskilling & SQA / Data Projects",
      company: "Independent Practice",
      date: "June 2023 - Present",
      location: "Chattogram, Bangladesh",
      bullets: [
        {
          id: "b6",
          text: "Authored comprehensive web test suites, executed relational SQL data analyses, and built modular Postman REST API verification collections with automated assertions for status codes, payloads, and response latencies.",
        },
        {
          id: "b7",
          text: "Developed full-stack web and SaaS prototypes implementing role-based authentication (RBAC), relational database schemas, and modern cloud deployment workflows on Render and Vercel.",
        },
      ],
      forcePageBreak: true, // Default page break between page 1 and page 2
    },
  ],
  projects: [
    {
      id: "p1",
      title: "Enterprise Sales Performance & BI Analysis",
      url: "https://github.com/shoyebrabbi",
      technologies: "SQL, PostgreSQL, Power BI, Power Query, Advanced Excel",
      description:
        "Extracted and transformed 50,000+ sales and inventory records using advanced PostgreSQL queries and Power Query ETL. Designed a Star Schema dimensional data model and deployed dynamic Power BI dashboards tracking monthly revenue, product margins, and customer retention trends with 100% data integrity validation.",
      forcePageBreak: false,
    },
    {
      id: "p2",
      title: "REST API Testing & Verification Suite",
      url: "https://github.com/shoyebrabbi",
      technologies: "Postman, REST APIs, JSON Schema Validation, Dynamic Assertions",
      description:
        "Engineered modular Postman test collections with pre-request scripts and dynamic variables to validate CRUD endpoints. Configured automated test assertions for HTTP status codes (200, 201, 400, 404, 500), response payloads, auth tokens (Bearer), and latency benchmarks across negative and edge-case scenarios.",
      forcePageBreak: false,
    },
    {
      id: "p3",
      title: "Enterprise Web App Test Suite & Jira Defect Hub",
      url: "https://github.com/shoyebrabbi",
      technologies: "Jira Software, Test Case Design, Chrome DevTools, Cross-Browser",
      description:
        "Authored 80+ comprehensive manual test cases covering user authentication, dynamic catalog filters, form validations, and checkout workflows using BVA/ECP techniques. Executed cross-browser compatibility tests and managed defect lifecycles in Jira with clear reproduction steps and log captures.",
      forcePageBreak: false,
    },
    {
      id: "p4",
      title: "Full-Stack Educational Management Portal",
      url: "https://shoyebrabbi.com",
      technologies: "Node.js, JavaScript, Relational Database, Tailwind CSS, Vercel",
      description:
        "Developed and deployed a full-stack web application featuring student enrollment, batch tracking, and attendance modules with role-based access control (Admin vs. Student) and relational schema design, hosted on cloud infrastructure.",
      forcePageBreak: false,
    },
  ],
  education: {
    degree: "B.Sc. in CSIT",
    school: "Southern University Bangladesh",
    year: "Graduated: 2020",
    location: "Chattogram, Bangladesh",
    modules:
      "Core Modules: Database Management Systems (DBMS), Computer Networks, Data Structures, Software Engineering.",
  },
  certifications: [
    "Google Data Analytics Specialization (Coursera)",
    "Applied Data Science with Python (Coursera)",
    "Database SQL Query Optimization (Skill Course)",
    "Advanced Power BI & Excel Data Analytics",
    "Foundations of Networking (CCNA & MikroTik)",
    "AI for App Deployment & ISO Standards Awareness",
  ],
  languages: "English (Professional Working)\nBengali (Native Proficiency)",
  strengths:
    "Root Cause Analysis, Technical Documentation, Cross-Team Collaboration, Problem Solving.",
  customSections: [],
};

export const INITIAL_SETTINGS: StudioSettings = {
  template: "bd-corporate",
  photoPosition: "right",
  headerStyle: "right",
  bodyColumns: "1col",
  sectionHeading: "accent-bar",
  skillsMode: "table",
  bulletStyle: "bullet-disc",
  themePrimary: "#0f4c81",
  themeLight: "#f0f7ff",
  themeBorder: "#1e6091",
  cvFont: "'Inter', sans-serif",
  fontSize: 12.4,
  lineHeight: 1.44,
  sectionGap: 13,
  pagePadding: 11,
  photoShape: "10px",
  photoSize: 112,
  photoScale: 1,
  photoPosX: 50,
  photoPosY: 50,
  photoSrc: DEFAULT_AVATAR_SVG,
  pageSplitView: true,
  isEditMode: true,
  zoomLevel: 1,
  portfolioMode: false,
  qrCode: {
    enabled: true,
    url: "https://shoyebrabbi.com",
    position: "header",
    size: 68,
    label: "Scan Portfolio",
  },
  signature: {
    enabled: false,
    image: "",
    name: "Md Shoyeb Rabbi",
    date: new Date().toLocaleDateString("en-GB"),
    showDeclaration: true,
    declarationText:
      "I hereby declare that all the details provided above are genuine, complete, and correct to the best of my knowledge and belief.",
  },
  hiddenSections: [],
  sidebarWidthPercent: 33,
  sidebarSections: ["skills", "credentials"],
  sectionTitles: {},
  showHeader: true,
  showHeaderDivider: true,
  showTitle: true,
  showContacts: true,
  headerAlign: "auto",
  showFooter: true,
  footerNote: "",
  footerRightText: "",
  showFooterPageNum: true,
  hideBrowserPrintChrome: true,
  cvTextColor: "#1e293b",
  cvPaperBg: "#ffffff",
  sidebarBg: "",
  sidebarTextColor: "",
  portfolio: {
    availabilityText: "Available for Immediate Joining · Chattogram / Dhaka / Remote",
    availabilityActive: true,
    showSectionNumbers: false,
    accentTheme: "cobalt",
    metrics: [
      { id: "m1", value: "2+ Years", label: "Industry Experience" },
      { id: "m2", value: "50,000+", label: "Records Reconciled" },
      { id: "m3", value: "80+", label: "Test Cases Authored" },
      { id: "m4", value: "100+", label: "Enterprise Users Supported" },
    ],
  },
};

export const INITIAL_PROFILES = [
  {
    id: "prof_master",
    name: "Master Executive (All-in-One)",
    rolePreset: "master" as const,
    description: "Balanced hybrid CV covering Data Analytics, SQA, and IT Systems.",
    data: INITIAL_CV_DATA,
    settings: INITIAL_SETTINGS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof_data",
    name: "Data Analyst & BI Developer",
    rolePreset: "data" as const,
    description: "Emphasizes SQL queries, PostgreSQL, Power BI dashboards, and Power Query ETL pipelines.",
    data: {
      ...INITIAL_CV_DATA,
      title: "DATA ANALYST | POWER BI DEVELOPER & SQL DATABASE SPECIALIST",
      summary:
        "Analytical and detail-oriented Computer Science graduate with 2+ years of professional experience in Data Analytics, Advanced SQL, Power BI interactive reporting, and Power Query ETL pipelines. Experienced in reconciling operational records, designing dimensional Star Schemas, and auditing enterprise ERP/SaaS data for business decision-making.",
    },
    settings: {
      ...INITIAL_SETTINGS,
      template: "bd-corporate" as const,
      themePrimary: "#0f4c81",
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof_sqa",
    name: "Software QA Engineer (SQA)",
    rolePreset: "sqa" as const,
    description: "Focuses on manual functional testing, regression, Postman REST API assertions, and Jira defect tracking.",
    data: {
      ...INITIAL_CV_DATA,
      title: "SOFTWARE QA ENGINEER | REST API, SQL & MANUAL TESTING SPECIALIST",
      summary:
        "Quality-driven Software QA specialist with hands-on experience in manual functional and regression testing, Postman REST API verification, SQL database auditing, BVA/ECP test design, and Jira defect tracking across Agile workflows. Skilled in cross-browser verification, UI test automation basics, and requirements traceability.",
    },
    settings: {
      ...INITIAL_SETTINGS,
      template: "modern-split" as const,
      themePrimary: "#1e3a8a",
      skillsMode: "grid" as const,
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prof_netops",
    name: "IT Support & Network Admin",
    rolePreset: "netops" as const,
    description: "Focuses on Windows Server, Linux shell, MikroTik, CCNA concepts, enterprise user support and ERP.",
    data: {
      ...INITIAL_CV_DATA,
      title: "IT SUPPORT ENGINEER | SYSTEM, NETWORK & ERP SPECIALIST",
      summary:
        "Enterprise IT Support and Network Operations specialist experienced in supporting 100+ business users, Windows Server and Linux system administration, network switch and router troubleshooting, ERP/SaaS support, and scheduled backup operations.",
    },
    settings: {
      ...INITIAL_SETTINGS,
      template: "two-col-sidebar" as const,
      themePrimary: "#0f766e",
    },
    updatedAt: new Date().toISOString(),
  },
];

