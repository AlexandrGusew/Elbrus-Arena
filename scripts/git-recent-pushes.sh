#!/bin/bash
# Скрипт для просмотра истории всех пушей за указанный период
# Использование: ./scripts/git-recent-pushes.sh [часы]
# Пример: ./scripts/git-recent-pushes.sh 3  (за последние 3 часа)

HOURS=${1:-3}  # По умолчанию 3 часа

echo "🔍 История всех пушей за последние $HOURS часов"
echo "================================================"
echo ""

# Обновляем информацию о удаленных ветках
echo "📥 Обновление информации о удаленных ветках..."
git fetch --all --quiet

echo ""
echo "📋 Коммиты за последние $HOURS часов:"
echo ""

# Показываем коммиты с подробной информацией
git log --all --branches --remotes --since="$HOURS hours ago" \
    --pretty=format:"%C(yellow)%h%Creset | %C(green)%an%Creset | %C(blue)%ad%Creset | %C(cyan)%s%Creset | %C(red)%D%Creset" \
    --date=format:"%Y-%m-%d %H:%M:%S" \
    --decorate

COMMIT_COUNT=$(git log --all --branches --remotes --since="$HOURS hours ago" --oneline | wc -l | tr -d ' ')

echo ""
echo "================================================"
echo "📊 Всего коммитов: $COMMIT_COUNT"
echo ""

# Показываем статистику по авторам
if [ "$COMMIT_COUNT" -gt 0 ]; then
    echo "👥 Статистика по авторам:"
    git log --all --branches --remotes --since="$HOURS hours ago" \
        --pretty=format:"%an" | sort | uniq -c | sort -rn | \
        awk '{printf "   %s: %d коммитов\n", $2, $1}'
    
    echo ""
    echo "🌿 Ветки с изменениями:"
    git log --all --branches --remotes --since="$HOURS hours ago" \
        --pretty=format:"%D" | grep -oE 'origin/[^,)]+' | sort -u | \
        sed 's/^origin\///' | awk '{printf "   - %s\n", $1}'
fi

echo ""
echo "💡 Полезные команды:"
echo "   git log --all --since=\"$HOURS hours ago\" --oneline"
echo "   git log --all --since=\"$HOURS hours ago\" --graph --decorate"
echo "   git reflog --all --since=\"$HOURS hours ago\""


