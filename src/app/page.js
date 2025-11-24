"use client";

import { useState } from "react";
import Converter from "@/components/Converter";
import RemovePages from "@/components/RemovePages";
import { FileInput, Scissors } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("convert");

  return (
    <main className="container">
      <section className="hero">
        <h1>ToPDF Converter</h1>
        <p>
          Securely convert your documents and images to PDF entirely in your browser.
          No files are uploaded to any server.
        </p>
      </section>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === "convert" ? "active" : ""}`}
          onClick={() => setActiveTab("convert")}
        >
          <FileInput size={18} />
          Convert to PDF
        </button>
        <button
          className={`tab-btn ${activeTab === "remove" ? "active" : ""}`}
          onClick={() => setActiveTab("remove")}
        >
          <Scissors size={18} />
          Remove Pages
        </button>
      </div>

      {activeTab === "convert" ? <Converter /> : <RemovePages />}

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ToPDF. Built by White (SouSou).</p>
      </footer>


    </main>
  );
}
