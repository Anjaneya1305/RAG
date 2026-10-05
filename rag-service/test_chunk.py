from services.chunk_service import chunk_text


text = (
    "Enterprise RAG Python Test. "
    "This document is used to test PDF text extraction. "
    "We will later split large documents into smaller chunks "
    "before generating embeddings for semantic search."
)

chunks = chunk_text(text, chunk_size=50, overlap=10)

for index, chunk in enumerate(chunks, start=1):
    print(f"\nChunk {index}:")
    print(chunk)
