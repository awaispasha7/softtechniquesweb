// File parser utilities for PDF and Word documents

export interface ParsedDocument {
  text: string;
  images: File[];
  title?: string;
}

// Parse PDF file - Browser compatible using pdf.js
export const parsePDF = async (file: File): Promise<ParsedDocument> => {
  try {
    // Use PDF.js for browser compatibility
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker - try local first, then CDN fallbacks
    // This avoids CORS issues by using a local worker file
    const version = pdfjsLib.version || '5.4.394';
    
    // Try local worker first (from public folder), then CDN fallbacks
    // If you copy pdf.worker.min.mjs to public folder, it will use that
    const isLocal = typeof window !== 'undefined' && window.location.origin;
    const localWorker = isLocal ? `${window.location.origin}/pdf.worker.min.mjs` : null;
    
    const workerUrls = [
      localWorker, // Try local first
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
      `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`,
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.js`,
    ].filter(Boolean) as string[];
    
    // Set worker source - prefer local to avoid CORS
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const numPages = pdf.numPages;
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          // Check if item has 'str' property (TextItem) vs TextMarkedContent
          // Type guard to narrow the type properly
          if ('str' in item) {
            return (item as { str?: string }).str || '';
          }
          return '';
        })
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return {
      text: fullText.trim(),
      images: [], // PDF images extraction is complex, can be added later
      title: file.name.replace('.pdf', ''),
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file. Please ensure the PDF is not password-protected.');
  }
};

// Parse Word document
export const parseWord = async (file: File): Promise<ParsedDocument> => {
  try {
    // Dynamic import for browser compatibility
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    
    // Extract images from Word document
    const images: File[] = [];
    if (htmlResult.messages) {
      // Images are embedded in the HTML, we'll extract them
      const imageMatches = htmlResult.value.match(/<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"/g);
      if (imageMatches) {
        imageMatches.forEach((match, index) => {
          const base64Match = match.match(/data:image\/([^;]+);base64,([^"]+)/);
          if (base64Match) {
            const mimeType = base64Match[1];
            const base64Data = base64Match[2];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: `image/${mimeType}` });
            const imageFile = new File([blob], `image-${index}.${mimeType}`, { type: `image/${mimeType}` });
            images.push(imageFile);
          }
        });
      }
    }
    
    return {
      text: result.value,
      images: images,
      title: file.name.replace(/\.(docx?|doc)$/i, ''),
    };
  } catch (error) {
    console.error('Error parsing Word document:', error);
    throw new Error('Failed to parse Word document');
  }
};

// Main function to parse any supported file
export const parseDocument = async (file: File): Promise<ParsedDocument> => {
  const fileType = file.type || file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword' ||
    file.name.toLowerCase().endsWith('.docx') ||
    file.name.toLowerCase().endsWith('.doc')
  ) {
    return parseWord(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or Word document.');
  }
};

