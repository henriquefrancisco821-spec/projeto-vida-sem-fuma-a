"""Testes das rotas da Sprint 2: /registros, /progresso, /plano/hoje e /conquistas."""
from datetime import datetime, timedelta, timezone
from itertools import count

import pytest
from sqlalchemy import update

from app.database import SessionLocal
from app.models import RegistroConsumo, Usuario

_numero = count(1)
AGORA = datetime.now(timezone.utc).replace(tzinfo=None)


def cadastrar(cliente, perfil="fuma", cigarros=20, preco=12.5, dias=None, gatilhos=("Café",)):
    """Cria uma conta nova (e-mail único) e devolve (cabeçalho com o token, id do usuário)."""
    email = f"pessoa{next(_numero)}@exemplo.com"
    r = cliente.post("/auth/cadastro", json={
        "email": email, "senha": "senhaforte1", "apelido": "Teste", "perfil": perfil,
        "cigarros_por_dia": cigarros, "preco_maco": preco, "dias_sem_fumar": dias,
        "gatilhos": list(gatilhos), "motivo": "Pela saúde",
    })
    assert r.status_code == 201, r.json()
    j = r.json()
    return {"Authorization": f"Bearer {j['access_token']}"}, j["usuario"]["id_usuario"]


def viajar_no_tempo(id_usuario, inicio_horas_atras, cigarro_horas_atras=None):
    """Muda as datas no banco para simular dias de jornada."""
    db = SessionLocal()
    db.execute(update(Usuario).where(Usuario.id_usuario == id_usuario)
               .values(data_inicio=AGORA - timedelta(hours=inicio_horas_atras)))
    if cigarro_horas_atras is not None:
        db.execute(update(RegistroConsumo)
                   .where(RegistroConsumo.id_usuario == id_usuario, RegistroConsumo.tipo == "cigarro")
                   .values(data_hora=AGORA - timedelta(hours=cigarro_horas_atras)))
    db.commit()
    db.close()


@pytest.mark.parametrize("rota", ["/registros", "/progresso", "/plano/hoje", "/conquistas"])
def test_rotas_exigem_login(cliente, rota):
    assert cliente.get(rota).status_code == 401


def test_registrar_cigarro_e_vontade(cliente):
    h, _ = cadastrar(cliente)
    r = cliente.post("/registros", headers=h, json={"tipo": "cigarro", "gatilho": "Estresse"})
    assert r.status_code == 201
    assert r.json()["quantidade"] == 1 and r.json()["data_hora"].endswith("-03:00")
    r = cliente.post("/registros", headers=h, json={"tipo": "vontade", "gatilho": "Café", "nivel_vontade": 4})
    assert r.status_code == 201 and r.json()["quantidade"] == 0
    assert [x["tipo"] for x in cliente.get("/registros?dias=7", headers=h).json()] == ["vontade", "cigarro"]


@pytest.mark.parametrize("dias", [0, 91])
def test_dias_fora_do_limite(cliente, dias):
    h, _ = cadastrar(cliente)
    assert cliente.get(f"/registros?dias={dias}", headers=h).status_code == 422


def test_anti_idor_um_usuario_nao_ve_nem_grava_pelo_outro(cliente):
    h_marcos, id_marcos = cadastrar(cliente)
    h_bia, _ = cadastrar(cliente, perfil="parou", dias=14)
    cliente.post("/registros", headers=h_marcos, json={"tipo": "cigarro"})
    assert cliente.get("/registros", headers=h_bia).json() == []
    # tentar gravar em nome do Marcos mandando o id no corpo não funciona
    cliente.post("/registros", headers=h_bia, json={"tipo": "vontade", "id_usuario": id_marcos})
    assert len(cliente.get("/registros", headers=h_marcos).json()) == 1


def test_plano_do_marcos_no_dia_1(cliente):
    h, _ = cadastrar(cliente)
    cliente.post("/registros", headers=h, json={"tipo": "cigarro"})
    plano = cliente.get("/plano/hoje", headers=h).json()
    assert plano["dia_plano"] == 1 and plano["limite_hoje"] == 19 and plano["fumados_hoje"] == 1
    assert plano["mensagem"] == "Hoje o limite é 19. Amanhã, 18."


def test_progresso_do_marcos_depois_de_3_dias(cliente):
    h, uid = cadastrar(cliente)
    cliente.post("/registros", headers=h, json={"tipo": "cigarro"})
    viajar_no_tempo(uid, inicio_horas_atras=72, cigarro_horas_atras=13)
    p = cliente.get("/progresso", headers=h).json()
    # 20 por dia x 3 dias - 1 fumado = 59 evitados; 59 x R$ 12,50 / 20 = R$ 36,88
    assert p["cigarros_evitados"] == 59 and p["economia"] == 36.88
    assert p["dia_jornada"] == 4 and p["limite_hoje"] == 16
    assert abs(p["segundos_sem_fumar"] - 13 * 3600) < 5
    assert p["marcos_atingidos"] == 2  # 20 minutos e 12 horas


def test_conquistas_mostram_os_marcos_atingidos(cliente):
    h, uid = cadastrar(cliente)
    viajar_no_tempo(uid, inicio_horas_atras=13)
    marcos = cliente.get("/conquistas", headers=h).json()
    assert [m["titulo"] for m in marcos] == ["20 minutos", "12 horas", "2 dias", "2 semanas", "3 meses", "1 ano"]
    assert [m["atingida"] for m in marcos] == [True, True, False, False, False, False]
    assert marcos[0]["data_obtida"] and marcos[2]["data_obtida"] is None


def test_beatriz_sem_limite_e_com_dica_do_gatilho(cliente):
    h, _ = cadastrar(cliente, perfil="parou", cigarros=10, preco=11, dias=14, gatilhos=["Festas"])
    p = cliente.get("/progresso", headers=h).json()
    assert p["limite_hoje"] is None and p["marcos_atingidos"] == 4
    assert p["cigarros_evitados"] == 140 and p["economia"] == 77.0
    plano = cliente.get("/plano/hoje", headers=h).json()
    assert plano == {"perfil": "parou", "gatilhos": ["Festas"], "motivo": "Pela saúde",
                     "mensagem": "Festas são um dos seus gatilhos. Tenha um plano antes de sair."}


def test_excluir_conta_apaga_os_registros(cliente):
    h, uid = cadastrar(cliente)
    cliente.post("/registros", headers=h, json={"tipo": "cigarro"})
    db = SessionLocal()
    db.delete(db.get(Usuario, uid))
    db.commit()
    assert db.query(RegistroConsumo).filter(RegistroConsumo.id_usuario == uid).count() == 0
    db.close()
