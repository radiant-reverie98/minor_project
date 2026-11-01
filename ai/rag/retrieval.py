
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from rag.config import (
    VECTOR_STORE_PATH,
    EMBEDDING_MODEL
)


# Initialize embedding model
def load_embeddings():

    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={
            "normalize_embeddings": True
        }
    )


# Load existing FAISS index
def load_vector_store():

    embeddings = load_embeddings()

    vector_store = FAISS.load_local(
        VECTOR_STORE_PATH,
        embeddings,
        allow_dangerous_deserialization=True
    )

    return vector_store


# Retrieve relevant documents
def retrieve_documents(query, k=5):

    vector_store = load_vector_store()

    results = vector_store.similarity_search_with_score(
        query,
        k=k
    )

    return results


# Display retrieved results
def main():

    print("\n========== BODHI RETRIEVAL TEST ==========\n")

    query = input("Enter your question: ")

    results = retrieve_documents(query, k=5)

    for index, (doc, score) in enumerate(results, start=1):

        print(f"\nResult {index}")
        print("-" * 50)

        print("Content:")
        print(doc.page_content)

        print("\nMetadata:")
        print(doc.metadata)

        print(f"\nL2 Distance: {score:.4f}")


if __name__ == "__main__":
    main()
