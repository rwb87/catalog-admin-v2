import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Config } from '@/_config';

// User store
export const useUser = create(
    persist(
        (set) => ({
            token: null,
            user: null,
            userPermissions: null,
            setToken: (token: string) => set({
                token: token,
            }),
            clearToken: () => set({
                token: null,
                user: null,
                userPermissions: null,
            }),
            setUser: (user: object) => set({
                user: user,
            }),
            setUserPermissions: (permissions: object) => set({
                userPermissions: permissions,
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