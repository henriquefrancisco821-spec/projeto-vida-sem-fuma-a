from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.datas import agora_utc
from app.models import Usuario
from app.regras import calcular_data_alvo, meta_ativa, montar_usuario
from app.schemas import UsuarioOut, UsuarioUpdate
from app.seguranca import usuario_atual

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

CAMPOS_OBRIGATORIOS = {"apelido", "motivo", "lembretes", "perfil"}


@router.get("/me", response_model=UsuarioOut)
def ver_meu_perfil(usuario: Usuario = Depends(usuario_atual)):
    return montar_usuario(usuario)


@router.patch("/me", response_model=UsuarioOut)
def atualizar_meu_perfil(
    dados: UsuarioUpdate,
    usuario: Usuario = Depends(usuario_atual),
    db: Session = Depends(get_db),
):
    campos = dados.model_dump(exclude_unset=True)  # só o que o front mandou

    vazios = [c for c in CAMPOS_OBRIGATORIOS if c in campos and campos[c] is None]
    if vazios:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"Estes campos não podem ficar vazios: {', '.join(vazios)}")

    novo_perfil = campos.pop("perfil", usuario.perfil)
    if novo_perfil != usuario.perfil:
        # Trocar de perfil recomeça a jornada a partir de agora
        usuario.perfil = novo_perfil
        usuario.data_inicio = agora_utc()
        meta = meta_ativa(usuario)
        meta.tipo = "reducao" if novo_perfil == "fuma" else "manutencao"
        meta.data_alvo = calcular_data_alvo(novo_perfil, meta.consumo_inicial, usuario.data_inicio)

    for campo, valor in campos.items():
        setattr(usuario, campo, valor.strip() if isinstance(valor, str) and campo in ("apelido", "motivo") else valor)

    db.commit()
    db.refresh(usuario)
    return montar_usuario(usuario)
