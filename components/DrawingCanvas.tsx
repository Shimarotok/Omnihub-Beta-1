
import React, { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
      }
    }
  }, [color, brushSize]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex gap-3">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded border-none p-0 cursor-pointer"
          />
          <input 
            type="range" min="1" max="20" 
            value={brushSize} 
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">Clear</button>
          <button onClick={onCancel} className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Save</button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden touch-none relative bg-gray-50">
        <canvas
          ref={canvasRef}
          width={800}
          height={1000}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full object-contain cursor-crosshair"
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
