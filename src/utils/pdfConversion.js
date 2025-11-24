import jsPDF from "jspdf";
import mammoth from "mammoth";

export const convertFilesToPdf = async (files) => {
    const doc = new jsPDF();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (i > 0) doc.addPage();

        try {
            if (file.type.includes("image")) {
                await addImageToPdf(doc, file);
            } else if (file.type.includes("text") || file.name.endsWith(".txt")) {
                await addTextToPdf(doc, file);
            } else if (file.name.endsWith(".docx")) {
                await addDocxToPdf(doc, file);
            } else {
                doc.text(`Unsupported file type: ${file.name}`, 10, 10);
            }
        } catch (error) {
            console.error(`Error converting ${file.name}:`, error);
            doc.text(`Error converting ${file.name}`, 10, 10);
        }
    }

    return doc.output("blob");
};

const addImageToPdf = (doc, file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const imgData = event.target.result;
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            // Calculate dimensions to fit page while maintaining aspect ratio
            const ratio = imgProps.width / imgProps.height;
            let w = pdfWidth - 20; // 10mm margin
            let h = w / ratio;

            if (h > pdfHeight - 20) {
                h = pdfHeight - 20;
                w = h * ratio;
            }

            doc.addImage(imgData, "JPEG", 10, 10, w, h);
            resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const addTextToPdf = (doc, file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const splitText = doc.splitTextToSize(text, 180); // 180mm width (A4 is 210mm)

            // Handle pagination for long text
            let y = 10;
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < splitText.length; i++) {
                if (y > pageHeight - 10) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(splitText[i], 10, y);
                y += 7; // Line height
            }
            resolve();
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

const addDocxToPdf = async (doc, file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                const text = result.value;

                const splitText = doc.splitTextToSize(text, 180);
                let y = 10;
                const pageHeight = doc.internal.pageSize.getHeight();

                for (let i = 0; i < splitText.length; i++) {
                    if (y > pageHeight - 10) {
                        doc.addPage();
                        y = 10;
                    }
                    doc.text(splitText[i], 10, y);
                    y += 7;
                }
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};
