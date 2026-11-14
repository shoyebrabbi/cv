import * as XLSX from 'xlsx';
import { CVData, CVSectionId, StudioSettings } from '../types/cv';

function getSafeFileBase(candidateName?: string): string {
  const clean = (candidateName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || 'Candidate';
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

const DEFAULT_SECTION_ORDER: CVSectionId[] = [
  'summary',
  'skills',
  'experience',
  'projects',
  'credentials',
];

function getActiveSectionOrder(settings?: StudioSettings): CVSectionId[] {
  const hidden = new Set<CVSectionId>(settings?.hiddenSections || []);
  const order =
    settings?.sectionOrder && settings.sectionOrder.length === 5
      ? settings.sectionOrder
      : DEFAULT_SECTION_ORDER;
  return order.filter((id) => !hidden.has(id));
}

function getSectionHeading(
  id: CVSectionId | 'certifications' | 'languages',
  settings?: StudioSettings
): string {
  const custom = settings?.sectionTitles?.[id];
  if (custom && custom.trim()) return custom.trim();
  switch (id) {
    case 'summary':
      return 'PROFESSIONAL SUMMARY';
    case 'skills':
      return 'CORE TECHNICAL SKILLS & COMPETENCIES';
    case 'experience':
      return 'PROFESSIONAL EXPERIENCE';
    case 'projects':
      return 'KEY TECHNICAL PROJECTS & CASE STUDIES';
    case 'credentials':
      return 'EDUCATION';
    case 'certifications':
      return 'CERTIFICATIONS';
    case 'languages':
      return 'LANGUAGES & CORE';
  }
}

// 1. Direct PDF Download
export async function exportDirectPDF(elementId = 'cvDocument', candidateName?: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const html2pdf = (window as unknown as { html2pdf?: () => any }).html2pdf;
  if (!html2pdf) {
    window.print();
    return;
  }

  const safeName = (candidateName || 'Professional_Resume')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const wrapper = element.closest('.cv-document-wrapper') as HTMLElement | null;
  const prevTransform = wrapper ? wrapper.style.transform : '';
  const prevMarginBottom = wrapper ? wrapper.style.marginBottom : '';
  if (wrapper) {
    wrapper.style.transform = 'scale(1)';
    wrapper.style.marginBottom = '0px';
  }

  const opt = {
    margin: [6, 0, 6, 0],
    filename: `${safeName || 'Resume'}_CV.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      ignoreElements: (el: Element) =>
        el.classList?.contains('builder-control') || el.classList?.contains('no-print'),
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: {
      mode: ['css', 'legacy'],
      before: '.force-page-break',
      avoid: ['tr', '.experience-item', '.project-item', '.cv-keep-together'],
    },
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error('Direct PDF error, falling back to print:', err);
    window.print();
  } finally {
    if (wrapper) {
      wrapper.style.transform = prevTransform;
      wrapper.style.marginBottom = prevMarginBottom;
    }
  }
}

// 1B. High-Resolution PNG Image Export
export async function exportHighResPNG(
  elementId = 'cvDocument',
  candidateName?: string
): Promise<boolean> {
  const element = document.getElementById(elementId);
  const html2pdf = (window as unknown as { html2pdf?: () => any }).html2pdf;
  if (!element || !html2pdf) {
    return false;
  }

  const safeName = (candidateName || 'Professional_Resume')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const wrapper = element.closest('.cv-document-wrapper') as HTMLElement | null;
  const prevTransform = wrapper ? wrapper.style.transform : '';
  const prevMarginBottom = wrapper ? wrapper.style.marginBottom : '';
  if (wrapper) {
    wrapper.style.transform = 'scale(1)';
    wrapper.style.marginBottom = '0px';
  }

  try {
    const canvas: HTMLCanvasElement = await html2pdf()
      .set({
        margin: 0,
        html2canvas: {
          scale: 2.5,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          backgroundColor: '#ffffff',
          ignoreElements: (el: Element) =>
            el.classList?.contains('builder-control') || el.classList?.contains('no-print'),
        },
      })
      .from(element)
      .toCanvas()
      .get('canvas');

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png', 1.0)
    );
    if (!blob) return false;
    triggerDownload(blob, `${safeName || 'Resume'}_CV_HD.png`);
    return true;
  } catch (err) {
    console.error('High-res PNG export failed:', err);
    return false;
  } finally {
    if (wrapper) {
      wrapper.style.transform = prevTransform;
      wrapper.style.marginBottom = prevMarginBottom;
    }
  }
}

// 2. Word (.doc & .docx) — Full Studio Sync
export function exportWordDoc(ext: 'doc' | 'docx', data: CVData, settings: StudioSettings) {
  const primaryColor = settings.themePrimary || '#0f4c81';
  const activeSections = getActiveSectionOrder(settings);
  const safeFileBase = (data.name || 'Resume')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const contactsHTML =
    settings.showContacts !== false
      ? data.contacts
          .map((c) =>
            c.url
              ? `<a href="${c.url}" style="color:${primaryColor}; text-decoration:none; font-weight:bold;">${c.label}</a>`
              : `<span>${c.label}</span>`
          )
          .join(' &nbsp;|&nbsp; ')
      : '';

  const photoCellHTML =
    settings.photoPosition !== 'hide' && settings.photoSrc
      ? `<td style="width:115px; vertical-align:top; text-align:${
          settings.photoPosition === 'right' ? 'right' : 'left'
        };">
          <img src="${settings.photoSrc}" width="95" height="110" style="border:2px solid ${primaryColor}; border-radius:6px; object-fit:cover;" />
        </td>`
      : '';

  const textCellHTML = `
    <td style="vertical-align:top; text-align:${
      settings.headerAlign === 'center' || settings.photoPosition === 'center' ? 'center' : 'left'
    };">
      <h1 style="margin:0; font-size:20pt; color:#0f172a; text-transform:uppercase;">${data.name}</h1>
      ${
        settings.showTitle !== false
          ? `<p style="margin:2pt 0 6pt 0; font-size:11pt; font-weight:bold; color:${primaryColor};">${data.title}</p>`
          : ''
      }
      ${
        contactsHTML
          ? `<p style="margin:0; font-size:9.5pt; color:#334155;">${contactsHTML}</p>`
          : ''
      }
    </td>
  `;

  const headerRowContent =
    settings.photoPosition === 'left'
      ? `${photoCellHTML}${textCellHTML}`
      : `${textCellHTML}${photoCellHTML}`;

  const skillsRowsHTML = data.skills
    .map(
      (s) => `
      <tr>
        <td style="width:24%; font-weight:bold; background-color:#f0f7ff; border:1px solid #cbd5e1; border-left:3pt solid ${primaryColor}; padding:5pt 8pt; font-size:9.5pt;">${s.category}</td>
        <td style="width:76%; border:1px solid #cbd5e1; padding:5pt 8pt; font-size:9.5pt;">${s.competencies}</td>
      </tr>
    `
    )
    .join('');

  const expHTML = data.experiences
    .map(
      (e) => `
      ${e.forcePageBreak ? `<br clear="all" style="page-break-before:always" />` : ''}
      <div style="margin-bottom:9pt; page-break-inside:avoid;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="font-weight:bold; font-size:10.5pt; color:#0f172a;">${e.role} — <span style="color:${primaryColor};">${e.company}</span></td>
            <td style="text-align:right; font-weight:bold; font-size:9pt; color:#475569;">${e.date} | ${e.location}</td>
          </tr>
        </table>
        <ul style="margin-top:3pt; margin-bottom:3pt; padding-left:16pt;">
          ${e.bullets
            .map((b) => `<li style="font-size:9.5pt; color:#334155; margin-bottom:2.5pt;">${b.text.replace(/<[^>]+>/g, '')}</li>`)
            .join('')}
        </ul>
      </div>
    `
    )
    .join('');

  const projHTML = data.projects
    .map(
      (p) => `
      ${p.forcePageBreak ? `<br clear="all" style="page-break-before:always" />` : ''}
      <div style="margin-bottom:7pt; page-break-inside:avoid;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="font-weight:bold; font-size:10pt; color:#0f172a;">
              ${p.url ? `<a href="${p.url}" style="color:#0f172a; text-decoration:none;">${p.title}</a>` : p.title}
            </td>
            <td style="text-align:right; font-style:italic; font-weight:bold; font-size:9pt; color:${primaryColor};">${p.technologies}</td>
          </tr>
        </table>
        <p style="margin:2pt 0 0 0; font-size:9.5pt; color:#334155; text-align:justify;">${p.description}</p>
      </div>
    `
    )
    .join('');

  const certsHTML = data.certifications
    .map((c) => `<li style="font-size:9pt; margin-bottom:2pt;">${c}</li>`)
    .join('');

  const wordSections: Record<CVSectionId, string> = {
    summary: `
      <h2>${getSectionHeading('summary', settings)}</h2>
      <p style="font-size:9.5pt; text-align:justify; color:#334155; margin-top:0;">${data.summary}</p>
    `,
    skills: `
      <h2>${getSectionHeading('skills', settings)}</h2>
      <table style="width:100%; border-collapse:collapse; margin-bottom:6pt;">
        ${skillsRowsHTML}
      </table>
    `,
    experience: `
      <h2>${getSectionHeading('experience', settings)}</h2>
      ${expHTML}
    `,
    projects: `
      <h2>${getSectionHeading('projects', settings)}</h2>
      ${projHTML}
    `,
    credentials: `
      <table style="width:100%; border-collapse:collapse; margin-top:8pt; page-break-inside:avoid;">
        <tr>
          <td style="width:33%; vertical-align:top; padding-right:10pt;">
            <h2>${getSectionHeading('credentials', settings)}</h2>
            <p style="font-size:9.5pt; margin:0;"><strong>${data.education.degree}</strong><br>
            <span style="color:${primaryColor}; font-weight:bold;">${data.education.school}</span><br>
            <span style="font-size:8.5pt; color:#64748b;">${data.education.year}</span><br>
            ${data.education.modules}</p>
          </td>
          <td style="width:40%; vertical-align:top; padding-right:10pt;">
            <h2>${getSectionHeading('certifications', settings)}</h2>
            <ul style="margin:0; padding-left:15pt;">${certsHTML}</ul>
          </td>
          <td style="width:27%; vertical-align:top;">
            <h2>${getSectionHeading('languages', settings)}</h2>
            <p style="font-size:9pt; margin:0 0 5pt 0;"><strong>Languages:</strong><br>${data.languages.replace(/\n/g, '<br>')}</p>
            <p style="font-size:9pt; margin:0;"><strong>Key Strengths:</strong><br>${data.strengths}</p>
          </td>
        </tr>
      </table>
    `,
  };

  const customSectionsHTML = (data.customSections || [])
    .map(
      (sec) => `
      ${sec.forcePageBreak ? `<br clear="all" style="page-break-before:always" />` : ''}
      <h2>${sec.title}</h2>
      ${
        sec.type === 'paragraph'
          ? `<p style="font-size:9.5pt; text-align:justify; color:#334155;">${sec.content.join(' ')}</p>`
          : `<ul style="margin-top:3pt; margin-bottom:5pt; padding-left:16pt;">
              ${sec.content
                .map((item) => `<li style="font-size:9.5pt; color:#334155; margin-bottom:2pt;">${item}</li>`)
                .join('')}
            </ul>`
      }
    `
    )
    .join('');

  const footerHTML =
    settings.showFooter !== false
      ? `
      <table style="width:100%; border-top:1pt solid #e2e8f0; margin-top:14pt; padding-top:4pt; font-size:8pt; color:#64748b;">
        <tr>
          <td>${settings.footerNote !== undefined ? settings.footerNote : `${data.name} — Professional Resume`}</td>
          <td style="text-align:right;">${
            settings.showFooterPageNum !== false ? settings.footerRightText || '' : ''
          }</td>
        </tr>
      </table>
    `
      : '';

  const wordDocContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${data.name} - CV</title>
      <style>
        @page { size: 21cm 29.7cm; margin: 1.1cm 1.3cm 1.1cm 1.3cm; }
        body { font-family: 'Calibri', 'Arial', sans-serif; color: #1e293b; line-height: 1.36; }
        h2 { color: ${primaryColor}; font-size: 11pt; text-transform: uppercase; border-bottom: 1.5pt solid ${primaryColor}; padding-bottom: 2pt; margin-top: 10pt; margin-bottom: 5pt; }
      </style>
    </head>
    <body>
      ${
        settings.showHeader !== false
          ? `<table style="width:100%; ${
              settings.showHeaderDivider !== false ? `border-bottom:2pt solid ${primaryColor};` : ''
            } padding-bottom:6pt; margin-bottom:6pt;">
              <tr>${headerRowContent}</tr>
            </table>`
          : ''
      }

      ${activeSections.map((secId) => wordSections[secId]).join('')}
      ${customSectionsHTML}
      ${footerHTML}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordDocContent], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, `${safeFileBase || 'Candidate'}_CV.${ext}`);
}

// 3. 5-Sheet Excel Workbook
export function exportExcel(data: CVData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
  const overviewRows = [
    [`${data.name} - EXECUTIVE MASTER TECHNICAL CV`],
    ['Role / Title', data.title],
    ...data.contacts.map((c) => ['Contact / Link', c.label, c.url]),
    [],
    ['PROFESSIONAL SUMMARY'],
    [data.summary],
    [],
    ['CORE TECHNICAL SKILLS & COMPETENCIES'],
    ['Category', 'Skills & Competencies'],
    ...data.skills.map((s) => [s.category, s.competencies]),
    [],
    ['PROFESSIONAL EXPERIENCE'],
    ['Role', 'Company', 'Duration & Location', 'Key Responsibilities & Achievements'],
    ...data.experiences.map((e) => [
      e.role,
      e.company,
      `${e.date} | ${e.location}`,
      e.bullets.map((b) => b.text.replace(/<[^>]+>/g, '')).join(' | '),
    ]),
    [],
    ['KEY TECHNICAL PROJECTS & CASE STUDIES'],
    ['Project Title', 'Tech Stack', 'Description & Impact', 'Project Link'],
    ...data.projects.map((p) => [p.title, p.technologies, p.description, p.url]),
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewRows);
  wsOverview['!cols'] = [{ wch: 32 }, { wch: 38 }, { wch: 32 }, { wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Sheet 2: Technical_Skills
  const wsSkills = XLSX.utils.json_to_sheet(
    data.skills.map((s) => ({
      'Skill Category': s.category,
      'Technical Competencies': s.competencies,
    }))
  );
  wsSkills['!cols'] = [{ wch: 28 }, { wch: 95 }];
  XLSX.utils.book_append_sheet(wb, wsSkills, 'Technical_Skills');

  // Sheet 3: Experience
  const expFlat: Array<{
    Role: string;
    Organization: string;
    'Period & Location': string;
    'Responsibility / Impact': string;
  }> = [];
  data.experiences.forEach((e) => {
    e.bullets.forEach((b) => {
      expFlat.push({
        Role: e.role,
        Organization: e.company,
        'Period & Location': `${e.date} | ${e.location}`,
        'Responsibility / Impact': b.text.replace(/<[^>]+>/g, ''),
      });
    });
  });
  const wsExp = XLSX.utils.json_to_sheet(expFlat);
  wsExp['!cols'] = [{ wch: 35 }, { wch: 28 }, { wch: 30 }, { wch: 85 }];
  XLSX.utils.book_append_sheet(wb, wsExp, 'Experience');

  // Sheet 4: Projects
  const wsProj = XLSX.utils.json_to_sheet(
    data.projects.map((p) => ({
      'Project Title': p.title,
      'Technologies Used': p.technologies,
      'Case Study & Results': p.description,
      URL: p.url,
    }))
  );
  wsProj['!cols'] = [{ wch: 38 }, { wch: 45 }, { wch: 85 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, wsProj, 'Projects');

  // Sheet 5: Education_Certs
  const eduCertRows = [
    ['EDUCATION'],
    ['Degree', 'Institution', 'Graduated', 'Core Modules'],
    [data.education.degree, data.education.school, `${data.education.year} | ${data.education.location}`, data.education.modules],
    [],
    ['CERTIFICATIONS'],
    ...data.certifications.map((c, i) => [`Certification ${i + 1}`, c]),
    [],
    ['LANGUAGES & CORE STRENGTHS'],
    ['Languages', data.languages],
    ['Key Strengths', data.strengths],
  ];
  const wsEdu = XLSX.utils.aoa_to_sheet(eduCertRows);
  wsEdu['!cols'] = [{ wch: 25 }, { wch: 55 }, { wch: 30 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, wsEdu, 'Education_Certs');

  XLSX.writeFile(wb, `${getSafeFileBase(data.name)}_CV.xlsx`);
}

// 4. CSV Exporter
export function exportCSV(data: CVData) {
  const rows = [
    ['Section', 'Title / Category', 'Organization / Tech Stack', 'Timeline / URL', 'Details / Description'],
    ['Profile', data.name, data.title, '', data.contacts.map((c) => `${c.label} (${c.url})`).join(' | ')],
    ['Summary', 'Professional Summary', '', '', data.summary],
    ...data.skills.map((s) => ['Skill', s.category, '', '', s.competencies]),
    ...data.experiences.map((e) => [
      'Experience',
      e.role,
      e.company,
      `${e.date} | ${e.location}`,
      e.bullets.map((b) => b.text.replace(/<[^>]+>/g, '')).join(' ; '),
    ]),
    ...data.projects.map((p) => ['Project', p.title, p.technologies, p.url, p.description]),
    ['Education', data.education.degree, data.education.school, data.education.year, data.education.modules],
    ...data.certifications.map((c) => ['Certification', c, '', '', '']),
    ['Languages', 'Languages', '', '', data.languages],
    ['Strengths', 'Key Strengths', '', '', data.strengths],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(['\ufeff' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${getSafeFileBase(data.name)}_CV.csv`);
}

