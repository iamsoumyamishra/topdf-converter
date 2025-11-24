"use client";

import { useState, useEffect, useRef } from "react";
import FileUploader from "./FileUploader";
import { Trash2, Download, Loader2, CheckCircle } from "lucide-react";
import { loadPdf, getPdfPageCount, renderPage, removePages } from "@/utils/pdfUtils";

export default function RemovePages() {
    const [file, setFile] = useState(null);
    const [pageCount, setPageCount] = useState(0);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedPdf, setProcessedPdf] = useState(null);
    const [loadingPages, setLoadingPages] = useState(false);

    const canvasRefs = useRef({});

    const handleFileSelected = async (files) => {
        if (files.length > 0 && files[0].type === "application/pdf") {
            const selectedFile = files[0];
            setFile(selectedFile);
            setProcessedPdf(null);
            setSelectedPages(new Set());
            setLoadingPages(true);

            try {
                const count = await getPdfPageCount(selectedFile);
                setPageCount(count);
            } catch (error) {
                console.error("Error loading PDF", error);
                alert("Error loading PDF. Please try another file.");
            } finally {
                setLoadingPages(false);
            }
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    useEffect(() => {
        if (file && pageCount > 0) {
            // Render pages
            for (let i = 0; i < pageCount; i++) {
                const canvas = canvasRefs.current[i];
                if (canvas) {
                    renderPage(file, i, canvas).catch(err => console.error(`Error rendering page ${i + 1}`, err));
                }
            }
        }
    }, [file, pageCount]);

    const togglePageSelection = (index) => {
        const newSelected = new Set(selectedPages);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedPages(newSelected);
    };

    const handleRemovePages = async () => {
        if (selectedPages.size === 0) return;

        setIsProcessing(true);
        try {
            const newPdfBlob = await removePages(file, Array.from(selectedPages));
            setProcessedPdf(newPdfBlob);
        } catch (error) {
            console.error("Error removing pages", error);
            alert("Failed to remove pages.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!processedPdf) return;

        const url = URL.createObjectURL(processedPdf);
        const a = document.createElement("a");
        a.href = url;
        a.download = `modified_${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setPageCount(0);
        setSelectedPages(new Set());
        setProcessedPdf(null);
    };

    return (
        <div className="card" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {!file ? (
                <FileUploader onFilesSelected={handleFileSelected} accept=".pdf" />
            ) : (
                <div className="flex-col gap-6">
                    <div className="flex-between">
                        <div>
                            <h3 style={{ margin: 0 }}>{file.name}</h3>
                            <p style={{ margin: 0, color: "var(--text-muted)" }}>
                                {pageCount} pages • Select pages to remove
                            </p>
                        </div>
                        <button className="btn btn-secondary" onClick={reset}>
                            Upload Different File
                        </button>
                    </div>

                    {loadingPages ? (
                        <div className="flex-center p-8">
                            <Loader2 className="animate-spin" size={32} />
                        </div>
                    ) : (
                        <div className="pages-grid">
                            {Array.from({ length: pageCount }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`page-item ${selectedPages.has(index) ? "selected" : ""}`}
                                    onClick={() => togglePageSelection(index)}
                                >
                                    <div className="page-preview">
                                        <canvas ref={el => canvasRefs.current[index] = el} />
                                        {selectedPages.has(index) && (
                                            <div className="page-overlay">
                                                <Trash2 color="white" size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="page-number">Page {index + 1}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="converter-actions">
                        {processedPdf ? (
                            <button className="btn btn-primary" onClick={handleDownload}>
                                <Download size={20} style={{ marginRight: "0.5rem" }} />
                                Download Modified PDF
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleRemovePages}
                                disabled={selectedPages.size === 0 || isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" style={{ marginRight: "0.5rem" }} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={20} style={{ marginRight: "0.5rem" }} />
                                        Remove {selectedPages.size} Page{selectedPages.size !== 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .pages-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 1rem;
                    max-height: 600px;
                    overflow-y: auto;
                    padding: 1rem;
                    background: var(--background);
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                }
                .page-item {
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }
                .page-preview {
                    position: relative;
                    border: 2px solid transparent;
                    border-radius: 4px;
                    overflow: hidden;
                    background: white;
                    aspect-ratio: 1/1.4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .page-item.selected .page-preview {
                    border-color: var(--destructive);
                }
                .page-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(239, 68, 68, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .page-preview canvas {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                .page-number {
                    text-align: center;
                    margin-top: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}
