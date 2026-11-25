"""As fórmulas da Sprint 2 (CONTEXTO_IA.md, seções 4.4 a 4.6).

Este arquivo NÃO fala com o banco nem com a internet: só recebe números e datas
e devolve resultados. Por isso dá para testar cada regra sozinha, e as rotas
de /progresso e /plano/hoje só precisam buscar os dados e chamar estas funções.

Datas: recebem o horário do banco (UTC, sem fuso) e usam o dia de São Paulo
para tudo que depende de "hoje".
"""
import math
from datetime import date, datetime

from app.datas import para_sp

SEGUNDOS_POR_DIA = 24 * 60 * 60


def arredondar(valor: float) -> int:
    """Arredonda .5 para cima, igual ao Math.round do front.
    (O round() do Python arredonda 2.5 para 2, e front e back mostrariam números diferentes.)"""
    return math.floor(valor + 0.5)


# ---------- Tempo ----------
def dia_no_fuso_sp(momento_utc: datetime) -> date:
    return para_sp(momento_utc).date()


def dia_plano(data_inicio: datetime, agora: datetime) -> int:
    """Dia da jornada: o dia do início é o dia 1. Conta pelo calendário de São Paulo."""
    return (dia_no_fuso_sp(agora) - dia_no_fuso_sp(data_inicio)).days + 1


def dias_decorridos(data_inicio: datetime, agora: datetime) -> float:
    """Tempo desde o início, em dias (com fração: 12 horas = 0.5)."""
    return max(0.0, (agora - data_inicio).total_seconds() / SEGUNDOS_POR_DIA)


def segundos_sem_fumar(data_inicio: datetime, ultimo_cigarro: datetime | None, agora: datetime) -> int:
    """Desde o último cigarro registrado; sem nenhum, desde o início da jornada."""
    referencia = max(data_inicio, ultimo_cigarro) if ultimo_cigarro else data_inicio
    return max(0, int((agora - referencia).total_seconds()))


# ---------- Plano do perfil "fuma" (seção 4.4) ----------
def limite_do_dia(cigarros_por_dia: int, dia: int) -> int:
    """1 cigarro a menos por dia: dia 1 = consumo - 1; chega a 0 no dia igual ao consumo."""
    return max(0, cigarros_por_dia - dia)


def reduzidos_ate_hoje(cigarros_por_dia: int, dia: int) -> int:
    return cigarros_por_dia - limite_do_dia(cigarros_por_dia, dia)


def mensagem_plano_fuma(limite_hoje: int) -> str:
    if limite_hoje == 0:
        return "Hoje é o seu dia de parar! Você chegou até aqui."
    amanha = limite_hoje - 1
    return f"Hoje o limite é {limite_hoje}. Amanhã, {amanha if amanha else 'zero'}."


# ---------- Progresso (seção 4.6) ----------
def cigarros_evitados(cigarros_por_dia: int, dias: float, fumados_desde_o_inicio: int) -> int:
    return max(0, arredondar(cigarros_por_dia * dias - fumados_desde_o_inicio))


def economia(evitados: int, preco_maco: float, cigarros_por_maco: int) -> float:
    return round(evitados * float(preco_maco) / cigarros_por_maco, 2)


def marcos_atingidos(segundos: int, criterios: list[int]) -> int:
    """Quantos marcos de saúde já foram alcançados com esse tempo sem fumar."""
    return sum(1 for c in criterios if segundos >= c)


# ---------- Apoio do perfil "parou" (seção 4.5) ----------
DICAS_POR_GATILHO = {
    "Estresse": "Estresse é um dos seus gatilhos. Quando ele vier, respire fundo por 1 minuto antes de decidir qualquer coisa.",
    "Café": "Café é um dos seus gatilhos. Que tal trocar de lugar ou de caneca para quebrar o costume?",
    "Depois das refeições": "Depois das refeições é um momento de risco. Escove os dentes ou levante para caminhar logo em seguida.",
    "Bebida alcoólica": "Bebida alcoólica é um dos seus gatilhos. Se for beber hoje, combine antes com alguém que te apoie.",
    "Ansiedade": "Ansiedade é um dos seus gatilhos. A vontade passa em poucos minutos: o botão SOS está sempre a um toque.",
    "Trabalho": "O trabalho é um dos seus gatilhos. Planeje pequenas pausas sem cigarro: água, alongamento ou uma volta curta.",
    "Tédio": "Tédio é um dos seus gatilhos. Deixe algo para ocupar as mãos e a cabeça por perto.",
    "Festas": "Festas são um dos seus gatilhos. Tenha um plano antes de sair.",
    "Amigos que fumam": "Amigos que fumam são um gatilho. Conte a eles que você parou: quem gosta de você vai ajudar.",
    "Pausa do trabalho": "A pausa do trabalho é um gatilho. Troque o cigarro da pausa por um café, uma água ou uma conversa.",
}


def mensagem_apoio_parou(gatilhos: list[str], motivo: str | None, hoje: date) -> str:
    """Uma dica por dia, alternando entre os gatilhos do usuário."""
    if not gatilhos:
        return f"Lembre do seu porquê: {motivo}" if motivo else "Cada dia sem fumar é uma vitória. Continue firme."
    gatilho = gatilhos[hoje.toordinal() % len(gatilhos)]
    return DICAS_POR_GATILHO.get(
        gatilho, f"{gatilho} é um dos seus gatilhos. Quando ele aparecer, lembre do seu porquê."
    )