// 5. Markdown Exporter — Synced with Studio Section Order & Custom Sections
export function exportMarkdown(data: CVData, settings?: StudioSettings): void {
  const activeSections = getActiveSectionOrder(settings);
  let md = `# ${data.name}\n**${data.title}**\n\n`;
  if (settings?.showContacts !== false) {
    md += data.contacts.map((c) => (c.url ? `[${c.label}](${c.url})` : c.label)).join(' | ') + `\n\n---\n\n`;
  }

  activeSections.forEach((secId) => {
    if (secId === 'summary') {
      md += `## ${getSectionHeading('summary', settings)}\n${data.summary}\n\n`;
    } else if (secId === 'skills') {
      md += `## ${getSectionHeading('skills', settings)}\n| Category | Competencies |\n| :--- | :--- |\n`;
      data.skills.forEach((s) => {
        md += `| **${s.category}** | ${s.competencies} |\n`;
      });
      md += `\n`;
    } else if (secId === 'experience') {
      md += `## ${getSectionHeading('experience', settings)}\n`;
      data.experiences.forEach((e) => {
        md += `### ${e.role} — *${e.company}*\n*${e.date} | ${e.location}*\n`;
        e.bullets.forEach((b) => {
          md += `- ${b.text.replace(/<[^>]+>/g, '')}\n`;
        });
        md += `\n`;
      });
    } else if (secId === 'projects') {
      md += `## ${getSectionHeading('projects', settings)}\n`;
      data.projects.forEach((p) => {
        md += `### ${p.url ? `[${p.title}](${p.url})` : p.title} | \`${p.technologies}\`\n${p.description}\n\n`;
      });
    } else if (secId === 'credentials') {
      md += `## ${getSectionHeading('credentials', settings)}\n**${data.education.degree}** — ${data.education.school} (${data.education.year})\n- ${data.education.modules}\n\n`;
      md += `## ${getSectionHeading('certifications', settings)}\n`;
      data.certifications.forEach((c) => {
        md += `- ${c}\n`;
      });
      md += `\n## ${getSectionHeading('languages', settings)}\n- **Languages:** ${data.languages.replace(/\n/g, ', ')}\n- **Key Strengths:** ${data.strengths}\n\n`;
    }
  });

  (data.customSections || []).forEach((sec) => {
    md += `## ${sec.title}\n`;
    if (sec.type === 'paragraph') {
      md += `${sec.content.join(' ')}\n\n`;
    } else {
      sec.content.forEach((item) => {
        md += `- ${item.replace(/<[^>]+>/g, '')}\n`;
      });
      md += `\n`;
    }
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${getSafeFileBase(data.name)}_CV.md`);
}

// 6. Plain Text Exporter — Synced with Studio Section Order & Custom Sections
export function exportPlainText(data: CVData, settings?: StudioSettings): void {
  const activeSections = getActiveSectionOrder(settings);
  let txt = `${data.name}\n${data.title}\n${data.contacts.map((c) => c.label).join(' | ')}\n================================================================================\n\n`;

  activeSections.forEach((secId) => {
    if (secId === 'summary') {
      const h = getSectionHeading('summary', settings);
      txt += `${h}\n${'-'.repeat(h.length)}\n${data.summary}\n\n`;
    } else if (secId === 'skills') {
      const h = getSectionHeading('skills', settings);
      txt += `${h}\n${'-'.repeat(h.length)}\n`;
      data.skills.forEach((s) => {
        txt += `* ${s.category}: ${s.competencies}\n`;
      });
      txt += `\n`;
    } else if (secId === 'experience') {
      const h = getSectionHeading('experience', settings);
      txt += `${h}\n${'-'.repeat(h.length)}\n`;
      data.experiences.forEach((e) => {
        txt += `${e.role} - ${e.company} (${e.date} | ${e.location})\n`;
        e.bullets.forEach((b) => {
          txt += `  • ${b.text.replace(/<[^>]+>/g, '')}\n`;
        });
        txt += `\n`;
      });
    } else if (secId === 'projects') {
      const h = getSectionHeading('projects', settings);
      txt += `${h}\n${'-'.repeat(h.length)}\n`;
      data.projects.forEach((p) => {
        txt += `${p.title} [${p.technologies}]\n  ${p.description}\n\n`;
      });
    } else if (secId === 'credentials') {
      const hEdu = getSectionHeading('credentials', settings);
      const hCert = getSectionHeading('certifications', settings);
      const hLang = getSectionHeading('languages', settings);
      txt += `${hEdu}\n${'-'.repeat(hEdu.length)}\n${data.education.degree} | ${data.education.school} (${data.education.year})\n${data.education.modules}\n\n`;
      txt += `${hCert}\n${'-'.repeat(hCert.length)}\n`;
      data.certifications.forEach((c) => {
        txt += `• ${c}\n`;
      });
      txt += `\n${hLang}\n${'-'.repeat(hLang.length)}\nLanguages: ${data.languages.replace(/\n/g, ' / ')}\nKey Strengths: ${data.strengths}\n\n`;
    }
  });

  (data.customSections || []).forEach((sec) => {
    txt += `${sec.title}\n${'-'.repeat(sec.title.length)}\n`;
    if (sec.type === 'paragraph') {
      txt += `${sec.content.join(' ')}\n\n`;
    } else {
      sec.content.forEach((item) => {
        txt += `• ${item.replace(/<[^>]+>/g, '')}\n`;
      });
      txt += `\n`;
    }
  });

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${getSafeFileBase(data.name)}_CV.txt`);
}

// 7. Standalone HTML file — Full Studio Sync
export function exportHTMLFile(data: CVData, settings: StudioSettings) {
  const primaryColor = settings.themePrimary || '#0f4c81';
  const activeSections = getActiveSectionOrder(settings);

  const htmlSections: Record<CVSectionId, string> = {
    summary: `
      <div class="cv-section-title">${getSectionHeading('summary', settings)}</div>
      <p style="font-size: 12px; line-height: 1.5; text-align: justify; color: #334155;">${data.summary}</p>
    `,
    skills: `
      <div class="cv-section-title">${getSectionHeading('skills', settings)}</div>
      <table class="skills-table">
        ${data.skills.map((s) => `<tr><td>${s.category}</td><td>${s.competencies}</td></tr>`).join('')}
      </table>
    `,
    experience: `
      <div class="cv-section-title">${getSectionHeading('experience', settings)}</div>
      ${data.experiences
        .map(
          (e) => `
        <div style="margin-bottom: 12px;">
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px;">
            <span>${e.role} — <span style="color:${primaryColor};">${e.company}</span></span>
            <span style="font-size:12px; color:#64748b;">${e.date} | ${e.location}</span>
          </div>
          <ul style="margin: 6px 0; padding-left: 18px; font-size: 12px; color: #334155;">
            ${e.bullets.map((b) => `<li style="margin-bottom: 3px;">${b.text}</li>`).join('')}
          </ul>
        </div>
      `
        )
        .join('')}
    `,
    projects: `
      <div class="cv-section-title">${getSectionHeading('projects', settings)}</div>
      ${data.projects
        .map(
          (p) => `
        <div style="margin-bottom: 10px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:bold;">
            <span>${p.url ? `<a href="${p.url}" style="color:#0f172a;">${p.title}</a>` : p.title}</span>
            <span style="font-size:11px; color:${primaryColor}; font-style:italic;">${p.technologies}</span>
          </div>
          <p style="font-size: 12px; color: #334155; margin: 3px 0 0 0; text-align: justify;">${p.description}</p>
        </div>
      `
        )
        .join('')}
    `,
    credentials: `
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 14px;">
        <div>
          <div class="cv-section-title">${getSectionHeading('credentials', settings)}</div>
          <div style="font-size: 12px; color: #334155;">
            <strong>${data.education.degree}</strong><br>
            <span style="color:${primaryColor};">${data.education.school}</span><br>
            <span style="color:#64748b;">${data.education.year}</span><br>
            <span style="font-size: 11px;">${data.education.modules}</span>
          </div>
        </div>
        <div>
          <div class="cv-section-title">${getSectionHeading('certifications', settings)}</div>
          <ul style="font-size: 11.5px; color: #334155; padding-left: 18px; margin: 0;">
            ${data.certifications.map((c) => `<li style="margin-bottom:2px;">${c}</li>`).join('')}
          </ul>
        </div>
        <div>
          <div class="cv-section-title">${getSectionHeading('languages', settings)}</div>
          <div style="font-size: 11.5px; color: #334155;">
            <strong>Languages:</strong><br>${data.languages.replace(/\n/g, '<br>')}<br><br>
            <strong>Key Strengths:</strong><br>${data.strengths}
          </div>
        </div>
      </div>
    `,
  };

  const customHtml = (data.customSections || [])
    .map(
      (sec) => `
      <div class="cv-section-title">${sec.title}</div>
      ${
        sec.type === 'paragraph'
          ? `<p style="font-size: 12px; line-height: 1.5; text-align: justify; color: #334155;">${sec.content.join(' ')}</p>`
          : `<ul style="margin: 6px 0; padding-left: 18px; font-size: 12px; color: #334155;">
              ${sec.content.map((item) => `<li style="margin-bottom: 3px;">${item}</li>`).join('')}
            </ul>`
      }
    `
    )
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.name} - Executive Master Technical CV</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
body { font-family: ${settings.cvFont || "'Inter', sans-serif"}; background: #f1f5f9; padding: 24px; color: ${settings.cvTextColor || '#1e293b'}; }
.cv-document { background: ${settings.cvPaperBg || 'white'}; max-width: 210mm; margin: 0 auto; padding: 36px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 8px; }
.theme-text { color: ${primaryColor}; }
.theme-border { border-color: ${primaryColor}; }
.cv-section-title { display:flex; align-items:center; font-weight:800; font-size:0.92rem; color:${primaryColor}; text-transform:uppercase; margin-top:1.1rem; margin-bottom:0.5rem; border-bottom:2px solid ${primaryColor}; padding-bottom:3px; }
.skills-table { width:100%; border-collapse:collapse; font-size:0.84rem; }
.skills-table td { border:1px solid #cbd5e1; padding:6px 10px; vertical-align:top; }
.skills-table td:first-child { width:24%; font-weight:700; background:${settings.themeLight || '#f0f7ff'}; border-left:3.5px solid ${primaryColor}; }
</style>
</head>
<body>
<div class="cv-document">
  ${
    settings.showHeader !== false
      ? `<div style="${
          settings.showHeaderDivider !== false ? `border-bottom: 2px solid ${primaryColor};` : ''
        } padding-bottom: 12px; margin-bottom: 16px; text-align: ${
          settings.headerAlign === 'center' ? 'center' : 'left'
        };">
          <h1 style="font-size: 26px; font-weight: 800; text-transform: uppercase; margin: 0;">${data.name}</h1>
          ${
            settings.showTitle !== false
              ? `<div style="font-size: 13px; font-weight: 700; color: ${primaryColor}; margin-top: 3px;">${data.title}</div>`
              : ''
          }
          ${
            settings.showContacts !== false
              ? `<div style="font-size: 12px; color: #475569; margin-top: 8px;">
                  ${data.contacts
                    .map((c) => (c.url ? `<a href="${c.url}" style="color:${primaryColor}; text-decoration:none;">${c.label}</a>` : c.label))
                    .join(' &bull; ')}
                </div>`
              : ''
          }
        </div>`
      : ''
  }

  ${activeSections.map((id) => htmlSections[id]).join('')}
  ${customHtml}

  ${
    settings.showFooter !== false
      ? `<div style="margin-top: 18px; padding-top: 8px; border-top: 1px solid #e2e8f0; display:flex; justify-content:space-between; font-size: 11px; color: #64748b;">
          <span>${settings.footerNote !== undefined ? settings.footerNote : `${data.name} — Professional Resume`}</span>
          <span>${settings.showFooterPageNum !== false ? settings.footerRightText || '' : ''}</span>
        </div>`
      : ''
  }
</div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `${getSafeFileBase(data.name)}_CV.html`);
}

// 8. JSON Backup
export function exportJSONBackup(data: CVData, settings: StudioSettings) {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '3.0.0',
    data,
    settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, `${getSafeFileBase(data.name)}_CV_Project.json`);
}

