export const MAX_FILE_SIZE = { // In MB.
  default: 5,
  space: 50,
};

export const SUPPORTED_FILE_TYPES = {
  space: ['png', 'jpg', 'jpeg', 'svg', 'dxf'],
};

const fileTypeRegex = /\.([^.]*?)(?=\?|#|$)/;

export function fileTypeFromName(name) {
  const ext = name.match(fileTypeRegex);
  return ext ? ext[1] : '';
}

export function fileTypeCheck(file, types) {
  const type = file && fileTypeFromName(file.name);
  if (!type || types.indexOf(type) < 0) {
    const error = new Error('File type is not supported. Please choose a file in one of the following formats: {{types}}.');
    error.interpolation = { types: types.join(', ') };
    throw error;
  }
}

export function fileSizeCheck(file, maxMB) {
  if (!file || file.size > maxMB * 1000 * 1000) {
    const error = new Error('File size is too big. Please choose a file smaller than {{maxMB}} MB.');
    error.interpolation = { maxMB };
    throw error;
  }
}
