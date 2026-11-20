from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, Literal, Optional

from pydantic import BaseModel, EmailStr, Field

# Os "formulários" de entrada e saída de cada rota, com os nomes do contrato da API
Perfil = Literal["fuma", "parou"]
Gatilho = Annotated[str, Field(min_length=1, max_length=40)]
Foto = Annotated[str, Field(max_length=700_000)]  # ~500 KB de imagem em data URL


class CadastroIn(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=8, max_length=72)
    apelido: str = Field(min_length=2, max_length=40)
    perfil: Perfil
    cigarros_por_dia: int = Field(ge=1, le=100)
    preco_maco: Decimal = Field(ge=1, le=100, decimal_places=2)
    cigarros_por_maco: int = Field(default=20, ge=1, le=40)
    dias_sem_fumar: Optional[int] = Field(default=None, ge=0, le=3650)
    gatilhos: list[Gatilho] = Field(default_factory=list, max_length=15)
    motivo: str = Field(min_length=3, max_length=140)
    foto_motivo: Optional[Foto] = None


class LoginIn(BaseModel):
    email: EmailStr
    senha: str


class UsuarioOut(BaseModel):
    id_usuario: int
    email: str
    apelido: str
    perfil: Perfil
    data_inicio: datetime
    cigarros_por_dia: int
    preco_maco: float
    cigarros_por_maco: int
    data_alvo: Optional[date]
    gatilhos: list[str]
    motivo: Optional[str]
    foto_motivo: Optional[str]
    foto_perfil: Optional[str]
    lembretes: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class UsuarioUpdate(BaseModel):
    """PATCH: o front manda só o que mudou. Tudo é opcional."""
    apelido: Optional[str] = Field(default=None, min_length=2, max_length=40)
    motivo: Optional[str] = Field(default=None, min_length=3, max_length=140)
    foto_motivo: Optional[Foto] = None
    foto_perfil: Optional[Foto] = None
    lembretes: Optional[bool] = None
    perfil: Optional[Perfil] = None