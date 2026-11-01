
import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

from rag.retrieval import load_vector_store

load_dotenv()

# Initialize LLM
llm = ChatGroq(
    model="openai/gpt-oss-20b",
    temperature=0.2,
    api_key=os.getenv("GROQ_API_KEY")
)

# Load FAISS vector store
vector_store = load_vector_store()


# STEP 1: Rewrite follow-up questions
rewrite_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
        You are a question rewriting assistant.

        Given the conversation history and latest question,
        rewrite the latest question into a standalone question.

        Resolve pronouns such as he, she, it, they, his and her
        using the conversation history.

        Do not answer the question.
        If the question is already standalone, return it unchanged.

        Return only the rewritten question.
        """
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])


def rewrite_question(question, chat_history):

    if not chat_history:
        return question

    messages = rewrite_prompt.format_messages(
        chat_history=chat_history,
        question=question
    )

    response = llm.invoke(messages)

    return response.content.strip()


# STEP 2: Retrieve relevant documents
def retrieve_context(query, k=4):

    results = vector_store.similarity_search_with_score(
        query,
        k=k
    )

    context = []

    for doc, score in results:

        context.append(
            f"Content:\n{doc.page_content}"
        )

    return "\n\n".join(context)


# STEP 3: Generate conversational response
answer_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
        You are Bodhi, the AI Academic Assistant
        of Meridian Valley University.

        Instructions:
        1. Answer using the retrieved context.
        2. Never invent university information.
        3. If information is unavailable, clearly say so.
        4. Be concise, friendly and student-friendly.
        5. Never mention source documents, filenames,
           page numbers or citations.
        6. Use conversation history to understand follow-up questions.
        7. Do not treat conversation history as a substitute
           for retrieved evidence when answering new factual questions.

        Retrieved context:

        {context}
        """
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])


# STEP 4: Main chatbot function
def ask_bodhi(question, chat_history):

    # Rewrite the question using conversation history
    standalone_question = rewrite_question(
        question,
        chat_history
    )

    print(f"\n[Retrieval Query]: {standalone_question}")

    # Retrieve relevant context
    context = retrieve_context(standalone_question)

    if not context.strip():
        answer = (
            "I couldn't find this information "
            "in the university knowledge base."
        )
    else:

        messages = answer_prompt.format_messages(
            context=context,
            chat_history=chat_history,
            question=question
        )

        response = llm.invoke(messages)
        answer = response.content

    # Store conversation
    chat_history.append(HumanMessage(content=question))
    chat_history.append(AIMessage(content=answer))

    # Keep only the last 5 exchanges
    del chat_history[:-10]

    return answer


# STEP 5: Interactive chatbot
if __name__ == "__main__":

    chat_history = []

    print("\n========== BODHI AI ASSISTANT ==========")
    print("Type 'clear' to reset conversation.")
    print("Type 'exit' to quit.\n")

    while True:

        question = input("You: ").strip()

        if question.lower() in ["exit", "quit", "bye"]:
            print("Bodhi: Goodbye!")
            break

        if question.lower() == "clear":
            chat_history.clear()
            print("Bodhi: Conversation history cleared!\n")
            continue

        if not question:
            continue

        try:
            answer = ask_bodhi(question, chat_history)
            print("\nBodhi:", answer, "\n")

        except Exception as e:
            print("Error:", e)
