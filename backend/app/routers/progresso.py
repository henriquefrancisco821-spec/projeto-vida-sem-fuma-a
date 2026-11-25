from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import calculos
from app.database import get_db
from app.datas import agora_utc, hoje_sp, inicio_do_dia_em_utc, para_sp
from app.models import Conquista, RegistroConsumo, Usuario
from app.regras import meta_ativa
from app.schemas import ConquistaOut, PlanoFumaOut, PlanoParouOut, ProgressoOut
from app.seguranca import usuario_atual

router = APIRouter(tags=["Progresso"])


# ---------- Consultas ao banco (as contas ficam no calculos.py) ----------
def soma_cigarros(db: Session, id_usuario: int, desde: datetime) -> int:
    total = db.scalar(
        select(func.coalesce(func.sum(RegistroConsumo.quantidade), 0)).where(
            RegistroConsumo.id_usuario == id_usuario,
            RegistroConsumo.tipo == "cigarro",
            RegistroConsumo.data_hora >= desde,
        )
    )
    return int(total)


def ultimo_cigarro(db: Session, id_usuario: int) -> datetime | None:
    return db.scalar(
        select(func.max(RegistroConsumo.data_hora)).where(
            RegistroConsumo.id_usuario == id_usuario, RegistroConsumo.tipo == "cigarro"
        )
    )


def contar_vontades(db: Session, id_usuario: int, desde: datetime) -> int:
    return db.scalar(
        select(func.count()).select_from(RegistroConsumo).where(
            RegistroConsumo.id_usuario == id_usuario,
            RegistroConsumo.tipo == "vontade",
            RegistroConsumo.data_hora >= desde,
        )
    )


def marcos_cadastrados(db: Session) -> list[Conquista]:
    marcos = db.scalars(select(Conquista).where(Conquista.tipo == "saude")).all()
    return sorted(marcos, key=lambda m: int(m.criterio))


# ---------- Rotas ----------
@router.get("/progresso", response_model=ProgressoOut)
def progresso(usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Tempo sem fumar, economia, cigarros evitados e marcos (RF06, RF07)."""
    agora = agora_utc()
    meta = meta_ativa(usuario)
    inicio = usuario.data_inicio
    dia = calculos.dia_plano(inicio, agora)

    segundos = calculos.segundos_sem_fumar(inicio, ultimo_cigarro(db, usuario.id_usuario), agora)
    evitados = calculos.cigarros_evitados(
        meta.consumo_inicial, calculos.dias_decorridos(inicio, agora), soma_cigarros(db, usuario.id_usuario, inicio)
    )
    criterios = [int(m.criterio) for m in marcos_cadastrados(db)]

    return ProgressoOut(
        perfil=usuario.perfil,
        data_inicio=para_sp(inicio),
        dia_jornada=dia,
        segundos_sem_fumar=segundos,
        cigarros_evitados=evitados,
        economia=calculos.economia(evitados, meta.preco_maco, meta.cigarros_por_maco),
        marcos_atingidos=calculos.marcos_atingidos(segundos, criterios),
        limite_hoje=calculos.limite_do_dia(meta.consumo_inicial, dia) if usuario.perfil == "fuma" else None,
        fumados_hoje=soma_cigarros(db, usuario.id_usuario, inicio_do_dia_em_utc(hoje_sp())),
        vontades_vencidas=contar_vontades(db, usuario.id_usuario, inicio),
    )


@router.get("/plano/hoje", response_model=PlanoFumaOut | PlanoParouOut)
def plano_de_hoje(usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Perfil "fuma": limite do dia (RF05). Perfil "parou": dica contra os gatilhos."""
    if usuario.perfil == "parou":
        gatilhos = [g.gatilho for g in usuario.gatilhos]
        return PlanoParouOut(
            gatilhos=gatilhos,
            motivo=usuario.motivo,
            mensagem=calculos.mensagem_apoio_parou(gatilhos, usuario.motivo, hoje_sp()),
        )

    meta = meta_ativa(usuario)
    dia = calculos.dia_plano(usuario.data_inicio, agora_utc())
    limite = calculos.limite_do_dia(meta.consumo_inicial, dia)
    return PlanoFumaOut(
        dia_plano=dia,
        limite_hoje=limite,
        fumados_hoje=soma_cigarros(db, usuario.id_usuario, inicio_do_dia_em_utc(hoje_sp())),
        reduzidos_ate_hoje=calculos.reduzidos_ate_hoje(meta.consumo_inicial, dia),
        data_alvo=meta.data_alvo,
        mensagem=calculos.mensagem_plano_fuma(limite),
    )


@router.get("/conquistas", response_model=list[ConquistaOut])
def conquistas(usuario: Usuario = Depends(usuario_atual), db: Session = Depends(get_db)):
    """Os marcos de saúde, marcando os que o tempo sem fumar atual já alcançou (RF07).
    data_obtida = o momento exato em que o marco foi alcançado."""
    agora = agora_utc()
    referencia_ultimo = ultimo_cigarro(db, usuario.id_usuario)
    segundos = calculos.segundos_sem_fumar(usuario.data_inicio, referencia_ultimo, agora)
    desde = agora - timedelta(seconds=segundos)  # início da sequência atual sem fumar

    resposta = []
    for m in marcos_cadastrados(db):
        necessarios = int(m.criterio)
        atingida = segundos >= necessarios
        resposta.append(ConquistaOut(
            id_conquista=m.id_conquista,
            titulo=m.titulo,
            descricao=m.descricao,
            segundos_necessarios=necessarios,
            atingida=atingida,
            data_obtida=para_sp(desde + timedelta(seconds=necessarios)) if atingida else None,
        ))
    return resposta
