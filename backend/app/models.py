"""Tabelas do Vida Sem Fumaça (modelo lógico: CONTEXTO_IA.md, seção 5).

Cada classe é uma tabela; cada atributo, uma coluna. As regras de integridade
(valores permitidos, faixas de 1 a 5, não seguir a si mesmo) ficam também no
banco, com CheckConstraint: assim, nem um erro no código consegue gravar dado inválido.
"""
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (Boolean, CheckConstraint, Column, Date, DateTime, Float,
                        ForeignKey, Index, Integer, Numeric, String, Table, Text, func)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def fk_usuario() -> ForeignKey:
    # ondelete CASCADE: se o usuário for excluído (direito de exclusão da LGPD),
    # os dados dele somem junto, sem sobrar registro órfão no banco.
    return ForeignKey("usuario.id_usuario", ondelete="CASCADE")


# ---------------------------------------------------------------------------
# Tabelas associativas (relacionamentos N:N)
# ---------------------------------------------------------------------------
usuario_conquista = Table(
    "usuario_conquista", Base.metadata,
    Column("id_usuario", fk_usuario(), primary_key=True),
    Column("id_conquista", ForeignKey("conquista.id_conquista", ondelete="CASCADE"), primary_key=True),
    Column("data_obtida", DateTime, server_default=func.now(), nullable=False),
)

usuario_unidade = Table(
    "usuario_unidade", Base.metadata,
    Column("id_usuario", fk_usuario(), primary_key=True),
    Column("id_unidade", ForeignKey("unidade_saude.id_unidade", ondelete="CASCADE"), primary_key=True),
)

usuario_conteudo = Table(
    "usuario_conteudo", Base.metadata,
    Column("id_usuario", fk_usuario(), primary_key=True),
    Column("id_conteudo", ForeignKey("conteudo.id_conteudo", ondelete="CASCADE"), primary_key=True),
)

# Usuário APOIA Publicação. A chave composta impede apoiar o mesmo post duas vezes.
# A quantidade de apoios não é coluna: é a contagem (COUNT) desta tabela.
apoio = Table(
    "apoio", Base.metadata,
    Column("id_usuario", fk_usuario(), primary_key=True),
    Column("id_publicacao", ForeignKey("publicacao.id_publicacao", ondelete="CASCADE"), primary_key=True),
)

# Usuário SEGUE Usuário: um N:N da tabela com ela mesma
seguidor = Table(
    "seguidor", Base.metadata,
    Column("id_seguidor", fk_usuario(), primary_key=True),
    Column("id_seguido", fk_usuario(), primary_key=True),
    CheckConstraint("id_seguidor <> id_seguido", name="ck_seguidor_nao_segue_a_si"),
)


