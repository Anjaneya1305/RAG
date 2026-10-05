import os

from dotenv import load_dotenv
from google import genai


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=GEMINI_API_KEY)


MODEL_NAME = "gemini-3.8-flash"


def generate_answer(question: str, retrieved_chunks: list[dict]) -> str:
    """
    Generate an answer using Gemini and the chunks retrieved by FAISS.
    """

    context_parts = []

    for chunk in retrieved_chunks:
        document = chunk["document"]

        context_parts.append(
            f"Source: {document['filename']}, "
            f"Page: {document['page']}\n"
            f"{document['text']}"
        )

    context = "\n\n".join(context_parts)

    prompt = f"""
You are an enterprise knowledge assistant.

Answer the user's question using ONLY the information
provided in the context below.

Do not invent information.

If the answer cannot be found in the context, say:
"I could not find the answer in the provided documents."

Context:
{context}

User Question:
{question}

Provide a clear and concise answer.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    return response.text
