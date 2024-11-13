import ConnectionPoint from "../models/ConnectionPoint";
import Point from "../models/Point";
import Rect from "../models/Rect";
import isConnectionValid from "./isConnectionValid";

function toDegrees (angle:number):number {
  return angle * (180 / Math.PI);
}

function toRadians (angle: number): number {
  return angle * (Math.PI / 180);
}

const nextPoint = (point: Point, angle:number, len:number):Point => {
  const x = len * Math.cos(toRadians(angle)) + point.x;
  const y = len * Math.sin(toRadians(angle)) + point.y;
  return { x, y };
}

const vector = (start:Point, end:Point):Point =>{
  const x = end.x - start.x;
  const y = end.y - start.y;
  return {x, y};
}
//нахождение угла между двумя векторами
const angle = (vectorA: Point, vectorB: Point = {x: 1, y: 0}):number => {
    const dot = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
    const lenA = Math.sqrt(vectorA.x*vectorA.x + vectorA.y*vectorA.y);
    const lenB = Math.sqrt(vectorB.x*vectorB.x + vectorB.y*vectorB.y);
    const angle = (dot) / (lenA * lenB);
    return toDegrees(Math.acos(angle));
}

const checkDir = (vectorA:Point, vectorB:Point):boolean => {
  const res =angle(vectorA, vectorB); 
  // console.log(res);   
  return res < 90;
}

const middle = (a:Point, b:Point):Point => {
  const x = (a.x + b.x) / 2;
  const y = (a.y + b.y) / 2;
  return {x, y};
}

const medianLine = (a:Point, b:Point, angle:number):((p: Point) => Point) => {
  const middlePoint = middle(a,b);

  return (p: Point):Point=>{
    if (!(angle%180===0)){
      
      return {x:p.x, y: middlePoint.y }
    } else {
      
      return {x: middlePoint.x, y: p.y}
    }
  }
}

const backMedianLine = (a:Point, b:Point, angle:number, rect1:Rect, rect2:Rect):((p: Point) => Point) => {
  const middlePoint = middle(a,b);
  const xDist = (rect1.size.width + rect2.size.width)/2 + 10; 
  const yDist = (rect1.size.height + rect2.size.height)/2 + 10; 
  const minRectHeight = Math.min(rect1.size.height, rect2.size.height);
  const minRectWidth = Math.min(rect1.size.width, rect2.size.width);

  let isFits = true;
  if (angle%180===0 && (Math.abs(a.y-b.y) < yDist && Math.abs(a.x-b.x)>10) || (angle===90 || angle===270) && Math.abs(a.x-b.x) < xDist){
      isFits = false;
  } 

  const pnewhor = rect1.size.height > rect2.size.height ? a : b;
  const offseth = Math.abs(rect1.position.x - rect2.position.x) - Math.abs(rect1.size.width/2 - rect2.size.width/2)
  
  
  const pnewvert = rect1.size.width > rect2.size.width ? a : b;
  const offsetv = Math.abs(rect1.position.y- rect2.position.y) - Math.abs(rect1.size.height/2 - rect2.size.height/2)
  if (angle%180===0)
    pnewhor.x = Math.abs(a.x-b.x)>10 && Math.abs(a.x-b.x)<(10+minRectWidth)+10 && !isFits ?  offseth + pnewhor.x : pnewhor.x;
  else
    pnewvert.y = Math.abs(a.y-b.y)>10 && Math.abs(a.y-b.y)<(10+minRectHeight)+10 && !isFits ?  offsetv + pnewvert.y : pnewvert.y;

  return (p: Point):Point=>{
    if (angle%180===0){
      
      const sign = (middlePoint.y-pnewhor.y)/Math.abs(middlePoint.y-pnewhor.y) || 1;
      const rectDif = Math.abs(a.x-b.x)>10 ? (rect1.size.height - rect2.size.height)/4 : 0;
      
      
      return {x:p.x, y: middlePoint.y + (sign*rectDif) + (isFits ? 0 : (sign*(10+minRectHeight)))}
    } else {
      
      
      const rectDif = (rect1.size.width - rect2.size.width)/4;
      const sign = (middlePoint.x-pnewvert.x)/Math.abs(middlePoint.x-pnewvert.x) || 1;

      return {x: middlePoint.x + (sign*rectDif) + (isFits ? 0 : (sign*(10+minRectWidth))), y: p.y}
    }
  }
}

