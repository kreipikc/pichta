FROM apache/age:release_PG16_1.5.0

ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB_GRAPH
ARG POSTGRES_DB_USERS

ENV POSTGRES_USER=${POSTGRES_USER} \
    POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
    POSTGRES_DB_GRAPH=${POSTGRES_DB_GRAPH} \
    POSTGRES_DB_USERS=${POSTGRES_DB_USERS} \
    PGDATA=/var/lib/postgresql/data

USER postgres

RUN initdb -D "$PGDATA" && \
    pg_ctl -D "$PGDATA" -o "-c listen_addresses=''" -w start && \
    psql -v ON_ERROR_STOP=1 --username postgres -c "CREATE USER \"${POSTGRES_USER}\" WITH PASSWORD '${POSTGRES_PASSWORD}';" && \
    psql -v ON_ERROR_STOP=1 --username postgres -c "ALTER USER postgres WITH PASSWORD '${POSTGRES_PASSWORD}';" && \
    createdb -O "${POSTGRES_USER}" "${POSTGRES_DB_GRAPH}" && \
    createdb -O "${POSTGRES_USER}" "${POSTGRES_DB_USERS}" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_GRAPH}" -c "CREATE EXTENSION age;" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_GRAPH}" -c "LOAD 'age';" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c " \
      CREATE TABLE users ( \
        id UUID PRIMARY KEY, \
        email TEXT, \
        phone TEXT, \
        password_hash TEXT, \
        created_at TIMESTAMPTZ DEFAULT NOW(), \
        updated_at TIMESTAMPTZ DEFAULT NOW() \
      ); \
    " && \
    pg_ctl -D "$PGDATA" -m fast -w stop

USER root
RUN echo "host all all 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
RUN echo "host all all ::/0 trust" >> "$PGDATA/pg_hba.conf"

EXPOSE 5432