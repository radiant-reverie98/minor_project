import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

KNOWLEDGE_BASE_PATH = os.path.join(
    BASE_DIR, "knowledge_base"
)

VECTOR_STORE_PATH = os.path.join(
    BASE_DIR, "vector_store"
)

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200