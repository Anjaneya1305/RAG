from services.llm_service import client, MODEL_NAME


prompt = """
Explain in one sentence what a PDF text extraction system does.
"""

response = client.models.generate_content(
    model=MODEL_NAME,
    contents=prompt
)

print("\nGemini Response:")
print(response.text)
