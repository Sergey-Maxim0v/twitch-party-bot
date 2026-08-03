export interface QueueLogsProps {
    className?: string;
}

const QueueLogs = ({className = ""}: QueueLogsProps) => {

    return (
        <div className={className}>
            QueueLogs
        </div>
    )
}

export default QueueLogs;
