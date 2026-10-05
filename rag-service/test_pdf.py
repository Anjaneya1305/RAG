from services.pdf_service import extract_text_from_pdf


pages = extract_text_from_pdf("test_rag.pdf")

for page in pages:
    print(f"Page {page['page']}:")
    print(page["text"])
