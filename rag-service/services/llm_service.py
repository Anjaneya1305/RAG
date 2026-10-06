import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-3.8-flash"


def generate_answer(question, results):

    context_parts = []

    for result in results:
        document = result["document"]

        context_parts.append(
            f"Source: {document['filename']}\n"
            f"Page: {document['page']}\n"
            f"Content:\n{document['text']}"
        )

    context = "\n\n---\n\n".join(context_parts)

    prompt = f"""
You are an enterprise knowledge assistant.

Answer the user's question using only the provided document context.

If the answer cannot be found in the context, say that the information
is not available in the provided documents.

User question:
{question}

Document context:
{context}
"""

    max_retries = 3

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )

            return response.text

        except Exception as error:

            error_text = str(error)

            print(
                f"Gemini attempt {attempt + 1}/{max_retries} failed: "
                f"{error_text}"
            )

            # Hide provider-specific quota details from the user.
            if (
                "429" in error_text
                or "RESOURCE_EXHAUSTED" in error_text
                or "quota" in error_text.lower()
                or "retryDelay" in error_text
            ):
                raise RuntimeError(
                    "AI service temporarily unavailable. "
                    "The current AI usage limit has been reached. "
                    "Please try again later."
                )

            if "503" not in error_text and "UNAVAILABLE" not in error_text:
                raise RuntimeError(
                    "AI service is currently unavailable. "
                    "Please try again later."
                )

            if attempt < max_retries - 1:
                wait_time = 3 * (attempt + 1)

                print(
                    f"Gemini temporarily unavailable. "
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)

            if attempt < max_retries - 1:
                wait_time = 3 * (attempt + 1)

                print(
                    f"Gemini temporarily unavailable. "
                    f"Retrying in {wait_time} seconds..."
                )

                time.sleep(wait_time)

    raise RuntimeError(
        "Gemini is temporarily unavailable after multiple retries. "
        "Please try again shortly."
    )
