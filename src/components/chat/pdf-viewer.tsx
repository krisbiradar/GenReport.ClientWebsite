import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ExternalLink, FileText } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [error, setError] = useState<boolean>(false);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  function onDocumentLoadError() {
    setError(true);
  }

  const filename = url.split('/').pop() || 'Document.pdf';

  if (error) {
    return (
      <div className="border rounded-md p-4 mb-4 flex items-center justify-between bg-muted/30 max-w-sm">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
          <div className="truncate">
             <p className="text-sm font-medium truncate">{filename}</p>
             <p className="text-xs text-muted-foreground">PDF Document</p>
          </div>
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs shrink-0 ml-4">
          Open
        </a>
      </div>
    );
  }

  return (
    <div className="border border-border bg-background/50 rounded-md overflow-hidden max-w-md mb-4 shadow-sm">
      <div className="bg-muted px-3 py-2 text-xs font-mono break-all line-clamp-1 border-b flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate">{filename}</span>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto flex justify-center bg-black/5">
        <Document 
          file={url} 
          onLoadSuccess={onDocumentLoadSuccess} 
          onLoadError={onDocumentLoadError}
          loading={<div className="p-8 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground"/></div>}
        >
          <Page pageNumber={1} width={350} renderTextLayer={false} renderAnnotationLayer={false} className="shadow-md" />
        </Document>
      </div>
      <div className="bg-muted px-3 py-2 text-xs flex justify-between items-center border-t">
         <span className="text-muted-foreground">
           {numPages ? `1 of ${numPages} pages` : 'Loading pages...'}
         </span>
         <a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 font-medium z-10">
           <ExternalLink className="h-3 w-3" /> View Full PDF
         </a>
      </div>
    </div>
  );
}
