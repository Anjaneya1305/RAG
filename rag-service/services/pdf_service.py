from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> list[dict]:
    """
    Extract text from every page of a PDF.

    Returns:
        A list containing page number and extracted text.
    """

    reader = PdfReader(file_path)

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        pages.append({
            "page": page_number,
            "text": text.strip()
        })

    return pages
