import * as crypto from 'crypto';

/**
 * Валидирует initData от Telegram WebApp
 * Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    // Парсим query string
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return false;
    }

    // Удаляем hash из параметров
    params.delete('hash');

    // Сортируем параметры и создаем data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ из bot token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем hash
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем с полученным hash
    return computedHash === hash;
  } catch (error) {
    console.error('Ошибка валидации Telegram initData:', error);
    return false;
  }
}

/**
 * Извлекает данные пользователя из initData
 */
export function parseTelegramInitData(initData: string): {
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
} | null {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');

    if (!userParam) {
      return null;
    }

    const user = JSON.parse(userParam);

    return {
      telegramId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    };
  } catch (error) {
    console.error('Ошибка парсинга Telegram initData:', error);
    return null;
  }
}