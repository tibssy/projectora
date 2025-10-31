export type PremadeBackground = {
    id: string;
    name: string;
    url: string;
    theme: "Halloween" | "Christmas" | "Nature" | "Generic";
};

export const PREMADE_BACKGROUNDS: PremadeBackground[] = [
    {
        id: "haunted_forest",
        name: "Haunted Forest",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869900/halloween_background_portrait03_tn0fau.svg",
        theme: "Halloween",
    },
    {
        id: "pumpkin_patch",
        name: "Pumpkin Patch",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869899/halloween_background_portrait02_j18uwx.svg",
        theme: "Halloween",
    },
    {
        id: "misty_graveyard",
        name: "Misty Graveyard",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869900/halloween_background_portrait04_nlpokh.svg",
        theme: "Halloween",
    },
    {
        id: "cobweb_corner",
        name: "Cobweb Corner",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869898/halloween_background_portrait01_qpclaz.svg",
        theme: "Halloween",
    },
    {
        id: "starry_night",
        name: "Starry Night",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869897/halloween_background_landscape01_gwgkxe.svg",
        theme: "Halloween",
    },
    {
        id: "moonlit_clearing",
        name: "Moonlit Clearing",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869898/halloween_background_landscape05_l0dmxa.svg",
        theme: "Halloween",
    },
    {
        id: "spooky_forest",
        name: "Spooky Forest",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869898/halloween_background_landscape04_ahnlvw.svg",
        theme: "Halloween",
    },
    {
        id: "night_sky",
        name: "Night Sky",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869897/halloween_background_landscape03_drba2v.svg",
        theme: "Halloween",
    },
    {
        id: "haunted_graveyard",
        name: "Haunted Graveyard",
        url: "https://res.cloudinary.com/dls8hlthp/image/upload/v1761869897/halloween_background_landscape02_hfrgwj.svg",
        theme: "Halloween",
    },
];