// 9. Copy all text — Synced with Studio Section Order, Titles & Visibility
export async function copyAllCVText(data: CVData, settings?: StudioSettings): Promise<boolean> {
  const activeSections = getActiveSectionOrder(settings);
  let txt = `${data.name}\n${settings?.showTitle !== false ? `${data.title}\n` : ''}${
    settings?.showContacts !== false ? `${data.contacts.map((c) => c.label).join(' | ')}\n` : ''
  }\n`;

  activeSections.forEach((secId) => {
    if (secId === 'summary') {
      txt += `${getSectionHeading('summary', settings)}\n${data.summary}\n\n`;
    } else if (secId === 'skills') {
      txt += `${getSectionHeading('skills', settings)}\n`;
      data.skills.forEach((s) => {
        txt += `${s.category}: ${s.competencies}\n`;
      });
      txt += `\n`;
    } else if (secId === 'experience') {
      txt += `${getSectionHeading('experience', settings)}\n`;
      data.experiences.forEach((e) => {
        txt += `${e.role} - ${e.company} (${e.date})\n`;
        e.bullets.forEach((b) => {
          txt += `• ${b.text.replace(/<[^>]+>/g, '')}\n`;
        });
      });
      txt += `\n`;
    } else if (secId === 'projects') {
      txt += `${getSectionHeading('projects', settings)}\n`;
      data.projects.forEach((p) => {
        txt += `${p.title} [${p.technologies}]: ${p.description}\n`;
      });
      txt += `\n`;
    } else if (secId === 'credentials') {
      txt += `${getSectionHeading('credentials', settings)}\n${data.education.degree} - ${data.education.school} (${data.education.year})\n\n`;
      txt += `${getSectionHeading('certifications', settings)}\n${data.certifications.join('\n')}\n\n`;
      txt += `${getSectionHeading('languages', settings)}\nLanguages: ${data.languages.replace(/\n/g, ' / ')}\nKey Strengths: ${data.strengths}\n\n`;
    }
  });

  if (data.customSections && data.customSections.length > 0) {
    data.customSections.forEach((sec) => {
      txt += `${sec.title}\n${sec.content.map((c) => c.replace(/<[^>]+>/g, '')).join('\n')}\n\n`;
    });
  }

  try {
    await navigator.clipboard.writeText(txt.trim());
    return true;
  } catch {
    const tempInput = document.createElement('textarea');
    tempInput.value = txt.trim();
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    return true;
  }
}

