import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load('Template-Technical.repaired.xlsx'));
for (const sh of wb.worksheets.items) {
  console.log(`SHEET: ${sh.name} | ${sh.getUsedRange().address}`);
  console.log((await wb.inspect({kind:'table,region',sheetId:sh.name,range:sh.getUsedRange().address,maxChars:7000,tableMaxRows:50,tableMaxCols:45,tableMaxCellChars:120})).ndjson);
}
