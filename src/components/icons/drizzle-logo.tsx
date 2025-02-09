import { LogoProps } from '@/components/icons/logo.interface';

export const DrizzleLogo = ({ className }: LogoProps) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" className={className}>
            <title>Drizzle</title>
            <desc>Drizzle ORM Logo</desc>
            <rect
                width="9.631"
                height="40.852"
                fill="currentColor"
                rx="4.816"
                transform="matrix(.87303 .48767 -.49721 .86763 43.48 67.304)"
            />
            <rect
                width="9.631"
                height="40.852"
                fill="currentColor"
                rx="4.816"
                transform="matrix(.87303 .48767 -.49721 .86763 76.94 46.534)"
            />
            <rect
                width="9.631"
                height="40.852"
                fill="currentColor"
                rx="4.816"
                transform="matrix(.87303 .48767 -.49721 .86763 128.424 46.535)"
            />
            <rect
                width="9.631"
                height="40.852"
                fill="currentColor"
                rx="4.816"
                transform="matrix(.87303 .48767 -.49721 .86763 94.957 67.304)"
            />
        </svg>
    );
};
