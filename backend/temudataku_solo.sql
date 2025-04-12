CREATE TABLE "users" (
  "id" integer PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "full_name" varchar NOT NULL,
  "phone_number" varchar,
  "profile_picture" varchar,
  "city" varchar,
  "province" varchar,
  "is_email_verified" boolean DEFAULT false,
  "verification_token" varchar,
  "verification_token_expires" timestamp,
  "registration_date" timestamp DEFAULT (now()),
  "last_login" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "roles" (
  "id" integer PRIMARY KEY,
  "role_name" varchar UNIQUE NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "user_roles" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "role_id" integer NOT NULL,
  "assigned_date" timestamp DEFAULT (now()),
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "mentor_profiles" (
  "id" integer PRIMARY KEY,
  "user_id" integer UNIQUE NOT NULL,
  "expertise" text,
  "bio" text,
  "experience" text,
  "availability_schedule" json,
  "hourly_rate" decimal,
  "is_verified" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "mentoring_services" (
  "id" integer PRIMARY KEY,
  "mentor_id" integer NOT NULL,
  "service_name" varchar NOT NULL,
  "description" text,
  "price" decimal NOT NULL,
  "service_type" varchar,
  "max_participants" integer,
  "duration_days" integer NOT NULL,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "mentoring_sessions" (
  "id" integer PRIMARY KEY,
  "service_id" integer NOT NULL,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp NOT NULL,
  "duration_minutes" integer NOT NULL,
  "meeting_link" varchar,
  "status" varchar,
  "notes" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "bookings" (
  "id" integer PRIMARY KEY,
  "mentee_id" integer NOT NULL,
  "session_id" integer NOT NULL,
  "booking_date" timestamp DEFAULT (now()),
  "status" varchar,
  "special_requests" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "payments" (
  "id" integer PRIMARY KEY,
  "booking_id" integer NOT NULL,
  "amount" decimal NOT NULL,
  "payment_date" timestamp,
  "payment_method" varchar,
  "transaction_id" varchar,
  "status" varchar,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "referral_codes" (
  "id" integer PRIMARY KEY,
  "owner_id" integer NOT NULL,
  "code" varchar UNIQUE NOT NULL,
  "discount_percentage" decimal NOT NULL,
  "commission_percentage" decimal NOT NULL,
  "created_date" timestamp DEFAULT (now()),
  "expiry_date" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "feedback" (
  "id" integer PRIMARY KEY,
  "session_id" integer NOT NULL,
  "user_id" integer NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "submitted_date" timestamp DEFAULT (now()),
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "projects" (
  "id" integer PRIMARY KEY,
  "mentee_id" integer NOT NULL,
  "session_id" integer NOT NULL,
  "title" varchar NOT NULL,
  "description" text,
  "file_path" varchar,
  "submission_date" timestamp DEFAULT (now()),
  "plagiarism_score" decimal,
  "nilai" decimal,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "notifications" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "type" varchar NOT NULL,
  "title" varchar NOT NULL,
  "message" text,
  "is_read" boolean DEFAULT false,
  "created_date" timestamp DEFAULT (now()),
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "user_behavior" (
  "id" integer PRIMARY KEY,
  "user_id" integer,
  "page_visited" varchar NOT NULL,
  "action" varchar,
  "timestamp" timestamp DEFAULT (now()),
  "ip_address" varchar,
  "user_agent" varchar,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "practices" (
  "id" integer PRIMARY KEY,
  "mentor_id" integer NOT NULL,
  "title" varchar NOT NULL,
  "description" text,
  "thumbnail_image" varchar,
  "price" decimal NOT NULL,
  "practice_type" varchar,
  "category" varchar,
  "tags" json,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "practice_materials" (
  "id" integer PRIMARY KEY,
  "practice_id" integer NOT NULL,
  "title" varchar NOT NULL,
  "description" text,
  "order_number" integer NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "practice_files" (
  "id" integer PRIMARY KEY,
  "material_id" integer NOT NULL,
  "file_name" varchar NOT NULL,
  "file_path" varchar NOT NULL,
  "file_type" varchar NOT NULL,
  "file_size" integer,
  "order_number" integer NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "practice_purchases" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "practice_id" integer NOT NULL,
  "purchase_date" timestamp DEFAULT (now()),
  "status" varchar,
  "payment_id" integer,
  "referral_code_id" integer,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "practice_progress" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "practice_id" integer NOT NULL,
  "material_id" integer NOT NULL,
  "is_completed" boolean DEFAULT false,
  "last_accessed" timestamp,
  "time_spent_seconds" integer DEFAULT 0,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "practice_reviews" (
  "id" integer PRIMARY KEY,
  "user_id" integer NOT NULL,
  "practice_id" integer NOT NULL,
  "rating" integer NOT NULL,
  "comment" text,
  "submitted_date" timestamp DEFAULT (now()),
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

CREATE TABLE "certificates" (
  "id" integer PRIMARY KEY,
  "mentee_id" integer NOT NULL,
  "service_id" integer NOT NULL,
  "certificate_number" varchar UNIQUE NOT NULL,
  "issue_date" timestamp DEFAULT (now()),
  "certificate_path" varchar,
  "projects_data" json,
  "status" varchar,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp
);

COMMENT ON COLUMN "mentoring_services"."service_type" IS 'one-on-one, group, bootcamp, shortclass, live class';

COMMENT ON COLUMN "mentoring_sessions"."status" IS 'scheduled, ongoing, completed, cancelled';

COMMENT ON COLUMN "bookings"."status" IS 'pending, confirmed, cancelled, completed';

COMMENT ON COLUMN "payments"."payment_method" IS 'bank_transfer, virtual_account, qris';

COMMENT ON COLUMN "payments"."status" IS 'pending, completed, failed, refunded';

COMMENT ON COLUMN "practices"."practice_type" IS 'Data Analyst, Data Scientist, Machine Learning Engineer, NLP Specialist, Other';

COMMENT ON COLUMN "practice_files"."file_type" IS 'pptx, pdf, word, ipynb, video, etc';

COMMENT ON COLUMN "practice_purchases"."status" IS 'pending, completed, cancelled, refunded';

COMMENT ON COLUMN "certificates"."projects_data" IS 'JSON data containing project details and scores for bootcamp certificates';

COMMENT ON COLUMN "certificates"."status" IS 'generated, sent, viewed';

ALTER TABLE "user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "mentor_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "mentoring_services" ADD FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles" ("id");

ALTER TABLE "mentoring_sessions" ADD FOREIGN KEY ("service_id") REFERENCES "mentoring_services" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("mentee_id") REFERENCES "users" ("id");

ALTER TABLE "bookings" ADD FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions" ("id");

ALTER TABLE "payments" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id");

ALTER TABLE "referral_codes" ADD FOREIGN KEY ("owner_id") REFERENCES "users" ("id");

ALTER TABLE "feedback" ADD FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions" ("id");

ALTER TABLE "feedback" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("mentee_id") REFERENCES "users" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("session_id") REFERENCES "mentoring_sessions" ("id");

ALTER TABLE "notifications" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_behavior" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "mentoring_sessions" ADD FOREIGN KEY ("meeting_link") REFERENCES "mentoring_sessions" ("status");

ALTER TABLE "practices" ADD FOREIGN KEY ("mentor_id") REFERENCES "mentor_profiles" ("id");

ALTER TABLE "practice_materials" ADD FOREIGN KEY ("practice_id") REFERENCES "practices" ("id");

ALTER TABLE "practice_files" ADD FOREIGN KEY ("material_id") REFERENCES "practice_materials" ("id");

ALTER TABLE "practice_purchases" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "practice_purchases" ADD FOREIGN KEY ("practice_id") REFERENCES "practices" ("id");

ALTER TABLE "practice_purchases" ADD FOREIGN KEY ("payment_id") REFERENCES "payments" ("id");

ALTER TABLE "practice_purchases" ADD FOREIGN KEY ("referral_code_id") REFERENCES "referral_codes" ("id");

ALTER TABLE "practice_progress" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "practice_progress" ADD FOREIGN KEY ("practice_id") REFERENCES "practices" ("id");

ALTER TABLE "practice_progress" ADD FOREIGN KEY ("material_id") REFERENCES "practice_materials" ("id");

ALTER TABLE "practice_reviews" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "practice_reviews" ADD FOREIGN KEY ("practice_id") REFERENCES "practices" ("id");

ALTER TABLE "certificates" ADD FOREIGN KEY ("mentee_id") REFERENCES "users" ("id");

ALTER TABLE "certificates" ADD FOREIGN KEY ("service_id") REFERENCES "mentoring_services" ("id");
