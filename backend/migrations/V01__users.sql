CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "users"
(
    "id"           integer DEFAULT nextval('users_id_seq') NOT NULL,
    "firstName"    character varying(50)                   NOT NULL,
    "lastName"     character varying(50),
    "username"     character varying(50)                   NOT NULL,
    "passwordHash" character varying(150),
    "isActive"     boolean DEFAULT true                    NOT NULL,
    "createdAt"    timestamptz                             NOT NULL,
    "updatedAt"    timestamptz                             NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);
