"use client";

import { useState, useRef } from "react";
import { Upload, File, X } from "lucide-react";

export default function FileUploader({ onFilesSelected, accept }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(Array.from(e.dataTransfer.files));
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    };

    return (
        <div
            className={`dropzone ${isDragging ? "active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                multiple
                accept={accept || ".docx,.txt,.jpg,.jpeg,.png"}
                style={{ display: "none" }}
            />
            <div className="flex-col flex-center gap-4">
                <Upload size={48} color={isDragging ? "#3b82f6" : "#94a3b8"} />
                <div>
                    <p style={{ fontSize: "1.125rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                        Click to upload or drag and drop
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        Supported formats: DOCX, TXT, JPG, PNG
                    </p>
                </div>
            </div>
        </div>
    );
}
