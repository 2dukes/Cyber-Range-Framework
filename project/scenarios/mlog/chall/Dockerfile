ARG OPENAI_KEY

FROM python:3.10.9-slim as chall
ARG OPENAI_KEY

WORKDIR /app
COPY pyproject.toml poetry.lock run .//
COPY mlog/__init__.py mlog/
RUN pip install -e ./
COPY mlog/ mlog/
RUN sed -i -e "s/%%OPENAI_KEY%%/${OPENAI_KEY}/g" mlog/predict.py

FROM 2dukes/pwnred_jail

COPY hook.sh /jail/hook.sh
COPY --from=chall / /srv

ENV JAIL_PIDS=20
ENV JAIL_MEM=40M
ENV JAIL_ENV_FLAG=dice{fakeflag}
