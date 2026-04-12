CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"school" varchar(255),
	"subjects_taught" varchar(50)[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teachers_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "teachers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "teacher_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"default_subject" varchar(50) DEFAULT 'general',
	"default_strictness" varchar(20) DEFAULT 'moderate',
	"ai_detection_enabled" boolean DEFAULT true NOT NULL,
	"default_max_score" integer DEFAULT 100 NOT NULL,
	"feedback_tone" varchar(20) DEFAULT 'neutral',
	"preferred_llm_provider" varchar(20),
	"preferred_llm_model" varchar(100),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_preferences_teacher_id_unique" UNIQUE("teacher_id")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"provider" varchar(20) NOT NULL,
	"encrypted_key" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"key_hint" varchar(8) NOT NULL,
	"is_valid" boolean DEFAULT true NOT NULL,
	"last_validated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grading_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject" varchar(50) NOT NULL,
	"strictness" varchar(20) DEFAULT 'moderate' NOT NULL,
	"custom_instructions" text,
	"ai_detection_enabled" boolean DEFAULT true NOT NULL,
	"max_score" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(50) DEFAULT 'general',
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"rule_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grading_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"template_id" uuid,
	"subject" varchar(50) NOT NULL,
	"strictness" varchar(20) NOT NULL,
	"custom_instructions" text,
	"ai_detection_enabled" boolean DEFAULT true NOT NULL,
	"max_score" integer DEFAULT 100 NOT NULL,
	"llm_provider" varchar(20) NOT NULL,
	"llm_model" varchar(100) NOT NULL,
	"total_files" integer DEFAULT 0 NOT NULL,
	"graded_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"average_score" real,
	"avg_ai_percentage" real,
	"flagged_count" integer DEFAULT 0 NOT NULL,
	"total_tokens_used" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"score" real,
	"feedback" text,
	"strengths" text,
	"areas_for_improvement" text,
	"ai_content_percentage" real,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" varchar(255),
	"math_verified" boolean,
	"wolfram_details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"graded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "grading_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"total_assignments_graded" integer DEFAULT 0 NOT NULL,
	"all_time_average_score" real,
	"total_flagged" integer DEFAULT 0 NOT NULL,
	"total_time_saved_minutes" integer DEFAULT 0 NOT NULL,
	"last_graded_at" date,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grading_statistics_teacher_id_unique" UNIQUE("teacher_id")
);
--> statement-breakpoint
ALTER TABLE "teacher_preferences" ADD CONSTRAINT "teacher_preferences_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_templates" ADD CONSTRAINT "grading_templates_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_rules" ADD CONSTRAINT "custom_rules_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_rules" ADD CONSTRAINT "template_rules_template_id_grading_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."grading_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_rules" ADD CONSTRAINT "template_rules_rule_id_custom_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."custom_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_sessions" ADD CONSTRAINT "grading_sessions_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_sessions" ADD CONSTRAINT "grading_sessions_template_id_grading_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."grading_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_results" ADD CONSTRAINT "student_results_session_id_grading_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."grading_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grading_statistics" ADD CONSTRAINT "grading_statistics_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_teachers_clerk_id" ON "teachers" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_teachers_email" ON "teachers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_api_keys_teacher_provider" ON "api_keys" USING btree ("teacher_id","provider");--> statement-breakpoint
CREATE INDEX "idx_api_keys_teacher" ON "api_keys" USING btree ("teacher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_templates_teacher_name" ON "grading_templates" USING btree ("teacher_id","name");--> statement-breakpoint
CREATE INDEX "idx_rules_teacher" ON "custom_rules" USING btree ("teacher_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_template_rules_unique" ON "template_rules" USING btree ("template_id","rule_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_teacher" ON "grading_sessions" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_status" ON "grading_sessions" USING btree ("teacher_id","status");--> statement-breakpoint
CREATE INDEX "idx_sessions_created" ON "grading_sessions" USING btree ("teacher_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_results_session" ON "student_results" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_stats_teacher" ON "grading_statistics" USING btree ("teacher_id");