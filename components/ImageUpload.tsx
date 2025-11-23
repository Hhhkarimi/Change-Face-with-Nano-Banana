import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    onImageSelect(file);
  };

  if (selectedImage) {
    return (
      <div className="relative group w-full h-64 md:h-96 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        <img 
          src={selectedImage} 
          alt="Original upload" 
          className="w-full h-full object-contain"
        />
        <button 
          onClick={onClear}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-md">
          Original
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-64 md:h-96 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
        isDragging 
          ? 'border-yellow-500 bg-yellow-50' 
          : 'border-slate-300 hover:border-yellow-400 hover:bg-slate-50 bg-white'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="image/*" 
        className="hidden" 
      />
      <div className="p-4 bg-slate-100 rounded-full mb-4">
        <Upload className={`w-8 h-8 ${isDragging ? 'text-yellow-600' : 'text-slate-400'}`} />
      </div>
      <h3 className="text-lg font-medium text-slate-900">Upload an image</h3>
      <p className="text-slate-500 text-sm mt-1 max-w-xs">
        Drag and drop or click to select a PNG or JPG file to start editing.
      </p>
    </div>
  );
};

export default ImageUpload;