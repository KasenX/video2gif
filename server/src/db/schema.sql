CREATE TABLE "video" (
    "id" UUID PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(255) NOT NULL,
    "size" BIGINT NOT NULL,
    "uploaded" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE gif_status AS ENUM ('in_progress', 'completed', 'failed');

CREATE TABLE "gif" (
    "id" UUID PRIMARY KEY,
    "user_id" INTEGER NOT NULL,
    "video_id" UUID NOT NULL REFERENCES "video"("id"),
    "name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(255) NOT NULL,
    "size" BIGINT NOT NULL,
    "status" gif_status NOT NULL,
    "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" TIMESTAMP
);
