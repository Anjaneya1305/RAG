import faiss
import numpy as np
import json
import os


EMBEDDING_DIMENSION = 384


class VectorStore:
    def __init__(self):
        self.index = faiss.IndexFlatIP(EMBEDDING_DIMENSION)
        self.documents = []

    def add_documents(self, embeddings, documents):
        """
        Add document embeddings and metadata to FAISS.
        """

        if len(embeddings) != len(documents):
            raise ValueError(
                "Number of embeddings must match number of documents"
            )

        vectors = np.asarray(embeddings, dtype="float32")

        self.index.add(vectors)
        self.documents.extend(documents)

    def search(self, query_embedding, top_k=3):
        """
        Search for the most relevant documents.
        """

        if self.index.ntotal == 0:
            return []

        query_vector = np.asarray(
            [query_embedding],
            dtype="float32"
        )

        top_k = min(top_k, self.index.ntotal)

        scores, indices = self.index.search(
            query_vector,
            top_k
        )

        results = []

        for score, index in zip(scores[0], indices[0]):
            if index == -1:
                continue

            results.append({
                "score": float(score),
                "document": self.documents[index]
            })

        return results

    def save(self, index_path="data/faiss.index", metadata_path="data/documents.json"):
        """
        Save the FAISS index and document metadata to disk.
        """

        os.makedirs("data", exist_ok=True)

        faiss.write_index(self.index, index_path)

        with open(metadata_path, "w", encoding="utf-8") as file:
            json.dump(
                self.documents,
                file,
                ensure_ascii=False,
                indent=2
            )

    def load(self, index_path="data/faiss.index", metadata_path="data/documents.json"):
        """
        Load the FAISS index and document metadata from disk.
        """

        if not os.path.exists(index_path):
            raise FileNotFoundError(
                f"FAISS index not found: {index_path}"
            )

        if not os.path.exists(metadata_path):
            raise FileNotFoundError(
                f"Document metadata not found: {metadata_path}"
            )

        self.index = faiss.read_index(index_path)

        with open(metadata_path, "r", encoding="utf-8") as file:
            self.documents = json.load(file)
