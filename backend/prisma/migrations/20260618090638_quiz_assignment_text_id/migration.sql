-- Migration: ganti subBabId → textId pada quiz & assignment

-- 1. Tambah kolom text_id
ALTER TABLE e_learning_quizzes     ADD COLUMN text_id TEXT;
ALTER TABLE e_learning_assignments ADD COLUMN text_id TEXT;

-- 2. Isi text_id: ambil text pertama dari subBab yang sama
--    Catatan: kolom orderNumber di e_learning_texts tidak pakai @map jadi nama di DB = "orderNumber" (camelCase)
UPDATE e_learning_quizzes q
SET    text_id = (
  SELECT t.id
  FROM   e_learning_texts t
  WHERE  t.sub_bab_id = q.sub_bab_id
  ORDER  BY t."orderNumber" ASC NULLS LAST, t."createdAt" ASC
  LIMIT  1
)
WHERE  text_id IS NULL;

UPDATE e_learning_assignments a
SET    text_id = (
  SELECT t.id
  FROM   e_learning_texts t
  WHERE  t.sub_bab_id = a.sub_bab_id
  ORDER  BY t."orderNumber" ASC NULLS LAST, t."createdAt" ASC
  LIMIT  1
)
WHERE  text_id IS NULL;

-- 3. Hapus row yang tidak bisa di-resolve (subBab tanpa text)
DELETE FROM e_learning_quizzes     WHERE text_id IS NULL;
DELETE FROM e_learning_assignments WHERE text_id IS NULL;

-- 4. Set NOT NULL + unique
ALTER TABLE e_learning_quizzes     ALTER COLUMN text_id SET NOT NULL;
ALTER TABLE e_learning_assignments ALTER COLUMN text_id SET NOT NULL;

ALTER TABLE e_learning_quizzes
  ADD CONSTRAINT e_learning_quizzes_text_id_key UNIQUE (text_id);

ALTER TABLE e_learning_assignments
  ADD CONSTRAINT e_learning_assignments_text_id_key UNIQUE (text_id);

-- 5. Tambah FK
ALTER TABLE e_learning_quizzes
  ADD CONSTRAINT e_learning_quizzes_text_id_fkey
  FOREIGN KEY (text_id) REFERENCES e_learning_texts(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE e_learning_assignments
  ADD CONSTRAINT e_learning_assignments_text_id_fkey
  FOREIGN KEY (text_id) REFERENCES e_learning_texts(id) ON DELETE CASCADE;

-- 6. Drop kolom sub_bab_id lama beserta constraint-nya
ALTER TABLE e_learning_quizzes     DROP CONSTRAINT IF EXISTS e_learning_quizzes_sub_bab_id_key;
ALTER TABLE e_learning_quizzes     DROP CONSTRAINT IF EXISTS e_learning_quizzes_sub_bab_id_fkey;
ALTER TABLE e_learning_quizzes     DROP COLUMN IF EXISTS sub_bab_id;

ALTER TABLE e_learning_assignments DROP CONSTRAINT IF EXISTS e_learning_assignments_sub_bab_id_key;
ALTER TABLE e_learning_assignments DROP CONSTRAINT IF EXISTS e_learning_assignments_sub_bab_id_fkey;
ALTER TABLE e_learning_assignments DROP COLUMN IF EXISTS sub_bab_id;