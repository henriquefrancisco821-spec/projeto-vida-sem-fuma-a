import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers import auth, progresso, registros, usuarios

app = FastAPI(title="Vida Sem Fumaça API", version="0.3.0")

# Só os endereços listados no .env podem chamar a API pelo navegador
origens = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origens,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(registros.router)
app.include_router(progresso.router)


@app.get("/health", tags=["Saúde da API"])
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "banco": "conectado"}
