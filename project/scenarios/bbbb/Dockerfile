FROM python:3.10.9-slim AS app
RUN pip install --no-cache pycryptodome

FROM 2dukes/pwnred_jail
COPY --from=app / /srv
COPY bbbb.py /srv/app/run
RUN chmod 755 /srv/app/run
COPY flag.txt /srv/app/
ENV JAIL_MEM=100M JAIL_CPU=500 JAIL_TIME=300
