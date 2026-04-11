-- AlterTable: add new preference columns to UserSettings
ALTER TABLE "UserSettings"
  ADD COLUMN IF NOT EXISTS "currency"         TEXT NOT NULL DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS "theme"            TEXT NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS "text_size"        TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS "auto_mute"        BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "compact_feed"     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "show_captions"    BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "show_like_counts" BOOLEAN NOT NULL DEFAULT true;
