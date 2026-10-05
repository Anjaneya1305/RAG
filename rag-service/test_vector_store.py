from services.embedding_service import generate_embeddings
from services.vector_store import VectorStore


documents = [
    {
        "filename": "employee_handbook.pdf",
        "page": 1,
        "text": "Employees receive health insurance and medical benefits from the company."
    },
    {
        "filename": "employee_handbook.pdf",
        "page": 2,
        "text": "Employees can work remotely two days per week."
    },
    {
        "filename": "employee_handbook.pdf",
        "page": 3,
        "text": "The company provides paid vacation and sick leave."
    }
]


# Generate embeddings for our document chunks
texts = [document["text"] for document in documents]

embeddings = generate_embeddings(texts)


# Create FAISS vector store
vector_store = VectorStore()

vector_store.add_documents(
    embeddings,
    documents
)


# Search query
query = "What medical insurance benefits do employees receive?"

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
