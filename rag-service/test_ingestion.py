from services.embedding_service import generate_embeddings
from services.vector_store import VectorStore


# Create a completely new vector store
vector_store = VectorStore()

# Load previously saved FAISS data
vector_store.load()

print("\nLoaded successfully!")
print("Number of vectors:", vector_store.index.ntotal)
print("Number of documents:", len(vector_store.documents))


# Search the loaded index
query = "What is this document about?"

query_embedding = generate_embeddings([query])[0]

results = vector_store.search(
    query_embedding,
    top_k=3
)


print("\nSearch Results:\n")

for result in results:
    print("Score:", result["score"])
    print("File:", result["document"]["filename"])
    print("Page:", result["document"]["page"])
    print("Text:", result["document"]["text"])
    print("-" * 60)
