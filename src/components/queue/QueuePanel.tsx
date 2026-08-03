export interface QueuePanelProps {
    className?: string;
}

const QueuePanel = ({className = ""}: QueuePanelProps) => {

    return (
        <div className={className}>
            QueuePanel
        </div>
    )
}

export default QueuePanel;