# ---------------------------------------------------------------------------
# Tabelas principais
# ---------------------------------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuario"
    __table_args__ = (
        CheckConstraint("perfil IN ('fuma', 'parou')", name="ck_usuario_perfil"),
    )

    id_usuario: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255))  # nunca a senha: só o hash bcrypt
    apelido: Mapped[str] = mapped_column(String(40))
    perfil: Mapped[str] = mapped_column(String(10))  # "fuma" ou "parou"
    data_inicio: Mapped[datetime] = mapped_column(DateTime)  # guardada em UTC
    data_cadastro: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    motivo: Mapped[str] = mapped_column(Text)
    foto_motivo: Mapped[Optional[str]] = mapped_column(Text)
    foto_perfil: Mapped[Optional[str]] = mapped_column(Text)
    lembretes: Mapped[bool] = mapped_column(Boolean, default=False)

    # cascade="all, delete-orphan": apagar o usuário apaga também o que é só dele
    metas: Mapped[list["Meta"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    gatilhos: Mapped[list["GatilhoUsuario"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    registros_consumo: Mapped[list["RegistroConsumo"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    registros_crise: Mapped[list["RegistroCrise"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    publicacoes: Mapped[list["Publicacao"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")
    comentarios: Mapped[list["Comentario"]] = relationship(back_populates="usuario", cascade="all, delete-orphan")

    conquistas: Mapped[list["Conquista"]] = relationship(secondary=usuario_conquista)
    unidades_salvas: Mapped[list["UnidadeSaude"]] = relationship(secondary=usuario_unidade)
    conteudos_salvos: Mapped[list["Conteudo"]] = relationship(secondary=usuario_conteudo)
    publicacoes_apoiadas: Mapped[list["Publicacao"]] = relationship(secondary=apoio, back_populates="apoiadores")

    # Quem eu sigo e quem me segue (mesma tabela "seguidor", lida nos dois sentidos)
    seguindo: Mapped[list["Usuario"]] = relationship(
        secondary=seguidor,
        primaryjoin=lambda: Usuario.id_usuario == seguidor.c.id_seguidor,
        secondaryjoin=lambda: Usuario.id_usuario == seguidor.c.id_seguido,
        back_populates="seguidores",
    )
    seguidores: Mapped[list["Usuario"]] = relationship(
        secondary=seguidor,
        primaryjoin=lambda: Usuario.id_usuario == seguidor.c.id_seguido,
        secondaryjoin=lambda: Usuario.id_usuario == seguidor.c.id_seguidor,
        back_populates="seguindo",
    )


class Meta(Base):
    __tablename__ = "meta"
    __table_args__ = (
        CheckConstraint("tipo IN ('reducao', 'manutencao')", name="ck_meta_tipo"),
        CheckConstraint("status IN ('ativa', 'encerrada')", name="ck_meta_status"),
        CheckConstraint("consumo_inicial BETWEEN 1 AND 100", name="ck_meta_consumo"),
        CheckConstraint("preco_maco > 0", name="ck_meta_preco"),
        CheckConstraint("cigarros_por_maco > 0", name="ck_meta_cigarros_por_maco"),
    )

    id_meta: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(fk_usuario(), index=True)
    tipo: Mapped[str] = mapped_column(String(20))  # "reducao" (fuma) ou "manutencao" (parou)
    consumo_inicial: Mapped[int] = mapped_column(Integer)
    meta_diaria: Mapped[Optional[int]] = mapped_column(Integer)
    preco_maco: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    cigarros_por_maco: Mapped[int] = mapped_column(Integer, default=20)
    data_alvo: Mapped[Optional[date]] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="ativa")

    usuario: Mapped["Usuario"] = relationship(back_populates="metas")


class GatilhoUsuario(Base):
    __tablename__ = "gatilho_usuario"

    id_gatilho_usuario: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(fk_usuario(), index=True)
    gatilho: Mapped[str] = mapped_column(String(40))

    usuario: Mapped["Usuario"] = relationship(back_populates="gatilhos")


class RegistroConsumo(Base):
    __tablename__ = "registro_consumo"
    __table_args__ = (
        CheckConstraint("tipo IN ('cigarro', 'vontade')", name="ck_registro_tipo"),
        CheckConstraint("quantidade >= 0", name="ck_registro_quantidade"),
        CheckConstraint("nivel_vontade IS NULL OR nivel_vontade BETWEEN 1 AND 5", name="ck_registro_nivel"),
        # As consultas mais comuns são "registros deste usuário neste período"
        Index("ix_registro_usuario_data", "id_usuario", "data_hora"),
    )

    id_registro: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(fk_usuario())
    tipo: Mapped[str] = mapped_column(String(10))  # "cigarro" ou "vontade"
    data_hora: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    quantidade: Mapped[int] = mapped_column(Integer, default=0)  # cigarro >= 1, vontade = 0
    gatilho: Mapped[Optional[str]] = mapped_column(String(40))
    nivel_vontade: Mapped[Optional[int]] = mapped_column(Integer)  # 1 a 5

    usuario: Mapped["Usuario"] = relationship(back_populates="registros_consumo")


class RegistroCrise(Base):
    __tablename__ = "registro_crise"
    __table_args__ = (
        CheckConstraint("intensidade BETWEEN 1 AND 5", name="ck_crise_intensidade"),
        CheckConstraint("resultado IN ('venceu', 'fumou')", name="ck_crise_resultado"),
        CheckConstraint("estrategia IN ('respiracao', 'agua', 'jogo', 'cvv', 'outra')", name="ck_crise_estrategia"),
        Index("ix_crise_usuario_data", "id_usuario", "data_hora"),
    )

    id_crise: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(fk_usuario())
    data_hora: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    intensidade: Mapped[int] = mapped_column(Integer)  # 1 a 5
    estrategia: Mapped[str] = mapped_column(String(60))
    resultado: Mapped[str] = mapped_column(String(30))  # "venceu" ou "fumou"

    usuario: Mapped["Usuario"] = relationship(back_populates="registros_crise")


class Conquista(Base):
    """Marcos de saúde. Os 6 marcos entram pelo script de dados iniciais."""
    __tablename__ = "conquista"

    id_conquista: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(80))
    descricao: Mapped[str] = mapped_column(Text)
    tipo: Mapped[str] = mapped_column(String(20), default="saude")
    criterio: Mapped[str] = mapped_column(String(80))  # segundos sem fumar, ex.: "1200"


class Publicacao(Base):
    __tablename__ = "publicacao"
    __table_args__ = (
        CheckConstraint("categoria IN ('conquista', 'ajuda')", name="ck_publicacao_categoria"),
    )

    id_publicacao: Mapped[int] = mapped_column(primary_key=True)
    id_usuario: Mapped[int] = mapped_column(fk_usuario(), index=True)
    texto: Mapped[str] = mapped_column(String(500))
    data_hora: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    categoria: Mapped[str] = mapped_column(String(20))  # "conquista" ou "ajuda"
    foto: Mapped[Optional[str]] = mapped_column(Text)

    usuario: Mapped["Usuario"] = relationship(back_populates="publicacoes")
    comentarios: Mapped[list["Comentario"]] = relationship(back_populates="publicacao", cascade="all, delete-orphan")
    apoiadores: Mapped[list["Usuario"]] = relationship(secondary=apoio, back_populates="publicacoes_apoiadas")


class Comentario(Base):
    __tablename__ = "comentario"

    id_comentario: Mapped[int] = mapped_column(primary_key=True)
    id_publicacao: Mapped[int] = mapped_column(ForeignKey("publicacao.id_publicacao", ondelete="CASCADE"), index=True)
    id_usuario: Mapped[int] = mapped_column(fk_usuario())
    texto: Mapped[str] = mapped_column(String(300))
    data_hora: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    publicacao: Mapped["Publicacao"] = relationship(back_populates="comentarios")
    usuario: Mapped["Usuario"] = relationship(back_populates="comentarios")


class UnidadeSaude(Base):
    __tablename__ = "unidade_saude"
    __table_args__ = (
        CheckConstraint("tipo IN ('UBS', 'CAPS AD')", name="ck_unidade_tipo"),
    )

    id_unidade: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    tipo: Mapped[str] = mapped_column(String(10))  # "UBS" ou "CAPS AD"
    endereco: Mapped[str] = mapped_column(String(200))
    telefone: Mapped[Optional[str]] = mapped_column(String(20))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)


class Conteudo(Base):
    __tablename__ = "conteudo"

    id_conteudo: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(120))
    categoria: Mapped[str] = mapped_column(String(40))
    resumo: Mapped[str] = mapped_column(Text)
    data_publicacao: Mapped[Optional[date]] = mapped_column(Date)
