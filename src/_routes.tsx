import { Route, Routes as RoutesList } from 'react-router-dom';
import { AuthProvider } from '@/providers/AuthProvider';

// Pages
import Index from '@/pages/index';
import FourOhFour from '@/pages/404';

// Auth Pages
import Login from '@/pages/auth/login';

// App Pages
import LooksView from '@/pages/looks';
import AdminsView from '@/pages/admins';
import ShoppersView from '@/pages/shoppers';
import CreatorsView from '@/pages/creators';
import BrandsView from '@/pages/brands';

export default function Routes() {
    return(
        <AuthProvider>
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
                <Route path="/brands" element={<BrandsView />} />

                {/* Error Pages */}
                <Route path="*" element={<FourOhFour />} />
            </RoutesList>
        </AuthProvider>
    )
}