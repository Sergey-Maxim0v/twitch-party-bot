import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="footer footer-center p-4 bg-base-200 text-base-content border-t border-base-300">
            <aside>
                <p className="text-xs opacity-70">
                    <a className="text-primary"
                       href="https://github.com/Sergey-Maxim0v"
                       target="_blank"
                    >
                        © Sergey-Maxim0v
                    </a>

                    <span> {new Date().getFullYear()}</span>
                </p>
            </aside>
        </footer>
    );
};
