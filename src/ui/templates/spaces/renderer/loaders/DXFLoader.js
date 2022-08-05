// Inspired by: https://github.com/gdsestimating/three-dxf/blob/master/src/index.js
//              version: 27 february 2019
// Double check dxf-files: https://en.dwgfastview.com/

/* eslint-disable max-classes-per-file */

import DxfParser from 'dxf-parser'; // https://github.com/gdsestimating/dxf-parser
import * as THREE from 'three';

import openSans from './Open Sans_Regular.json';

/**
* Returns the angle in radians of the vector (p1,p2). In other words, imagine
* putting the base of the vector at coordinates (0,0) and finding the angle
* from vector (1,0) to (p1,p2).
* @param  {Object} p1 start point of the vector
* @param  {Object} p2 end point of the vector
* @return {Number} the angle
*/
function angle2(p1, p2) {
  const v1 = new THREE.Vector2(p1.x, p1.y);
  const v2 = new THREE.Vector2(p2.x, p2.y);
  v2.sub(v1); // sets v2 to be our chord
  v2.normalize();
  return v2.y < 0 ? -Math.acos(v2.x) : Math.acos(v2.x);
}


function polar(point, distance, angle) {
  const result = {};
  result.x = point.x + distance * Math.cos(angle);
  result.y = point.y + distance * Math.sin(angle);
  return result;
}

/**
* Calculates points for a curve between two points
* @param startPoint - the starting point of the curve
* @param endPoint - the ending point of the curve
* @param bulge - a value indicating how much to curve
* @param segments - number of segments between the two given points
*/
class BulgeGeometry extends THREE.BufferGeometry {
  constructor(startPoint, endPoint, bulge, segments) {
    super();

    const p0 = startPoint ? new THREE.Vector2(startPoint.x, startPoint.y) : new THREE.Vector2(0, 0);
    const p1 = endPoint ? new THREE.Vector2(endPoint.x, endPoint.y) : new THREE.Vector2(1, 0);
    const bulg = bulge || 1;

    this.startPoint = p0;
    this.endPoint = p1;
    this.bulge = bulg;

    const angle = 4 * Math.atan(bulg);
    const radius = p0.distanceTo(p1) / 2 / Math.sin(angle / 2);
    const center = polar(startPoint, radius, angle2(p0, p1) + ((Math.PI / 2) - (angle / 2)));
    const segmen = segments || Math.max(Math.abs(Math.ceil(angle / (Math.PI / 18))), 6); // By default want a segment roughly every 10 degrees

    const startAngle = angle2(center, p0);
    const thetaAngle = angle / segmen;

    this.vertices.push(new THREE.Vector3(p0.x, p0.y, 0));

    for (let i = 1; i <= segmen - 1; i++) {
      const vertex = polar(center, Math.abs(radius), startAngle + thetaAngle * i);
      this.vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));
    }
  }
}

/**
* Viewer class for a dxf object.
* @param {Object} dxf - the dxf object
* @param {Object} font - a font loaded with THREE.FontLoader
* @constructor
*/
export default class DXFLoader {
  constructor() {
    this.font = openSans;
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new THREE.FileLoader(this.manager);
    loader.setPath(this.path);
    loader.load(
      url,
      (data) => {
        const parser = new DxfParser();
        try {
          this.dxf = parser.parseSync(data);
        } catch (err) {
          return onError(err);
        }

        this.createLineTypeShaders();
        return onLoad(this.parse());
      },
      onProgress,
      onError,
    );
  }

  parse() {
    const data = this.dxf;
    const group = new THREE.Group();

    for (let i = 0; i < data.entities.length; i++) {
      const entity = data.entities[i];
      let obj;

      if (entity.type === 'DIMENSION') {
        if (entity.block) {
          const block = data.blocks[entity.block];
          if (!block) {
            console.error(`Missing referenced block "${entity.block}"`); // eslint-disable-line no-console
          } else {
            for (let j = 0; j < block.entities.length; j++) {
              obj = this.drawEntity(block.entities[j]);
            }
          }
        } else {
          console.warn('WARNING: No block for DIMENSION entity.'); // eslint-disable-line no-console
        }
      } else {
        obj = this.drawEntity(entity);
      }

      if (obj) {
        group.add(obj);
      }
    }

    return group;
  }

