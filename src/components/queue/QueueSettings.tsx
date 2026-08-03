export interface QueueSettingsProps {
    className?: string;
}

const QueueSettings = ({className = ""}: QueueSettingsProps) => {

    return (
        <div className={className}>
            QueueSettings
        </div>
    )
}

export default QueueSettings;
