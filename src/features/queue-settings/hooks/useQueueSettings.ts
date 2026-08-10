import {useContext} from 'react';
import {QueueSettingsContext} from "../context/QueueSettingsInstance.ts";

export const useQueueSettings = () => {
    const context = useContext(QueueSettingsContext);
    if (!context) {
        throw new Error('useQueueSettings должен использоваться строго внутри QueueSettingsProvider');
    }
    return context;
};
