// FPS tracker: https://github.com/mrdoob/stats.js

import * as THREE from 'three';
import { ref } from 'vue';

import SVGLoader from './SVGLoader';
import DXFLoader from './DXFLoader';

function centerGroup(group) {
  const box = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector2();
  size.subVectors(box.max, box.min);
  group.position.x = (size.x / -2) - box.min.x; // eslint-disable-line no-param-reassign
  group.position.y = (size.y / 2) - box.min.y; // eslint-disable-line no-param-reassign
}

function setPos(object, point) {
  object.position.x = (point?.[0] || 0); // eslint-disable-line no-param-reassign
  object.position.y = (point?.[1] || 0); // eslint-disable-line no-param-reassign
}

function progressor(progress) {
  return (xhr) => {
    progress.value = (xhr.loaded / xhr.total) * 100; // eslint-disable-line no-param-reassign
  };
}

function loadDXF({ url, point }, progress) {
  return new Promise((resolve, reject) => {
    const loader = new DXFLoader();
    loader.load(
      url, // resource URL

      (group) => { // onLoad
        centerGroup(group);

        const wrapper = new THREE.Group();
        wrapper.add(group);
        setPos(wrapper, point);
        return resolve(wrapper);
      },

      progressor(progress), // onProgress

      reject, // onError
    );
  });
}

function loadSVG({ url, point }, progress) {
  return new Promise((resolve, reject) => {
    const loader = new SVGLoader();
    loader.load(
      url, // resource URL

      (data) => { // onLoad
        const paths = data.paths;
        if (!paths.length) {
          return reject(new Error('File is not a valid svg.'));
        }

        const group = new THREE.Group();
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          const fillColor = path.userData.style.fill;
          if (fillColor !== undefined && fillColor !== 'none') {
            const material = new THREE.MeshBasicMaterial({
              color: new THREE.Color().setStyle(fillColor),
              opacity: path.userData.style.fillOpacity,
              transparent: path.userData.style.fillOpacity < 1,
              side: THREE.DoubleSide,
              depthWrite: false,
              // wireframe: fillShapesWireframe
            });
            const shapes = path.toShapes(true);
            for (let j = 0; j < shapes.length; j++) {
              const shape = shapes[j];
              const geometry = new THREE.ShapeBufferGeometry(shape);
              const mesh = new THREE.Mesh(geometry, material);
              group.add(mesh);
            }
          }
          const strokeColor = path.userData.style.stroke;
          if (strokeColor !== undefined && strokeColor !== 'none') {
            const material = new THREE.MeshBasicMaterial({
              color: new THREE.Color().setStyle(strokeColor),
              opacity: path.userData.style.strokeOpacity,
              transparent: path.userData.style.strokeOpacity < 1,
              side: THREE.DoubleSide,
              depthWrite: false,
              // wireframe: strokesWireframe
            });
            for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
              const subPath = path.subPaths[j];
              const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style);
              if (geometry) {
                const mesh = new THREE.Mesh(geometry, material);
                group.add(mesh);
              }
            }
          }
        }

        centerGroup(group);
        group.scale.y *= -1; // Three' y is the reverse of svg's.

        const wrapper = new THREE.Group();
        wrapper.add(group);
        setPos(wrapper, point);
        return resolve(wrapper);
      },

      progressor(progress), // onProgress

      reject, // onError
    );
  });
}

function loadImage({ url, point }) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    loader.load(
      url, // resource URL

      (texture) => { // onLoad
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(texture.image.width, texture.image.height, 1);
        setPos(sprite, point);
        resolve(sprite);
      },

      undefined, // onProgress currently not supported

      reject, // onError
    );
  });
}

export default function load(item) {
  const { url } = item;
  const progress = ref(0);

  let loader;

  if (url.endsWith('.dxf')) {
    loader = loadDXF(item, progress);
  } else if (url.endsWith('.svg')) {
    loader = loadSVG(item, progress);
  } else {
    loader = loadImage(item, progress); // Try image loader as default.
  }

  loader.finally(() => {
    progress.value = 100;
  });

  return { progress, loader };
}
