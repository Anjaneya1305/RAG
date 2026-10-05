from services.embedding_service import generate_embeddings


texts = [
    "The company provides health insurance to employees.",
    "Employees receive medical insurance benefits."
]

embeddings = generate_embeddings(texts)

print("Number of embeddings:", len(embeddings))
print("Vector dimensions:", embeddings.shape[1])
print("First vector:", embeddings[0])
