from services.pdf_service import extract_text_from_pdf
from services.chunk_service import chunk_text
from services.embedding_service import generate_embeddings
from services.vector_store import VectorStore


def ingest_pdf(file_path: str, filename: str, vector_store: VectorStore):
    """
    Process a PDF and add its chunks to the vector store.
    """

    # 1. Extract text from every page
    pages = extract_text_from_pdf(file_path)

    documents = []

    # 2. Split each page into chunks
    for page in pages:

        chunks = chunk_text(page["text"])

        for chunk in chunks:
            documents.append({
                "filename": filename,
                "page": page["page"],
                "text": chunk
            })

    # 3. Generate embeddings
    texts = [document["text"] for document in documents]

    embeddings = generate_embeddings(texts)

    # 4. Clear the previous index before indexing the new PDF
    vector_store.reset()

    # 5. Add embeddings + metadata to FAISS
    vector_store.add_documents(
        embeddings,
        documents
    )

    return {
        "filename": filename,
        "pages": len(pages),
        "chunks": len(documents)
    }
