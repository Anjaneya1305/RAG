from services.embedding_service import generate_embeddings
from services.vector_store import VectorStore


def retrieve_relevant_chunks(
    question: str,
    vector_store: VectorStore,
    top_k: int = 3
):
    """
    Retrieve the most relevant document chunks for a question.
    """

    # Convert the user's question into an embedding
    query_embedding = generate_embeddings([question])[0]

    # Search FAISS for the most similar chunks
    results = vector_store.search(
        query_embedding,
        top_k=top_k
    )

    return results
