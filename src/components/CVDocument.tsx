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
  Sparkles,
  ShieldCheck,
  Smile,
  Ban,
  GripVertical,
} from 'lucide-react';
import { CVData, CVSectionId, StudioSettings } from '../types/cv';
import { compressImageFileToDataUrl } from '../utils/imageCompress';
import { sanitizeHref, sanitizeRichTextHtml } from '../utils/sanitizeHtml';
import { getContactIcon } from '../utils/contactIcon';
import { getExperienceDateLabel } from '../utils/experienceDate';

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
  onOpenAddSectionModal?: () => void;
  onOpenBulletLibraryModal?: (expIdx: number, roleTitle: string) => void;
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
  onOpenAddSectionModal,
  onOpenBulletLibraryModal,
}: CVDocumentProps) {
  const isHighlightActive = jdHighlightKeywords.length > 0;
  const effectiveEditMode = settings.isEditMode && !isHighlightActive;

  // Drag and Drop States
  const [draggingExpIdx, setDraggingExpIdx] = useState<number | null>(null);
  const [dragOverExpIdx, setDragOverExpIdx] = useState<number | null>(null);
  const [draggingSecId, setDraggingSecId] = useState<CVSectionId | null>(null);
  const [dragOverSecId, setDragOverSecId] = useState<CVSectionId | null>(null);
  const [draggingCsIdx, setDraggingCsIdx] = useState<number | null>(null);
  const [dragOverCsIdx, setDragOverCsIdx] = useState<number | null>(null);

  function highlightTextHtml(raw: string, isHtml = false): string {
    const base = isHtml
      ? sanitizeRichTextHtml(raw)
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
  const [activeTouchKey, setActiveTouchKey] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveEditMode) {
      setActiveTouchKey(null);
    }
  }, [effectiveEditMode]);

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
      : settings.template === 'nordic-emerald'
      ? 'tpl-nordic-emerald'
      : settings.template === 'royal-indigo'
      ? 'tpl-royal-indigo'
      : settings.template === 'elite-crimson'
      ? 'tpl-elite-crimson'
      : settings.template === 'wallstreet-ats'
      ? 'tpl-wallstreet-ats'
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

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const compactUrl = await compressImageFileToDataUrl(file);
      onUpdateSettings({ photoSrc: compactUrl });
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onUpdateSettings({ photoSrc: event.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
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

  function autoHighlightKeyMetrics() {
    const targetPhrases = [
      '50,000+',
      '80+',
      '100+',
      '4+',
      '99.9%',
      '100%',
      'REST API',
      'Power BI',
      'PostgreSQL',
      'Star Schema',
      'Jira',
      'Postman',
    ];
    onUpdateCVData((prev) => {
      const updatedExperiences = prev.experiences.map((exp) => ({
        ...exp,
        bullets: exp.bullets.map((b) => {
          let text = b.text;
          targetPhrases.forEach((phrase) => {
            if (text.includes(phrase) && !text.includes(`<strong>${phrase}</strong>`)) {
              text = text.split(phrase).join(`<strong>${phrase}</strong>`);
            }
          });
          return { ...b, text };
        }),
      }));
      return { ...prev, experiences: updatedExperiences };
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

  // Effective Header & Name Alignment (Supports Left, Center, Right, and Split Corporate)
  const isHeaderSplit = settings.headerLayout === 'split' || settings.headerAlign === 'split';

  const effectiveNameAlign: 'left' | 'center' | 'right' =
    settings.nameAlign && settings.nameAlign !== 'auto'
      ? settings.nameAlign
      : isHeaderSplit
      ? 'left'
      : settings.headerAlign === 'center' || settings.headerAlign === 'right' || settings.headerAlign === 'left'
      ? settings.headerAlign
      : settings.photoPosition === 'center'
      ? 'center'
      : 'left';

  const effectiveContactAlign: 'left' | 'center' | 'right' =
    settings.contactAlign && settings.contactAlign !== 'auto'
      ? settings.contactAlign
      : isHeaderSplit
      ? 'right'
      : settings.headerAlign === 'center' || settings.headerAlign === 'right' || settings.headerAlign === 'left'
      ? settings.headerAlign
      : settings.photoPosition === 'center'
      ? 'center'
      : 'left';

  const nameTextAlignClass =
    effectiveNameAlign === 'center'
      ? 'text-center'
      : effectiveNameAlign === 'right'
      ? 'text-right'
      : 'text-left';

  const contactJustifyClass =
    effectiveContactAlign === 'center'
      ? 'justify-center'
      : effectiveContactAlign === 'right'
      ? 'justify-end'
      : 'justify-start';

  const headerLayoutClass =
    settings.photoPosition === 'right'
      ? 'cv-header-right flex-row-reverse items-start justify-between'
      : settings.photoPosition === 'left'
      ? 'cv-header-left flex-row items-start justify-between'
      : settings.photoPosition === 'center'
      ? 'flex-col items-center text-center'
      : isHeaderSplit
      ? 'flex-row items-start justify-between'
      : effectiveNameAlign === 'center'
      ? 'flex-col items-center'
      : effectiveNameAlign === 'right'
      ? 'flex-col items-end'
      : 'flex-col items-start';

  const textAlignmentClass = isHeaderSplit
    ? 'flex flex-col sm:flex-row sm:items-end justify-between gap-3 w-full'
    : `w-full flex flex-col ${
        effectiveNameAlign === 'center'
          ? 'items-center text-center'
          : effectiveNameAlign === 'right'
          ? 'items-end text-right'
          : 'items-start text-left'
      }`;

  const contactAlignmentClass = isHeaderSplit
    ? `flex flex-wrap items-center ${contactJustifyClass} gap-x-3 gap-y-1.5 text-[12px] max-w-full sm:max-w-[62%]`
    : `mt-2.5 flex flex-wrap items-center ${contactJustifyClass} gap-x-4 gap-y-1.5 text-[12px] w-full`;

  const customTextClass =
    settings.cvTextColor && settings.cvTextColor !== '#1e293b' ? 'custom-text-color' : '';

  return (
    <div
      id="cvDocument"
      className={`cv-document ${templateClass} ${headerDarkBanner} ${bodyColClass} ${secHeadingClass} ${customTextClass}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveTouchKey(null);
      }}
    >
      {isHighlightActive && (
        <div className="builder-control no-print mb-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-center justify-between gap-2">
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
        className={`relative group/hdr flex gap-5 transition-all ${
          settings.showHeaderDivider !== false ? 'pb-3.5 border-b-2 theme-border' : 'pb-2'
        } ${headerLayoutClass}`}
      >
        {/* Quick Floating Alignment Bar (Direct on Canvas in Edit Mode, neatly at top-right of Header) */}
        {effectiveEditMode && (
          <div className="builder-control no-print hidden group-hover/hdr:flex absolute right-0 -top-5 items-center gap-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-md shadow-xl text-[10px] z-40 border border-slate-700/80">
            <span className="text-slate-400 font-medium mr-0.5">Align:</span>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  headerAlign: 'left',
                  nameAlign: 'left',
                  contactAlign: 'left',
                  headerLayout: 'stacked',
                })
              }
              className={`px-1.5 py-0.5 rounded transition ${
                effectiveNameAlign === 'left' && !isHeaderSplit
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Align Header Left"
            >
              Left
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  headerAlign: 'center',
                  nameAlign: 'center',
                  contactAlign: 'center',
                  headerLayout: 'stacked',
                })
              }
              className={`px-1.5 py-0.5 rounded transition ${
                effectiveNameAlign === 'center' && !isHeaderSplit
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Align Header Center"
            >
              Center
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  headerAlign: 'right',
                  nameAlign: 'right',
                  contactAlign: 'right',
                  headerLayout: 'stacked',
                })
              }
              className={`px-1.5 py-0.5 rounded transition ${
                effectiveNameAlign === 'right' && !isHeaderSplit
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Align Header Right"
            >
              Right
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  headerAlign: 'split',
                  headerLayout: 'split',
                  nameAlign: 'left',
                  contactAlign: 'right',
                })
              }
              className={`px-1.5 py-0.5 rounded transition ${
                isHeaderSplit
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Corporate Split: Name on Left, Contacts on Right"
            >
              Split (L+R)
            </button>
          </div>
        )}
        {/* QR Code in Header (if enabled) */}
        {settings.qrCode?.enabled && settings.qrCode?.position === 'header' && qrDataUrl && (
          <div className="shrink-0 flex flex-col items-center justify-center p-1.5 rounded-lg border border-slate-200 bg-white shadow-sm text-center">
            <a
              href={sanitizeHref(settings.qrCode.url) || undefined}
              target="_blank"
              rel="noreferrer"
              title="Click or Scan with Mobile"
            >
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
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer?.files?.[0];
              if (file && file.type.startsWith('image/')) {
                try {
                  const compactUrl = await compressImageFileToDataUrl(file);
                  onUpdateSettings({ photoSrc: compactUrl });
                } catch {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    if (typeof ev.target?.result === 'string') {
                      onUpdateSettings({ photoSrc: ev.target.result });
                    }
                  };
                  reader.readAsDataURL(file);
                }
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
            {effectiveEditMode && (
              <span
                aria-hidden="true"
                className="builder-control no-print photo-touch-badge hidden absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-slate-950/85 border border-blue-400/60 text-blue-300 items-center justify-center shadow-lg pointer-events-none"
              >
                <Camera className="w-3.5 h-3.5" />
              </span>
            )}
            <label className="builder-control no-print photo-hover-overlay absolute inset-0 bg-slate-900/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium cursor-pointer p-1.5 text-center">
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
        <div id="headerTextContainer" className={`relative ${textAlignmentClass}`}>
          <div
            className={`identity-block ${
              isHeaderSplit ? 'min-w-[200px] shrink-0 text-left' : `w-full ${nameTextAlignClass}`
            }`}
          >
            <h1
              id="cvName"
              contentEditable={effectiveEditMode}
              suppressContentEditableWarning
              onBlur={(e) => handleTextBlur('name', e.currentTarget.innerText)}
              className="text-[28px] font-extrabold tracking-tight text-slate-900 uppercase leading-tight"
            >
              {cvData.name}
            </h1>
            {settings.showTitle !== false && (
              <p
                id="cvTitle"
                contentEditable={effectiveEditMode}
                suppressContentEditableWarning
                onBlur={(e) => handleTextBlur('title', e.currentTarget.innerText)}
                className="text-[13.5px] font-bold theme-text tracking-wide uppercase mt-0.5"
              >
                {cvData.title}
              </p>
            )}
          </div>

          {/* Granular Contact Items */}
          {settings.showContacts !== false && (
          <div id="contactItemsList" className={contactAlignmentClass}>
            {cvData.contacts.map((item, index) => {
              const showIcons =
                settings.showContactIcons !== false &&
                settings.template !== 'strict-ats' &&
                settings.template !== 'wallstreet-ats';
              const rawIcon = getContactIcon(item);
              const iconText = showIcons ? rawIcon : '';

              return (
                <React.Fragment key={item.id}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (effectiveEditMode) setActiveTouchKey(`c:${item.id}`);
                    }}
                    className={`contact-item relative group/citem inline-flex items-center ${
                      iconText ? 'gap-1.5' : 'gap-0'
                    } ${activeTouchKey === `c:${item.id}` ? 'cv-touch-active' : ''}`}
                    data-type={item.type}
                  >
                    {Boolean(iconText) && (
                      <span
                        className="contact-icon theme-text"
                        contentEditable={effectiveEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const icon = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => ({
                            ...prev,
                            contacts: prev.contacts.map((contact) =>
                              contact.id === item.id ? { ...contact, icon: icon || '' } : contact
                            ),
                          }));
                        }}
                        title={effectiveEditMode ? 'Edit contact icon' : undefined}
                        aria-label={`Icon for ${item.label}`}
                      >
                        {iconText}
                      </span>
                    )}
                    <a
                      href={sanitizeHref(item.url) || undefined}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (effectiveEditMode) e.preventDefault();
                      }}
                      className="contact-link font-medium"
                      contentEditable={effectiveEditMode}
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

                    {/* Individual Contact Controls (positioned safely below contact text) */}
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="builder-control no-print hidden group-hover/citem:flex absolute -bottom-5 left-0 items-center gap-0.5 bg-slate-900/95 text-white px-1.5 py-0.5 rounded text-[9px] shadow-md z-30"
                    >
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
                      {showIcons && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateCVData((prev) => ({
                              ...prev,
                              contacts: prev.contacts.map((c) =>
                                c.id === item.id
                                  ? { ...c, icon: (c.icon === '' || c.icon === 'none') ? undefined : '' }
                                  : c
                              ),
                            }));
                          }}
                          className="hover:text-amber-300"
                          title={
                            item.icon === '' || item.icon === 'none'
                              ? 'Restore Icon'
                              : 'Remove Icon (Zero Ghost Space)'
                          }
                        >
                          {item.icon === '' || item.icon === 'none' ? (
                            <Smile className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Ban className="w-3 h-3 text-amber-300" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteContact(item.id)}
                        className="text-rose-400 hover:text-rose-300"
                        title="Delete entire contact item (icon, label, and link)"
                        aria-label={`Delete entire contact item: ${item.label}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {index < cvData.contacts.length - 1 &&
                    settings.contactSeparator &&
                    settings.contactSeparator !== 'none' && (
                      <span
                        aria-hidden="true"
                        className="contact-separator text-slate-400 font-normal select-none px-0.5"
                      >
                        {settings.contactSeparator === 'dot'
                          ? '·'
                          : settings.contactSeparator === 'pipe'
                          ? '|'
                          : '/'}
                      </span>
                    )}
                </React.Fragment>
              );
            })}
          </div>
          )}
        </div>
      </header>
      )}

      {/* ================= SECTIONS CONTAINER ================= */}
      {(() => {
        const summarySection = (
          <section className="cv-section group/sec" data-section-id="summary">
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
            <div className="cv-section-header-bar builder-control no-print hidden group-hover/sec:flex absolute right-0 -top-5 items-center gap-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-30">
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
                  <tr
                    key={row.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (effectiveEditMode) setActiveTouchKey(`s:${row.id}`);
                    }}
                    className={`group/row ${activeTouchKey === `s:${row.id}` ? 'cv-touch-active' : ''}`}
                  >
                    <td>
                      <div
                        contentEditable={effectiveEditMode}
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
                      {settings.skillsMode === 'dots' && (() => {
                        const rating = index === 0 ? 5 : index <= 2 ? 5 : 4;
                        return (
                          <div className="flex items-center gap-1 mt-1 mb-0.5" title={`Proficiency: ${rating}/5`}>
                            {[1, 2, 3, 4, 5].map((dot) => {
                              const isFilled = dot <= rating;
                              return (
                                <span
                                  key={dot}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isFilled ? 'theme-bg' : 'bg-slate-300'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        );
                      })()}
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

                      <div
                        onMouseDown={(e) => e.preventDefault()}
                        className={`builder-control no-print hidden group-hover/row:flex absolute -top-3.5 right-1 items-center gap-1 bg-slate-900/95 text-white px-1.5 py-0.5 rounded shadow-md text-[9px] z-30 ${
                          activeTouchKey === `s:${row.id}` ? '!flex' : ''
                        }`}
                      >
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
            <div className="cv-section-header-bar builder-control no-print hidden group-hover/sec:flex absolute right-0 -top-5 items-center gap-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-30">
              <button
                type="button"
                onClick={autoHighlightKeyMetrics}
                className="text-amber-300 hover:text-amber-200 px-1 font-semibold flex items-center gap-1 transition"
                title="Auto-bold quantifiable metrics (50,000+, 80+, 100+, etc.) for ATS & recruiters"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Auto-Bold Metrics
              </button>
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

            <div
              id="experienceList"
              className={`space-y-3.5 ${settings.showTimelineRail ? 'cv-timeline-rail' : ''}`}
            >
              {cvData.experiences.map((exp, expIdx) => (
                <div
                  key={exp.id}
                  draggable={effectiveEditMode}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/exp-idx', String(expIdx));
                    e.dataTransfer.effectAllowed = 'move';
                    setDraggingExpIdx(expIdx);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverExpIdx !== expIdx) setDragOverExpIdx(expIdx);
                  }}
                  onDragLeave={() => {
                    if (dragOverExpIdx === expIdx) setDragOverExpIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const srcStr = e.dataTransfer.getData('text/exp-idx');
                    const srcIdx = parseInt(srcStr, 10);
                    if (!isNaN(srcIdx) && srcIdx !== expIdx) {
                      onUpdateCVData((prev) => {
                        const nextExp = [...prev.experiences];
                        const [moved] = nextExp.splice(srcIdx, 1);
                        nextExp.splice(expIdx, 0, moved);
                        return { ...prev, experiences: nextExp };
                      });
                    }
                    setDraggingExpIdx(null);
                    setDragOverExpIdx(null);
                  }}
                  onDragEnd={() => {
                    setDraggingExpIdx(null);
                    setDragOverExpIdx(null);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (effectiveEditMode) setActiveTouchKey(`e:${exp.id}`);
                  }}
                  className={`experience-item relative group/item rounded-lg transition ${
                    exp.forcePageBreak ? 'force-page-break' : ''
                  } ${activeTouchKey === `e:${exp.id}` ? 'cv-touch-active' : ''} ${
                    draggingExpIdx === expIdx ? 'opacity-40 scale-[0.99] border-2 border-dashed border-blue-400' : ''
                  } ${dragOverExpIdx === expIdx && draggingExpIdx !== expIdx ? 'border-t-2 border-blue-500 bg-blue-50/20' : ''}`}
                >
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <div className="font-bold text-slate-900 text-[1.05em]">
                      <span
                        className="exp-role"
                        contentEditable={effectiveEditMode}
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
                        contentEditable={effectiveEditMode}
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
                    <div className="exp-date text-[0.92em] font-semibold text-slate-600">
                      <span
                        contentEditable={effectiveEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const date = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => ({
                            ...prev,
                            experiences: prev.experiences.map((item, i) =>
                              i === expIdx ? { ...item, date } : item
                            ),
                          }));
                        }}
                        aria-label={`Date for ${exp.role}`}
                      >
                        {getExperienceDateLabel(exp)}
                      </span>
                      {exp.location && ' | '}
                      <span
                        contentEditable={effectiveEditMode}
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const location = e.currentTarget.innerText.trim();
                          onUpdateCVData((prev) => ({
                            ...prev,
                            experiences: prev.experiences.map((item, i) =>
                              i === expIdx
                                ? { ...item, date: getExperienceDateLabel(item), location }
                                : item
                            ),
                          }));
                        }}
                        aria-label={`Location for ${exp.role}`}
                      >
                        {exp.location}
                      </span>
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="exp-bullets list-outside ml-4 mt-1.5 space-y-1 text-slate-700">
                    {exp.bullets.map((b, bIdx) => (
                      <li
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (effectiveEditMode) setActiveTouchKey(`b:${b.id}`);
                        }}
                        className={`relative group/bullet ${
                          activeTouchKey === `b:${b.id}` ? 'cv-touch-active' : ''
                        }`}
                      >
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
                        <span
                          onMouseDown={(e) => e.preventDefault()}
                          className="builder-control no-print hidden group-hover/bullet:flex absolute -top-4 right-0 items-center gap-1 bg-slate-900/95 text-white px-1.5 py-0.5 rounded text-[9px] shadow-md z-30"
                        >
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

                  {/* Role item bar (out of normal flow so unhovered role height is 100% true-to-print) */}
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className={`builder-control no-print hidden group-hover/item:flex absolute -bottom-3.5 right-0 flex-wrap items-center gap-2 text-[10px] bg-slate-900/95 text-slate-100 px-2.5 py-0.5 rounded-md border border-slate-700 shadow-lg z-30 ${
                      activeTouchKey === `e:${exp.id}` ? '!flex' : ''
                    }`}
                  >
                    <span
                      className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white p-0.5 inline-flex items-center"
                      title="Drag to reorder role position"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenBulletLibraryModal?.(expIdx, `${exp.role} (${exp.company})`)}
                      className="text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1"
                      title="Open Pre-written action bullet points library"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" /> Bullets Library
                    </button>
                    <button type="button" onClick={() => addBullet(expIdx)} className="text-emerald-300 hover:underline font-semibold">
                      + Bullet
                    </button>
                    <button type="button" onClick={() => moveExperience(expIdx, -1)} className="text-slate-300 hover:text-blue-300">
                      ▲ Up
                    </button>
                    <button type="button" onClick={() => moveExperience(expIdx, 1)} className="text-slate-300 hover:text-blue-300">
                      ▼ Down
                    </button>
                    <button type="button" onClick={() => togglePageBreakExp(expIdx)} className="text-cyan-300 hover:underline font-semibold flex items-center gap-0.5">
                      <Scissors className="w-3 h-3" /> Page 2 Break
                    </button>
                    <button type="button" onClick={() => deleteExperience(exp.id)} className="text-rose-400 hover:underline flex items-center gap-0.5">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

        const projectsSection = (
          <section className="cv-section group/sec" data-section-id="projects">
            <div className="cv-section-header-bar builder-control no-print hidden group-hover/sec:flex absolute right-0 -top-5 items-center gap-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-30">
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

            <div
              id="projectsList"
              className={
                settings.projectLayout === 'compact-grid'
                  ? 'projects-compact-grid gap-3'
                  : 'space-y-2.5'
              }
            >
              {cvData.projects.map((proj, pIdx) => (
                <div
                  key={proj.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (effectiveEditMode) setActiveTouchKey(`p:${proj.id}`);
                  }}
                  className={`project-item relative group/proj transition ${
                    proj.forcePageBreak ? 'force-page-break' : ''
                  } ${activeTouchKey === `p:${proj.id}` ? 'cv-touch-active' : ''}`}
                >
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <h3 className="proj-title font-bold text-slate-900 text-[1.03em]">
                      <a
                        href={sanitizeHref(proj.url) || undefined}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (effectiveEditMode) e.preventDefault();
                        }}
                        className="proj-link underline hover:text-blue-600"
                        contentEditable={effectiveEditMode}
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
                      contentEditable={effectiveEditMode}
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
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className={`builder-control no-print hidden group-hover/proj:flex absolute right-0 -bottom-3.5 items-center gap-1.5 bg-slate-900/95 text-white px-2 py-0.5 rounded-md text-[9.5px] shadow-lg z-30 ${
                      activeTouchKey === `p:${proj.id}` ? '!flex' : ''
                    }`}
                  >
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
                contentEditable={effectiveEditMode}
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
                contentEditable={effectiveEditMode}
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
                contentEditable={effectiveEditMode}
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
                contentEditable={effectiveEditMode}
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
                contentEditable={effectiveEditMode}
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
                className="builder-control no-print cv-section-touch-add ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shrink-0"
              >
                + Add
              </button>
            </div>
            <ul id="certificationsList" className="list-disc list-outside ml-4 space-y-1 text-slate-700">
              {cvData.certifications.map((cert, cIdx) => (
                <li
                  key={cIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (effectiveEditMode) setActiveTouchKey(`cert:${cIdx}`);
                  }}
                  className={`relative group/cert ${
                    activeTouchKey === `cert:${cIdx}` ? 'cv-touch-active' : ''
                  }`}
                >
                  <span
                    contentEditable={effectiveEditMode}
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
                  <span
                    onMouseDown={(e) => e.preventDefault()}
                    className="builder-control no-print hidden group-hover/cert:flex absolute -top-4 right-0 items-center gap-0.5 bg-slate-900/95 text-white px-1.5 py-0.5 rounded text-[9px] shadow-md z-30"
                  >
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
              contentEditable={effectiveEditMode}
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
                  contentEditable={effectiveEditMode}
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
                  contentEditable={effectiveEditMode}
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
            draggable={effectiveEditMode}
            onDragStart={(e) => {
              e.dataTransfer.setData('text/cs-idx', String(secIdx));
              e.dataTransfer.effectAllowed = 'move';
              setDraggingCsIdx(secIdx);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverCsIdx !== secIdx) setDragOverCsIdx(secIdx);
            }}
            onDragLeave={() => {
              if (dragOverCsIdx === secIdx) setDragOverCsIdx(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const srcStr = e.dataTransfer.getData('text/cs-idx');
              const srcIdx = parseInt(srcStr, 10);
              if (!isNaN(srcIdx) && srcIdx !== secIdx) {
                onUpdateCVData((prev) => {
                  const next = [...prev.customSections];
                  const [m] = next.splice(srcIdx, 1);
                  next.splice(secIdx, 0, m);
                  return { ...prev, customSections: next };
                });
              }
              setDraggingCsIdx(null);
              setDragOverCsIdx(null);
            }}
            onDragEnd={() => {
              setDraggingCsIdx(null);
              setDragOverCsIdx(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (effectiveEditMode) setActiveTouchKey(`cs:${sec.id}`);
            }}
            className={`cv-section group/sec transition ${sec.forcePageBreak ? 'force-page-break' : ''} ${
              activeTouchKey === `cs:${sec.id}` ? 'cv-touch-active' : ''
            } ${draggingCsIdx === secIdx ? 'opacity-40 scale-[0.99] border-2 border-dashed border-cyan-400' : ''} ${
              dragOverCsIdx === secIdx && draggingCsIdx !== secIdx ? 'border-t-2 border-cyan-500 bg-cyan-50/20' : ''
            }`}
          >
            <div
              onMouseDown={(e) => {
                if (e.target instanceof HTMLElement && e.target.closest('select')) return;
                e.preventDefault();
              }}
              className="cv-section-header-bar builder-control no-print hidden group-hover/sec:flex absolute right-0 -top-5 items-center gap-1 bg-slate-900/95 text-white px-2 py-0.5 rounded-md shadow-lg text-[10px] z-30"
            >
              <span
                className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white p-0.5 inline-flex items-center"
                title="Drag to reorder custom section"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </span>
              <select
                value={sec.type}
                onChange={(e) =>
                  onUpdateCVData((prev) => ({
                    ...prev,
                    customSections: prev.customSections.map((section) =>
                      section.id === sec.id
                        ? {
                            ...section,
                            type: e.target.value as 'bullets' | 'paragraph' | 'references',
                          }
                        : section
                    ),
                  }))
                }
                aria-label={`Layout for ${sec.title}`}
                className="max-w-24 rounded bg-slate-800 px-1 py-0.5 text-[9px] text-slate-100"
              >
                <option value="bullets">Bullets</option>
                <option value="paragraph">Paragraph</option>
                <option value="references">References</option>
              </select>
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
              contentEditable={effectiveEditMode}
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
                    ? 'cv-references-grid grid grid-cols-2 gap-3 list-none ml-0 text-slate-700'
                    : 'exp-bullets list-outside ml-4 space-y-1 text-slate-700'
                }
              >
                {sec.content.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (effectiveEditMode) setActiveTouchKey(`csi:${sec.id}:${itemIdx}`);
                    }}
                    className={`relative group/citem ${
                      sec.type === 'references'
                        ? 'p-2 rounded border border-slate-200 bg-slate-50/70'
                        : ''
                    } ${activeTouchKey === `csi:${sec.id}:${itemIdx}` ? 'cv-touch-active' : ''}`}
                  >
                    <span
                      contentEditable={effectiveEditMode}
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(item) }}
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
                        onMouseDown={(e) => e.preventDefault()}
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
                        className="builder-control no-print hidden group-hover/citem:flex absolute -top-3.5 right-0 bg-slate-900/95 text-rose-400 hover:text-rose-300 p-0.5 rounded shadow z-30"
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
                contentEditable={effectiveEditMode}
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
              <div id="credentialsGrid" className="grid grid-cols-12 gap-5">
                <div className="cred-edu col-span-4">{educationContent}</div>
                <div className="cred-certs col-span-5">{certificationsContent}</div>
                <div className="cred-lang col-span-3">{languagesContent}</div>
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
                    return effectiveEditMode ? (
                      <div
                        key={secId}
                        className="builder-control no-print my-1.5 px-3 py-1 rounded border border-dashed border-slate-300 bg-slate-50 text-[10.5px] text-slate-500 flex items-center justify-between"
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
                    <div
                      key={secId}
                      draggable={effectiveEditMode}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/sec-id', secId);
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggingSecId(secId);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverSecId !== secId) setDragOverSecId(secId);
                      }}
                      onDragLeave={() => {
                        if (dragOverSecId === secId) setDragOverSecId(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const srcId = e.dataTransfer.getData('text/sec-id') as CVSectionId;
                        if (srcId && srcId !== secId) {
                          const from = currentOrder.indexOf(srcId);
                          const to = currentOrder.indexOf(secId);
                          if (from >= 0 && to >= 0) {
                            const next = [...currentOrder];
                            const [m] = next.splice(from, 1);
                            next.splice(to, 0, m);
                            onUpdateSettings({ sectionOrder: next });
                          }
                        }
                        setDraggingSecId(null);
                        setDragOverSecId(null);
                      }}
                      onDragEnd={() => {
                        setDraggingSecId(null);
                        setDragOverSecId(null);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (effectiveEditMode) setActiveTouchKey(`wrap:${secId}`);
                      }}
                      className={`relative group/wrap transition ${
                        activeTouchKey === `wrap:${secId}` ? 'cv-touch-active' : ''
                      } ${draggingSecId === secId ? 'opacity-40 scale-[0.99] border-2 border-dashed border-blue-400 rounded-lg' : ''} ${
                        dragOverSecId === secId && draggingSecId !== secId ? 'border-t-2 border-blue-500 bg-blue-50/20' : ''
                      }`}
                    >
                      <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="builder-control no-print hidden group-hover/wrap:flex absolute right-0 -top-5 md:-left-7 md:right-auto md:top-0 flex-row md:flex-col items-center gap-0.5 bg-slate-900/95 text-white p-0.5 rounded shadow-md z-30 text-[9px]"
                      >
                        <span
                          className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 hover:text-white"
                          title="Drag to reorder section"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </span>
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

                {/* 1-Click Pre-Built Section Adder */}
                {effectiveEditMode && (
                  <div className="builder-control no-print my-4 pt-3 border-t border-dashed border-slate-300 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={onOpenAddSectionModal}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add Pre-Built Section Template (Awards, References, Languages...)</span>
                    </button>
                  </div>
                )}
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
              className="builder-control no-print text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
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
                  className="signature-draw-hint no-print cursor-pointer border-b border-dashed border-slate-400 pb-1 mb-1 text-[11px] text-blue-600 hover:text-blue-800 italic"
                >
                  Click to draw signature
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

          {/* Digital Verification QR Badge in Footer (if enabled) */}
          {settings.qrCode?.enabled && settings.qrCode?.position === 'footer' && qrDataUrl && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-slate-200 bg-white/90 shadow-2xs">
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                style={{ width: '38px', height: '38px' }}
                className="object-contain shrink-0"
              />
              <div className="flex flex-col text-left">
                <span className="text-[8.5px] font-extrabold uppercase tracking-tight theme-text flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 inline" /> {settings.qrCode.label || 'Verified Credentials'}
                </span>
                <span className="text-[7.5px] text-slate-400 font-medium">
                  Scan to view live profile
                </span>
              </div>
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
