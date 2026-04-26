import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLiveContentType1777234452363 implements MigrationInterface {
    name = 'AddLiveContentType1777234452363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch_history" DROP CONSTRAINT "watch_history_user_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "watch_history" DROP CONSTRAINT "watch_history_content_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "streaming_content_content_type_check"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "streaming_content_year_check"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "streaming_content_rating_check"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "streaming_content_watch_progress_check"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ALTER COLUMN "watch_progress" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ALTER COLUMN "updated_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "watch_history" ALTER COLUMN "watched_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "CHK_9f036bed877ecee0f96fb411ec" CHECK ("content_type" IN ('movie', 'series', 'live'))`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "CHK_b657b714ec8679cb2e6f87a78c" CHECK ("year" > 1800 AND "year" < 2100)`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "CHK_361bd142ae15969eed82d5a6b1" CHECK ("rating" BETWEEN 0 AND 10)`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "CHK_a83a93a6768073d751c546b1f8" CHECK ("watch_progress" BETWEEN 0 AND 100)`);
        await queryRunner.query(`ALTER TABLE "watch_history" ADD CONSTRAINT "CHK_9a842474eaa55b474269b2febb" CHECK ("progress" BETWEEN 0 AND 100)`);
        await queryRunner.query(`ALTER TABLE "watch_history" ADD CONSTRAINT "FK_5e1169219c2bda5624a4b65742d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_history" ADD CONSTRAINT "FK_2e3d78f45d9690d5c856d3e9db9" FOREIGN KEY ("content_id") REFERENCES "streaming_content"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "watch_history" DROP CONSTRAINT "FK_2e3d78f45d9690d5c856d3e9db9"`);
        await queryRunner.query(`ALTER TABLE "watch_history" DROP CONSTRAINT "FK_5e1169219c2bda5624a4b65742d"`);
        await queryRunner.query(`ALTER TABLE "watch_history" DROP CONSTRAINT "CHK_9a842474eaa55b474269b2febb"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "CHK_a83a93a6768073d751c546b1f8"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "CHK_361bd142ae15969eed82d5a6b1"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "CHK_b657b714ec8679cb2e6f87a78c"`);
        await queryRunner.query(`ALTER TABLE "streaming_content" DROP CONSTRAINT "CHK_9f036bed877ecee0f96fb411ec"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "watch_history" ALTER COLUMN "watched_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ALTER COLUMN "updated_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ALTER COLUMN "created_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ALTER COLUMN "watch_progress" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "streaming_content_watch_progress_check" CHECK (((watch_progress >= (0)::numeric) AND (watch_progress <= (100)::numeric)))`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "streaming_content_rating_check" CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "streaming_content_year_check" CHECK (((year > 1800) AND (year < 2100)))`);
        await queryRunner.query(`ALTER TABLE "streaming_content" ADD CONSTRAINT "streaming_content_content_type_check" CHECK (((content_type)::text = ANY ((ARRAY['movie'::character varying, 'series'::character varying])::text[])))`);
        await queryRunner.query(`ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "streaming_content"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
