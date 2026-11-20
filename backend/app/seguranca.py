import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Usuario

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("Defina SECRET_KEY no arquivo .env (veja o .env.example)")

ALGORITMO = "HS256"
VALIDADE_TOKEN = timedelta(days=7)


# ---------- Senha: o banco guarda só o hash, nunca a senha ----------
def gerar_hash(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, hash_salvo: str) -> bool:
    return bcrypt.checkpw(senha.encode("utf-8"), hash_salvo.encode("utf-8"))


# ---------- Token: o "crachá" que o usuário recebe no login ----------
def criar_token(id_usuario: int) -> str:
    payload = {"sub": str(id_usuario), "exp": datetime.now(timezone.utc) + VALIDADE_TOKEN}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITMO)


def ler_token(token: str) -> int:
    """Confere a assinatura e a validade do crachá e devolve o id do usuário.
    Se o token for falso, vencido ou sem assinatura, gera um erro."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITMO])
    return int(payload["sub"])


# ---------- Porteiro: protege as rotas que exigem login ----------
esquema_bearer = HTTPBearer(auto_error=False)


def usuario_atual(
    credenciais: HTTPAuthorizationCredentials | None = Depends(esquema_bearer),
    db: Session = Depends(get_db),
) -> Usuario:
    """Lê o token do cabeçalho e devolve quem está logado. Regra anti-IDOR:
    o usuário SEMPRE vem daqui, nunca de um número enviado pelo front."""
    erro = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão inválida ou expirada. Faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credenciais is None:
        raise erro
    try:
        id_usuario = ler_token(credenciais.credentials)
    except (jwt.PyJWTError, KeyError, ValueError):
        raise erro

    usuario = db.get(Usuario, id_usuario)
    if usuario is None:
        raise erro
    return usuario
