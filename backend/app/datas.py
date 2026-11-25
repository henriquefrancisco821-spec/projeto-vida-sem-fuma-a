from datetime import date, datetime, time, timezone
from zoneinfo import ZoneInfo

# Regra do contrato: o banco guarda em UTC, mas "hoje" é sempre o dia de São Paulo
FUSO_SP = ZoneInfo("America/Sao_Paulo")


def agora_utc() -> datetime:
    """Momento atual em UTC, sem fuso (é assim que o banco guarda)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def para_sp(momento_utc: datetime) -> datetime:
    """Converte uma data do banco (UTC) para o horário de São Paulo."""
    return momento_utc.replace(tzinfo=timezone.utc).astimezone(FUSO_SP)


def hoje_sp() -> date:
    return datetime.now(FUSO_SP).date()


def inicio_do_dia_em_utc(dia: date) -> datetime:
    """Meia-noite de um dia de São Paulo, no horário do banco (UTC, sem fuso).
    Ex.: o dia 20/11 em São Paulo começa às 03:00 UTC. Serve para filtrar "os registros de hoje"."""
    meia_noite_sp = datetime.combine(dia, time.min, tzinfo=FUSO_SP)
    return meia_noite_sp.astimezone(timezone.utc).replace(tzinfo=None)
