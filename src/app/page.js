import Converter from "@/components/Converter";

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <h1>ToPDF Converter</h1>
        <p>
          Securely convert your documents and images to PDF entirely in your browser.
          No files are uploaded to any server.
        </p>
      </section>

      <Converter />

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} ToPDF. Built with Next.js.</p>
      </footer>
    </main>
  );
}
