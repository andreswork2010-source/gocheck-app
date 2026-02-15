import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspectPdf() {
    const pdfPath = path.join(__dirname, 'public', 'forms', 'formulario_schengen_es.pdf');
    const data = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(data);

    const pages = pdfDoc.getPages();
    console.log('Page count:', pages.length);

    const form = pdfDoc.getForm();
    const fields = form.getFields();
    console.log('Field count:', fields.length);

    const report = {
        pages: pages.length,
        fields: fields.map(f => ({ name: f.getName(), type: f.constructor.name }))
    };

    fs.writeFileSync('pdf_report.json', JSON.stringify(report, null, 2));
}

inspectPdf();
