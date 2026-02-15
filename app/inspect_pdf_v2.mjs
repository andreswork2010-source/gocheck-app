import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function logFields() {
    const pdfBytes = fs.readFileSync('./public/forms/formulario_schengen_es.pdf');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    console.log('PDF Version:', pdfDoc.getForm().fields.length);
    console.log('Is Form:', pdfDoc.getForm().getFields().length > 0);

    // Check if it has XFA
    const xfa = pdfDoc.catalog.get(pdfDoc.context.obj('AcroForm'))?.get(pdfDoc.context.obj('XFA'));
    console.log('Has XFA:', !!xfa);

    const pages = pdfDoc.getPages();
    console.log('Page count:', pages.length);
}

logFields().catch(console.error);
