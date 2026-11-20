"""Cria as tabelas do banco a partir do models.py.

Uso (dentro da pasta backend, com o .venv ativo):
    python criar_banco.py

Se o models.py mudar, apague o arquivo vida_sem_fumaca.db e rode de novo:
o create_all só CRIA tabelas que não existem, ele não altera as que já existem.
"""
from app.database import Base, engine
from app import models  # noqa: F401  (importar registra as tabelas no Base)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    tabelas = sorted(Base.metadata.tables)
    print(f"Banco pronto com {len(tabelas)} tabelas:")
    for nome in tabelas:
        print(" -", nome)
