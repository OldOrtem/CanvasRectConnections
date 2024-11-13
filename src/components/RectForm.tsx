import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import rectStore from "../stores/RectStore"; // Импортируем RectStore
import RectItem from "../models/RectItem";


const RectForm: React.FC = observer(() => {
  // Стейт для хранения временных данных формы
  const [tempRects, setTempRects] = useState<RectItem[]>(rectStore.rects);
  const [errors, setErrors] = useState<string[]>([]);

  // Обработчик изменения координат прямоугольников
  const handleRectChange = (
    rectIndex: number,
    field: "x" | "y" | "width" | "height",
    value: string
  ) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      const newTempRects = [...tempRects];
      if (field === "x" || field === "y"){
        newTempRects[rectIndex].rect.position[field] = parsedValue;
      }
      else{
        newTempRects[rectIndex].rect.size[field] = parsedValue;
      }
      setTempRects(newTempRects);
    }
  };

  // Обработчик изменения точки соединения
  const handleConnectionPointChange = (
    rectIndex: number,
    field: "x" | "y" | "angle",
    value: string
  ) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      const newTempRects = [...tempRects];
      if (field === "x" || field === "y"){
        newTempRects[rectIndex].point.point[field] = parsedValue;
      }
      else{
        newTempRects[rectIndex].point[field] = parsedValue;
      }
      
      setTempRects(newTempRects);
    }
  };

  // Обработчик отправки формы для валидации данных
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Получаем ошибки от RectStore
    const validationErrors = rectStore.validateConnectionPoints();
    setErrors(validationErrors);

    // Если нет ошибок, обновляем стор данными из временных данных
    if (validationErrors.length === 0) {
      // Обновляем стор с новыми данными
      rectStore.rects = {...tempRects};
    }
  };

  return (
    <form className="form container" onSubmit={handleSubmit}>
      <div className="rect">
        <h3>Прямоугольник 1</h3>
        <label>
          X:
          <input
            type="number"
            value={tempRects[0].rect.position.x}
            onChange={(e) => handleRectChange(0, "x", e.target.value)}
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            value={tempRects[0].rect.position.y}
            onChange={(e) => handleRectChange(0, "y", e.target.value)}
          />
        </label>
        <label>
          W:
          <input
            type="number"
            value={tempRects[0].rect.size.width}
            onChange={(e) => handleRectChange(0, "width", e.target.value)}
          />
        </label>
        <label>
          H:
          <input
            type="number"
            value={tempRects[0].rect.size.height}
            onChange={(e) => handleRectChange(0, "height", e.target.value)}
          />
        </label>
        <h4>Точка соединения 1</h4>
        <label>
          X:
          <input
            type="number"
            value={tempRects[0].point.point.x}
            onChange={(e) => handleConnectionPointChange(0, "x", e.target.value)}
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            value={tempRects[0].point.point.y}
            onChange={(e) => handleConnectionPointChange(0, "y", e.target.value)}
          />
        </label>
        <label>
          Угол:
          <input
            type="number"
            value={tempRects[0].point.angle}
            onChange={(e) => handleConnectionPointChange(0, "angle", e.target.value)}
          />
        </label>
      </div>

      <div className="rect">
        <h3>Прямоугольник 2</h3>
        <label>
          X:
          <input
            type="number"
            value={tempRects[1].rect.position.x}
            onChange={(e) => handleRectChange(1, "x", e.target.value)}
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            value={tempRects[1].rect.position.y}
            onChange={(e) => handleRectChange(1, "y", e.target.value)}
          />
        </label>
        <label>
          W:
          <input
            type="number"
            value={tempRects[1].rect.size.width}
            onChange={(e) => handleRectChange(1, "width", e.target.value)}
          />
        </label>
        <label>
          H:
          <input
            type="number"
            value={tempRects[1].rect.size.height}
            onChange={(e) => handleRectChange(1, "height", e.target.value)}
          />
        </label>
        <h4>Точка соединения 2</h4>
        <label>
          X:
          <input
            type="number"
            value={tempRects[1].point.point.x}
            onChange={(e) => handleConnectionPointChange(1, "x", e.target.value)}
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            value={tempRects[1].point.point.y}
            onChange={(e) => handleConnectionPointChange(1, "y", e.target.value)}
          />
        </label>
        <label>
          Угол:
          <input
            type="number"
            value={tempRects[1].point.angle}
            onChange={(e) => handleConnectionPointChange(1, "angle", e.target.value)}
          />
        </label>
      </div>

      <div className="submitButt">
        <button type="submit">Проверить</button>
      </div>

      {/* Отображаем ошибки валидации */}
      {errors.length > 0 && (
        <div className="errors">
          <h3>Ошибки валидации:</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
});

export default RectForm;
