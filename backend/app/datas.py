from datetime import date, datetime, timezone
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
