from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.datas import agora_utc
from app.models import GatilhoUsuario, Usuario
from app.regras import montar_usuario, nova_meta
from app.schemas import CadastroIn, LoginIn, TokenOut
from app.seguranca import criar_token, gerar_hash, verificar_senha

router = APIRouter(prefix="/auth", tags=["Autenticação"])

EMAIL_EM_USO = "Este e-mail já está cadastrado."
LOGIN_INVALIDO = "E-mail ou senha incorretos."


@router.post("/cadastro", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def cadastrar(dados: CadastroIn, db: Session = Depends(get_db)):
    email = dados.email.lower()
    if db.scalar(select(Usuario).where(Usuario.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_EM_USO)

    agora = agora_utc()
    if dados.perfil == "parou":
        data_inicio = agora - timedelta(days=dados.dias_sem_fumar or 0)
    else:
        data_inicio = agora

    usuario = Usuario(
        email=email,
        senha_hash=gerar_hash(dados.senha),
        apelido=dados.apelido.strip(),
        perfil=dados.perfil,
        data_inicio=data_inicio,
        motivo=dados.motivo.strip(),
        foto_motivo=dados.foto_motivo,
        lembretes=False,
    )
    usuario.metas.append(nova_meta(dados.perfil, dados.cigarros_por_dia, dados.preco_maco,
                                   dados.cigarros_por_maco, data_inicio))
    for gatilho in dict.fromkeys(g.strip() for g in dados.gatilhos):  # tira repetidos
        usuario.gatilhos.append(GatilhoUsuario(gatilho=gatilho))

    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:  # duas pessoas cadastrando o mesmo e-mail ao mesmo tempo
        db.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, EMAIL_EM_USO)
    db.refresh(usuario)

    return TokenOut(access_token=criar_token(usuario.id_usuario), usuario=montar_usuario(usuario))


@router.post("/login", response_model=TokenOut)
def login(dados: LoginIn, db: Session = Depends(get_db)):
    usuario = db.scalar(select(Usuario).where(Usuario.email == dados.email.lower()))
    # Mesma mensagem para e-mail inexistente e senha errada: não revela quem tem conta
    if usuario is None or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, LOGIN_INVALIDO)
    return TokenOut(access_token=criar_token(usuario.id_usuario), usuario=montar_usuario(usuario))
