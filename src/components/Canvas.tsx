import { useEffect, useRef, useState } from "react";
import ConnectionPoint from "../models/ConnectionPoint";
import Point from "../models/Point";
import Rect from "../models/Rect";
import dataConverter from "../services/dataConverter";
import rectStore from "../stores/RectStore";
import { observer } from "mobx-react-lite";

const CanvasDrawing: React.FC = observer(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Храним данные в локальном стейте, которые будут изменяться при перетаскивании
  const [rect1, setRect1] = useState<Rect>(rectStore.rects[0].rect);
  const [rect2, setRect2] = useState<Rect>(rectStore.rects[1].rect);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedRect, setDraggedRect] = useState<'rect1' | 'rect2' | null>(null);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  // Ререндерим холст, когда прямоугольники меняют свои координаты
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas.width, canvas.height, 10);
        
        // Словарь функций для вычисления точки на основании угла
        const dict: { [key: string]: (rect: Rect) => Point } = {
            "0": (rect: Rect): Point => {
            return { x: rect.position.x + rect.size.width / 2, y: rect.position.y };
            },
            "90": (rect: Rect): Point => {
            return { x: rect.position.x, y: rect.position.y + rect.size.height / 2 };
            },
            "180": (rect: Rect): Point => {
            return { x: rect.position.x - rect.size.width / 2, y: rect.position.y };
            },
            "270": (rect: Rect): Point => {
            return { x: rect.position.x, y: rect.position.y - rect.size.height / 2 };
            },
        };
        
        // Вычисляем соединительные точки на основании текущих позиций прямоугольников
        const cPoint1: ConnectionPoint = {
            point: dict[rectStore.rects[0].point.angle](rect1),
            angle: rectStore.rects[0].point.angle,
        };
        const cPoint2: ConnectionPoint = {
            point: dict[rectStore.rects[1].point.angle](rect2),
            angle: rectStore.rects[1].point.angle,
        };

        // Отрисовка прямоугольников
        drawRectangle(ctx, rect1, "blue");
        drawRectangle(ctx, rect2, "green");

        // Получение и отрисовка пути
        const points = dataConverter(rect1, rect2, cPoint1, cPoint2);
        drawPath(ctx, points);
      }
    }
  }, [rect1, rect2, rectStore.rects]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, step: number) => {
    ctx.strokeStyle = "#e0e0e0"; // Цвет сетки
    ctx.lineWidth = 0.5;

    // Рисуем вертикальные линии
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Рисуем горизонтальные линии
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawRectangle = (ctx: CanvasRenderingContext2D, rect: Rect, color: string) => {
    ctx.fillStyle = color;
    const x = rect.position.x - rect.size.width / 2;
    const y = rect.position.y - rect.size.height / 2;
    ctx.fillRect(x, y, rect.size.width, rect.size.height);
  };

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[]) => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;

    // Проверка, нажали ли на один из прямоугольников
    if (isInsideRect(offsetX, offsetY, rect1)) {
      setDraggedRect('rect1');
      setOffset({ x: offsetX - rect1.position.x, y: offsetY - rect1.position.y });
      setIsDragging(true);
    } else if (isInsideRect(offsetX, offsetY, rect2)) {
      setDraggedRect('rect2');
      setOffset({ x: offsetX - rect2.position.x, y: offsetY - rect2.position.y });
      setIsDragging(true);
    }
  };


  const  areRectanglesIntersecting = (rect1: Rect, rect2: Rect): boolean =>{
    // Координаты границ первого прямоугольника
    const left1 = rect1.position.x - rect1.size.width / 2;
    const right1 = rect1.position.x + rect1.size.width / 2;
    const top1 = rect1.position.y - rect1.size.height / 2;
    const bottom1 = rect1.position.y + rect1.size.height / 2;
  
    // Координаты границ второго прямоугольника
    const left2 = rect2.position.x - rect2.size.width / 2;
    const right2 = rect2.position.x + rect2.size.width / 2;
    const top2 = rect2.position.y - rect2.size.height / 2;
    const bottom2 = rect2.position.y + rect2.size.height / 2;
  
    // Проверка пересечения
    return !(left1 >= right2 || right1 <= left2 || top1 >= bottom2 || bottom1 <= top2);
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging && draggedRect) {
      const { offsetX, offsetY } = e.nativeEvent;
      const newPosition:Point = { x: offsetX - offset.x, y: offsetY - offset.y };
      
      
        if (draggedRect === 'rect1') {
          const newRect = { ...rect1, position: newPosition }
          if (!areRectanglesIntersecting(newRect,rect2))
            setRect1(newRect);
        } else if (draggedRect === 'rect2') {
          const newRect = { ...rect2, position: newPosition }
          if (!areRectanglesIntersecting(newRect,rect1))
            setRect2(newRect);
        }
      
      // Обновляем позицию перетаскиваемого прямоугольника в локальном стейте
      
    }
  };

  const handleMouseUp = () => {
    // После окончания перетаскивания обновляем стор
    if (draggedRect === 'rect1') {
      rectStore.setRect(0, rect1.position, rect1.size);
    } else if (draggedRect === 'rect2') {
      rectStore.setRect(1, rect2.position, rect2.size);
    }

    setIsDragging(false);
    setDraggedRect(null);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDraggedRect(null);
  };

  const isInsideRect = (x: number, y: number, rect: Rect) => {
    const rectLeft = rect.position.x - rect.size.width / 2;
    const rectRight = rect.position.x + rect.size.width / 2;
    const rectTop = rect.position.y - rect.size.height / 2;
    const rectBottom = rect.position.y + rect.size.height / 2;

    return x >= rectLeft && x <= rectRight && y >= rectTop && y <= rectBottom;
  };

  return (
    <div>
      <canvas
        className="canvas"
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
});

export default CanvasDrawing;
