import ConnectionPoint from "../models/ConnectionPoint";
import Rect from "../models/Rect";

// Проверка валидности точки подключения
const isConnectionValid = (rect: Rect, connection: ConnectionPoint): boolean => {
    const { point, angle } = connection;
    const { position, size } = rect;
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    return (
      (point.x === position.x - halfWidth && angle === 180) ||
      (point.x === position.x + halfWidth && angle === 0) ||
      (point.y === position.y - halfHeight && angle === 270) ||
      (point.y === position.y + halfHeight && angle === 90)
    );
};

export default isConnectionValid;