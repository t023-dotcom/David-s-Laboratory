
import React from 'react';

interface ImagePreviewProps {
  original: string | null;
  result: string | null;
  isProcessing: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ original, result, isProcessing }) => {
  if (!original) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto mb-8">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">原始圖片</span>
        <div className="relative aspect-square rounded-2xl overflow-hidden glass shadow-2xl group">
          <img 
            src={original} 
            alt="Original" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">轉換成果</span>
        <div className="relative aspect-square rounded-2xl overflow-hidden glass shadow-2xl flex items-center justify-center group">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-400 font-medium animate-pulse">Gemini 正在為您的照片變換風格...</p>
            </div>
          ) : result ? (
            <img 
              src={result} 
              alt="Transformed" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-slate-500 text-center px-6">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>選擇一個風格並點擊「開始轉換」來見證奇蹟</p>
            </div>
          )}
          
          {result && !isProcessing && (
            <div className="absolute top-4 right-4">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = `styleswap-${Date.now()}.png`;
                  link.click();
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors"
                title="下載圖片"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
