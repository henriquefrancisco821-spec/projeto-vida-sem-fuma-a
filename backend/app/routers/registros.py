from datetime import timedelta

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.datas import agora_utc, hoje_sp, inicio_do_dia_em_utc, para_sp
from app.models import RegistroConsumo, Usuario
from app.schemas import RegistroIn, RegistroOut
from app.seguranca import usuario_atual

router = APIRouter(prefix="/registros", tags=["Registros"])


def registro_out(r: RegistroConsumo) -> RegistroOut:
    return RegistroOut(
        id_registro=r.id_registro,
        tipo=r.tipo,
        gatilho=r.gatilho,
        quantidade=r.quantidade,
        nivel_vontade=r.nivel_vontade,
        data_hora=para_sp(r.data_hora),
    )


@router.post("", response_model=RegistroOut, status_code=status.HTTP_201_CREATED)
def registrar(dados: RegistroIn, usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Registra um cigarro fumado ou uma vontade vencida (RF03, RF04)."""
    registro = RegistroConsumo(
        id_usuario=usuario.id_usuario,  # sempre do token, nunca do que o front mandou (anti-IDOR)
        tipo=dados.tipo,
        gatilho=dados.gatilho.strip() if dados.gatilho else None,
        quantidade=dados.quantidade,
        nivel_vontade=dados.nivel_vontade,
        data_hora=agora_utc(),
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return registro_out(registro)


@router.get("", response_model=list[RegistroOut])
def listar(
    dias: int = Query(default=7, ge=1, le=90, description="Quantos dias, contando hoje"),
    usuario: Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    """Registros dos últimos N dias do calendário de São Paulo, do mais novo para o mais antigo."""
    desde = inicio_do_dia_em_utc(hoje_sp() - timedelta(days=dias - 1))
    registros = db.scalars(
        select(RegistroConsumo)
        .where(RegistroConsumo.id_usuario == usuario.id_usuario, RegistroConsumo.data_hora >= desde)
        .order_by(RegistroConsumo.data_hora.desc(), RegistroConsumo.id_registro.desc())
    )
    return [registro_out(r) for r in registros]
