'use client';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export const PdfPreview = (props: { file: string }) => {
  const [numPages, setNumPages] = useState(0);
  const [width] = useState(window.innerWidth);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <Document file={props.file} onLoadSuccess={onDocumentLoadSuccess}>
      {numPages > 0 && Array.from(new Array(numPages), (_, index) => <Page key={`page_${index + 1}`} pageNumber={index + 1} width={width} />)}
    </Document>
  );
};
