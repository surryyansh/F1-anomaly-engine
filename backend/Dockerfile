FROM python:3.11-slim
WORKDIR /app
RUN pip install uv
COPY . .
RUN uv pip install --system fastapi uvicorn pandas scikit-learn joblib motor websockets pydantic
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]