import { PDFDocument } from 'pdf-lib';

export const loadPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    return await PDFDocument.load(arrayBuffer);
};

export const getPdfPageCount = async (file) => {
    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    return pdf.numPages;
};

export const renderPage = async (file, pageIndex, canvas) => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(pageIndex + 1); // pdfjs is 1-indexed

    const viewport = page.getViewport({ scale: 1 });
    const context = canvas.getContext('2d');

    // Scale to fit within a reasonable thumbnail size (e.g., 200px width)
    const scale = 200 / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
    };

    await page.render(renderContext).promise;
};

export const removePages = async (file, pageIndicesToRemove) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Sort indices in descending order to avoid shifting issues when removing
    const sortedIndices = [...pageIndicesToRemove].sort((a, b) => b - a);

    for (const index of sortedIndices) {
        pdfDoc.removePage(index);
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
};
