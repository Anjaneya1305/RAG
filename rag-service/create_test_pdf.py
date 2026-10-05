from reportlab.pdfgen import canvas

pdf = canvas.Canvas("test_rag.pdf")

pdf.setFont("Helvetica", 18)
pdf.drawString(100, 700, "Enterprise RAG Python Test")

pdf.setFont("Helvetica", 12)
pdf.drawString(100, 670, "This document is used to test PDF text extraction.")

pdf.save()

print("Test PDF created successfully.")
