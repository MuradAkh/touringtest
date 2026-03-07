import React from "react";
import twemoji from 'twemoji'


export function ps(horizontal: any, vertical: any) {
    // if window undefined, return vertical
    if (typeof window === 'undefined') return vertical;
    return window.innerWidth / window.innerHeight > 0.8 ? horizontal : vertical;
}

const regionNames = new Intl.DisplayNames(
    ['en'], {type: 'region'}
);

export const Twemoji = ({emoji} : any) => (
    <span
        className="twemoji-emoji"
        dangerouslySetInnerHTML={{
            __html: twemoji.parse(emoji, {
                folder: 'svg',
                ext: '.svg'
            }) as any
        }}
    />
)

export function getDisplayString(option: string, gameType: string, fancy: boolean = false) {
    const gameClass = gameType.split('_')[0];
    if (gameClass === 'geo') {
        const [city, iso2] = option.split(':::');
        const flagEmoji = String.fromCodePoint(...[...iso2 as any].map(char => char.charCodeAt(0) + 127397))
        const country = regionNames.of(iso2);
        if (!fancy) {
            return `${city}, ${country} ${flagEmoji}`
        }
        return <span>{city}, {country} <Twemoji emoji={flagEmoji}/></span>
    } else {
        return option
    }
}