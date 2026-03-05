FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required for OpenCV and InsightFace
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libgl1-mesa-glx \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source maps
COPY . .

# Expose API port
EXPOSE 8000

CMD ["python", "start_backend.py"]
