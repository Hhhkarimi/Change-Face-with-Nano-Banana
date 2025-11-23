import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Download, 
  Sparkles, 
  AlertCircle,
  Zap,
  RotateCcw
} from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import Button from './components/Button';
import { fileToBase64, editImageWithGemini } from './services/geminiService';
import { LoadingState } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  const handleImageSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    // Create local preview
    const previewUrl = URL.createObjectURL(selectedFile);
    setOriginalImagePreview(previewUrl);
    
    // Reset output
    setEditedImage(null);
    setResultText(null);
    setStatus(LoadingState.IDLE);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setFile(null);
    setOriginalImagePreview(null);
    setEditedImage(null);
    setResultText(null);
    setPrompt('');
    setStatus(LoadingState.IDLE);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!file || !prompt.trim()) return;

    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    setResultText(null);
    setEditedImage(null);

    try {
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;

      const response = await editImageWithGemini(base64Data, mimeType, prompt);

      if (response.imageUrl) {
        setEditedImage(response.imageUrl);
        setStatus(LoadingState.SUCCESS);
        // Scroll to result on mobile
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (response.text) {
        // Sometimes the model might refuse to generate an image but gives a text explanation
        setResultText(response.text);
        setStatus(LoadingState.SUCCESS);
      } else {
        throw new Error("No image or text returned from the model.");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(LoadingState.ERROR);
      setErrorMsg(err.message || "Failed to generate image. Please try again.");
    }
  };

  const downloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `nano-banana-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-fill prompt logic for the Persian request
  const setExamplePrompt = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-slate-900" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nano Banana Studio</h1>
          </div>
          <div className="text-xs sm:text-sm font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-3">
            Transform Images with Words
          </h2>
          <p className="text-lg text-slate-600">
            Upload an image and describe how you want to change it. 
            <br className="hidden sm:block" />
            Nano Banana handles the rest instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs mr-2 border border-slate-200">1</span>
                  Source Image
                </h3>
              </div>
              <ImageUpload 
                onImageSelect={handleImageSelect} 
                selectedImage={originalImagePreview} 
                onClear={handleClear}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs mr-2 border border-slate-200">2</span>
                  Edit Instructions
                </h3>
              </div>
              
              <div className="space-y-3">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your edit, e.g., 'Add a vintage filter' or 'Make it snow'"
                  className="w-full h-32 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none transition-shadow text-slate-800 placeholder:text-slate-400"
                  disabled={status === LoadingState.LOADING}
                />
                
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="text-slate-500 py-1">Try:</span>
                  <button onClick={() => setExamplePrompt("Add a cinematic lighting effect")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors">
                    Cinematic Lighting
                  </button>
                  <button onClick={() => setExamplePrompt("Make it look like a sketch")} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors">
                    Sketch Style
                  </button>
                  <button onClick={() => setExamplePrompt("تصویر با یک لبخند همراه شود")} className="px-3 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full transition-colors">
                    Make them smile (Fa)
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={status === LoadingState.LOADING}
                  disabled={!file || !prompt}
                  className="w-full py-3 text-lg shadow-yellow-200"
                  leftIcon={<Wand2 className="w-5 h-5" />}
                >
                  {status === LoadingState.LOADING ? 'Generating...' : 'Generate Edit'}
                </Button>
                {status === LoadingState.LOADING && (
                  <p className="text-center text-xs text-slate-400 mt-2 animate-pulse">
                    Thinking with Nano Banana...
                  </p>
                )}
              </div>
            </div>
            
            {status === LoadingState.ERROR && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="space-y-6" ref={resultRef}>
            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full min-h-[500px] flex flex-col ${status === LoadingState.SUCCESS ? 'border-indigo-100 ring-4 ring-indigo-50/50' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-semibold text-slate-900 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs mr-2 border border-slate-200">3</span>
                  Result
                </h3>
                {editedImage && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      onClick={handleGenerate} // Regenerate
                      className="!px-3 !py-1.5 text-xs"
                      title="Regenerate"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={downloadImage}
                      className="!px-3 !py-1.5 text-xs"
                      leftIcon={<Download className="w-3 h-3" />}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative">
                {status === LoadingState.IDLE && (
                  <div className="text-center text-slate-400 p-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Your masterpiece will appear here</p>
                  </div>
                )}
                
                {status === LoadingState.LOADING && (
                  <div className="text-center text-slate-500">
                     <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
                     </div>
                     <p className="font-medium">Creating magic...</p>
                  </div>
                )}

                {status === LoadingState.SUCCESS && editedImage && (
                  <img 
                    src={editedImage} 
                    alt="Edited result" 
                    className="w-full h-full object-contain animate-in fade-in duration-700"
                  />
                )}

                {status === LoadingState.SUCCESS && resultText && !editedImage && (
                  <div className="p-6 text-slate-700 prose prose-sm max-w-none">
                    <p className="font-medium text-lg mb-2 text-indigo-600">Response:</p>
                    <p>{resultText}</p>
                    <p className="text-xs text-slate-400 mt-4 italic">The model responded with text instead of an image.</p>
                  </div>
                )}
              </div>
              
              {status === LoadingState.SUCCESS && editedImage && (
                 <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center justify-between">
                    <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Generation Complete!</span>
                 </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;