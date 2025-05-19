from flask import Flask, request, jsonify
from flask_cors import CORS
import os 
from dotenv import load_dotenv
import google.generativeai as genai
import requests 
import json
import fitz



load_dotenv()
MY_API_KEY = os.getenv("API_KEY")

#storing uploaded pdf globably
context_text = ""

#creating a flask instance
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "API is running"})

@app.route('/upload', methods=['POST'])
def uploadfile():
    global context_text
    pdf = request.files.get("PDF")

    if not pdf:
        return jsonify({"error": "No file received"}), 400

    # Check if the uploaded file is a PDF
    if pdf.mimetype != 'application/pdf':
        return jsonify({"error": "Invalid file type. Please upload a PDF file only."}), 400

    try:
        doc = fitz.open(stream=pdf.read(), filetype="pdf")
        context_text = " ".join([page.get_text() for page in doc])
        return jsonify({"message": "PDF uploaded and text extracted!"})
    except Exception as e:
        return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 500


@app.route('/ask', methods=['POST'])
def askquestion():
    global context_text
    question = request.form.get("question")

    if not context_text:
        return jsonify({"error": "Please upload a PDF first."}), 400
    if not question:
        return jsonify({"error": "Please enter a question."}), 400

    prompt = f"Based on the following document, answer this question:\n\nContext:\n{context_text}\n\nQuestion:\n{question}"

    try:
        # Construct API request to Gemini via REST
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

        # Send POST request
        response = requests.request("POST", url, headers=headers, data=payload)
        data = response.json()

        # Extract answer
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
