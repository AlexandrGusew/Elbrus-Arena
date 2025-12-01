-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('weapon', 'helmet', 'armor', 'belt', 'legs', 'accessory', 'potion', 'shield', 'offhand');

-- CreateEnum
CREATE TYPE "CharacterClass" AS ENUM ('WARRIOR', 'ROGUE', 'MAGE');

-- CreateEnum
CREATE TYPE "SpecializationBranch" AS ENUM ('PALADIN', 'BARBARIAN', 'SHADOW_DANCER', 'POISONER', 'FROST_MAGE', 'WARLOCK');

-- CreateEnum
CREATE TYPE "ChatRoomType" AS ENUM ('GLOBAL', 'PRIVATE', 'BATTLE', 'PARTY');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT,
    "username" TEXT,
    "firstName" TEXT,
    "email" TEXT,
    "password" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "verificationCodeExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 0,
    "agility" INTEGER NOT NULL DEFAULT 0,
    "intelligence" INTEGER NOT NULL DEFAULT 0,
    "freePoints" INTEGER NOT NULL DEFAULT 0,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "currentHp" INTEGER NOT NULL DEFAULT 100,
    "armor" INTEGER NOT NULL DEFAULT 10,
    "gold" INTEGER NOT NULL DEFAULT 100,
    "stamina" INTEGER NOT NULL DEFAULT 100,
    "lastStaminaUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "superPoints" INTEGER NOT NULL DEFAULT 0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monsters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "damage" INTEGER NOT NULL,
    "armor" INTEGER NOT NULL,
    "isBoss" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "monsters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dungeons" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "staminaCost" INTEGER NOT NULL DEFAULT 20,
    "expReward" INTEGER NOT NULL,
    "goldReward" INTEGER NOT NULL,

    CONSTRAINT "dungeons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dungeon_monsters" (
    "id" SERIAL NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "dungeon_monsters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "damage" INTEGER NOT NULL DEFAULT 0,
    "armor" INTEGER NOT NULL DEFAULT 0,
    "bonusStr" INTEGER NOT NULL DEFAULT 0,
    "bonusAgi" INTEGER NOT NULL DEFAULT 0,
    "bonusInt" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "minStrength" INTEGER NOT NULL DEFAULT 0,
    "minAgility" INTEGER NOT NULL DEFAULT 0,
    "minIntelligence" INTEGER NOT NULL DEFAULT 0,
    "minLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" SERIAL NOT NULL,
    "inventoryId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "enhancement" INTEGER NOT NULL DEFAULT 0,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pvp_battles" (
    "id" TEXT NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "status" TEXT NOT NULL,
    "ratingChange" INTEGER NOT NULL DEFAULT 0,
    "rounds" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pvp_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pve_battles" (
    "id" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "dungeonId" INTEGER NOT NULL,
    "currentMonster" INTEGER NOT NULL DEFAULT 1,
    "characterHp" INTEGER NOT NULL,
    "monsterHp" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "rounds" JSONB NOT NULL,
    "playerFirst" BOOLEAN NOT NULL DEFAULT true,
    "lootedItems" JSONB,
    "expGained" INTEGER,
    "goldGained" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pve_battles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monster_loots" (
    "id" SERIAL NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "dropChance" DOUBLE PRECISION NOT NULL,
    "minCount" INTEGER NOT NULL DEFAULT 1,
    "maxCount" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "monster_loots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "branch" "SpecializationBranch" NOT NULL,
    "tier1Unlocked" BOOLEAN NOT NULL DEFAULT true,
    "tier2Unlocked" BOOLEAN NOT NULL DEFAULT false,
    "tier3Unlocked" BOOLEAN NOT NULL DEFAULT false,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialization_abilities" (
    "id" SERIAL NOT NULL,
    "branch" "SpecializationBranch" NOT NULL,
    "tier" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cooldown" INTEGER NOT NULL DEFAULT 0,
    "effects" JSONB NOT NULL,

    CONSTRAINT "specialization_abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ability_cooldowns" (
    "id" SERIAL NOT NULL,
    "battleId" TEXT NOT NULL,
    "abilityId" INTEGER NOT NULL,
    "turnsLeft" INTEGER NOT NULL,

    CONSTRAINT "ability_cooldowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" TEXT NOT NULL,
    "type" "ChatRoomType" NOT NULL,
    "name" TEXT,
    "battleId" TEXT,
    "partyId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "mentionedIds" JSONB,
    "isCommand" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_participants" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_invitations" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" SERIAL NOT NULL,
    "blockerId" INTEGER NOT NULL,
    "blockedId" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message_logs" (
    "id" SERIAL NOT NULL,
    "characterId" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 1,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "characters_userId_key" ON "characters"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "characters_name_key" ON "characters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_characterId_key" ON "inventories"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_characterId_key" ON "specializations"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "specialization_abilities_branch_tier_key" ON "specialization_abilities"("branch", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "ability_cooldowns_battleId_abilityId_key" ON "ability_cooldowns"("battleId", "abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_battleId_key" ON "chat_rooms"("battleId");

-- CreateIndex
CREATE INDEX "chat_messages_roomId_createdAt_idx" ON "chat_messages"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_expiresAt_idx" ON "chat_messages"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participants_roomId_characterId_key" ON "chat_participants"("roomId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_invitations_senderId_receiverId_status_key" ON "chat_invitations"("senderId", "receiverId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_blockerId_blockedId_key" ON "blocked_users"("blockerId", "blockedId");

-- CreateIndex
CREATE INDEX "chat_message_logs_characterId_lastMessageAt_idx" ON "chat_message_logs"("characterId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_logs_characterId_roomId_key" ON "chat_message_logs"("characterId", "roomId");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dungeon_monsters" ADD CONSTRAINT "dungeon_monsters_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "dungeons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dungeon_monsters" ADD CONSTRAINT "dungeon_monsters_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "monsters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pvp_battles" ADD CONSTRAINT "pvp_battles_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pvp_battles" ADD CONSTRAINT "pvp_battles_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pve_battles" ADD CONSTRAINT "pve_battles_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pve_battles" ADD CONSTRAINT "pve_battles_dungeonId_fkey" FOREIGN KEY ("dungeonId") REFERENCES "dungeons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_loots" ADD CONSTRAINT "monster_loots_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "monsters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monster_loots" ADD CONSTRAINT "monster_loots_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ability_cooldowns" ADD CONSTRAINT "ability_cooldowns_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "pve_battles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_participants" ADD CONSTRAINT "chat_participants_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_invitations" ADD CONSTRAINT "chat_invitations_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_invitations" ADD CONSTRAINT "chat_invitations_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_users" ADD CONSTRAINT "blocked_users_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "characters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
