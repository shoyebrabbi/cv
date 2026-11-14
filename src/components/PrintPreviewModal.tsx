import React, { useEffect, useRef, useState } from 'react';
import { X, Printer, FileDown, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onExportPDF: () => void;
  estimatedPages: number;
  docHeightPx: number;
  hideBrowserPrintChrome: boolean;
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  onPrint,
  onExportPDF,
  estimatedPages,
  docHeightPx,
  hideBrowserPrintChrome,
}: PrintPreviewModalProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.85);

  useEffect(() => {
    if (!isOpen) return;
    const computeFitScale = () => {
      const horizontalPad = window.innerWidth < 640 ? 20 : 96;
      const fitScale = Math.min(1, Math.max(0.35, (window.innerWidth - horizontalPad) / 794));
      return Math.round(fitScale * 20) / 20;
    };
    setScale(computeFitScale());

    const handleResize = () => setScale(computeFitScale());
    window.addEventListener('resize', handleResize);

    const source = document.getElementById('cvDocument');
    const host = stageRef.current;
    if (source && host) {
      host.innerHTML = '';
      const clone = source.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone
        .querySelectorAll('.builder-control, .no-print, .signature-draw-hint, .photo-touch-badge')
        .forEach((el) => el.remove());
      clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
      host.appendChild(clone);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const scaledWidth = Math.round(794 * scale);
  const scaledHeight = Math.round((docHeightPx || 1123) * scale);

  return (
    <div className="no-print fixed inset-0 z-50 bg-[#060911]/95 backdrop-blur-md flex flex-col">
      {/* Studio Top Bar */}
      <div className="px-3 sm:px-6 py-2.5 bg-[#0B1120] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate">
              A4 Print &amp; PDF Exact Preview
            </h3>
            <div className="text-[10.5px] sm:text-[11px] text-slate-400 flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="tabular-nums">
                {estimatedPages} {estimatedPages > 1 ? 'Pages' : 'Page'} ·{' '}
                {Math.round(docHeightPx * 0.264583)}mm
              </span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span
                className={`hidden sm:inline ${
                  hideBrowserPrintChrome ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {hideBrowserPrintChrome
                  ? 'Browser URL/Date Headers Hidden'
                  : 'Browser Margins Enabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Action & Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          <div className="hidden md:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.4, Math.round((s - 0.1) * 100) / 100))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="min-w-[42px] text-center font-mono text-[11px] text-slate-200 tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.2, Math.round((s + 0.1) * 100) / 100))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setScale(1)}
              className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-[10.5px] font-semibold text-slate-400 hover:text-white flex items-center gap-1"
              title="Actual A4 Size (100%)"
            >
              <Maximize2 className="w-3 h-3" /> 100%
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => onPrint(), 150);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="sm:hidden">Print</span>
            <span className="hidden sm:inline">Print Now</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => onExportPDF(), 100);
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Compact Zoom Bar (Always reachable on small viewports) */}
      <div className="md:hidden px-3 py-1.5 bg-[#090E1A] border-b border-slate-800/80 flex items-center justify-between text-[11px] shrink-0">
        <span className="text-slate-400 truncate pr-2">A4 Paper Inspection</span>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 shrink-0">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.35, Math.round((s - 0.1) * 100) / 100))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="min-w-[38px] text-center font-mono text-slate-200 tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(1.2, Math.round((s + 0.1) * 100) / 100))}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const fitScale = Math.min(1, Math.max(0.35, (window.innerWidth - 20) / 794));
              setScale(Math.round(fitScale * 20) / 20);
            }}
            className="px-2 py-1 rounded hover:bg-slate-800 text-blue-300 font-semibold"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Crisp A4 Paper Stage (Outer sized box guarantees zero left/right clipping on narrow phones) */}
      <div className="flex-1 overflow-auto py-4 sm:py-8 px-2.5 sm:px-4">
        <div
          className="mx-auto shrink-0"
          style={{
            width: `${scaledWidth}px`,
            minHeight: `${scaledHeight}px`,
          }}
        >
          <div
            className="print-preview-stage origin-top-left transition-transform duration-150"
            style={{
              width: '794px',
              transform: `scale(${scale})`,
            }}
          >
            <div ref={stageRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
