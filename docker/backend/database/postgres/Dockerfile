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
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c "CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email TEXT UNIQUE NOT NULL, phone TEXT UNIQUE, username TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO \"${POSTGRES_USER}\";" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c "GRANT ALL PRIVILEGES ON DATABASE \"${POSTGRES_DB_USERS}\" TO ${POSTGRES_USER};" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO ${POSTGRES_USER};" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${POSTGRES_USER};" && \
    psql -v ON_ERROR_STOP=1 --username postgres -d "${POSTGRES_DB_USERS}" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${POSTGRES_USER};" && \
    pg_ctl -D "$PGDATA" -m fast -w stop

USER root
RUN echo "host all all 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
RUN echo "host all all ::/0 trust" >> "$PGDATA/pg_hba.conf"

EXPOSE 5432