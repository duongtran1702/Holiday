import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const input = await FileBlob.load('Template-Technical.repaired.xlsx');
const wb = await SpreadsheetFile.importXlsx(input);
console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:16000,tableMaxRows:20,tableMaxCols:12,tableMaxCellChars:100})).ndjson);
for (const sh of wb.worksheets.items) {
  const used=sh.getUsedRange();
  console.log('SHEET',sh.name,'USED',used.address);
  const png=await wb.render({sheetName:sh.name,autoCrop:'all',scale:1,format:'png'});
  await fs.writeFile(`${sh.name.replace(/[^a-z0-9]/gi,'_')}.png`,new Uint8Array(await png.arrayBuffer()));
}
