
import React, { useState, useCallback, useRef } from 'react';
import { COMMON_STYLES, MAX_IMAGE_SIZE } from './constants';
import { StyleOption, TransformationState } from './types';
import { transformImage } from './services/geminiService';
import ImagePreview from './components/ImagePreview';

const App: React.FC = () => {
  const [state, setState] = useState<TransformationState>({
    originalImage: null,
    resultImage: null,
    status: 'idle',
    errorMessage: null,
  });

  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(COMMON_STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_IMAGE_SIZE) {
            height = Math.round((height * MAX_IMAGE_SIZE) / width);
            width = MAX_IMAGE_SIZE;
          }
        } else {
          if (height > MAX_IMAGE_SIZE) {
            width = Math.round((width * MAX_IMAGE_SIZE) / height);
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const resized = await resizeImage(base64);
        setState({
          originalImage: resized,
          resultImage: null,
          status: 'idle',
          errorMessage: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!state.originalImage) return;

    const finalPrompt = customPrompt.trim() 
      ? `Transform this image with the following custom style: ${customPrompt}` 
      : (selectedStyle?.prompt || 'Transform this image creatively.');

    setState(prev => ({ ...prev, status: 'processing', errorMessage: null }));

    try {
      const result = await transformImage(state.originalImage, finalPrompt);
      setState(prev => ({ ...prev, resultImage: result, status: 'success' }));
    } catch (err: any) {
      setState(prev => ({ ...prev, status: 'error', errorMessage: err.message }));
    }
  };

  const reset = () => {
    setState({
      originalImage: null,
      resultImage: null,
      status: 'idle',
      errorMessage: null,
    });
    setCustomPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto w-full mb-12 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            StyleSwap AI
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl">
          使用 Gemini 2.5 Flash Image 將您的日常照片轉換為驚艷的藝術作品。
          上傳照片，選擇風格，見證視覺轉換。
        </p>
      </header>

      <main className="max-w-6xl mx-auto w-full flex-grow flex flex-col gap-8">
        {!state.originalImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-3xl p-12 glass hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all cursor-pointer group"
          >
            <div className="bg-slate-800 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-12 h-12 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">上傳照片</h2>
            <p className="text-slate-500 mb-6">支援 PNG, JPG 或 JPEG (上限 10MB)</p>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all">
              選擇檔案
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>
        ) : (
          <>
            <ImagePreview 
              original={state.originalImage} 
              result={state.resultImage} 
              isProcessing={state.status === 'processing'} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Style Selection */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <span className="text-indigo-400">1.</span> 選擇風格
                  </h3>
                  <button onClick={reset} className="text-sm text-slate-500 hover:text-red-400 transition-colors">
                    移除圖片
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {COMMON_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedStyle(style);
                        setCustomPrompt('');
                      }}
                      className={`
                        p-4 rounded-xl flex flex-col items-center gap-2 transition-all border-2
                        ${selectedStyle?.id === style.id && !customPrompt
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 shadow-lg shadow-indigo-500/10' 
                          : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-700/50'
                        }
                      `}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <span className="text-[10px] md:text-xs font-medium text-center leading-tight">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt & Action */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span className="text-indigo-400">2.</span> 自定義要求
                </h3>
                <div className="glass p-5 rounded-2xl flex flex-col gap-4">
                  <textarea
                    placeholder="例如：『加入 1970 年代的復古電影濾鏡』或『看起來像藍色墨水的鉛筆劃』..."
                    className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  
                  {state.errorMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                      錯誤：{state.errorMessage}
                    </div>
                  )}

                  <button
                    onClick={handleTransform}
                    disabled={state.status === 'processing'}
                    className={`
                      w-full py-4 rounded-xl font-semibold text-white shadow-xl transition-all
                      ${state.status === 'processing' 
                        ? 'bg-slate-700 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98]'
                      }
                    `}
                  >
                    {state.status === 'processing' ? '處理中...' : '開始轉換'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="max-w-6xl mx-auto w-full pt-8 pb-4 mt-auto border-t border-slate-800 text-center text-slate-500 text-sm">
        由 Google Gemini 2.5 Flash Image 技術提供 &bull; AI 藝術生成
      </footer>
    </div>
  );
};

export default App;
