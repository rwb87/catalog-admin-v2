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