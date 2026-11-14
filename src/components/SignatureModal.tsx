import React, { useRef, useState, useEffect } from 'react';
import { PenTool, X, Trash2, Check, Upload } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  candidateName: string;
  onSave: (signatureDataUrl: string, candidateName: string, date: string) => void;
}

export function SignatureModal({
  isOpen,
  onClose,
  initialImage,
  candidateName,
  onSave,
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [name, setName] = useState(candidateName);
  const [date, setDate] = useState(new Date().toLocaleDateString('en-GB'));
  const [penColor, setPenColor] = useState('#0f172a');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(candidateName);
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset and clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = initialImage;
    }
  }, [isOpen, initialImage, candidateName]);

  if (!isOpen) return null;

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, name, date);
    onClose();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ডিজিটাল ই-স্বাক্ষর (Touch Signature Pad)</h3>
              <p className="text-[11px] text-slate-400">মাউস বা স্ক্রিনে আঙুল দিয়ে স্বাক্ষর আঁকুন</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs">
          {/* Canvas Box */}
          <div className="relative rounded-xl border-2 border-dashed border-slate-700 bg-white p-1 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={460}
              height={140}
              className="w-full h-36 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 pointer-events-none font-mono">
              ✍️ Sign above this line
            </div>
          </div>

          {/* Canvas controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">রঙ:</span>
              <button
                type="button"
                onClick={() => setPenColor('#0f172a')}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${
                  penColor === '#0f172a' ? 'border-blue-400 scale-110' : 'border-slate-600'
                }`}
                title="Black Ink"
              />
              <button
                type="button"
                onClick={() => setPenColor('#0f4c81')}
                className={`w-5 h-5 rounded-full bg-[#0f4c81] border-2 ${
                  penColor === '#0f4c81' ? 'border-blue-400 scale-110' : 'border-slate-600'
                }`}
                title="Royal Blue Ink"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
              <label className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1 text-[11px] cursor-pointer">
                <Upload className="w-3 h-3" /> Upload Image
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Name & Date fields */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-slate-300 block mb-1">স্বাক্ষরকারীর নাম:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-slate-300 block mb-1">তারিখ (Date):</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> সিভিতে যুক্ত করুন (Apply Signature)
          </button>
        </div>
      </div>
    </div>
  );
}
