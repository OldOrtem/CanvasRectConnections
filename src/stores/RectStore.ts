import { makeAutoObservable, runInAction } from "mobx";
import Point from "../models/Point";
import Size from "../models/Size";
import RectItem from "../models/RectItem";

class RectStore {
    rects: RectItem[] = [
        {
            rect: {
                position: { x: 400, y: 300 },
                size: { width: 200, height: 100 },
            },
            point: {
                point: { x: 300, y: 300 }, 
                angle: 90,
            }
        },
        {
            rect: {
                position: { x: 600, y: 300 },
                size: { width: 100, height: 50 },
            },
            point: {
                point: { x: 550, y: 300 }, 
                angle: 180,
            }
        }
    ];

    constructor() {
        makeAutoObservable(this);
    }

    // Метод для обновления позиции и размеров прямоугольника
    setRect(rectIndex: number, position: Point, size: Size) {
        if (this.rects[rectIndex]) {
            runInAction(() => {
                this.rects[rectIndex].rect.position = position;
                this.rects[rectIndex].rect.size = size;
            });
            this.updateConnectionPoint(rectIndex);
        }
    }

    // Метод для обновления точки соединения
    setConnectionPoint(index: number, point: Point, angle: number) {
        if (this.rects[index]) {
            runInAction(() => {
                this.rects[index].point = { point, angle };
            });
        }
    }

    // Метод для автоматического обновления точки соединения в зависимости от позиции прямоугольника
    updateConnectionPoint(index: number) {
        const rectItem = this.rects[index];
        if (rectItem) {
            const { rect, point } = rectItem;
            const { x, y } = rect.position;
            const { width, height } = rect.size;

            // Обновляем точку соединения с учётом угла и положения
            const updatedPoint = { ...point.point };
            switch (point.angle) {
                case 0: // Справа
                    updatedPoint.x = x + width / 2;
                    updatedPoint.y = y;
                    break;
                case 180: // Слева
                    updatedPoint.x = x - width / 2;
                    updatedPoint.y = y;
                    break;
                case 90: // Снизу
                    updatedPoint.x = x;
                    updatedPoint.y = y + height / 2;
                    break;
                case 270: // Сверху
                    updatedPoint.x = x;
                    updatedPoint.y = y - height / 2;
                    break;
            }
            runInAction(() => {
                point.point = updatedPoint;
            });
        }
    }

    // Валидация точек соединения
    validateConnectionPoints(): string[] {
        const errors: string[] = [];

        this.rects.forEach((rectItem, index) => {
            const { rect, point: connectionPoint } = rectItem;
            const { x, y } = connectionPoint.point;
            const { x: rx, y: ry } = rect.position;
            const { width, height } = rect.size;

            const isValidPosition = (
                (connectionPoint.angle === 180 && x === rx - width / 2) ||
                (connectionPoint.angle === 0 && x === rx + width / 2) ||
                (connectionPoint.angle === 270 && y === ry - height / 2) ||
                (connectionPoint.angle === 90 && y === ry + height / 2)
            );

            if (!isValidPosition) {
                errors.push(`Точка соединения для прямоугольника ${index + 1} должна находиться на границе прямоугольника и быть перпендикулярной.`);
            }
        });

        return errors;
    }
}

const rectStore = new RectStore();
export default rectStore;
