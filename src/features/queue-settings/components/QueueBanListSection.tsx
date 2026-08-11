import type {FC} from "react";
import {useQueueSettings} from '../hooks/useQueueSettings';
import {LuPlus, LuTrash2} from 'react-icons/lu';

interface QueueBanListSectionProps {
    titleClassName?: string;
    className?: string;
}

export const QueueBanListSection: FC<QueueBanListSectionProps> = ({
                                                                      titleClassName = '',
                                                                      className = '',
                                                                  }) => {
    const {settings, updateSettings} = useQueueSettings();
    const banList = settings.banList || [];

    // Добавление новой пустой строки в конец списка
    const handleAddRow = () => {
        updateSettings({banList: [...banList, ''],});
    };

    // Изменение конкретного индекса в массиве
    const handleInputChange = (index: number, value: string) => {
        const updatedList = [...banList];
        updatedList[index] = value.trim();
        updateSettings({banList: updatedList});
    };

    // Удаление строки по её индексу
    const handleRemoveRow = (index: number) => {
        const updatedList = banList.filter((_, i) => i !== index);
        updateSettings({banList: updatedList});
    };

    return (
        <div className={`w-full min-w-0 space-y-3 ${className}`}>
            <h3 className={titleClassName}>Банлист очереди</h3>

            <div className="p-3 rounded-xl bg-base-200/40 border border-base-300 space-y-2 w-full min-w-0">
                {banList.length === 0 ? (
                    <p className="text-xs text-base-content/40 text-center py-2">
                        Игнор-лист пуст.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {banList.map((username, index) => (
                            <div key={index} className="flex items-center gap-2 w-full min-w-0">
                                <input
                                    type="text"
                                    placeholder="Никнейм на Twitch"
                                    className="input input-bordered input-sm flex-1 min-w-0 text-sm focus:input-primary focus:outline-none"
                                    value={username}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-square btn-sm btn-error btn-outline shrink-0"
                                    title="Удалить из списка"
                                    onClick={() => handleRemoveRow(index)}
                                >
                                    <LuTrash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Кнопка добавления нового поля */}
                <button
                    type="button"
                    className="btn btn-block btn-sm btn-dashed border-base-300 hover:border-primary gap-1 font-medium mt-2"
                    onClick={handleAddRow}
                >
                    <LuPlus className="w-4 h-4"/>
                    Добавить никнейм
                </button>
            </div>
        </div>
    );
};