  drawEntity(entity) {
    switch (entity.type) {
      case 'CIRCLE':
      case 'ARC':
        return this.drawArc(entity);
      case 'LWPOLYLINE':
      case 'LINE':
      case 'POLYLINE':
        return this.drawLine(entity);
      case 'TEXT':
        return this.drawText(entity);
      case 'SOLID':
        return this.drawSolid(entity);
      case 'POINT':
        return this.drawPoint(entity);
      case 'INSERT':
        return this.drawBlock(entity);
      case 'SPLINE':
        return this.drawSpline(entity);
      case 'MTEXT':
        return this.drawMtext(entity);
      case 'ELLIPSE':
        return this.drawEllipse(entity);
      default:
        console.log(`Unsupported Entity Type: ${entity.type}`); // eslint-disable-line no-console
        return null;
    }
  }

  drawEllipse(entity) {
    const xrad = Math.sqrt((entity.majorAxisEndPoint.x ** 2) + (entity.majorAxisEndPoint.y ** 2));
    const yrad = xrad * entity.axisRatio;
    const rotation = Math.atan2(entity.majorAxisEndPoint.y, entity.majorAxisEndPoint.x);

    const curve = new THREE.EllipseCurve(
      entity.center.x,
      entity.center.y,
      xrad,
      yrad,
      entity.startAngle,
      entity.endAngle,
      false, // Always counterclockwise
      rotation,
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ linewidth: 1, color: this.getColor(entity) });

