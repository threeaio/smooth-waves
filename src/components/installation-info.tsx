import { GitHubIcon } from './logos/github-icon';
import { NpmIcon } from './logos/npm-icon';
import { CardEmphased } from './card-emphased';
import { Pill } from './pill';

interface InstallationInfoProps {
    className?: string;
}

export const InstallationInfo = ({ className }: InstallationInfoProps) => {
    return (
        <CardEmphased className={className}>
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
                <div className="flex items-baseline gap-4 flex-col sm:flex-row">
                    <code className="font-mono text-white-washed py-2 px-4 rounded-full bg-black-washed border border-ui-border">
                        npm install <span className="text-3a-green">@threeaio/smooth-waves</span>
                    </code>
                    <div className="flex items-center gap-1">
                        <Pill>v0.1.0</Pill>
                        <Pill variant="warning">alpha</Pill>
                    </div>
                </div>
                <div className="flex items-center gap-4 xl:gap-8 pr-4 justify-center ">
                    <a
                        href="https://github.com/threeaio/smooth-waves"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white-washed hover:text-3a-green transition-colors"
                    >
                        <GitHubIcon className={'size-8'} />
                    </a>
                    <a
                        href="https://www.npmjs.com/package/@threeaio/smooth-waves"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white-washed hover:text-3a-green transition-colors"
                    >
                        <NpmIcon className={'size-12'} />
                    </a>
                </div>
            </div>
        </CardEmphased>
    );
};
