import { tutoraInfo } from "@/lib/config";
import Link from "next/link";
import { Button } from "./ui/button";
import { DynamicIcon } from 'lucide-react/dynamic';



function Footer() {
    return (
        <footer className="p-5 border-t-2">
            <div className="w-full px-4 md:px-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                <div className="flex items-center justify-center md:justify-start gap-3">
                    <Button asChild variant="link" className="dark:text-gray-200 text-gray-600 text-sm md:text-base">
                        <Link href="/">
                            {tutoraInfo.name}
                        </Link>
                    </Button>

                    <Link
                        href={tutoraInfo.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Check source code here"
                        className="hover:text-black dark:hover:text-white text-gray-400 transition-colors"
                    >
                        <DynamicIcon name="github" size={20} />
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-right">

                    <Button asChild variant="link" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Link href={tutoraInfo.policies.termsOfUse}>Terms of Use</Link>
                    </Button>

                    <Button asChild variant="link" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Link href={tutoraInfo.policies.privacy}>Privacy Policy</Link>
                    </Button>

                </div>
            </div>
        </footer>
    );
}

export default Footer;


