import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR NOT NULL UNIQUE,
        "password_hash" VARCHAR NOT NULL,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "streaming_content" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "description" TEXT,
        "thumbnail_url" VARCHAR,
        "video_url" VARCHAR,
        "content_type" VARCHAR CHECK ("content_type" IN ('movie', 'series')),
        "year" SMALLINT CHECK ("year" > 1800 AND "year" < 2100),
        "genre" TEXT[],
        "rating" DECIMAL(3,1) CHECK ("rating" BETWEEN 0 AND 10),
        "duration" INTEGER,
        "cast_members" TEXT[],
        "watch_progress" DECIMAL(5,2) DEFAULT 0 CHECK ("watch_progress" BETWEEN 0 AND 100),
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_content_type" ON "streaming_content"("content_type")`,
    );

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await queryRunner.query(`
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON "streaming_content"
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "watch_history" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "content_id" INTEGER REFERENCES "streaming_content"("id") ON DELETE CASCADE,
        "progress" DECIMAL(5,2),
        "watched_at" TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "watch_history"`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS set_updated_at ON "streaming_content"`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_content_type"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "streaming_content"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
