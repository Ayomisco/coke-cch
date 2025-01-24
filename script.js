// Import PDF.js from the CDN
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';

// Set up the PDF document
const url = 'presentation.pdf'; // Replace with your PDF file path

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.getElementById('pdf-canvas'),
    ctx = canvas.getContext('2d');

// Render a page
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('page-num').textContent = `Page: ${num}`;
}

// Queue a page render
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Navigate to the previous page
function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
}

// Navigate to the next page
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
}

// Event listeners for navigation buttons
document.getElementById('prev-page').addEventListener('click', onPrevPage);
document.getElementById('next-page').addEventListener('click', onNextPage);

// Load the PDF document
pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    document.getElementById('page-num').textContent = `Page: ${pageNum}`;
    renderPage(pageNum);
});