// 10. Recruiter One-Click vCard (.vcf) Contact Card Exporter
export function exportVCard(data: CVData) {
  const email = data.contacts.find((c) => c.type === 'email')?.label || 'shoyebrabbi@gmail.com';
  const phone = data.contacts.find((c) => c.type === 'phone')?.label || '+8801622517200';
  const location = data.contacts.find((c) => c.type === 'location')?.label || 'Chattogram, Bangladesh';
  const website = data.contacts.find((c) => c.type === 'website')?.url || 'https://shoyebrabbi.com';
  const linkedin = data.contacts.find((c) => c.type === 'linkedin')?.url || '';

  const nameParts = data.name.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : data.name;

  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.name}`,
    `N:${lastName};${firstName};;;`,
    `TITLE:${data.title}`,
    `TEL;TYPE=CELL:${phone.replace(/\s+/g, '')}`,
    `EMAIL;TYPE=INTERNET:${email}`,
    website ? `URL:${website}` : '',
    linkedin ? `URL;TYPE=LinkedIn:${linkedin}` : '',
    `ADR;TYPE=HOME:;;${location};;;;`,
    `NOTE:${data.summary.replace(/\r?\n/g, ' ').slice(0, 220)}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');

  const safeName = data.name.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') || 'Candidate';
  const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
  triggerDownload(blob, `${safeName}.vcf`);
}

