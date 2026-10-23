"use client";

import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useIntro, hasSeenIntro, markIntroSeen } from "@/context/IntroContext";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { SplitEntry } from "@/components/home";
import { GlobalFooter } from "@/components/navigation";
import { EntryLoader } from "@/components/intro";
import { HeroBackgroundsQueryResult } from "@/sanity/lib/queries";

interface HomeClientProps {
    heroBackgrounds?: HeroBackgroundsQueryResult;
    /** Below-the-fold sections, streamed separately so they never hold up the hero */
    children?: ReactNode;
}

export function HomeClient({ heroBackgrounds, children }: HomeClientProps) {
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(true); // Enable intro loader with animations
    const { setIntroActive } = useIntro();

    // Play the intro once per session. The header waits while it runs.
    useEffect(() => {
        if (hasSeenIntro()) {
            setShowLoader(false);
            setIntroActive(false);
        } else {
            setIntroActive(true);
        }
    }, [setIntroActive]);
    

    const handleNavigate = (path: string) => {
        if (path === 'home') {
            router.push('/');
        } else if (path === 'atlas') {
            router.push('/atlas');
        } else if (path === 'relic') {
            router.push('/relic');
        } else if (path === 'quiz') {
            router.push('/quiz');
        } else if (path === 'gift') {
            router.push('/gift');
        } else {
            router.push(`/${path}`);
        }
    };

    const handleLoaderComplete = useCallback(() => {
        setShowLoader(false);
        setIntroActive(false);
        markIntroSeen();
    }, [setIntroActive]);

    return (
        <>
            {/* Cinematic Entry Loader */}
            <AnimatePresence mode="wait">
                {showLoader && (
                    <EntryLoader onComplete={handleLoaderComplete} />
                )}
            </AnimatePresence>

            {/* Main Content. Painted beneath the intro overlay rather than held at
                opacity 0, so the hero images load and decode while the intro plays
                and are already in place when it lifts. */}
            <div
                className={`w-full bg-theme-alabaster selection:bg-theme-industrial/30 overflow-x-hidden ${showLoader ? 'pointer-events-none' : ''}`}
            >
                {/* Hero Entry Section */}
                <div className="w-full relative h-[calc(100svh-var(--site-header-h,0px))] min-h-[560px]">
                    <SplitEntry onNavigate={handleNavigate} heroBackgrounds={heroBackgrounds} />
                </div>

                {/* Collection, invitations and community map, streamed in after the hero */}
                {children}

                {/* Global Footer */}
                <GlobalFooter theme="dark" />
            </div>
        </>
    );
}
