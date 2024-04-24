import { Route, Routes as RoutesList } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';

// Pages
import Index from '@/pages/index';
import FourOhFour from '@/pages/404';

// Auth Pages
import Login from '@/pages/auth/login';

// App Pages
import LooksView from '@/pages/looks';
import LooksManagementView from '@/pages/looks/management';
import AdminsView from '@/pages/admins';
import ShoppersView from '@/pages/shoppers';
import CreatorsView from '@/pages/creators';
import DataManagersView from './pages/data-managers';
import ProductsView from './pages/products';
import BrandsView from '@/pages/brands';
import EarningsView from '@/pages/earnings';
import AppLayout from './layouts/app.layout';

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
                    <Route path="/data-managers" element={<DataManagersView />} />

                    <Route path="/looks" element={<LooksView />} />
                    <Route path="/looks/management" element={<LooksManagementView />} />
                    <Route path="/brands" element={<BrandsView />} />
                    <Route path="/products" element={<ProductsView />} />
                    <Route path="/products/management" element={<ProductsView />} />
                    <Route path="/earnings" element={<EarningsView />} />

                    {/* Error Pages */}
                    <Route path="*" element={<FourOhFour />} />
                </RoutesList>
            </AppLayout>
        </AuthProvider>
    )
}