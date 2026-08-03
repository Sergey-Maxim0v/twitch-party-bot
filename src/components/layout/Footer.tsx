import {type FC} from 'react';
import {LuCopyright} from "react-icons/lu";

export const Footer: FC = () => {
    return (
        <footer className="footer footer-center p-4 bg-base-200 text-base-content border-t border-base-300">
            <aside>
                <p className="text-xs opacity-70 flex items-center gap-1 whitespace-nowrap">
                    <a className="text-primary  flex items-center gap-1"
                       href="https://github.com/Sergey-Maxim0v"
                       target="_blank"
                    >
                        <span>
                            <LuCopyright/>
                        </span>
                        Sergey-Maxim0v
                    </a>

                    <span> {new Date().getFullYear()}</span>
                </p>
            </aside>
        </footer>
    );
};
