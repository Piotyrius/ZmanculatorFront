"use client";

import { useState, useRef, useEffect } from "react";

interface PatternViewerProps {
  svgContent: string;
}

export default function PatternViewer({ svgContent }: PatternViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && containerRef.current) {
      // Center the SVG on load
      const svg = svgRef.current;
      const container = containerRef.current;
      const svgRect = svg.getBBox();
      const containerRect = container.getBoundingClientRect();
      
      const centerX = (containerRect.width - svgRect.width * zoom) / 2;
      const centerY = (containerRect.height - svgRect.height * zoom) / 2;
      
      setPan({ x: centerX, y: centerY });
    }
  }, [svgContent, zoom]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(5, prev + 0.1))}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(0.1, prev - 0.1))}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          Reset
        </button>
        <span className="flex items-center rounded-md bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      <div
        ref={containerRef}
        className="h-[600px] w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
          className="h-full w-full"
        >
          <div
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="h-full w-full [&>svg]:max-h-full [&>svg]:max-w-full"
          />
        </div>
      </div>
    </div>
  );
}

