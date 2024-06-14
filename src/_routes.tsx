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
import IncomingCreatorsView from '@/pages/creators/incoming';

import LooksView from '@/pages/looks';
import LooksManagementView from '@/pages/looks/management';

import ProductsView from '@/pages/products';

import BrandsView from '@/pages/brands';

import MusicView from '@/pages/music';

import LocationView from './pages/locations';

import EarningsView from '@/pages/earnings';

import SettingsViewGeneral from '@/pages/settings/general';
import SettingsViewCreatorAffiliateLinks from '@/pages/settings/creator-affiliate-links';

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
                    <Route path="/creators/incoming" element={<IncomingCreatorsView />} />

                    <Route path="/looks" element={<LooksView />} />
                    <Route path="/looks/management" element={<LooksManagementView />} />

                    <Route path="/brands" element={<BrandsView />} />
                    <Route path="/brands/management" element={<BrandsView />} />

                    <Route path="/products" element={<ProductsView />} />
                    <Route path="/products/management" element={<ProductsView />} />

                    <Route path="/musics" element={<MusicView />} />

                    <Route path="/locations" element={<LocationView />} />

                    <Route path="/earnings" element={<EarningsView />} />

                    <Route path="/settings" element={<SettingsViewGeneral />} />
                    <Route path="/settings/creator-affiliate-links" element={<SettingsViewCreatorAffiliateLinks />} />

                    {/* Error Pages */}
                    <Route path="*" element={<FourOhFour />} />
                </RoutesList>
            </AppLayout>
        </AuthProvider>
    )
}