// 11. Matched Cover Letter Direct PDF Exporter (Synced with CV Header & Theme)
export async function exportCoverLetterPDF(
  coverText: string,
  data: CVData,
  settings: StudioSettings,
  company?: string
) {
  const primaryColor = settings.themePrimary || '#0f4c81';
  const fontStack = settings.cvFont || "'Plus Jakarta Sans', sans-serif";
  const contactsLine = data.contacts.map((c) => c.label).join('  |  ');
  const safeBody = coverText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-12000px';
  wrapper.style.top = '0';
  wrapper.style.width = '210mm';
  wrapper.style.background = '#ffffff';
  wrapper.style.color = '#1e293b';
  wrapper.style.fontFamily = fontStack;
  wrapper.style.padding = '16mm 18mm';
  wrapper.style.boxSizing = 'border-box';
  wrapper.innerHTML = `
    <div style="border-bottom: 2.5px solid ${primaryColor}; padding-bottom: 12px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.02em;">${data.name}</h1>
      <div style="margin-top: 3px; font-size: 12px; font-weight: 700; color: ${primaryColor}; text-transform: uppercase;">${data.title}</div>
      <div style="margin-top: 6px; font-size: 10.5px; color: #475569;">${contactsLine}</div>
    </div>
    <div style="font-size: 12.5px; line-height: 1.65; color: #1e293b; text-align: left;">
      ${safeBody}
    </div>
  `;
  document.body.appendChild(wrapper);

  const safeCompany = (company || 'Application').replace(/[^a-zA-Z0-9]+/g, '_');
  const html2pdf = (window as unknown as { html2pdf?: () => any }).html2pdf;
  try {
    if (html2pdf) {
      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: `Cover_Letter_${safeCompany}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(wrapper)
        .save();
    } else {
      exportCoverLetterDoc(coverText, data, settings, company);
    }
  } finally {
    document.body.removeChild(wrapper);
  }
}

// 12. Matched Cover Letter Word (.doc) Exporter
export function exportCoverLetterDoc(
  coverText: string,
  data: CVData,
  settings: StudioSettings,
  company?: string
) {
  const primaryColor = settings.themePrimary || '#0f4c81';
  const contactsLine = data.contacts.map((c) => c.label).join(' &nbsp;|&nbsp; ');
  const safeBody = coverText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head><meta charset="utf-8"><title>Cover Letter - ${data.name}</title>
    <style>
      @page { size: 21cm 29.7cm; margin: 1.8cm 2cm; }
      body { font-family: 'Calibri', Arial, sans-serif; color: #1e293b; line-height: 1.55; font-size: 11pt; }
    </style>
    </head>
    <body>
      <div style="border-bottom: 2pt solid ${primaryColor}; padding-bottom: 8pt; margin-bottom: 16pt;">
        <h1 style="margin:0; font-size: 18pt; color: #0f172a; text-transform: uppercase;">${data.name}</h1>
        <div style="font-size: 10.5pt; font-weight: bold; color: ${primaryColor}; margin-top: 2pt;">${data.title}</div>
        <div style="font-size: 9pt; color: #475569; margin-top: 5pt;">${contactsLine}</div>
      </div>
      <div>${safeBody}</div>
    </body>
    </html>
  `;
  const safeCompany = (company || 'Application').replace(/[^a-zA-Z0-9]+/g, '_');
  const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword;charset=utf-8' });
  triggerDownload(blob, `Cover_Letter_${safeCompany}.doc`);
}

