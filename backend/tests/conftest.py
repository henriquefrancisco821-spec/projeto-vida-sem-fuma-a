"""Preparação dos testes: um banco SQLite TEMPORÁRIO, só para os testes.
Assim o pytest nunca mexe no vida_sem_fumaca.db de vocês."""
import os
import tempfile

# Precisa vir ANTES de importar o app: o database.py lê estas variáveis ao ser importado
_pasta = tempfile.mkdtemp(prefix="vsf-testes-")
os.environ["DATABASE_URL"] = f"sqlite:///{_pasta}/teste.db"
os.environ.setdefault("SECRET_KEY", "chave-usada-somente-nos-testes-automaticos-0123456789")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import models  # noqa: E402,F401
from app.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from dados_iniciais import gravar_marcos  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def banco_de_teste():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    gravar_marcos(db)
    db.commit()
    db.close()
    yield


@pytest.fixture
def cliente():
    return TestClient(app)
