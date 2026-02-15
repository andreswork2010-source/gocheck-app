const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function listFields() {
    const pdfPath = path.join(__dirname, 'app', 'public', 'forms', 'formulario_schengen_es.pdf');
    if (!fs.existsSync(pdfPath)) {
        console.error('File not found:', pdfPath);
        return;
    }
    const data = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(data);
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    const fieldNames = fields.map(f => ({
        name: f.getName(),
        type: f.constructor.name
    }));

    fs.writeFileSync('pdf_fields.json', JSON.stringify(fieldNames, null, 2));
    console.log('Fields saved to pdf_fields.json');
}

listFields();
