from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import joblib
import re

app = FastAPI()

print("Loading embedder...")

embedder = SentenceTransformer(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

print("Embedder loaded successfully!")

print("Loading ML model...")

model = joblib.load("cyberbully_model.pkl")

print("Model loaded successfully!")


class CommentRequest(BaseModel):
    comment: str


def clean_text(text):
    text = text.lower()

    text = re.sub(r"http\S+", "", text)

    text = re.sub(r"[^\w\s]", " ", text)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


@app.post("/predict")
def predict(req: CommentRequest):

    cleaned = clean_text(req.comment)

    embedding = embedder.encode([cleaned])

    prediction = model.predict(embedding)[0]

    probability = model.predict_proba(embedding)[0]

    confidence = float(max(probability))

    label = "Cyberbullying" if prediction == 1 else "Neutral"

    return {
        "comment": req.comment,
        "prediction": int(prediction),
        "label": label,
        "confidence": confidence
    }


@app.get("/")
def home():
    return {"message": "API working"}