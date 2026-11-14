import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  X,
  ArrowUp,
  ArrowDown,
  Scissors,
  Trash2,
  Copy as CopyIcon,
  Plus,
  PenTool,
  QrCode as QrIcon,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CVData, CVSectionId, StudioSettings } from '../types/cv';

interface CVDocumentProps {
  cvData: CVData;
  settings: StudioSettings;
  estimatedPages?: number;
  jdHighlightKeywords?: string[];
  onClearJDHighlight?: () => void;
  onUpdateCVData: (updater: (prev: CVData) => CVData) => void;
  onUpdateSettings: (newSettings: Partial<StudioSettings>) => void;
  onOpenLinkModalForContact: (contactId: string, currentText: string, currentUrl: string) => void;
  onOpenLinkModalForProject: (projectId: string, currentTitle: string, currentUrl: string) => void;
  onOpenSignatureModal: () => void;
}

export function CVDocument({
  cvData,
  settings,
  estimatedPages = 1,
  jdHighlightKeywords = [],
  onClearJDHighlight,
  onUpdateCVData,
  onUpdateSettings,
  onOpenLinkModalForContact,
  onOpenLinkModalForProject,
  onOpenSignatureModal,
}: CVDocumentProps) {
  const isHighlightActive = jdHighlightKeywords.length > 0;
  const effectiveEditMode = settings.isEditMode && !isHighlightActive;

  function highlightTextHtml(raw: string, isHtml = false): string {
    const base = isHtml
      ? raw
      : raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (!isHighlightActive) return base;
    const escaped = jdHighlightKeywords
      .filter(Boolean)
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escaped.length === 0) return base;
    const regex = new RegExp(`(?![^<]*>)(${escaped.join('|')})`, 'gi');
    return base.replace(
      regex,
      '<mark class="bg-amber-200/90 text-slate-950 px-0.5 rounded-sm font-semibold">$1</mark>'
    );
  }
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (settings.qrCode?.enabled && settings.qrCode?.url) {
      QRCode.toDataURL(settings.qrCode.url, {
        width: (settings.qrCode.size || 68) * 2,
        margin: 1,
        color: {
          dark: settings.themePrimary || '#0f4c81',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [settings.qrCode, settings.themePrimary]);

  // Dynamic template and combiner classes (purely structural, never overrides Style Combiner)
  const templateClass =
    settings.template === 'strict-ats'
      ? 'tpl-ats'
      : settings.template === 'data-boxed'
      ? 'tpl-boxed'
      : settings.template === 'exec-ats'
      ? 'tpl-timeline'
      : settings.template === 'exec-sidebar'
      ? 'tpl-dark-sidebar'
      : settings.template === 'swiss-grid'
      ? 'tpl-swiss'
      : settings.template === 'tech-mono'
      ? 'tpl-mono'
      : '';

  const headerDarkBanner = settings.headerStyle === 'dark-banner' ? 'header-dark-banner' : '';

  const isTwoCol = settings.bodyColumns === '2col-left' || settings.bodyColumns === '2col-right';

  const bodyColClass =
    settings.bodyColumns === '2col-left'
      ? 'body-cols-left'
      : settings.bodyColumns === '2col-right'
      ? 'body-cols-right'
      : '';

  const secHeadingClass =
    settings.sectionHeading !== 'accent-bar' ? `sec-style-${settings.sectionHeading}` : '';

  function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onUpdateSettings({ photoSrc: event.target.result });
      }
    };
    reader.readAsDataURL(file);
  }

  // Content editable blur updater helpers
  function handleTextBlur(field: 'name' | 'title' | 'summary' | 'languages' | 'strengths', value: string) {
    onUpdateCVData((prev) => ({ ...prev, [field]: value.trim() }));
  }

  // Contact operations
  function moveContact(index: number, direction: -1 | 1) {
    onUpdateCVData((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.contacts.length) return prev;
      const newContacts = [...prev.contacts];
      const temp = newContacts[index];
      newContacts[index] = newContacts[targetIndex];
      newContacts[targetIndex] = temp;
      return { ...prev, contacts: newContacts };
    });
  }

  function deleteContact(id: string) {
    onUpdateCVData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id),
    }));
  }

  // Skills operations
  function moveSkill(index: number, direction: -1 | 1) {
    onUpdateCVData((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.skills.length) return prev;
      const newSkills = [...prev.skills];
      const temp = newSkills[index];
      newSkills[index] = newSkills[targetIndex];
      newSkills[targetIndex] = temp;
      return { ...prev, skills: newSkills };
    });
  }

  function duplicateSkill(index: number) {
    onUpdateCVData((prev) => {
      const newSkills = [...prev.skills];
      const toClone = newSkills[index];
      newSkills.splice(index + 1, 0, {
        ...toClone,
        id: 's_' + Date.now(),
        category: toClone.category + ' (Copy)',
      });
      return { ...prev, skills: newSkills };
    });
  }

  function deleteSkill(id: string) {
    onUpdateCVData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  }

  // Experience operations
  function moveExperience(index: number, direction: -1 | 1) {
    onUpdateCVData((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.experiences.length) return prev;
      const newExp = [...prev.experiences];
      const temp = newExp[index];
      newExp[index] = newExp[targetIndex];
      newExp[targetIndex] = temp;
      return { ...prev, experiences: newExp };
    });
  }

  function togglePageBreakExp(index: number) {
    onUpdateCVData((prev) => {
      const newExp = [...prev.experiences];
      newExp[index] = {
        ...newExp[index],
        forcePageBreak: !newExp[index].forcePageBreak,
      };
      return { ...prev, experiences: newExp };
    });
  }

  function deleteExperience(id: string) {
    onUpdateCVData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  }

  function addBullet(expIndex: number) {
    onUpdateCVData((prev) => {
      const newExp = [...prev.experiences];
      newExp[expIndex].bullets.push({
        id: 'b_' + Date.now(),
        text: '<strong>New Accomplishment:</strong> Click here to edit your responsibility or metric...',
      });
      return { ...prev, experiences: newExp };
    });
  }

  function moveBullet(expIndex: number, bulletIndex: number, direction: -1 | 1) {
    onUpdateCVData((prev) => {
      const newExp = [...prev.experiences];
      const bullets = [...newExp[expIndex].bullets];
      const targetIndex = bulletIndex + direction;
      if (targetIndex < 0 || targetIndex >= bullets.length) return prev;
      const temp = bullets[bulletIndex];
      bullets[bulletIndex] = bullets[targetIndex];
      bullets[targetIndex] = temp;
      newExp[expIndex].bullets = bullets;
      return { ...prev, experiences: newExp };
    });
  }

  function duplicateBullet(expIndex: number, bulletIndex: number) {
    onUpdateCVData((prev) => {
      const newExp = [...prev.experiences];
      const bullets = [...newExp[expIndex].bullets];
      const toClone = bullets[bulletIndex];
      bullets.splice(bulletIndex + 1, 0, {
        id: 'b_' + Date.now(),
        text: toClone.text,
      });
      newExp[expIndex].bullets = bullets;
      return { ...prev, experiences: newExp };
    });
  }

  function deleteBullet(expIndex: number, bulletIndex: number) {
    onUpdateCVData((prev) => {
      const newExp = [...prev.experiences];
      newExp[expIndex].bullets = newExp[expIndex].bullets.filter((_, idx) => idx !== bulletIndex);
      return { ...prev, experiences: newExp };
    });
  }

  // Projects operations
  function moveProject(index: number, direction: -1 | 1) {
    onUpdateCVData((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.projects.length) return prev;
      const newProj = [...prev.projects];
      const temp = newProj[index];
      newProj[index] = newProj[targetIndex];
      newProj[targetIndex] = temp;
      return { ...prev, projects: newProj };
    });
  }

  function duplicateProject(index: number) {
    onUpdateCVData((prev) => {
      const newProj = [...prev.projects];
      const toClone = newProj[index];
      newProj.splice(index + 1, 0, {
        ...toClone,
        id: 'p_' + Date.now(),
        title: toClone.title + ' (Copy)',
      });
      return { ...prev, projects: newProj };
    });
  }

  function togglePageBreakProj(index: number) {
    onUpdateCVData((prev) => {
      const newProj = [...prev.projects];
      newProj[index] = {
        ...newProj[index],
        forcePageBreak: !newProj[index].forcePageBreak,
      };
      return { ...prev, projects: newProj };
    });
  }

  function deleteProject(id: string) {
    onUpdateCVData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }

  // Certifications operations
  function moveCert(index: number, direction: -1 | 1) {
    onUpdateCVData((prev) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.certifications.length) return prev;
      const newCerts = [...prev.certifications];
      const temp = newCerts[index];
      newCerts[index] = newCerts[targetIndex];
      newCerts[targetIndex] = temp;
      return { ...prev, certifications: newCerts };
    });
  }

  function deleteCert(index: number) {
    onUpdateCVData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index),
    }));
  }

  function addCert() {
    onUpdateCVData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, 'New Professional Certification (Issuer)'],
    }));
  }

  // Header alignment classes based on photoPosition and headerAlign override
  const headerLayoutClass =
    settings.photoPosition === 'right'
      ? 'cv-header-right flex-col sm:flex-row-reverse items-center sm:items-start justify-between'
      : settings.photoPosition === 'left'
      ? 'cv-header-left flex-col sm:flex-row items-center sm:items-start justify-between'
      : settings.photoPosition === 'center'
      ? 'flex-col items-center text-center'
      : 'flex-col items-start';

  const effectiveAlign = settings.headerAlign && settings.headerAlign !== 'auto'
    ? settings.headerAlign
    : settings.photoPosition === 'center'
    ? 'center'
    : 'left';

  const textAlignmentClass =
    effectiveAlign === 'center'
      ? 'w-full text-center'
      : 'flex-1 text-center sm:text-left';

  const contactAlignmentClass =
    effectiveAlign === 'center'
      ? 'mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[12px]'
      : settings.photoPosition === 'hide'
      ? 'mt-2.5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 text-[12px]'
      : 'mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-[12px]';

  const customTextClass =
    settings.cvTextColor && settings.cvTextColor !== '#1e293b' ? 'custom-text-color' : '';

  return (
    <div
      id="cvDocument"
      className={`cv-document ${templateClass} ${headerDarkBanner} ${bodyColClass} ${secHeadingClass} ${customTextClass}`}
    >
      {isHighlightActive && (
        <div className="builder-control mb-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center justify-between gap-2">
          <span>
            JD Keyword Highlight Active ({jdHighlightKeywords.length} matched terms highlighted)
          </span>
          {onClearJDHighlight && (
            <button
              type="button"
              onClick={onClearJDHighlight}
              className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-slate-950 font-bold"
            >
              Turn Off Highlight
            </button>
          )}
        </div>
      )}
      {/* ================= HEADER SECTION ================= */}
      {settings.showHeader !== false && (
      <header
        id="cvHeader"
        className={`flex gap-5 transition-all ${
          settings.showHeaderDivider !== false ? 'pb-3.5 border-b-2 theme-border' : 'pb-2'
        } ${headerLayoutClass}`}
      >
        {/* QR Code in Header (if enabled) */}
        {settings.qrCode?.enabled && settings.qrCode?.position === 'header' && qrDataUrl && (
          <div className="shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white shadow-sm text-center">
            <a href={settings.qrCode.url} target="_blank" rel="noreferrer" title="Click or Scan with Mobile">
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: `${settings.qrCode.size}px`, height: `${settings.qrCode.size}px` }}
                className="object-contain"
              />
            </a>
            <span className="text-[8.5px] font-bold text-slate-500 uppercase mt-0.5 tracking-tight">
              {settings.qrCode.label || 'Portfolio'}
            </span>
          </div>
        )}

        {/* Profile Photo */}
        {settings.photoPosition !== 'hide' && (
          <div
            id="photoWrapper"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer?.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  if (typeof ev.target?.result === 'string') {
                    onUpdateSettings({ photoSrc: ev.target.result });
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            className="relative group shrink-0 overflow-hidden shadow-md bg-slate-100 flex items-center justify-center transition-all"
          >
            <img
              id="cvProfilePhoto"
              src={settings.photoSrc}
              alt={cvData.name}
              className="w-full h-full object-cover"
            />
            <label className="builder-control absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer p-1.5 text-center">
              <Camera className="w-4 h-4 mb-1 text-blue-300" />
              <span>Change / Drop Photo</span>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoFile}
              />
            </label>
          </div>
        )}

        {/* Identity & Movable Contact Bar */}
        <div id="headerTextContainer" className={textAlignmentClass}>
          <h1
            id="cvName"
            contentEditable={effectiveEditMode}
            suppressContentEditableWarning
            onBlur={(e) => handleTextBlur('name', e.currentTarget.innerText)}
            className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 uppercase leading-tight"
          >
            {cvData.name}
          </h1>
          {settings.showTitle !== false && (
            <p
              id="cvTitle"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTextBlur('title', e.currentTarget.innerText)}
              className="text-xs sm:text-[13.5px] font-bold theme-text tracking-wide uppercase mt-0.5"
            >
              {cvData.title}
            </p>
          )}

          {/* Granular Contact Items */}
          {settings.showContacts !== false && (
          <div id="contactItemsList" className={contactAlignmentClass}>
            {cvData.contacts.map((item, index) => (
              <div
                key={item.id}
                className="contact-item relative group/citem inline-flex items-center gap-1.5"
                data-type={item.type}
              >
                <span className="contact-icon theme-text">
                  {item.type === 'location' && '📍'}
                  {item.type === 'phone' && '📞'}
                  {item.type === 'email' && '✉️'}
                  {item.type === 'website' && '🌐'}
                  {item.type === 'linkedin' && '💼'}
                  {item.type === 'github' && '🐙'}
                  {item.type === 'custom' && '🔗'}
                </span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="contact-link font-medium"
                  contentEditable={settings.isEditMode}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newText = e.currentTarget.innerText.trim();
                    onUpdateCVData((prev) => {
                      const newContacts = [...prev.contacts];
                      newContacts[index] = { ...newContacts[index], label: newText };
                      return { ...prev, contacts: newContacts };
                    });
                  }}
                >
                  {item.label}
                </a>

                {/* Individual Contact Controls */}
                <div className="builder-control hidden group-hover/citem:inline-flex items-center gap-0.5 bg-slate-900 text-white px-1 py-0.5 rounded text-[9px] ml-1 shadow">
                  <button
                    type="button"
                    onClick={() => moveContact(index, -1)}
                    title="Move Left"
                    className="hover:text-blue-300"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveContact(index, 1)}
                    title="Move Right"
                    className="hover:text-blue-300"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenLinkModalForContact(item.id, item.label, item.url)}
                    className="text-blue-300 hover:text-blue-200"
                    title="Edit Link"
                  >
                    <LinkIcon className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteContact(item.id)}
                    className="text-rose-400 hover:text-rose-300"
                    title="Delete"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </header>
      )}

      {/* ================= SECTIONS CONTAINER ================= */}
      {(() => {
        const summarySection = (
          <section className="cv-section group/sec" data-section-id="summary">
            <div className="builder-control opacity-0 group-hover/sec:opacity-100 absolute right-0 -top-1 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-10">
              <span className="text-slate-400">Section 1</span>
            </div>
            <h2
              className="cv-section-title"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateSettings({
                    sectionTitles: { ...(settings.sectionTitles || {}), summary: val },
                  });
                }
              }}
            >
              {settings.sectionTitles?.summary || 'PROFESSIONAL SUMMARY'}
            </h2>
            {isHighlightActive ? (
              <p
                id="cvSummary"
                className="text-slate-700 text-justify leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightTextHtml(cvData.summary) }}
              />
            ) : (
              <p
                id="cvSummary"
                contentEditable={effectiveEditMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTextBlur('summary', e.currentTarget.innerText)}
                className="text-slate-700 text-justify leading-relaxed"
              >
                {cvData.summary}
              </p>
            )}
          </section>
        );

        const skillsSection = (
          <section className="cv-section group/sec" data-section-id="skills">
            <div className="builder-control opacity-0 group-hover/sec:opacity-100 absolute right-0 -top-1 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-10">
              <button
                type="button"
                onClick={() => {
                  onUpdateCVData((prev) => ({
                    ...prev,
                    skills: [
                      ...prev.skills,
                      {
                        id: 's_' + Date.now(),
                        category: 'New Skill Category',
                        competencies: 'Enter competencies, frameworks, tools...',
                      },
                    ],
                  }));
                }}
                className="text-emerald-300 hover:underline px-1 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Skill Row
              </button>
            </div>

            <h2
              className="cv-section-title"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateSettings({
                    sectionTitles: { ...(settings.sectionTitles || {}), skills: val },
                  });
                }
              }}
            >
              {settings.sectionTitles?.skills || 'CORE TECHNICAL SKILLS & COMPETENCIES'}
            </h2>

            <table className="skills-table" id="skillsTable">
              <tbody
                id="skillsTableBody"
                className={
                  settings.skillsMode === 'pills'
                    ? 'skills-pills-mode'
                    : settings.skillsMode === 'bars'
                    ? 'skills-bars-mode'
                    : settings.skillsMode === 'grid' && !isTwoCol
                    ? 'skills-grid-mode'
                    : settings.skillsMode === 'grid' && isTwoCol
                    ? 'skills-pills-mode'
                    : ''
                }
              >
                {cvData.skills.map((row, index) => (
                  <tr key={row.id} className="group/row">
                    <td>
                      <div
                        contentEditable={settings.isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newCat = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => {
                            const newSkills = [...prev.skills];
                            newSkills[index] = { ...newSkills[index], category: newCat };
                            return { ...prev, skills: newSkills };
                          });
                        }}
                      >
                        {row.category}
                      </div>
                      {settings.skillsMode === 'bars' && (
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1 mb-0.5">
                          <div
                            className="h-full theme-bg rounded-full"
                            style={{ width: `${Math.max(74, 96 - index * 4)}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="relative">
                      {isHighlightActive ? (
                        <div dangerouslySetInnerHTML={{ __html: highlightTextHtml(row.competencies) }} />
                      ) : (
                        <div
                          contentEditable={effectiveEditMode}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newComp = e.currentTarget.innerText.trim();
                            onUpdateCVData((prev) => {
                              const newSkills = [...prev.skills];
                              newSkills[index] = { ...newSkills[index], competencies: newComp };
                              return { ...prev, skills: newSkills };
                            });
                          }}
                        >
                          {row.competencies}
                        </div>
                      )}

                      <div className="builder-control opacity-0 group-hover/row:opacity-100 absolute top-1 right-1 flex items-center gap-1 bg-slate-900 text-white px-1.5 py-0.5 rounded shadow text-[9px]">
                        <button type="button" onClick={() => moveSkill(index, -1)} className="hover:text-blue-300" title="Move Up">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => moveSkill(index, 1)} className="hover:text-blue-300" title="Move Down">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => duplicateSkill(index)} className="hover:text-emerald-300" title="Duplicate">
                          <CopyIcon className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => deleteSkill(row.id)} className="text-rose-400 hover:text-rose-300" title="Delete">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );

        const experienceSection = (
          <section className="cv-section group/sec" data-section-id="experience">
            <div className="builder-control opacity-0 group-hover/sec:opacity-100 absolute right-0 -top-1 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-10">
              <button
                type="button"
                onClick={() => {
                  onUpdateCVData((prev) => ({
                    ...prev,
                    experiences: [
                      ...prev.experiences,
                      {
                        id: 'e_' + Date.now(),
                        role: 'Role Title',
                        company: 'Company Name',
                        date: 'Month Year - Present',
                        location: 'Location',
                        bullets: [
                          {
                            id: 'b_' + Date.now(),
                            text: '<strong>Key Responsibility:</strong> Describe your impact and metrics...',
                          },
                        ],
                      },
                    ],
                  }));
                }}
                className="text-emerald-300 hover:underline px-1 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Role
              </button>
            </div>

            <h2
              className="cv-section-title"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateSettings({
                    sectionTitles: { ...(settings.sectionTitles || {}), experience: val },
                  });
                }
              }}
            >
              {settings.sectionTitles?.experience || 'PROFESSIONAL EXPERIENCE'}
            </h2>

            <div id="experienceList" className="space-y-3.5">
              {cvData.experiences.map((exp, expIdx) => (
                <div
                  key={exp.id}
                  className={`experience-item relative group/item rounded-lg transition ${
                    exp.forcePageBreak ? 'force-page-break' : ''
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <div className="font-bold text-slate-900 text-[1.05em]">
                      <span
                        className="exp-role"
                        contentEditable={settings.isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newRole = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => {
                            const newExp = [...prev.experiences];
                            newExp[expIdx] = { ...newExp[expIdx], role: newRole };
                            return { ...prev, experiences: newExp };
                          });
                        }}
                      >
                        {exp.role}
                      </span>
                      <span className="text-slate-400 font-normal mx-1">—</span>
                      <span
                        className="exp-company theme-text"
                        contentEditable={settings.isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newCompany = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => {
                            const newExp = [...prev.experiences];
                            newExp[expIdx] = { ...newExp[expIdx], company: newCompany };
                            return { ...prev, experiences: newExp };
                          });
                        }}
                      >
                        {exp.company}
                      </span>
                    </div>
                    <div
                      className="exp-date text-[0.92em] font-semibold text-slate-600"
                      contentEditable={settings.isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newDate = e.currentTarget.innerText.trim();
                        onUpdateCVData((prev) => {
                          const newExp = [...prev.experiences];
                          newExp[expIdx] = { ...newExp[expIdx], date: newDate };
                          return { ...prev, experiences: newExp };
                        });
                      }}
                    >
                      {exp.date} | {exp.location}
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="exp-bullets list-outside ml-4 mt-1.5 space-y-1 text-slate-700">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={b.id} className="relative group/bullet">
                        <div
                          className="inline"
                          contentEditable={effectiveEditMode}
                          suppressContentEditableWarning
                          dangerouslySetInnerHTML={{ __html: highlightTextHtml(b.text, true) }}
                          onBlur={(e) => {
                            const newHtml = e.currentTarget.innerHTML;
                            onUpdateCVData((prev) => {
                              const newExp = [...prev.experiences];
                              newExp[expIdx].bullets[bIdx] = {
                                ...newExp[expIdx].bullets[bIdx],
                                text: newHtml,
                              };
                              return { ...prev, experiences: newExp };
                            });
                          }}
                        />
                        <span className="builder-control hidden group-hover/bullet:inline-flex items-center gap-1 bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9px] ml-1 shadow">
                          <button type="button" onClick={() => moveBullet(expIdx, bIdx, -1)} title="Move Bullet Up">
                            <ArrowUp className="w-2.5 h-2.5" />
                          </button>
                          <button type="button" onClick={() => moveBullet(expIdx, bIdx, 1)} title="Move Bullet Down">
                            <ArrowDown className="w-2.5 h-2.5" />
                          </button>
                          <button type="button" onClick={() => duplicateBullet(expIdx, bIdx)} title="Duplicate">
                            <CopyIcon className="w-2.5 h-2.5" />
                          </button>
                          <button type="button" onClick={() => deleteBullet(expIdx, bIdx)} className="text-rose-400" title="Delete">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Role item bar */}
                  <div className="builder-control opacity-0 group-hover/item:opacity-100 flex items-center gap-2 mt-1 text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <button type="button" onClick={() => addBullet(expIdx)} className="text-blue-600 hover:underline font-semibold">
                      + Bullet
                    </button>
                    <button type="button" onClick={() => moveExperience(expIdx, -1)} className="text-slate-600 hover:text-blue-600">
                      ▲ Role Up
                    </button>
                    <button type="button" onClick={() => moveExperience(expIdx, 1)} className="text-slate-600 hover:text-blue-600">
                      ▼ Role Down
                    </button>
                    <button type="button" onClick={() => togglePageBreakExp(expIdx)} className="text-indigo-600 hover:underline font-semibold flex items-center gap-0.5">
                      <Scissors className="w-3 h-3" /> ⤵ Toggle Page 2 Break
                    </button>
                    <button type="button" onClick={() => deleteExperience(exp.id)} className="text-red-500 hover:underline ml-auto flex items-center gap-0.5">
                      <Trash2 className="w-3 h-3" /> Delete Role
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

        const projectsSection = (
          <section className="cv-section group/sec" data-section-id="projects">
            <div className="builder-control opacity-0 group-hover/sec:opacity-100 absolute right-0 -top-1 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-10">
              <button
                type="button"
                onClick={() => {
                  onUpdateCVData((prev) => ({
                    ...prev,
                    projects: [
                      ...prev.projects,
                      {
                        id: 'p_' + Date.now(),
                        title: 'New Project Title',
                        url: 'https://github.com/shoyebrabbi',
                        technologies: 'Tech Stack',
                        description: 'Describe the project architecture and impact...',
                        forcePageBreak: false,
                      },
                    ],
                  }));
                }}
                className="text-emerald-300 hover:underline px-1 font-semibold flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Project
              </button>
            </div>

            <h2
              className="cv-section-title"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateSettings({
                    sectionTitles: { ...(settings.sectionTitles || {}), projects: val },
                  });
                }
              }}
            >
              {settings.sectionTitles?.projects || 'KEY TECHNICAL PROJECTS & CASE STUDIES'}
            </h2>

            <div id="projectsList" className="space-y-2.5">
              {cvData.projects.map((proj, pIdx) => (
                <div
                  key={proj.id}
                  className={`project-item relative group/proj transition ${
                    proj.forcePageBreak ? 'force-page-break' : ''
                  }`}
                >
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <h3 className="proj-title font-bold text-slate-900 text-[1.03em]">
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="proj-link underline hover:text-blue-600"
                        contentEditable={settings.isEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newTitle = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => {
                            const newProj = [...prev.projects];
                            newProj[pIdx] = { ...newProj[pIdx], title: newTitle };
                            return { ...prev, projects: newProj };
                          });
                        }}
                      >
                        {proj.title}
                      </a>
                    </h3>
                    <span
                      className="proj-tech text-[0.92em] font-semibold italic theme-text"
                      contentEditable={settings.isEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newTech = e.currentTarget.innerText.trim();
                        onUpdateCVData((prev) => {
                          const newProj = [...prev.projects];
                          newProj[pIdx] = { ...newProj[pIdx], technologies: newTech };
                          return { ...prev, projects: newProj };
                        });
                      }}
                    >
                      {proj.technologies}
                    </span>
                  </div>
                  {isHighlightActive ? (
                    <p
                      className="proj-desc text-slate-700 mt-0.5 text-justify"
                      dangerouslySetInnerHTML={{ __html: highlightTextHtml(proj.description) }}
                    />
                  ) : (
                    <p
                      className="proj-desc text-slate-700 mt-0.5 text-justify"
                      contentEditable={effectiveEditMode}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newDesc = e.currentTarget.innerText.trim();
                        onUpdateCVData((prev) => {
                          const newProj = [...prev.projects];
                          newProj[pIdx] = { ...newProj[pIdx], description: newDesc };
                          return { ...prev, projects: newProj };
                        });
                      }}
                    >
                      {proj.description}
                    </p>
                  )}

                  {/* Project controls */}
                  <div className="builder-control opacity-0 group-hover/proj:opacity-100 absolute right-0 -top-1 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded text-[9px] shadow">
                    <button type="button" onClick={() => onOpenLinkModalForProject(proj.id, proj.title, proj.url)} className="text-blue-300 hover:underline">
                      🔗 Link
                    </button>
                    <button type="button" onClick={() => moveProject(pIdx, -1)} title="Move Up">
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" onClick={() => moveProject(pIdx, 1)} title="Move Down">
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" onClick={() => duplicateProject(pIdx)} title="Duplicate">
                      <CopyIcon className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" onClick={() => togglePageBreakProj(pIdx)} className="text-amber-300" title="Toggle Page Break">
                      ⤵
                    </button>
                    <button type="button" onClick={() => deleteProject(proj.id)} className="text-rose-400" title="Delete">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

        const educationContent = (
          <div>
            <h2
              className="cv-section-title"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateSettings({
                    sectionTitles: { ...(settings.sectionTitles || {}), credentials: val },
                  });
                }
              }}
            >
              {settings.sectionTitles?.credentials || 'EDUCATION'}
            </h2>
            <div id="educationBlock" className="space-y-1 text-slate-700">
              <div
                id="eduDegree"
                className="font-bold text-slate-900 text-[1.04em]"
                contentEditable={settings.isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  onUpdateCVData((prev) => ({
                    ...prev,
                    education: { ...prev.education, degree: val },
                  }));
                }}
              >
                {cvData.education.degree}
              </div>
              <div
                id="eduSchool"
                className="font-semibold theme-text"
                contentEditable={settings.isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  onUpdateCVData((prev) => ({
                    ...prev,
                    education: { ...prev.education, school: val },
                  }));
                }}
              >
                {cvData.education.school}
              </div>
              <div
                id="eduYear"
                className="text-[0.9em] text-slate-500 font-medium"
                contentEditable={settings.isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  onUpdateCVData((prev) => ({
                    ...prev,
                    education: { ...prev.education, year: val },
                  }));
                }}
              >
                {cvData.education.year} | {cvData.education.location}
              </div>
              <div
                id="eduModules"
                className="pt-1 text-slate-700"
                contentEditable={settings.isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  onUpdateCVData((prev) => ({
                    ...prev,
                    education: { ...prev.education, modules: val },
                  }));
                }}
              >
                {cvData.education.modules}
              </div>
            </div>
          </div>
        );

        const certificationsContent = (
          <div>
            <div className="flex items-center justify-between">
              <h2
                className="cv-section-title flex-1"
                contentEditable={settings.isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  if (val) {
                    onUpdateSettings({
                      sectionTitles: { ...(settings.sectionTitles || {}), certifications: val },
                    });
                  }
                }}
              >
                {settings.sectionTitles?.certifications || 'CERTIFICATIONS'}
              </h2>
              <button
                type="button"
                onClick={addCert}
                className="builder-control ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              >
                + Add
              </button>
            </div>
            <ul id="certificationsList" className="list-disc list-outside ml-4 space-y-1 text-slate-700">
              {cvData.certifications.map((cert, cIdx) => (
                <li key={cIdx} className="relative group/cert">
                  <span
                    contentEditable={settings.isEditMode}
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const val = e.currentTarget.innerText.trim();
                      onUpdateCVData((prev) => {
                        const newC = [...prev.certifications];
                        newC[cIdx] = val;
                        return { ...prev, certifications: newC };
                      });
                    }}
                  >
                    {cert}
                  </span>
                  <span className="builder-control hidden group-hover/cert:inline-flex items-center gap-0.5 bg-slate-900 text-white px-1 rounded text-[9px] ml-1">
                    <button type="button" onClick={() => moveCert(cIdx, -1)}>
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" onClick={() => moveCert(cIdx, 1)}>
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                    <button type="button" onClick={() => deleteCert(cIdx)} className="text-rose-400">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );

        const languagesContent = (
          <div>
            <h2
              className="cv-section-title"
              contentEditable={settings.isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateSettings({
                    sectionTitles: { ...(settings.sectionTitles || {}), languages: val },
                  });
                }
              }}
            >
              {settings.sectionTitles?.languages || 'LANGUAGES & CORE'}
            </h2>
            <div className="space-y-2 text-slate-700">
              <div>
                <div className="font-bold text-slate-900">Languages:</div>
                <div
                  id="cvLanguages"
                  contentEditable={settings.isEditMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextBlur('languages', e.currentTarget.innerText)}
                  className="whitespace-pre-line"
                >
                  {cvData.languages}
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-900">Key Strengths:</div>
                <div
                  id="cvStrengths"
                  contentEditable={settings.isEditMode}
                  suppressContentEditableWarning
                  onBlur={(e) => handleTextBlur('strengths', e.currentTarget.innerText)}
                >
                  {cvData.strengths}
                </div>
              </div>
            </div>
          </div>
        );

        const customSectionsBlock = cvData.customSections.map((sec, secIdx) => (
          <section
            key={sec.id}
            className={`cv-section group/sec ${sec.forcePageBreak ? 'force-page-break' : ''}`}
          >
            <div className="builder-control opacity-0 group-hover/sec:opacity-100 absolute right-0 -top-2 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-20">
              {sec.type !== 'paragraph' && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCVData((prev) => {
                      const next = prev.customSections.map((s, idx) =>
                        idx === secIdx
                          ? {
                              ...s,
                              content: [
                                ...s.content,
                                sec.type === 'references'
                                  ? '<strong>New Reference:</strong> Designation, Organization | Email | Phone'
                                  : '<strong>Highlight:</strong> Describe key outcome or certification...',
                              ],
                            }
                          : s
                      );
                      return { ...prev, customSections: next };
                    });
                  }}
                  className="hover:text-emerald-300 flex items-center gap-0.5 font-semibold pr-1 border-r border-slate-700"
                  title="Add New Item"
                >
                  <Plus className="w-2.5 h-2.5" /> Item
                </button>
              )}
              <button
                type="button"
                disabled={secIdx === 0}
                onClick={() => {
                  if (secIdx === 0) return;
                  onUpdateCVData((prev) => {
                    const next = [...prev.customSections];
                    [next[secIdx - 1], next[secIdx]] = [next[secIdx], next[secIdx - 1]];
                    return { ...prev, customSections: next };
                  });
                }}
                className="hover:text-cyan-300 disabled:opacity-30"
                title="Move Custom Section Up"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={secIdx === cvData.customSections.length - 1}
                onClick={() => {
                  if (secIdx >= cvData.customSections.length - 1) return;
                  onUpdateCVData((prev) => {
                    const next = [...prev.customSections];
                    [next[secIdx], next[secIdx + 1]] = [next[secIdx + 1], next[secIdx]];
                    return { ...prev, customSections: next };
                  });
                }}
                className="hover:text-cyan-300 disabled:opacity-30"
                title="Move Custom Section Down"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCVData((prev) => ({
                    ...prev,
                    customSections: prev.customSections.map((s) =>
                      s.id === sec.id ? { ...s, forcePageBreak: !s.forcePageBreak } : s
                    ),
                  }));
                }}
                className={`px-1 rounded ${
                  sec.forcePageBreak ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:text-amber-300'
                }`}
                title="Toggle Page Break Before This Section"
              >
                <Scissors className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCVData((prev) => ({
                    ...prev,
                    customSections: prev.customSections.filter((s) => s.id !== sec.id),
                  }));
                }}
                className="text-rose-400 hover:text-rose-300 ml-0.5"
                title="Delete Custom Section"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <h2
              className="cv-section-title"
              contentEditable={settings.isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                const val = e.currentTarget.innerText.trim();
                if (val) {
                  onUpdateCVData((prev) => ({
                    ...prev,
                    customSections: prev.customSections.map((s, idx) =>
                      idx === secIdx ? { ...s, title: val } : s
                    ),
                  }));
                }
              }}
            >
              {sec.title}
            </h2>
            {sec.type === 'bullets' || sec.type === 'references' ? (
              <ul
                className={
                  sec.type === 'references'
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 list-none ml-0 text-slate-700'
                    : 'exp-bullets list-outside ml-4 space-y-1 text-slate-700'
                }
              >
                {sec.content.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className={`relative group/citem ${
                      sec.type === 'references'
                        ? 'p-2 rounded border border-slate-200 bg-slate-50/70'
                        : ''
                    }`}
                  >
                    <span
                      contentEditable={settings.isEditMode}
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: item }}
                      onBlur={(e) => {
                        const val = e.currentTarget.innerHTML.trim();
                        onUpdateCVData((prev) => {
                          const newSections = prev.customSections.map((s, sIdx) => {
                            if (sIdx !== secIdx) return s;
                            const nextContent = [...s.content];
                            nextContent[itemIdx] = val;
                            return { ...s, content: nextContent };
                          });
                          return { ...prev, customSections: newSections };
                        });
                      }}
                    />
                    {sec.content.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateCVData((prev) => ({
                            ...prev,
                            customSections: prev.customSections.map((s, sIdx) =>
                              sIdx === secIdx
                                ? { ...s, content: s.content.filter((_, i) => i !== itemIdx) }
                                : s
                            ),
                          }));
                        }}
                        className="builder-control hidden group-hover/citem:inline-flex ml-1.5 text-rose-500 hover:text-rose-700 align-middle"
                        title="Remove Item"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p
                contentEditable={settings.isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  const val = e.currentTarget.innerText.trim();
                  onUpdateCVData((prev) => {
                    const newSections = prev.customSections.map((s, sIdx) =>
                      sIdx === secIdx ? { ...s, content: [val] } : s
                    );
                    return { ...prev, customSections: newSections };
                  });
                }}
                className="text-slate-700 text-justify"
              >
                {sec.content.join(' ')}
              </p>
            )}
          </section>
        ));

        const defaultOrder: CVSectionId[] = [
          'summary',
          'skills',
          'experience',
          'projects',
          'credentials',
        ];
        const currentOrder =
          settings.sectionOrder && settings.sectionOrder.length === 5
            ? settings.sectionOrder
            : defaultOrder;
        const hiddenSet = new Set<CVSectionId>(settings.hiddenSections || []);

        const sectionLabels: Record<CVSectionId, string> = {
          summary: 'Professional Summary',
          skills: 'Core Technical Skills',
          experience: 'Professional Experience',
          projects: 'Technical Projects',
          credentials: 'Education, Certs & Languages',
        };

        function moveMainSection(secId: CVSectionId, dir: -1 | 1) {
          const idx = currentOrder.indexOf(secId);
          const targetIdx = idx + dir;
          if (idx < 0 || targetIdx < 0 || targetIdx >= currentOrder.length) return;
          const next = [...currentOrder];
          const tmp = next[idx];
          next[idx] = next[targetIdx];
          next[targetIdx] = tmp;
          onUpdateSettings({ sectionOrder: next });
        }

        function toggleHideSection(secId: CVSectionId) {
          const next = new Set(hiddenSet);
          if (next.has(secId)) {
            next.delete(secId);
          } else {
            next.add(secId);
          }
          onUpdateSettings({ hiddenSections: Array.from(next) });
        }

        const sectionMap: Record<CVSectionId, React.ReactNode> = {
          summary: summarySection,
          skills: skillsSection,
          experience: experienceSection,
          projects: projectsSection,
          credentials: (
            <section className="cv-section group/sec cv-keep-together" data-section-id="credentials">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-4">{educationContent}</div>
                <div className="md:col-span-5">{certificationsContent}</div>
                <div className="md:col-span-3">{languagesContent}</div>
              </div>
            </section>
          ),
        };

        const sidebarSet = new Set<CVSectionId>(
          settings.sidebarSections && settings.sidebarSections.length > 0
            ? settings.sidebarSections
            : ['skills', 'credentials']
        );

        const sidebarSectionMap: Record<CVSectionId, React.ReactNode> = {
          summary: summarySection,
          skills: skillsSection,
          experience: experienceSection,
          projects: projectsSection,
          credentials: (
            <div className="space-y-4">
              <section className="cv-section" data-section-id="credentials-edu">
                {educationContent}
              </section>
              <section className="cv-section" data-section-id="credentials-certs">
                {certificationsContent}
              </section>
              <section className="cv-section" data-section-id="credentials-lang">
                {languagesContent}
              </section>
            </div>
          ),
        };

        return (
          <div id="cvSectionsContainer">
            {isTwoCol ? (
              <>
                <div className="cv-side-col space-y-4">
                  {currentOrder
                    .filter((id) => sidebarSet.has(id) && !hiddenSet.has(id))
                    .map((id) => (
                      <div key={id}>{sidebarSectionMap[id]}</div>
                    ))}
                </div>
                <div className="cv-main-col space-y-3">
                  {currentOrder
                    .filter((id) => !sidebarSet.has(id) && !hiddenSet.has(id))
                    .map((id) => (
                      <div key={id}>{sectionMap[id]}</div>
                    ))}
                  {customSectionsBlock}
                </div>
              </>
            ) : (
              <>
                {currentOrder.map((secId, sIdx) => {
                  const isHidden = hiddenSet.has(secId);
                  if (isHidden) {
                    return settings.isEditMode ? (
                      <div
                        key={secId}
                        className="builder-control my-1.5 px-3 py-1 rounded border border-dashed border-slate-300 bg-slate-50 text-[10.5px] text-slate-500 flex items-center justify-between"
                      >
                        <span>Hidden Section: {sectionLabels[secId]}</span>
                        <button
                          type="button"
                          onClick={() => toggleHideSection(secId)}
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Show Section
                        </button>
                      </div>
                    ) : null;
                  }

                  return (
                    <div key={secId} className="relative group/wrap">
                      <div className="builder-control opacity-0 group-hover/wrap:opacity-100 absolute -left-7 top-3 flex flex-col gap-0.5 bg-slate-900 text-white p-0.5 rounded shadow z-20 text-[9px]">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => moveMainSection(secId, -1)}
                          className="p-0.5 hover:text-blue-300 disabled:opacity-30"
                          title="Move Section Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === currentOrder.length - 1}
                          onClick={() => moveMainSection(secId, 1)}
                          className="p-0.5 hover:text-blue-300 disabled:opacity-30"
                          title="Move Section Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleHideSection(secId)}
                          className="p-0.5 text-amber-300 hover:text-amber-200"
                          title="Hide Section (Keep Content)"
                        >
                          <EyeOff className="w-3 h-3" />
                        </button>
                      </div>
                      {sectionMap[secId]}
                    </div>
                  );
                })}
                {customSectionsBlock}
              </>
            )}
          </div>
        );
      })()}

      {/* ================= DECLARATION & DIGITAL SIGNATURE ================= */}
      {settings.signature?.enabled && (
        <section className="cv-section mt-5 pt-3 border-t border-slate-200 cv-keep-together">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
              DECLARATION & SIGNATURE
            </h2>
            <button
              type="button"
              onClick={onOpenSignatureModal}
              className="builder-control text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <PenTool className="w-3 h-3" /> Edit Signature
            </button>
          </div>
          {settings.signature.showDeclaration && (
            <p className="text-[11.5px] text-slate-600 leading-relaxed text-justify mb-3 italic">
              "{settings.signature.declarationText}"
            </p>
          )}
          <div className="flex justify-between items-end pt-2">
            <div className="text-[11px] text-slate-600 space-y-0.5">
              <div>
                <strong>Date:</strong> {settings.signature.date}
              </div>
              <div>
                <strong>Place:</strong> Chattogram, Bangladesh
              </div>
            </div>
            <div className="text-right">
              {settings.signature.image ? (
                <div className="inline-block border-b border-slate-400 pb-1 mb-1">
                  <img
                    src={settings.signature.image}
                    alt="Digital Signature"
                    className="h-10 max-w-[150px] object-contain ml-auto"
                  />
                </div>
              ) : (
                <div
                  onClick={onOpenSignatureModal}
                  className="cursor-pointer border-b border-dashed border-slate-400 pb-1 mb-1 text-[11px] text-blue-600 hover:text-blue-800 italic"
                >
                  Click to draw signature ✍️
                </div>
              )}
              <div className="font-bold text-xs text-slate-800 uppercase tracking-tight">
                {settings.signature.name || cvData.name}
              </div>
              <div className="text-[10px] text-slate-500">Candidate Signature</div>
            </div>
          </div>
        </section>
      )}

      {/* ================= FOOTER ================= */}
      {settings.showFooter !== false && (
        <footer className="mt-6 pt-2 border-t border-slate-200 flex items-center justify-between text-[10.5px] text-slate-400">
          <span
            id="cvFooterLeft"
            contentEditable={effectiveEditMode}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateSettings({ footerNote: e.currentTarget.innerText.trim() })}
          >
            {settings.footerNote || `${cvData.name} - Executive Master Technical CV`}
          </span>

          {/* QR Code in Footer (if enabled) */}
          {settings.qrCode?.enabled && settings.qrCode?.position === 'footer' && qrDataUrl && (
            <div className="flex items-center gap-2">
              <img
                src={qrDataUrl}
                alt="QR Code"
                style={{ width: '42px', height: '42px' }}
                className="object-contain"
              />
              <span className="text-[9px] font-bold text-slate-500 uppercase">
                {settings.qrCode.label || 'Scan Portfolio'}
              </span>
            </div>
          )}

          {settings.showFooterPageNum !== false && (
            <span
              id="cvFooterRight"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateSettings({ footerRightText: e.currentTarget.innerText.trim() })}
            >
              {settings.footerRightText || `Page 1 of ${estimatedPages}`}
            </span>
          )}
        </footer>
      )}
    </div>
  );
}
