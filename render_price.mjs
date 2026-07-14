import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load('Template-Technical.repaired.xlsx'));
const png=await wb.render({sheetName:'2. Price',range:'A1:L53',scale:1.4,format:'png'});
await fs.writeFile('price_preview.png',new Uint8Array(await png.arrayBuffer()));
