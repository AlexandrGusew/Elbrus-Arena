-- CreateTable
CREATE TABLE IF NOT EXISTS "friendships" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "friendships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "friendships_characterId_friendId_key" ON "friendships"("characterId", "friendId");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