    // Create the final object to add to the scene
    const ellipse = new THREE.Line(geometry, material);
    return ellipse;
  }

  drawMtext(entity) {
    const geometry = new THREE.TextGeometry(entity.text, {
      font: this.font,
      size: entity.height * (4 / 5),
      height: 1,
    });

    const material = new THREE.MeshBasicMaterial({ color: this.getColor(entity) });
    const text = new THREE.Mesh(geometry, material);

    // Measure what we rendered.
    const measure = new THREE.Box3();
    measure.setFromObject(text);
    const textWidth = measure.max.x - measure.min.x;

    // If the text ends up being wider than the box, it's supposed
    // to be multiline. Doing that in threeJS is overkill.
    if (textWidth > entity.width) {
      return undefined;
    }

    text.position.z = 0;
    switch (entity.attachmentPoint) {
      case 1:
        // Top Left
        text.position.x = entity.position.x;
        text.position.y = entity.position.y - entity.height;
        break;
      case 2:
        // Top Center
        text.position.x = entity.position.x - textWidth / 2;
        text.position.y = entity.position.y - entity.height;
        break;
      case 3:
        // Top Right
        text.position.x = entity.position.x - textWidth;
        text.position.y = entity.position.y - entity.height;
        break;
      case 4:
        // Middle Left
        text.position.x = entity.position.x;
        text.position.y = entity.position.y - entity.height / 2;
        break;
      case 5:
        // Middle Center
        text.position.x = entity.position.x - textWidth / 2;
        text.position.y = entity.position.y - entity.height / 2;
        break;
      case 6:
        // Middle Right
        text.position.x = entity.position.x - textWidth;
        text.position.y = entity.position.y - entity.height / 2;
        break;
      case 7:
        // Bottom Left
        text.position.x = entity.position.x;
        text.position.y = entity.position.y;
        break;
      case 8:
        // Bottom Center
        text.position.x = entity.position.x - textWidth / 2;
        text.position.y = entity.position.y;
        break;
      case 9:
        // Bottom Right
        text.position.x = entity.position.x - textWidth;
        text.position.y = entity.position.y;
        break;
      default:
        return undefined;
    }

    return text;
  }

  drawSpline(entity) {
    const points = entity.controlPoints.map((vec) => new THREE.Vector2(vec.x, vec.y));

    let interpolatedPoints = [];
    let curve;
    if (entity.degreeOfSplineCurve === 2 || entity.degreeOfSplineCurve === 3) {
      for (let i = 0; i + 2 < points.length; i += 2) {
        if (entity.degreeOfSplineCurve === 2) {
          curve = new THREE.QuadraticBezierCurve(points[i], points[i + 1], points[i + 2]);
        } else {
          curve = new THREE.QuadraticBezierCurve3(points[i], points[i + 1], points[i + 2]);
        }
        interpolatedPoints.push(curve.getPoints(50));
      }
    } else {
      curve = new THREE.SplineCurve(points);
      interpolatedPoints = curve.getPoints(100);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(interpolatedPoints);
    const material = new THREE.LineBasicMaterial({ linewidth: 1, color: this.getColor(entity) });
    const splineObject = new THREE.Line(geometry, material);

    return splineObject;
  }

  drawLine(entity) {
    const geometry = new THREE.BufferGeometry();

    // create geometry
    for (let i = 0; i < entity.vertices.length; i++) {
      if (entity.vertices[i].bulge) {
        const bulge = entity.vertices[i].bulge;
        const startPoint = entity.vertices[i];
        const endPoint = i + 1 < entity.vertices.length ? entity.vertices[i + 1] : geometry.vertices[0];

        const bulgeGeometry = new BulgeGeometry(startPoint, endPoint, bulge);

        geometry.vertices.push(bulgeGeometry.vertices);
      } else {
        const vertex = entity.vertices[i];
        geometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, 0));
      }
    }

    if (entity.shape) {
      geometry.vertices.push(geometry.vertices[0]);
    }

    // set material
    let material;
    if (entity.lineType) {
      const lineType = this.dxf.tables.lineType.lineTypes[entity.lineType];
      if (lineType && lineType.pattern && lineType.pattern.length !== 0) {
        material = new THREE.LineDashedMaterial({ color: this.getColor(entity), gapSize: 4, dashSize: 4 });
      }
    }
    if (!material) {
      material = new THREE.LineBasicMaterial({ linewidth: 1, color: this.getColor(entity) });
    }

    return new THREE.Line(geometry, material);
  }

  drawArc(entity) {
    let startAngle;
    let endAngle;
    if (entity.type === 'CIRCLE') {
      startAngle = entity.startAngle || 0;
      endAngle = startAngle + 2 * Math.PI;
    } else {
      startAngle = entity.startAngle;
      endAngle = entity.endAngle;
    }

    const curve = new THREE.ArcCurve(
      0,
      0,
      entity.radius,
      startAngle,
      endAngle,
    );
    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: this.getColor(entity) });
    const arc = new THREE.Line(geometry, material);
    arc.position.x = entity.center.x;
    arc.position.y = entity.center.y;
    arc.position.z = entity.center.z;

    return arc;
  }

  drawSolid(entity) {
    const geometry = new THREE.BufferGeometry();
    const verts = geometry.vertices;
    verts.push(new THREE.Vector3(entity.points[0].x, entity.points[0].y, entity.points[0].z));
    verts.push(new THREE.Vector3(entity.points[1].x, entity.points[1].y, entity.points[1].z));
    verts.push(new THREE.Vector3(entity.points[2].x, entity.points[2].y, entity.points[2].z));
    verts.push(new THREE.Vector3(entity.points[3].x, entity.points[3].y, entity.points[3].z));

    // Calculate which direction the points are facing (clockwise or counter-clockwise)
    const vector1 = new THREE.Vector3();
    const vector2 = new THREE.Vector3();
    vector1.subVectors(verts[1], verts[0]);
    vector2.subVectors(verts[2], verts[0]);
    vector1.cross(vector2);

    // If z < 0 then we must draw these in reverse order
    if (vector1.z < 0) {
      geometry.faces.push(new THREE.Face3(2, 1, 0));
      geometry.faces.push(new THREE.Face3(2, 3, 1));
    } else {
      geometry.faces.push(new THREE.Face3(0, 1, 2));
      geometry.faces.push(new THREE.Face3(1, 3, 2));
    }

    const material = new THREE.MeshBasicMaterial({ color: this.getColor(entity) });
    return new THREE.Mesh(geometry, material);
  }

  drawText(entity) {
    const geometry = new THREE.TextGeometry(entity.text, {
      font: this.font,
      height: 0,
      size: entity.textHeight || 12,
    });
    const material = new THREE.MeshBasicMaterial({ color: this.getColor(entity) });
    const text = new THREE.Mesh(geometry, material);
    text.position.x = entity.startPoint.x;
    text.position.y = entity.startPoint.y;
    text.position.z = entity.startPoint.z;
    return text;
  }

  drawPoint(entity) {
    const color = this.getColor(entity);
    const colors = new Float32Array(3);
    colors[0] = color.r;
    colors[1] = color.g;
    colors[2] = color.b;

    const geometry = new THREE.BufferGeometry();
    geometry.vertices.push(new THREE.Vector3(entity.position.x, entity.position.y, entity.position.z));
    geometry.colors = colors;
    geometry.computeBoundingBox();

    const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: THREE.VertexColors });
    const point = new THREE.Points(geometry, material);
    return point;
  }

  drawBlock(entity) {
    const block = this.dxf.blocks[entity.name];

    if (!block.entities) {
      return null;
    }

    const group = new THREE.Object3D();

    if (entity.xScale) {
      group.scale.x = entity.xScale;
    }
    if (entity.yScale) {
      group.scale.y = entity.yScale;
    }
    if (entity.rotation) {
      group.rotation.z = entity.rotation * (Math.PI / 180);
    }
    if (entity.position) {
      group.position.x = entity.position.x;
      group.position.y = entity.position.y;
      group.position.z = entity.position.z;
    }

    for (let i = 0; i < block.entities.length; i++) {
      const childEntity = this.drawEntity(block.entities[i], group);
      if (childEntity) {
        group.add(childEntity);
      }
    }

    return group;
  }

  getColor(entity) {
    const data = this.dxf;

    let color;
    if (entity.color) {
      color = entity.color;
    } else if (data.tables && data.tables.layer && data.tables.layer.layers[entity.layer]) {
      color = data.tables.layer.layers[entity.layer].color;
    }

    return color || 0x000000; // default to black
  }

  createLineTypeShaders() {
    const data = this.dxf;
    if (!data.tables || !data.tables.lineType) {
      return;
    }

    const ltypes = data.tables.lineType.lineTypes;

    Object.keys(ltypes).forEach((type) => {
      const ltype = ltypes[type];
      if (ltype.pattern) {
        ltype.material = DXFLoader.createDashedLineShader(ltype.pattern);
      }
    });
  }

  static createDashedLineShader(pattern) {
    let totalLength = 0.0;

    for (let i = 0; i < pattern.length; i++) {
      totalLength += Math.abs(pattern[i]);
    }

    return {
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.common,
        THREE.UniformsLib.fog,
        {
          pattern: { type: 'fv1', value: pattern },
          patternLength: { type: 'f', value: totalLength },
        },
      ]),

      vertexShader: [
        'attribute float lineDistance;',
        'varying float vLineDistance;',
        THREE.ShaderChunk.color_pars_vertex,
        'void main() {',
        THREE.ShaderChunk.color_vertex,
        'vLineDistance = lineDistance;',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}',
      ].join('\n'),

      fragmentShader: [
        'uniform vec3 diffuse;',
        'uniform float opacity;',
        `uniform float pattern[${pattern.length}];`,
        'uniform float patternLength;',
        'varying float vLineDistance;',
        THREE.ShaderChunk.color_pars_fragment,
        THREE.ShaderChunk.fog_pars_fragment,
        'void main() {',
        'float pos = mod(vLineDistance, patternLength);',
        `for ( int i = 0; i < ${pattern.length}; i++ ) {`,
        'pos = pos - abs(pattern[i]);',
        'if( pos < 0.0 ) {',
        'if( pattern[i] > 0.0 ) {',
        'gl_FragColor = vec4(1.0, 0.0, 0.0, opacity );',
        'break;',
        '}',
        'discard;',
        '}',
        '}',
        THREE.ShaderChunk.color_fragment,
        THREE.ShaderChunk.fog_fragment,
        '}',
      ].join('\n'),
    };
  }
}
