from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="GatewayHub ML Service")

MODEL_PATH = Path(__file__).parent / "model.pkl"
model = None


@app.on_event("startup")
def load_model():
    global model
    if not MODEL_PATH.exists():
        raise RuntimeError("model.pkl not found. Run: python train.py")
    model = joblib.load(MODEL_PATH)


class PredictRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)


class PredictResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float


@app.get("/health")
def health():
    return {"status": "UP", "service": "ml-service"}


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    probabilities = model.predict_proba([request.text])[0]
    best = probabilities.argmax()

    return PredictResponse(
        text=request.text,
        sentiment=str(model.classes_[best]),
        confidence=round(float(probabilities[best]), 3),
    )