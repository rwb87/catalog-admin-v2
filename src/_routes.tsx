import { Route, Routes as RoutesList } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';

// Pages
import Index from '@/pages/index';
import FourOhFour from '@/pages/404';

// Auth Pages
import Login from '@/pages/auth/login';

// App Pages
import AppLayout from '@/layouts/app.layout';

import AdminsView from '@/pages/admins';
import ShoppersView from '@/pages/shoppers';
import CreatorsView from '@/pages/creators';

import LooksView from '@/pages/looks';
import LooksManagementView from '@/pages/looks/management';

import ProductsView from '@/pages/products';

import BrandsView from '@/pages/brands';

import MusicView from '@/pages/music';

import EarningsView from '@/pages/earnings';
import SettingsView from '@/pages/settings';

export default function Routes() {
    return(
        <AuthProvider>
            <AppLayout>
                <RoutesList>

                    {/* Redirect to /looks when visited home */}
                    <Route path="/" element={<Index />} />

                    {/* Auth Pages */}
                    <Route path="/login" element={<Login />} />

                    {/* App Pages */}
                    <Route path="/administrators" element={<AdminsView />} />
                    <Route path="/shoppers" element={<ShoppersView />} />
                    <Route path="/creators" element={<CreatorsView />} />

                    <Route path="/looks" element={<LooksView />} />
                    <Route path="/looks/management" element={<LooksManagementView />} />

                    <Route path="/brands" element={<BrandsView />} />
                    <Route path="/brands/management" element={<BrandsView />} />

                    <Route path="/products" element={<ProductsView />} />
                    <Route path="/products/management" element={<ProductsView />} />

                    <Route path="/music" element={<MusicView />} />

                    <Route path="/earnings" element={<EarningsView />} />

                    <Route path="/settings" element={<SettingsView />} />

                    {/* Error Pages */}
                    <Route path="*" element={<FourOhFour />} />
                </RoutesList>
            </AppLayout>
        </AuthProvider>
    )
}