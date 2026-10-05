from fastapi import FastAPI
from pydantic import BaseModel

from services.vector_store import VectorStore
from services.retrieval_service import retrieve_relevant_chunks
from services.llm_service import generate_answer


app = FastAPI(
    title="Enterprise RAG Service",
    description="Python RAG backend for the Enterprise Knowledge Assistant",
    version="1.0.0"
)


# Load FAISS index
vector_store = VectorStore()

try:
    vector_store.load()
    print("FAISS vector store loaded successfully")
except FileNotFoundError:
    print("FAISS index not found. Upload and ingest documents first.")


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def root():
    return {
        "message": "Enterprise RAG Service is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    # Retrieve relevant chunks
    results = retrieve_relevant_chunks(
        request.question,
        vector_store,
        top_k=3
    )

    # Generate answer
    answer = generate_answer(
        request.question,
        results
    )

    # Return sources
    sources = []

    for result in results:
        document = result["document"]

        sources.append({
            "filename": document["filename"],
            "page": document["page"],
            "score": result["score"]
        })

    return {
        "question": request.question,
        "answer": answer,
        "sources": sources
    }
