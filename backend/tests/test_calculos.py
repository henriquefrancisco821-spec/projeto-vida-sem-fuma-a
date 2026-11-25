"""Testes das fórmulas da Sprint 2. Rodar dentro de backend:  pytest
Cada teste usa um exemplo do CONTEXTO_IA.md. As datas são em UTC, como no banco."""
from datetime import date, datetime

import pytest
from pydantic import ValidationError

from app import calculos as c
from app.schemas import RegistroIn

# 20/11/2026 10:00 em São Paulo = 13:00 UTC
INICIO = datetime(2026, 11, 20, 13, 0)


# ---------- dia do plano e fuso de São Paulo ----------
def test_dia_do_inicio_e_o_dia_1():
    assert c.dia_plano(INICIO, INICIO) == 1


def test_dia_plano_conta_pelo_calendario():
    assert c.dia_plano(INICIO, datetime(2026, 11, 26, 13, 0)) == 7


def test_dia_nao_vira_as_21h():
    # 22:00 de 20/11 em São Paulo já é 01:00 de 21/11 em UTC. Continua sendo o dia 1.
    assert c.dia_plano(INICIO, datetime(2026, 11, 21, 1, 0)) == 1


def test_dia_vira_a_meia_noite_de_sao_paulo():
    # 00:30 de 21/11 em São Paulo = 03:30 UTC. Agora sim, dia 2.
    assert c.dia_plano(INICIO, datetime(2026, 11, 21, 3, 30)) == 2


# ---------- plano do Marcos: 1 cigarro a menos por dia ----------
@pytest.mark.parametrize("dia, limite", [(1, 19), (7, 13), (19, 1), (20, 0), (25, 0)])
def test_limite_do_dia_com_20_por_dia(dia, limite):
    assert c.limite_do_dia(20, dia) == limite


def test_no_dia_7_ja_sao_7_a_menos():
    assert c.reduzidos_ate_hoje(20, 7) == 7


def test_mensagens_do_plano():
    assert c.mensagem_plano_fuma(16) == "Hoje o limite é 16. Amanhã, 15."
    assert c.mensagem_plano_fuma(1) == "Hoje o limite é 1. Amanhã, zero."
    assert c.mensagem_plano_fuma(0).startswith("Hoje é o seu dia de parar!")


# ---------- tempo sem fumar ----------
def test_sem_cigarro_conta_desde_o_inicio():
    assert c.segundos_sem_fumar(INICIO, None, datetime(2026, 11, 20, 15, 0)) == 7200


def test_com_cigarro_conta_desde_o_ultimo():
    ultimo = datetime(2026, 11, 20, 14, 0)
    assert c.segundos_sem_fumar(INICIO, ultimo, datetime(2026, 11, 20, 15, 0)) == 3600


def test_tempo_nunca_fica_negativo():
    assert c.segundos_sem_fumar(INICIO, None, datetime(2026, 11, 20, 12, 0)) == 0


# ---------- cigarros evitados e economia ----------
def test_meio_dia_com_20_por_dia_e_3_fumados():
    # 20 x 0,5 dia - 3 fumados = 7 evitados
    dias = c.dias_decorridos(INICIO, datetime(2026, 11, 21, 1, 0))
    assert dias == 0.5
    assert c.cigarros_evitados(20, dias, 3) == 7


def test_evitados_nunca_ficam_negativos():
    assert c.cigarros_evitados(20, 0.1, 10) == 0


def test_arredonda_igual_ao_front():
    assert c.arredondar(2.5) == 3  # round(2.5) do Python daria 2
    assert c.cigarros_evitados(5, 0.5, 0) == 3


def test_economia_em_reais():
    # 12 evitados x R$ 12,50 / 20 por maço = R$ 7,50
    assert c.economia(12, 12.50, 20) == 7.50


# ---------- marcos de saúde ----------
CRITERIOS = [1200, 43200, 172800, 1209600, 7776000, 31536000]


@pytest.mark.parametrize("segundos, marcos", [(0, 0), (1199, 0), (1200, 1), (2 * 86400, 3), (400 * 86400, 6)])
def test_marcos_atingidos(segundos, marcos):
    assert c.marcos_atingidos(segundos, CRITERIOS) == marcos


# ---------- apoio da Beatriz ----------
def test_dica_de_festas_igual_ao_contrato():
    assert c.mensagem_apoio_parou(["Festas"], "Pela saúde", date(2026, 11, 24)) == \
        "Festas são um dos seus gatilhos. Tenha um plano antes de sair."


def test_dica_alterna_entre_os_gatilhos_por_dia():
    gatilhos = ["Festas", "Café"]
    dia1 = c.mensagem_apoio_parou(gatilhos, None, date(2026, 11, 24))
    dia2 = c.mensagem_apoio_parou(gatilhos, None, date(2026, 11, 25))
    assert dia1 != dia2


def test_sem_gatilhos_lembra_o_porque():
    assert c.mensagem_apoio_parou([], "Pela minha filha", date(2026, 11, 24)) == "Lembre do seu porquê: Pela minha filha"


def test_gatilho_sem_dica_pronta_tem_mensagem_padrao():
    assert c.mensagem_apoio_parou(["Chuva"], None, date(2026, 11, 24)).startswith("Chuva é um dos seus gatilhos.")


# ---------- formulário de registro ----------
def test_cigarro_sem_quantidade_vale_1():
    assert RegistroIn(tipo="cigarro", gatilho="Estresse").quantidade == 1


def test_vontade_vencida_tem_quantidade_0():
    assert RegistroIn(tipo="vontade", gatilho="Café", nivel_vontade=4).quantidade == 0


@pytest.mark.parametrize("dados", [
    {"tipo": "charuto"},
    {"tipo": "vontade", "nivel_vontade": 9},
    {"tipo": "cigarro", "quantidade": 0},
    {"tipo": "cigarro", "gatilho": "x" * 41},
])
def test_registros_invalidos_sao_recusados(dados):
    with pytest.raises(ValidationError):
        RegistroIn(**dados)
