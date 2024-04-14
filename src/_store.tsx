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
            storage: createJSONStorage(() => sessionStorage),
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

export const useGlobalData = create(
    persist(
        (set) => ({
            brands: null,
            setBrands: (brands: any) => set({
                brands: brands,
            }),
        }),
        {
            name: `${Config.APP_NAME?.toLowerCase()?.replaceAll(' ', '_')}.global`,
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)