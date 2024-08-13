export const Config = {
    APP_NAME: "Catalog",
}

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    CREATOR: 'creator',
    SHOPPER: 'shopper',
    DATA_MANAGER: 'data_manager',
}
export type ROLES = typeof ROLES[keyof typeof ROLES];

export const PRODUCT_LINK_TYPES = {
    AFFILIATE: 'AFFILIATE',
    BASIC: 'BASIC',
    CREATOR_AFFILIATE: 'CREATOR-AFFILIATE',
}
export type PRODUCT_LINK_TYPES = typeof PRODUCT_LINK_TYPES[keyof typeof PRODUCT_LINK_TYPES];

export const LOOK_STATUSES = {
    LIVE: 'live',
    IN_EDIT: 'in_edit',
    ARCHIVED: 'archived',
    DENIED: 'denied',
    SUBMITTED_FOR_APPROVAL: 'submitted_for_approval',
    IN_ADMIN: 'in_admin',
    IN_DATA_MANAGEMENT: 'in_data_management',
}
export type LOOK_STATUSES = typeof LOOK_STATUSES[keyof typeof LOOK_STATUSES];

export const MUSIC_PROVIDERS = {
    SPOTIFY: {
        name: 'Spotify',
        logo: '/icons/icon-spotify.webp',
    },
    APPLE_MUSIC: {
        name: 'Apple Music',
        logo: '/icons/icon-apple.webp',
    },
    CUSTOM: {
        name: 'Custom',
        logo: null,
    },
}
export type MUSIC_PROVIDERS = typeof MUSIC_PROVIDERS[keyof typeof MUSIC_PROVIDERS];

export const PRODUCT_REVIEW_OPTIONS = [
    {
        label: 'Correct link, correct information',
        value: 'correct',
    }, {
        label: 'Correct link but incorrect information. Updated',
        value: 'updated',
    }, {
        label: 'Incorrect link, does not match product',
        value: 'incorrect',
    }, {
        label: 'Need further review',
        value: 'need_further_review',
    },
]
export type PRODUCT_REVIEW_OPTIONS = typeof PRODUCT_REVIEW_OPTIONS[keyof typeof PRODUCT_REVIEW_OPTIONS];