import { useCallback, useEffect, useRef, useState } from 'react';
import './App.scss';

interface Point {
  x: number;
  y: number;
}

const DEFAULT_GRID_SIZE = 25;
const DEFAULT_RECT_COORDS = { x: 25, y: 25 };
const GridCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasCoords, setCanvasCoords] = useState<Point>({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState<number>(DEFAULT_GRID_SIZE);
  const [rectCoords, setRectCoords] = useState<Point>(DEFAULT_RECT_COORDS);
  const [viewportCoords, setViewportCoords] = useState<Point>({ x: 0, y: 0 });

  const animationRef = useRef<number>();

  const drawAxes = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Translate the canvas origin to the origin point

      // Draw X axes
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.stroke();
      ctx.closePath();

      // Draw Y axes
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, canvas.height);
      ctx.stroke();
      ctx.closePath();

      const { x, y } = rectCoords;
      const width = 100;
      const height = 100;
      const endX = x + width;
      const endY = y + height;

      // Draw Rectangle
      ctx.strokeStyle = '#339af0';
      ctx.strokeRect(x, y, width, height);

      // Mark starting coordinate of  rectangle
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();

      // Text for starting coordinate of  rectangle
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(`(${x},${y})`, x + 5, y + 20);
      ctx.save();
      ctx.restore();

      // Mark the ending coordinate of Rectangle
      ctx.beginPath();
      ctx.arc(endX, endY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();

      // Text for ending coordinate of Rectangle
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(`(${endX},${endY})`, endX + 5, endY + 15);
      ctx.save();
      ctx.restore();
    },
    [rectCoords]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw axes
    drawAxes(ctx);

    // Draw text for coordinates
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`(${canvasCoords.x}, ${canvasCoords.y})`, canvasCoords.x + 10, canvasCoords.y + 10);

    // Draw coordinate indicator
    ctx.beginPath();
    ctx.arc(canvasCoords.x, canvasCoords.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#007AFF';
    ctx.fill();

    animationRef.current = requestAnimationFrame(animate);
  }, [drawAxes, gridSize, canvasCoords.x, canvasCoords.y]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, drawAxes, canvasCoords]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set raw mouse coordinates
    setViewportCoords({
      x: Math.round(e.clientX ),
      y: Math.round(e.clientY),
    });

    const rect = canvas.getBoundingClientRect();
    // Set canvas coordinates relative to the canvas
    setCanvasCoords({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };

  const handleUpdateGridSize = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const parsed = parseInt(newValue) || 1;
    setGridSize(parsed);
  };

  return (
    <div className="canvas-coordinate-system">
      <h1>Canvas Coordinate System</h1>
      <div className="canvas-input">
        <div className="input-group">
          <label htmlFor="grid">Grid Size</label>
          <input type="text" id="grid" onChange={handleUpdateGridSize} defaultValue={gridSize} />
        </div>
        <div className="rect-input">
          <div className="input-group">
            <label htmlFor="rectX">Rectangle X</label>
            <input
              id="rectX"
              defaultValue={rectCoords.x}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setRectCoords({
                  x: parseInt(event.target.value),
                  y: rectCoords.y,
                });
              }}
            />
          </div>
          <div className="input-group">
            <label htmlFor="rectY">Rectangle Y</label>
            <input
              id="rectY"
              defaultValue={rectCoords.y}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setRectCoords({
                  x: rectCoords.x,
                  y: parseInt(event.target.value),
                });
              }}
            />
          </div>
          
        </div>
        <div className="coordinate-display">
        <div className="coordinate-group input-group">
          <label>Viewport X</label>
          <input type="text" value={viewportCoords.x} readOnly />
        </div>
        <div className="coordinate-group input-group">
          <label>Viewport Y</label>
          <input type="text" value={viewportCoords.y} readOnly />
        </div>
        <div className="coordinate-group input-group">
          <label>Canvas X</label>
          <input type="text" value={canvasCoords.x} readOnly />
        </div>
        <div className="coordinate-group input-group">
          <label>Canvas Y</label>
          <input type="text" value={canvasCoords.y} readOnly />
        </div>
      </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
};

export default GridCanvas;
