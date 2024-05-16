import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Config } from '@/_config';

// User store
export const useUser = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            role: null,
            permissions: null,
            setToken: (token: string) => set({
                token: token,
            }),
            clearToken: () => set({
                token: null,
                user: null,
                role: null,
                permissions: null,
            }),
            setUser: (user: any, permissions: any) => set({
                user: user,
                role: user?.type,
                permissions: permissions,
            }),
        }),
        {
            name: `${Config.APP_NAME?.toLowerCase()?.replaceAll(' ', '_')}.auth`,
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export const useUi = create(
    persist(
        (set) => ({
            isSidebarCollapsed: false,
            toggleSidebar: (isSidebarCollapsed: boolean) => set({
                isSidebarCollapsed: !isSidebarCollapsed,
            }),
        }),
        {
            name: `${Config.APP_NAME?.toLowerCase()?.replaceAll(' ', '_')}.ui`,
            storage: createJSONStorage(() => localStorage),
        }
    )
)

export const useGlobalVolatileStorage = create(
    (set) => ({
        brands: [],
        styles: [],
        setBrands: (brands: any) => set({
            brands: brands,
        }),
        setStyles: (styles: any) => set({
            styles: styles,
        }),
    })
)