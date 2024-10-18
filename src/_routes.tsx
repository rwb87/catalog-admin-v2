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
import WaitlistView from '@/pages/shoppers/waitlist';

import CreatorsView from '@/pages/creators';
import IncomingCreatorsView from '@/pages/creators/incoming';

import LooksView from '@/pages/looks';
import LooksManagementView from '@/pages/looks/management';

import ProductsView from '@/pages/products';

import BrandsView from '@/pages/brands';
import BrandAdsView from '@/pages/brands/advertisements';
import BrandCampaignsView from '@/pages/brands/campaigns';

import MusicView from '@/pages/music';

import LocationView from './pages/locations';

import EarningsView from '@/pages/earnings';

import SettingsViewGeneral from '@/pages/settings/general';
import SettingsViewCreatorAffiliateLinks from '@/pages/settings/creator-affiliate-links';
import SettingsViewAdSettings from '@/pages/settings/ad-settings';

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
                    <Route path="/shoppers/waitlist" element={<WaitlistView />} />

                    <Route path="/creators" element={<CreatorsView />} />
                    <Route path="/creators/incoming" element={<IncomingCreatorsView />} />

                    <Route path="/looks" element={<LooksView />} />
                    <Route path="/looks/management" element={<LooksManagementView />} />

                    <Route path="/brands" element={<BrandsView />} />
                    <Route path="/brands/management" element={<BrandsView />} />
                    <Route path="/brands/advertisements" element={<BrandAdsView />} />
                    <Route path="/brands/campaigns" element={<BrandCampaignsView />} />

                    <Route path="/products" element={<ProductsView />} />
                    <Route path="/products/management" element={<ProductsView />} />

                    <Route path="/musics" element={<MusicView />} />

                    <Route path="/locations" element={<LocationView />} />

                    <Route path="/earnings" element={<EarningsView />} />

                    <Route path="/settings" element={<SettingsViewGeneral />} />
                    <Route path="/settings/creator-affiliate-links" element={<SettingsViewCreatorAffiliateLinks />} />
                    <Route path="/settings/ad-settings" element={<SettingsViewAdSettings />} />

                    {/* Error Pages */}
                    <Route path="*" element={<FourOhFour />} />
                </RoutesList>
            </AppLayout>
        </AuthProvider>
    )
}