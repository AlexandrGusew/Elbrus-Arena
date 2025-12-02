-- Миграция для удаления unique constraint с userId в таблице characters
-- и добавления обычного индекса

-- Удаляем unique constraint с userId (если он существует как unique index)
DROP INDEX IF EXISTS "characters_userId_key";

-- Добавляем обычный индекс на userId (если его еще нет)
CREATE INDEX IF NOT EXISTS "characters_userId_idx" ON "characters"("userId");

