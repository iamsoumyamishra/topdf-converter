"use client";

import { useState } from "react";
import FileUploader from "./FileUploader";
import { FileText, Image as ImageIcon, FileType, Trash2, Download, Loader2 } from "lucide-react";
import { convertFilesToPdf } from "@/utils/pdfConversion";

export default function Converter() {
    const [files, setFiles] = useState([]);
    const [isConverting, setIsConverting] = useState(false);
    const [convertedPdf, setConvertedPdf] = useState(null);

    const handleFilesSelected = (newFiles) => {
        setFiles((prev) => [...prev, ...newFiles]);
        setConvertedPdf(null);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setConvertedPdf(null);
    };

    const getFileIcon = (type) => {
        if (type.includes("image")) return <ImageIcon size={20} />;
        if (type.includes("text") || type.includes("plain")) return <FileText size={20} />;
        if (type.includes("word") || type.includes("officedocument")) return <FileType size={20} />;
        return <FileText size={20} />;
    };

    const handleConvert = async () => {
        if (files.length === 0) return;

        setIsConverting(true);
        setConvertedPdf(null);

        try {
            const pdfBlob = await convertFilesToPdf(files);
            setConvertedPdf(pdfBlob);
        } catch (error) {
            console.error("Conversion failed", error);
            alert("Conversion failed. See console for details.");
        } finally {
            setIsConverting(false);
        }
    };

    const handleDownload = () => {
        if (!convertedPdf) return;

        const url = URL.createObjectURL(convertedPdf);
        const a = document.createElement("a");
        a.href = url;
        a.download = "converted_files.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <FileUploader onFilesSelected={handleFilesSelected} />

            {files.length > 0 && (
                <div className="file-list">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="file-item">
                            <div className="file-info">
                                <div style={{ color: "var(--primary)" }}>
                                    {getFileIcon(file.type)}
                                </div>
                                <div>
                                    <div className="file-name">{file.name}</div>
                                    <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                            </div>
                            <button className="remove-btn" onClick={() => removeFile(index)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="converter-actions">
                {convertedPdf ? (
                    <button className="btn btn-primary" onClick={handleDownload}>
                        <Download size={20} style={{ marginRight: "0.5rem" }} />
                        Download PDF
                    </button>
                ) : (
                    files.length > 0 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleConvert}
                            disabled={isConverting}
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" style={{ marginRight: "0.5rem" }} />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    Convert to PDF
                                </>
                            )}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
