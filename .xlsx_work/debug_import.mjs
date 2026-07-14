import fs from 'node:fs/promises';
await fs.writeFile('../.xlsx_work/debug.txt','start\n');
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
await fs.appendFile('../.xlsx_work/debug.txt','imported\n');
const input = await FileBlob.load('../Template-Technical.repaired.xlsx');
await fs.appendFile('../.xlsx_work/debug.txt','loaded\n');
const wb = await SpreadsheetFile.importXlsx(input);
await fs.appendFile('../.xlsx_work/debug.txt',`workbook ${wb.worksheets.items.length}\n`);
console.log('done');
