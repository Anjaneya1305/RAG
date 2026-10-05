from services.retrieval_service import retrieve_relevant_chunks
from services.vector_store import VectorStore


# Create a new vector store
vector_store = VectorStore()

# Load the previously saved FAISS index
vector_store.load()


# Ask a question
question = "What is this document used for?"


# Retrieve relevant chunks
results = retrieve_relevant_chunks(
    question,
    vector_store,
    top_k=3
)


print("\nQuestion:")
print(question)

print("\nRelevant Chunks:\n")

for result in results:
    print("Similarity Score:", result["score"])
    print("File:", result["document"]["filename"])
    print("Page:", result["document"]["page"])
    print("Text:", result["document"]["text"])
    print("-" * 60)
