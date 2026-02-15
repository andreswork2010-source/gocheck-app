import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function logFields() {
    const pdfBytes = fs.readFileSync('app/public/forms/formulario_schengen_es.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    fields.forEach(field => {
        const type = field.constructor.name;
        const name = field.getName();
        console.log(`${type}: ${name}`);
    });
}

logFields().catch(console.error);
