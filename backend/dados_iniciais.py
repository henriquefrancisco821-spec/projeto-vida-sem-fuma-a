"""Grava os dados iniciais do app (CONTEXTO_IA.md, seções 4.6 e 5).

Uso (dentro da pasta backend, com o .venv ativo), DEPOIS do criar_banco.py:
    python dados_iniciais.py

Pode rodar quantas vezes quiser: o que já existe não é duplicado.
Sprint 2: marcos de saúde. Sprints 3 e 4: unidades de saúde e conteúdos entram aqui também.
"""
from sqlalchemy import func, select

from app.database import SessionLocal
from app.models import Conquista

MINUTO = 60
HORA = 60 * MINUTO
DIA = 24 * HORA

# Marcos de recuperação da saúde. "criterio" = segundos sem fumar para atingir o marco.
# Mesmos prazos e textos da tela de Progresso do front (prazos aproximados, para fins educativos).
MARCOS_DE_SAUDE = [
    ("20 minutos", "Batimentos e pressão começam a voltar ao normal", 20 * MINUTO),
    ("12 horas", "O monóxido de carbono no sangue volta ao normal", 12 * HORA),
    ("2 dias", "Olfato e paladar começam a melhorar", 2 * DIA),
    ("2 semanas", "A circulação melhora e caminhar fica mais fácil", 14 * DIA),
    ("3 meses", "A função dos pulmões aumenta", 90 * DIA),
    ("1 ano", "O risco de doença do coração cai pela metade", 365 * DIA),
]


def gravar_marcos(db) -> int:
    """Grava os marcos que ainda não existem. Devolve quantos foram criados."""
    ja_existem = set(db.scalars(select(Conquista.titulo)))
    novos = [
        Conquista(titulo=titulo, descricao=descricao, tipo="saude", criterio=str(segundos))
        for titulo, descricao, segundos in MARCOS_DE_SAUDE
        if titulo not in ja_existem
    ]
    db.add_all(novos)
    return len(novos)


if __name__ == "__main__":
    db = SessionLocal()
    try:
        criados = gravar_marcos(db)
        db.commit()
        total = db.scalar(select(func.count()).select_from(Conquista))
        print(f"Marcos de saúde: {criados} criados agora, {total} no banco.")
    finally:
        db.close()
