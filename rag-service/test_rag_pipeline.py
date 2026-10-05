from services.vector_store import VectorStore
from services.retrieval_service import retrieve_relevant_chunks
from services.llm_service import generate_answer


# Load the saved FAISS index
vector_store = VectorStore()
vector_store.load()


# Ask a question
question = "What is this document used for?"


# Retrieve relevant chunks from FAISS
results = retrieve_relevant_chunks(
    question,
    vector_store,
    top_k=3
)


print("\nRetrieved Chunks:")
for result in results:
    document = result["document"]

    print(f"\nScore: {result['score']:.4f}")
    print(f"File: {document['filename']}")
    print(f"Page: {document['page']}")
    print(f"Text: {document['text']}")


# Generate answer using Gemini
answer = generate_answer(
    question,
    results
)


print("\nGemini Answer:")
print(answer)
