CREATE TABLE "video" (
    "id" UUID PRIMARY KEY,
    "userId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(255) NOT NULL,
    "duration" DECIMAL NOT NULL,
    "size" BIGINT NOT NULL,
    "uploaded" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE gif_status AS ENUM ('in_progress', 'completed', 'failed');

CREATE TABLE "gif" (
    "id" UUID PRIMARY KEY,
    "userId" UUID NOT NULL,
    "videoId" UUID NOT NULL REFERENCES "video"("id"),
    "name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(255) NOT NULL,
    "size" BIGINT NOT NULL,
    "fps" INTEGER NOT NULL,
    "scaleX" INTEGER NOT NULL,
    "scaleY" INTEGER NOT NULL,
    "startTime" DECIMAL NOT NULL,
    "duration" DECIMAL,
    "status" gif_status NOT NULL,
    "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" TIMESTAMP
);

CREATE TABLE "preferences" (
    "userId" UUID PRIMARY KEY,
    "fps" INTEGER NOT NULL,
    "scaleX" INTEGER NOT NULL,
    "scaleY" INTEGER NOT NULL,
    "updated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
