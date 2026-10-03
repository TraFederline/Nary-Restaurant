import React, { useRef, useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { UploadCloud, Image as ImageIcon, Camera, Trash2, RefreshCw, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (val: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ value, onChange }) => {
  const { t, language } = usePOS();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Resize and compress uploaded image to prevent localStorage bloat
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert(language === 'km' ? 'សូមជ្រើសរើសឯកសារជារូបភាព (JPG, PNG, WebP)។' : 'Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = event => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // Optimal max dimensions for POS catalog cards
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to lightweight JPEG Data URL (~60KB - 80KB)
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(optimizedDataUrl);
        } else {
          onChange(rawDataUrl);
        }
        setIsProcessing(false);
      };

      img.onerror = () => {
        setIsProcessing(false);
        alert(language === 'km' ? 'មិនអាចផ្ទុកទិន្នន័យរូបភាពនេះបានឡើយ។' : 'Failed to process image file.');
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      alert(language === 'km' ? 'កំហុសក្នុងការអានឯកសារ។' : 'Error reading image file.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset file input so user can re-select same file if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleTriggerPicker = () => {
    fileInputRef.current?.click();
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUrlDraft('');
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 dark:text-neutral-300">
          {t.uploadProductPhoto}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? (language === 'km' ? 'លាក់ URL' : 'Hide URL input') : t.orPasteUrl}</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* 1. Has Image: Live Preview Card with Change/Remove Actions */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-700 group bg-slate-900 shadow-xs">
          <div className="w-full h-44 bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src={value}
              alt="Menu item preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Top floating badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'km' ? 'រូបភាពដើមរបស់ផលិតផល' : 'Original Product Photo'}</span>
          </div>

          {/* Action overlay buttons */}
          <div className="absolute bottom-2.5 right-2.5 left-2.5 flex items-center justify-end gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 rounded-xl">
            <button
              type="button"
              onClick={handleTriggerPicker}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer backdrop-blur-xs"
            >
              {isProcessing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-orange-600" />
              )}
              <span>{t.changePhoto}</span>
            </button>

            <button
              type="button"
              onClick={handleClearImage}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer backdrop-blur-xs"
              title={t.removePhoto}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.removePhoto}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. No Image: Drag & Drop / Upload Trigger Area */
        <div
          onClick={handleTriggerPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
            isDragging
              ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-neutral-700 bg-slate-50/80 dark:bg-neutral-800/40 hover:border-orange-400 hover:bg-orange-50/30 dark:hover:bg-neutral-800/80'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center py-2 space-y-2">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              <span className="text-xs font-semibold text-slate-600 dark:text-neutral-300">
                {language === 'km' ? 'កំពុងកែសម្រួលទំហំ និងគុណភាពរូបភាព...' : 'Optimizing and resizing image...'}
              </span>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                {t.clickToUploadImage}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1">
                {t.dragOrDropImage}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium mt-1">
                {t.supportedImageFormats}
              </span>
            </>
          )}
        </div>
      )}

      {/* 3. Optional URL input box when expanded */}
      {showUrlInput && (
        <div className="p-3 bg-slate-100 dark:bg-neutral-800/80 rounded-xl space-y-2 border border-slate-200 dark:border-neutral-700/80">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-neutral-300 block">
            {t.imagePathUrl}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={urlDraft}
              onChange={e => setUrlDraft(e.target.value)}
              placeholder={t.pasteUrlPlaceholder}
              className="flex-1 p-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              {language === 'km' ? 'ប្រើប្រាស់' : 'Apply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
