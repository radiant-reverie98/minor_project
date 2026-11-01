
import os
import json

from langchain_community.document_loaders import PyMuPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

from config import (
    KNOWLEDGE_BASE_PATH,
    VECTOR_STORE_PATH,
    EMBEDDING_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP
)

# ------------------ HELPER FUNCTION FOR JSON DATA OF FACULTY --------------------- #

def faculty_to_text(record):

    fields = {
        "Faculty ID": "faculty_id",
        "Name": "name",
        "Department": "department",
        "Designation": "designation",
        "Qualifications": "qualifications",
        "Experience": "experience_years",
        "Primary Expertise": "primary_expertise",
        "Secondary Expertise": "secondary_expertise",
        "Teaching Expertise": "teaching_expertise",
        "Research Expertise": "research_expertise",
        "Mentorship Expertise": "mentorship_expertise",
        "Subjects Taught": "subjects_taught",
        "Technical Skills": "technical_skills",
        "Research Interests": "research_interests",
        "Research Domains": "research_domains",
        "Mentorship Domains": "mentorship_domains",
        "Publications": "publications_and_achievements",
        "Professional Experience": "projects_and_professional_experience",
        "Example Projects": "example_project_topics",
        "Preferred Consultation Topics": "preferred_consultation_topics",
        "Office Location": "office_location",
        "Consultation Mode": "consultation_mode",
        "Consultation Days": "consultation_days",
        "Consultation Hours": "consultation_hours"
    }

    content = []

    for label, key in fields.items():

        value = record.get(key)

        if value is not None:
            if isinstance(value, list):
                value = ", ".join(map(str, value))

            content.append(f"{label}: {value}")

    return "\n".join(content)

# --------------------------------
# 1. Load PDF and JSON documents
# --------------------------------

def load_documents():

    documents = []

    for filename in os.listdir(KNOWLEDGE_BASE_PATH):

        file_path = os.path.join(
            KNOWLEDGE_BASE_PATH, filename
        )

        # PDF DOCUMENTS
        if filename.lower().endswith(".pdf"):

            print(f"Loading PDF: {filename}")

            loader = PyMuPDFLoader(file_path)
            pdf_documents = loader.load()

            for doc in pdf_documents:

                doc.metadata["source"] = filename
                doc.metadata["document_type"] = "pdf"

            documents.extend(pdf_documents)

        # JSON DOCUMENTS
        elif filename.lower().endswith(".json"):

            print(f"Loading JSON: {filename}")

            with open(file_path, "r", encoding="utf-8") as file:
                data = json.load(file)
                print("JSON root type:", type(data))

                if isinstance(data, dict):
                    print("JSON root keys:", data.keys())

                elif isinstance(data, list):
                    print("Total faculty records:", len(data))

            # Support both list and single-object JSON
            if isinstance(data, dict):
                records = data.get("faculty", [])
            elif isinstance(data, list):
                records = data
            else:
                records = []

            print(f"Total faculty records found: {len(records)}")

            for record in records:

                if not isinstance(record, dict):
                    print(f"Skipping invalid record in {filename}")
                    continue

                content = faculty_to_text(record)

                documents.append(
                    Document(
                        page_content=content,
                        metadata={
                            "source": filename,
                            "document_type": "json",
                            "faculty_id": str(
                                record.get("faculty_id", "")
                            )
                        }
                    )
                )

    return documents


# --------------------------------
# 2. Split PDF documents
# --------------------------------

def split_documents(documents):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""]
    )

    pdf_documents = [
        doc for doc in documents
        if doc.metadata.get("document_type") == "pdf"
    ]

    json_documents = [
        doc for doc in documents
        if doc.metadata.get("document_type") == "json"
    ]

    # Split PDF pages into chunks
    pdf_chunks = splitter.split_documents(pdf_documents)

    # Keep individual faculty profiles intact
    json_chunks = json_documents

    return pdf_chunks + json_chunks


# --------------------------------
# 3. Generate embeddings
# --------------------------------

def create_embeddings():

    embeddings = HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={
            "normalize_embeddings": True
        }
    )

    return embeddings


# --------------------------------
# 4. Create FAISS vector store
# --------------------------------

def create_vector_store(chunks, embeddings):

    if not chunks:
        raise ValueError("No document chunks available for indexing.")

    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    # Create directory if it does not exist
    os.makedirs(
        VECTOR_STORE_PATH,
        exist_ok=True
    )

    vector_store.save_local(
        VECTOR_STORE_PATH
    )

    return vector_store


# --------------------------------
# 5. Main execution
# --------------------------------

def main():

    print("\n========== RAG INGESTION STARTED ==========\n")

    # Load documents
    print("Step 1: Loading knowledge-base documents...")

    documents = load_documents()

    if not documents:
        print("No PDF or JSON documents found!")
        return

    print(f"Total loaded documents/pages: {len(documents)}")

    # Split documents
    print("\nStep 2: Splitting documents...")

    chunks = split_documents(documents)

    print(f"Total generated chunks: {len(chunks)}")

    # Count document types
    pdf_chunks = sum(
        1 for chunk in chunks
        if chunk.metadata.get("document_type") == "pdf"
    )

    json_chunks = sum(
        1 for chunk in chunks
        if chunk.metadata.get("document_type") == "json"
    )

    print(f"PDF chunks: {pdf_chunks}")
    print(f"JSON profiles: {json_chunks}")

    # Generate embeddings
    print("\nStep 3: Loading embedding model...")

    embeddings = create_embeddings()

    # Create vector store
    print("\nStep 4: Creating FAISS vector index...")

    create_vector_store(chunks, embeddings)

    print("\n========== INGESTION COMPLETED ==========")
    print(f"Total indexed chunks: {len(chunks)}")
    print(f"Vector store saved at: {VECTOR_STORE_PATH}")


if __name__ == "__main__":
    main()
