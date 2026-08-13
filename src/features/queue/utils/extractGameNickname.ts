import type {QueueGameConfig} from "../../queue-settings/types.ts";

interface ExtractGameNicknameArgs {
    /** Полный текст сообщения из чата */
    rawMessage: string;
    /** Текущие настройки игры и регулярного выражения */
    gameConfig?: QueueGameConfig;
}

/**
 * Сканирует сообщение и извлекает первый попавшийся никнейм,
 * который строго соответствует регулярному выражению игры.
 *
 * @returns {string | null} Найденный никнейм или null
 */
export const extractGameNickname = ({
                                        rawMessage,
                                        gameConfig
                                    }: ExtractGameNicknameArgs): string | null => {
    if (!gameConfig?.validationPattern) {
        return null;
    }

    const trimmed = rawMessage.trim();
    // Разбиваем строку по пробелам на массив отдельных слов/фрагментов
    const textParts = trimmed.split(/\s+/);

    // Если в сообщении только одно слово (команда), искать нечего
    if (textParts.length <= 1) {
        return null;
    }

    // Убираем первое слово (саму команду, например "!join")
    const wordsToScan = textParts.slice(1);

    try {
        const regex = new RegExp(gameConfig.validationPattern);

        // Перебираем каждое слово по отдельности в поисках совпадения с паттерном
        for (const word of wordsToScan) {
            if (regex.test(word)) {
                return word;
            }
        }
    } catch (e) {
        console.error("Ошибка в регулярном выражении игры:", e);
    }

    // Если ни одно слово в сообщении не подошло под паттерн игры
    return null;
};
