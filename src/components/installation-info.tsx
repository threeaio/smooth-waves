import { GitHubIcon } from './logos/github-icon';
import { NpmIcon } from './logos/npm-icon';
import { CardEmphased } from './card-emphased';
import { Pill } from './pill';
import { CopyButton } from './copy-button';

interface InstallationInfoProps {
    className?: string;
}

export const InstallationInfo = ({ className }: InstallationInfoProps) => {
    const installCommand = 'npm install @threeaio/smooth-waves';

    return (
        <CardEmphased className={className}>
            <div className="flex flex-col md:flex-row items-center  justify-between gap-8">
                <div className="flex items-baseline gap-4 flex-col sm:flex-row">
                    <div className="relative">
                        <code className="font-mono text-xs md:text-base text-white-washed py-2 px-4 rounded-full sm:bg-black-washed/60 border border-ui-border md:pr-10">
                            npm install <span className="text-3a-green">@threeaio/smooth-waves</span>
                        </code>
                        <CopyButton
                            textToCopy={installCommand}
                            className="absolute hidden md:block right-3 top-1/2 -translate-y-1/2 text-white-washed hover:text-3a-green transition-colors"
                        />
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-1 justify-center md:justify-start">
                        <Pill>v0.1.3</Pill>
                        <Pill variant="warning">alpha</Pill>
                    </div>
                </div>
                <div className="flex items-center gap-4 xl:gap-8 md:pr-4 justify-center ">
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
