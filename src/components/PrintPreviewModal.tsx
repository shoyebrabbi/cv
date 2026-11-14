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
    const fitScale = Math.min(1, Math.max(0.55, (window.innerWidth - 96) / 820));
    setScale(Math.round(fitScale * 20) / 20);

    const source = document.getElementById('cvDocument');
    const host = stageRef.current;
    if (!source || !host) return;

    host.innerHTML = '';
    const clone = source.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.querySelectorAll('.builder-control').forEach((el) => el.remove());
    clone.querySelectorAll('[contenteditable]').forEach((el) => el.removeAttribute('contenteditable'));
    host.appendChild(clone);
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

  return (
    <div className="no-print fixed inset-0 z-50 bg-[#060911]/95 backdrop-blur-md flex flex-col">
      {/* Studio Top Bar */}
      <div className="h-14 px-4 sm:px-6 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              A4 Print &amp; PDF Exact Preview
            </h3>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span>
                {estimatedPages} {estimatedPages > 1 ? 'Pages' : 'Page'} ·{' '}
                {Math.round(docHeightPx * 0.264583)}mm
              </span>
              <span aria-hidden="true">·</span>
              <span className={hideBrowserPrintChrome ? 'text-emerald-400' : 'text-amber-400'}>
                {hideBrowserPrintChrome
                  ? 'Browser URL/Date Headers Hidden'
                  : 'Browser Margins Enabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.5, Math.round((s - 0.1) * 100) / 100))}
              className="p-1 rounded hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="min-w-[42px] text-center font-mono text-[11px] text-slate-200">
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
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Now</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              setTimeout(() => onExportPDF(), 100);
            }}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white flex items-center gap-1.5 transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Crisp A4 Paper Stage */}
      <div className="flex-1 overflow-auto py-8 px-4 flex justify-center items-start">
        <div
          className="print-preview-stage origin-top transition-transform duration-150"
          style={{
            transform: `scale(${scale})`,
            marginBottom:
              scale < 1 ? `-${Math.round((1 - scale) * (docHeightPx || 1120))}px` : undefined,
          }}
        >
          <div ref={stageRef} />
        </div>
      </div>
    </div>
  );
}
