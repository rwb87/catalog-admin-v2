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