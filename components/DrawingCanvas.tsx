
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Pencil, Trash2, Check, X, Undo2 } from 'lucide-react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  
  // Track last coordinates for smoothing
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        // Use a slight delay to ensure parent dimensions are settled on mobile
        const updateSize = () => {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
          // Restore latest history if resized
          if (history.length > 0) {
            const img = new Image();
            img.src = history[history.length - 1];
            img.onload = () => {
              canvas.getContext('2d')?.drawImage(img, 0, 0);
            };
          }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
      }
    }
  }, [history]);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setHistory(prev => [...prev.slice(-19), dataUrl]); // Keep last 20 states
    }
  }, []);

  const undo = () => {
    if (history.length <= 1) {
      clear();
      setHistory([]);
      return;
    }
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const prevState = newHistory[newHistory.length - 1];
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx && prevState) {
      const img = new Image();
      img.src = prevState;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        setHistory(newHistory);
      };
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    lastPoint.current = coords;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = isEraser ? '#ffffff' : color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    
    // Smooth drawing using quadratic curves
    const midPoint = {
      x: (lastPoint.current.x + coords.x) / 2,
      y: (lastPoint.current.y + coords.y) / 2
    };
    
    ctx.quadraticCurveTo(lastPoint.current.x, lastPoint.current.y, midPoint.x, midPoint.y);
    ctx.stroke();
    
    lastPoint.current = coords;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPoint.current = null;
      saveToHistory();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#000000', '#64748b'
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden select-none">
      {/* Top Navigation */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <button 
          onClick={onCancel} 
          className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-2xl text-slate-500 hover:text-slate-900 active:scale-90 transition-all border border-white"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={undo} 
            disabled={history.length === 0}
            className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-2xl text-slate-500 hover:text-slate-900 active:scale-90 transition-all border border-white disabled:opacity-30"
          >
            <Undo2 className="w-6 h-6" />
          </button>
          <button 
            onClick={() => onSave(canvasRef.current?.toDataURL() || '')} 
            className="p-3 px-6 bg-blue-600 shadow-xl shadow-blue-200 rounded-2xl text-white font-black flex items-center gap-2 active:scale-95 transition-all"
          >
            <Check className="w-6 h-6" /> Done
          </button>
        </div>
      </div>

      {/* Canvas Area - Maximized */}
      <div className="flex-1 touch-none relative cursor-crosshair bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />
      </div>

      {/* Bottom Floating Toolbar - Thumb Optimized */}
      <div className="absolute bottom-8 left-4 right-4 z-20 space-y-4">
        {/* Brush Size Controls */}
        <div className="flex justify-center">
          <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white flex items-center gap-6 w-full max-w-xs">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 flex-shrink-0"
            >
              <div 
                className="rounded-full transition-all duration-200" 
                style={{ 
                  width: `${Math.max(2, brushSize)}px`, 
                  height: `${Math.max(2, brushSize)}px`,
                  backgroundColor: isEraser ? '#94a3b8' : color
                }} 
              />
            </div>
            <input 
              type="range" min="2" max="40" 
              value={brushSize} 
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 rounded-full appearance-none accent-blue-600"
            />
          </div>
        </div>

        {/* Tools & Colors */}
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border border-white flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl flex-shrink-0">
              <button 
                onClick={() => setIsEraser(false)}
                className={`p-3 rounded-xl transition-all ${!isEraser ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400'}`}
              >
                <Pencil className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsEraser(true)}
                className={`p-3 rounded-xl transition-all ${isEraser ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-400'}`}
              >
                <Eraser className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex justify-between items-center px-2">
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => { setColor(c); setIsEraser(false); }}
                    className={`w-9 h-9 rounded-full border-4 transition-all active:scale-75 ${color === c && !isEraser ? 'border-slate-900 scale-110 shadow-lg' : 'border-white'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={clear} 
              className="p-3 text-slate-400 hover:text-red-500 active:bg-red-50 rounded-2xl transition-all"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DrawingCanvas;
