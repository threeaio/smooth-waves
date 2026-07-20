'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NsLogo } from '@/components/logos/ns-logo';
import { cn } from '@/lib/utils';

export function NavBarLight() {
    const pathname = usePathname();

    // The playground is a full editor with its own chrome — the site nav would
    // pollute the page preview there (it has its own exit link instead).
    if (pathname === '/playground') return null;

    const links = [
        { href: '/', label: 'H' },
        { href: '/example-1', label: 'E.1' },
        { href: '/example-2', label: 'E.2' },
        { href: '/example-4', label: 'E.3' },
        { href: '/playground', label: 'LAB' },
    ];

    // On some pages the nav blends against the background (its color inverts as
    // you scroll). On the bright E.3 page that reads as noise, so keep it solid white.
    const white = pathname === '/' || pathname === '/example-4' || pathname === '/playground';
    const dark = pathname === '/example-1';
    const needsContrast = pathname === '/example-2';

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 bg-linear-gradient bg-gradient-to-t from-ui-gradient-bottom/90 to-ui-gradient-top/100 backdrop-blur-sm md:backdrop-blur-none md:bg-none overflow-hidden',
                needsContrast && 'md:mix-blend-difference md:opacity-80',
                white && 'md:text-white-washed',
                dark && 'md:text-black-washed md:opacity-80',
            )}
        >
            {/* bg-linear-gradient bg-gradient-to-t from-black-washed/70  to-black-washed/100 */}
            <div
                className="absolute right-0 -bottom-1/2 w-full h-full opacity-20 md:hidden"
                style={{
                    background: 'radial-gradient(ellipse at center, #414795 0%, transparent 70%)',
                }}
            />
            <div className="  ">
                <div className="relative flex items-center justify-between px-4 md:px-16 py-6 md:py-8 ">
                    <Link href="/">
                        <NsLogo className="w-32 h-auto" />
                    </Link>

                    <div className="flex gap-2 sm:gap-4 md:gap-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={` transition-colors text-xs uppercase p-2  ${
                                    pathname === link.href ? 'font-bold' : ''
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}
