'use client';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export const PdfPreview = (props: { file: string }) => {
  const [numPages, setNumPages] = useState(0);
  const [width] = useState(window.innerWidth);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Document file={props.file} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from(new Array(numPages), (_, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={width} />
      ))}
    </Document>
  );
};
