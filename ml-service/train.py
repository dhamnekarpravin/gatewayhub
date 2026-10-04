from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

positive = [
    "I love this product",
    "This is amazing and works great",
    "Excellent quality, very happy",
    "Fantastic service and fast delivery",
    "Absolutely wonderful experience",
    "I am very satisfied with my purchase",
    "Great value for the money",
    "The team was helpful and friendly",
    "Best purchase I have made this year",
    "Superb, highly recommended",
    "Works perfectly, thank you",
    "Really good, I will buy again",
]

negative = [
    "I hate this product",
    "This is terrible and does not work",
    "Very poor quality, totally disappointed",
    "Awful service and late delivery",
    "Worst experience ever",
    "I am very unhappy with my purchase",
    "Waste of money",
    "The team was rude and unhelpful",
    "Worst purchase I have made this year",
    "Horrible, do not recommend",
    "Broken on arrival, very bad",
    "Really bad, I will never buy again",
]

texts = positive + negative
labels = ["POSITIVE"] * len(positive) + ["NEGATIVE"] * len(negative)

model = make_pipeline(TfidfVectorizer(), LogisticRegression(max_iter=1000))
model.fit(texts, labels)

out = Path(__file__).parent / "model.pkl"
joblib.dump(model, out)
print(f"Model trained and saved to {out}")