from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import os
import shutil

from services.vector_store import VectorStore
from services.retrieval_service import retrieve_relevant_chunks
from services.llm_service import generate_answer
from services.ingestion_service import ingest_pdf


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

    results = retrieve_relevant_chunks(
        request.question,
        vector_store,
        top_k=3
    )

    answer = generate_answer(
        request.question,
        results
    )

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


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    os.makedirs("uploads", exist_ok=True)

    file_path = os.path.join(
        "uploads",
        file.filename
    )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = ingest_pdf(
            file_path,
            file.filename,
            vector_store
        )

        vector_store.save()

        return {
            "message": "PDF uploaded and indexed successfully",
            "document": result
        }

    except Exception as error:
        print("Upload error:", error)

        raise HTTPException(
            status_code=500,
            detail="Failed to process PDF"
        )

    finally:
        file.file.close()
