from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_system import RAGSystem
import uvicorn

app = FastAPI(title="My Gastronomy AI API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG system
rag_system = RAGSystem()

class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    sources: list = []

# ✅ ROTA CORRIGIDA - Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "Gemma + RAG", "service": "Chat AI"}

# ✅ ROTA CORRIGIDA - Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        print(f"📥 Recebida pergunta: {request.message}")
        answer, sources = rag_system.ask_question(request.message)
        print(f"📤 Resposta gerada: {answer[:100]}...")
        return ChatResponse(response=answer, sources=sources)
    except Exception as e:
        print(f"❌ Erro no chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ✅ ROTA ADICIONAL - Teste simples
@app.get("/test")
async def test_endpoint():
    return {"message": "Backend Python está funcionando!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)