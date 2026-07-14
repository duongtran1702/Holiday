import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load('Template-Technical.repaired.xlsx'));
const ranges=[['3. Master Plan','A1:CB45'],['4. Nhân sự dự án','A1:Z50'],['7. Cập nhật tiến độ','A1:Z60']];
for(const [s,r] of ranges){console.log('\n===',s,r);console.log((await wb.inspect({kind:'table,region',sheetId:s,range:r,maxChars:18000,tableMaxRows:60,tableMaxCols:85,tableMaxCellChars:90})).ndjson)}
