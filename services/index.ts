import { FileSystem } from '../utils/fileSystem.ts';
import { type Base } from './base.ts';

const services: Base[] = [];
let service:Base|undefined;
for (const file of FileSystem.GetAllFilePaths(__dirname)) {
  if (!file.includes('.spec.') && !file.endsWith('md')) {
    service = require(file).default as Base;
    if (service != undefined) {
      services.push(service);
    }
  }
}

export default services;