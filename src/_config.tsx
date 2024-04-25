export const Config = {
    APP_NAME: "StyleUp Admin",
}

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    CREATOR: 'creator',
    SHOPPER: 'shopper',
    DATA_MANAGER: 'data_manager',
}
export type ROLES = typeof ROLES[keyof typeof ROLES];