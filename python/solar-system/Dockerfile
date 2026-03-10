FROM python:3.12-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    git \
 && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip setuptools wheel

RUN pip install \
    numpy \
    scipy \
    matplotlib \
    mpmath \
    tqdm \
    rebound

WORKDIR /app
CMD ["python"]
