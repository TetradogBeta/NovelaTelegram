// deno-lint-ignore-file no-explicit-any
import * as fs from 'node:fs';
import * as fsExtra from 'fs-extra';
import * as Path from 'node:path';
import { execSync } from 'node:child_process';
import { type Buffer } from 'node:buffer'; // Explicit import for Buffer to ensure compatibility

export class FileSystem {
  public static GetFileName(filePath: string, withExt = false) {
    const fileName = Path.basename(filePath);
    return withExt ? fileName : Path.parse(fileName).name;
  }

  public static *GetFiles(dir: string, encoding: string = 'base64', nameData: string = 'dataBase64') {
    const items = fs.readdirSync(dir);
    for (const itemName of items) {
      const currentItem = Path.join(dir, itemName);
      const stat = fs.lstatSync(currentItem);

      if (!stat.isDirectory()) {
        const item = FileSystem.GetFile(currentItem, encoding, nameData);
        item.dir = dir;
        yield item;
      }
    }
  }

  public static GetFile(filePath: string, encoding:string = 'base64', nameData: string = 'dataBase64') {
    const fileName = Path.basename(filePath);
    const fileExt = Path.extname(filePath).slice(1);
    const baseName = Path.parse(fileName).name;
    const data = fs.readFileSync(filePath).toString(encoding as any);

    return {
      fileName: baseName,
      fileExt,
      [nameData]: data,
    };
  }

  public static Save(filePath: string, data: string | Array<string>, encoding?: fs.WriteFileOptions) {
    let isOk = true;
    let folderPath: string;
    filePath = FileSystem.Resolve(filePath);
    folderPath = Path.dirname(filePath);
    if (Array.isArray(data)) {
      data = data.join('\n');
    } else {
      data = String(data);
    }

    FileSystem.Delete(filePath);
    try {
      FileSystem.CreateDirIfNoExist(folderPath);
      fs.writeFileSync(filePath, data, encoding);
    } catch {
      isOk = false;
    }
    return isOk;
  }

  public static Exists(filePath: string) {
    return fs.existsSync(filePath);
  }
  public static IsEmpty(folderPath: string) {
    if (!folderPath.endsWith(Path.sep)) {
      folderPath += Path.sep;
    }
    const { length } = fs.readdirSync(folderPath);
    return length === 0;
  }

  public static GetAllFilePaths(dir: string) {
    const result: Array<string> = [];
    if (FileSystem.Exists(dir)) {
      FileSystem._GetAllFilePaths(dir, result);
    }
    return result;
  }
  public static GetAllDirs(dir: string) {
    const result: Array<string> = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        result.push(Path.join(dir, item.name));
      }
    }
    return result;
  }
  public static CreateDirIfNoExist(dir: string) {
    let isOk = true;
    dir = FileSystem.Resolve(dir);
    try {
      if (!FileSystem.Exists(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch ({ message }: any) {
      isOk = false;
    }
    return isOk;
  }

  public static DeleteDirIfExist(dir: string) {
    dir = FileSystem.Resolve(dir);
    if (FileSystem.Exists(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  private static _GetAllFilePaths(dir: string, files: Array<string>) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const currentItem = Path.join(dir, item.name);
      if (item.isDirectory()) {
        FileSystem._GetAllFilePaths(currentItem, files);
      } else {
        files.push(currentItem);
      }
    }
  }

  public static Resolve(path: string) {
    if (!path.startsWith(Path.sep)) {
      path = `${Path.sep}${path}`;
    }
    return path;
  }

  public static Delete(filePath: string) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  }

  public static IsAUserValidFile(filePath: string) {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.uid === process.getuid!();
    }
    return false;
  }

  public static HasFreeSpace(minFreeSpace: number) {
    const MIN_FREE_SPACE = minFreeSpace * 1024 ** 3;
    const total = FileSystem.GetFreeSpace();
    return total > MIN_FREE_SPACE;
  }

  public static GetFreeSpace(path = '/'): number {
    try {
      const stdout = execSync(`df -k ${path}`);
      const lines = stdout.toString().split('\n');
      const infoLine = lines[1];
      const [, , , available] = infoLine.split(/\s+/);
      return parseInt(available) * 1024; // Convert from kilobytes to bytes
    } catch {
      return 0;
    }
  }

  public static CompressFolder(sourceDir: string, outputFilePath: string): boolean {
    sourceDir = FileSystem.Resolve(sourceDir);
    outputFilePath = FileSystem.Resolve(outputFilePath);
    try {
      execSync(`7z a -r "${outputFilePath}" "${sourceDir}"`);
      return true;
    } catch {
      return false;
    }
  }

  public static CopyFolder(source: string, destination: string): boolean {
    let isOk = true;
    source = FileSystem.Resolve(source);
    destination = FileSystem.Resolve(destination);

    try {
      fsExtra.ensureDirSync(destination);
      fsExtra.copySync(source, destination);
    } catch {
      isOk = false;
    }
    return isOk;
  }

  // Added missing methods

  public static SaveBuffer(filePath: string, buffer: Buffer) {
    filePath = FileSystem.Resolve(filePath);
    FileSystem.Delete(filePath);
    fs.writeFileSync(filePath, buffer);
  }

  public static LoadBuffer(filePath: string): Buffer {
    filePath = FileSystem.Resolve(filePath);
    return fs.readFileSync(filePath);
  }

  public static GetFilesAsBuffers(dir: string) {
    FileSystem.CreateDirIfNoExist(dir);

    const items = fs.readdirSync(dir);
    return items
      .map(itemName => {
        const currentItem = Path.join(dir, itemName);
        const stat = fs.lstatSync(currentItem);

        if (!stat.isDirectory()) {
          const data = fs.readFileSync(currentItem);
          return { fileName: itemName, data };
        }
      })
      .filter(Boolean) as Array<{ fileName: string; data: Buffer }>;
  }
}