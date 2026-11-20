from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional

from app.datas import para_sp
from app.models import Meta, Usuario
from app.schemas import UsuarioOut


def calcular_data_alvo(perfil: str, cigarros_por_dia: int, data_inicio: datetime) -> Optional[date]:
    """Plano do Marcos: 1 cigarro a menos por dia. O limite chega a zero no dia
    'cigarros_por_dia' do plano, ou seja, data_inicio + (cigarros_por_dia - 1) dias."""
    if perfil != "fuma":
        return None
    return para_sp(data_inicio).date() + timedelta(days=cigarros_por_dia - 1)


def nova_meta(perfil: str, cigarros_por_dia: int, preco_maco: Decimal,
              cigarros_por_maco: int, data_inicio: datetime) -> Meta:
    return Meta(
        tipo="reducao" if perfil == "fuma" else "manutencao",
        consumo_inicial=cigarros_por_dia,
        preco_maco=preco_maco,
        cigarros_por_maco=cigarros_por_maco,
        data_alvo=calcular_data_alvo(perfil, cigarros_por_dia, data_inicio),
        status="ativa",
    )


def meta_ativa(usuario: Usuario) -> Meta:
    ativas = [m for m in usuario.metas if m.status == "ativa"]
    return max(ativas, key=lambda m: m.id_meta)


def montar_usuario(usuario: Usuario) -> UsuarioOut:
    """Junta os dados do usuário, da meta ativa e dos gatilhos no formato do contrato."""
    meta = meta_ativa(usuario)
    return UsuarioOut(
        id_usuario=usuario.id_usuario,
        email=usuario.email,
        apelido=usuario.apelido,
        perfil=usuario.perfil,
        data_inicio=para_sp(usuario.data_inicio),
        cigarros_por_dia=meta.consumo_inicial,
        preco_maco=float(meta.preco_maco),
        cigarros_por_maco=meta.cigarros_por_maco,
        data_alvo=meta.data_alvo,
        gatilhos=[g.gatilho for g in usuario.gatilhos],
        motivo=usuario.motivo,
        foto_motivo=usuario.foto_motivo,
        foto_perfil=usuario.foto_perfil,
        lembretes=bool(usuario.lembretes),
    )
