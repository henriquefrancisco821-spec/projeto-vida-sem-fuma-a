import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()  # lê o arquivo .env

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vida_sem_fumaca.db")

# O SQLite precisa dessa opção extra; o PostgreSQL (Sprint 5) não
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

if DATABASE_URL.startswith("sqlite"):
    # O SQLite vem com a checagem de chaves estrangeiras DESLIGADA.
    # Sem isto, ele aceitaria um registro de um usuário que não existe.
    # (O PostgreSQL já checa sempre; por isso só vale para o SQLite.)
    @event.listens_for(engine, "connect")
    def ligar_chaves_estrangeiras(conexao, _registro):
        cursor = conexao.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
