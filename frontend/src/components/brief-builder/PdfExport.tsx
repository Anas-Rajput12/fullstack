import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PdfExportProps {
  brief: {
    title: string;
    objectives: string;
    target_audience: string;
    ai_generated_copy?: any;
    social_posts?: any;
    hashtags?: any;
  };
  onExportComplete?: () => void;
}

const PdfExport: React.FC<PdfExportProps> = ({ brief, onExportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async () => {
    setIsExporting(true);

    try {
      // Create a temporary container for the PDF content
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.backgroundColor = 'white';
      container.style.color = 'black';

      // Add title
      const title = document.createElement('h1');
      title.textContent = brief.title || 'Creative Brief';
      title.style.fontSize = '24px';
      title.style.marginBottom = '20px';
      container.appendChild(title);

      // Add objectives
      const objectivesSection = document.createElement('div');
      objectivesSection.style.marginBottom = '20px';
      const objectivesTitle = document.createElement('h2');
      objectivesTitle.textContent = 'Objectives';
      objectivesTitle.style.fontSize = '18px';
      objectivesTitle.style.marginBottom = '10px';
      objectivesSection.appendChild(objectivesTitle);
      const objectivesText = document.createElement('p');
      objectivesText.textContent = brief.objectives;
      objectivesText.style.fontSize = '12px';
      objectivesSection.appendChild(objectivesText);
      container.appendChild(objectivesSection);

      // Add target audience
      const audienceSection = document.createElement('div');
      audienceSection.style.marginBottom = '20px';
      const audienceTitle = document.createElement('h2');
      audienceTitle.textContent = 'Target Audience';
      audienceTitle.style.fontSize = '18px';
      audienceTitle.style.marginBottom = '10px';
      audienceSection.appendChild(audienceTitle);
      const audienceText = document.createElement('p');
      audienceText.textContent = brief.target_audience;
      audienceText.style.fontSize = '12px';
      audienceSection.appendChild(audienceText);
      container.appendChild(audienceSection);

      // Add AI-generated copy
      if (brief.ai_generated_copy) {
        const copySection = document.createElement('div');
        copySection.style.marginBottom = '20px';
        const copyTitle = document.createElement('h2');
        copyTitle.textContent = 'Generated Copy';
        copyTitle.style.fontSize = '18px';
        copyTitle.style.marginBottom = '10px';
        copySection.appendChild(copyTitle);

        if (brief.ai_generated_copy.headlines) {
          const headlinesTitle = document.createElement('h3');
          headlinesTitle.textContent = 'Headlines';
          headlinesTitle.style.fontSize = '14px';
          headlinesTitle.style.marginBottom = '5px';
          copySection.appendChild(headlinesTitle);

          brief.ai_generated_copy.headlines.forEach((headline: string) => {
            const headlineText = document.createElement('p');
            headlineText.textContent = `• ${headline}`;
            headlineText.style.fontSize = '12px';
            copySection.appendChild(headlineText);
          });
        }

        copySection.style.marginBottom = '20px';
        container.appendChild(copySection);
      }

      // Append container to document body temporarily
      document.body.appendChild(container);

      // Generate PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Use html2canvas to capture the container
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pdfWidth - 20; // 10mm margins on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      // Save PDF
      const filename = `${brief.title || 'creative-brief'}.pdf`.replace(/[^a-z0-9]/gi, '_');
      pdf.save(filename);

      // Remove temporary container
      document.body.removeChild(container);

      onExportComplete?.();
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPdf}
      disabled={isExporting}
      className="btn-primary flex items-center gap-2 disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <span className="animate-spin">⏳</span>
          Exporting...
        </>
      ) : (
        <>
          <span>📄</span>
          Export PDF
        </>
      )}
    </button>
  );
};

export default PdfExport;