const dataConverter = (
    rect1: Rect, 
    rect2: Rect, 
    cPoint1: ConnectionPoint, 
    cPoint2: ConnectionPoint
  ): Point[] => {
    // реализация алгоритма

    if (!isConnectionValid(rect1, cPoint1) || !isConnectionValid(rect2, cPoint2)) {
        throw new Error("Invalid connection point or angle.");
    }
    
    const points: Point[] = [];
    const endpoints: Point[] = [];

    const aAngle = cPoint1.angle; 
    const bAngle = cPoint2.angle;

    
    
    points.push(cPoint1.point);
    endpoints.push(cPoint2.point);
    const offsetaX = Math.abs(rect1.position.y - rect2.position.y) < Math.abs(rect1.size.height-rect2.size.height) ?
    Math.min(10, Math.abs(Math.abs(cPoint1.point.x - rect2.position.x) - Math.abs(rect2.size.width)/2)/2): 10;

    const offsetaY = Math.abs(rect1.position.x - rect2.position.x) < Math.abs(rect1.size.width-rect2.size.width) ?
    Math.min(10, Math.abs(Math.abs(cPoint1.point.y - rect2.position.y) - Math.abs(rect2.size.height)/2)/2): 10;

    const offsetbX = Math.abs(rect1.position.y - rect2.position.y) < Math.abs(rect1.size.height-rect2.size.height) ?
    Math.min(10,  Math.abs(Math.abs(cPoint2.point.x - rect1.position.x) - Math.abs(rect1.size.width)/2)/2,): 10;

    const offsetbY = Math.abs(rect1.position.x - rect2.position.x) < Math.abs(rect1.size.width-rect2.size.width) ?
    Math.min(10, Math.abs(Math.abs(cPoint2.point.y - rect1.position.y) - Math.abs(rect1.size.height)/2)/2): 10;

    points.push(nextPoint(cPoint1.point, aAngle, aAngle % 180 ? offsetaY : offsetaX));
    endpoints.push(nextPoint(cPoint2.point, bAngle, aAngle % 180 ? offsetbY : offsetbX));

    let acur= points[points.length-1];
    let aprev= points[points.length-2];
    let bcur= endpoints[endpoints.length-1];
    let bprev= endpoints[endpoints.length-2];
    let isABack = !checkDir(vector(aprev,acur), vector(acur, bcur));
    let isBBack = !checkDir(vector(bprev,bcur), vector(bcur, acur));
    
    // while (
    //   points[points.length-1].x != endpoints[endpoints.length-1].x 
    //   &&
    //   points[points.length-1].y != endpoints[endpoints.length-1].y
    // ){
      
      // const isDiff = (aAngle+bAngle) % 180 === 0;
      
      // if (isABack && isBBack && isDiff){
      console.log(isABack, isBBack)
      if (isABack && isBBack ){
        console.log(0)
        const f = backMedianLine(acur, bcur, aAngle, rect1, rect2);
        points.push(f(acur));
        endpoints.push(f(bcur));
      } else if(isABack && !isBBack ){
        console.log(1)
        const f = medianLine(bcur, bcur, bAngle+90);
        points.push(f(acur));
        endpoints.push(f(bcur));
      } else if(!isABack && isBBack){
        console.log(2)
        const f = medianLine(acur, acur, aAngle+90);
        points.push(f(acur));
        endpoints.push(f(bcur));
      } else {
        console.log(3)
        const f = medianLine(acur, bcur, aAngle);
        points.push(f(acur));
        endpoints.push(f(bcur));
      }
      // if (isABack && !isBBack){
      //   points.pop();
      // } else if (!isABack && isBBack){
      //   endpoints.pop();
      // }
      acur= points[points.length-1];
      aprev= points[points.length-2];
      bcur= points[points.length-1];
      bprev= points[points.length-2];
      isABack = !checkDir(vector(aprev,acur), vector(acur, bcur));
      isBBack = !checkDir(vector(bprev,bcur), vector(bcur, acur));
    // }

    points.push(...(endpoints.reverse()))
    return points;
};


export default dataConverter;