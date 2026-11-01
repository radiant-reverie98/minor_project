import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

from rag.retrieval import load_vector_store

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is missing. Add it to the AI service .env file.")

llm = ChatGroq(
    model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
    temperature=0.2,
    api_key=api_key,
)

# Load the FAISS store once when this process starts.
vector_store = load_vector_store()

rewrite_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
        Rewrite the latest question into a standalone question using the
        conversation history. Resolve pronouns and references. Do not answer.
        If the question is already standalone, return it unchanged.
        Return only the rewritten question.
        """,
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
])


def to_langchain_history(chat_history):
    converted = []
    for item in chat_history or []:
        if isinstance(item, (HumanMessage, AIMessage)):
            converted.append(item)
        elif isinstance(item, dict):
            role = item.get("role")
            content = item.get("content", "")
            if role == "user":
                converted.append(HumanMessage(content=content))
            elif role == "assistant":
                converted.append(AIMessage(content=content))
    return converted[-10:]


def rewrite_question(question, chat_history):
    if not chat_history:
        return question

    messages = rewrite_prompt.format_messages(
        chat_history=chat_history,
        question=question,
    )
    response = llm.invoke(messages)
    return response.content.strip()


def retrieve_context(query, k=4):
    results = vector_store.similarity_search_with_score(query, k=k)
    return "\n\n".join(
        f"Content:\n{doc.page_content}" for doc, _score in results
    )


answer_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """
        You are Bodhi, the AI Academic Assistant of Meridian Valley University.

        Instructions:
        1. Answer university-specific factual questions using retrieved context.
        2. Never invent university information, policies, dates, names, or figures.
        3. If the retrieved context does not contain the answer, clearly say that
           you could not find it in the university knowledge base.
        4. Be concise, friendly, and student-friendly.
        5. Do not mention filenames, page numbers, or internal retrieval details.
        6. Use conversation history to understand follow-up questions.
        7. Conversation history is not evidence for new university facts.

        Retrieved context:
        {context}
        """,
    ),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
])


def ask_bodhi(question, chat_history):
    history = to_langchain_history(chat_history)
    standalone_question = rewrite_question(question, history)
    print(f"\n[Retrieval Query]: {standalone_question}")

    context = retrieve_context(standalone_question)

    if not context.strip():
        answer = "I couldn't find this information in the university knowledge base."
    else:
        messages = answer_prompt.format_messages(
            context=context,
            chat_history=history,
            question=question,
        )
        response = llm.invoke(messages)
        answer = response.content
        if not isinstance(answer, str):
            answer = str(answer)

    # Mutate only the request-local history. The main backend persists messages
    # in MySQL and sends the prior turns again on the next request.
    chat_history.extend([
        HumanMessage(content=question),
        AIMessage(content=answer),
    ])
    del chat_history[:-10]
    return answer


if __name__ == "__main__":
    history = []
    print("\n========== BODHI AI ASSISTANT ==========")
    print("Type 'clear' to reset conversation. Type 'exit' to quit.\n")

    while True:
        question = input("You: ").strip()
        if question.lower() in {"exit", "quit", "bye"}:
            print("Bodhi: Goodbye!")
            break
        if question.lower() == "clear":
            history.clear()
            print("Bodhi: Conversation history cleared!\n")
            continue
        if not question:
            continue
        try:
            print("\nBodhi:", ask_bodhi(question, history), "\n")
        except Exception as exc:
            print("Error:", exc)
