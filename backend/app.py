from flask import Flask, request, jsonify
from flask_cors import CORS
import os
#from dotenv import load_dotenv
import fitz  # PyMuPDF
import uuid
import json
import requests

# Load environment variables
#load_dotenv()
MY_API_KEY = os.getenv("API_KEY")

# In-memory storage (for demo purposes only; use Redis/DB in production)
pdf_store = {}

# Flask app setup
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "API is running"})

@app.route('/upload', methods=['POST'])
def uploadfile():
    pdf = request.files.get("PDF")

    if not pdf:
        return jsonify({"error": "No file received"}), 400

    if pdf.mimetype != 'application/pdf':
        return jsonify({"error": "Invalid file type. Please upload a PDF file only."}), 400

    try:
        doc = fitz.open(stream=pdf.read(), filetype="pdf")
        context_text = " ".join([page.get_text() for page in doc])

        doc_id = str(uuid.uuid4())  # 🔑 Unique ID per PDF
        pdf_store[doc_id] = context_text  # Save in memory

        return jsonify({
            "message": "PDF uploaded and text extracted!",
            "doc_id": doc_id  # Return doc_id to frontend
        })

    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500

@app.route('/ask', methods=['POST'])
def askquestion():
    data = request.get_json()
    question = data.get("question")
    doc_id = data.get("doc_id")

    if not question or not doc_id:
        return jsonify({"error": "Missing question or document ID"}), 400

    context_text = pdf_store.get(doc_id)
    if not context_text:
        return jsonify({"error": "Invalid or expired document ID"}), 404

    prompt = f"Based on the following document, answer this question:\n\nContext:\n{context_text}\n\nQuestion:\n{question}"

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={MY_API_KEY}"

        payload = json.dumps({
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        })

        headers = {
            "Content-Type": "application/json"
        }

        response = requests.post(url, headers=headers, data=payload)
        data = response.json()
        print("Gemini Response:", data)

        if "candidates" in data and data["candidates"]:
            answer = data["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({"answer": answer})
        else:
            return jsonify({
                "error": "No response from Gemini API.",
                "details": data
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
