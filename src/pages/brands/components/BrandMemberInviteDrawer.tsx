import { BRAND_ROLES, } from "@/_config";
import CustomDrawer from "@/components/Drawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { capitalize } from "@/helpers/utils";
import { Box, Input, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function BrandMemberInviteDrawer() {
    const [open, setOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [payload, setPayload] = useState({
        name: '',
        email: '',
        brandId: null,
        role: 'admin',
        id: null,
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        const openDrawer = (event: CustomEvent) => {
            const user = event?.detail;

            setPayload({
                name: user?.name || '',
                email: user?.email || '',
                brandId: user?.brandId,
                role: user?.role || 'admin',
                id: user?.id || null,
                password: '',
                confirmPassword: '',
            });
            setOpen(true);
            setIsProcessing(false);
        }

        window.addEventListener('drawer:brand:members:invite', openDrawer);
        window.addEventListener('drawer:brand:members:edit', openDrawer);

        return () => {
            window.removeEventListener('drawer:brand:members:invite', openDrawer);
            window.removeEventListener('drawer:brand:members:edit', openDrawer);
        }
    }, []);

    const handleSubmit = async () => {

        // Validation
        if(!payload?.name?.trim()?.length) return notify('Name is required', 'error');
        if(!payload?.email?.trim()?.length) return notify('Email is required', 'error');
        if(!payload?.role) return notify('Role is required', 'error');

        setIsProcessing(true);

        try {
            const dataPayload = payload;
            dataPayload.brandId = payload?.brandId;
            dataPayload.role = payload?.role?.toLowerCase();

            if(payload?.id === null || !payload?.password?.trim()?.length) {
                delete dataPayload.password;
                delete dataPayload.confirmPassword;
            }

            const response = await fetch({
                endpoint: payload?.id ? `/campaigns/users/${payload?.id}` : '/campaigns/users/invite',
                method: payload?.id ? 'PUT' : 'POST',
                data: dataPayload,
            });

            if(response) {
                if(payload?.id) notify('Member updated Successfully!', 'info');
                else notify('Member invited Successfully!', 'success');
            } else notify('Something went wrong!', 'error');

            setOpen(false);
            window.dispatchEvent(new CustomEvent('reload:brand-members'));
        } catch (error) {
            notify('Something went wrong!', 'error');
        }

        setIsProcessing(false);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <CustomDrawer
            isOpen={open}
            title={payload?.id ? 'Edit Member' : 'Invite Member'}
            cancelText='Cancel'
            submitText={payload?.id ? 'Save' : 'Invite'}
            isProcessing={isProcessing}
            processingText='Inviting...'
            onSubmit={handleSubmit}
            onClose={handleClose}
        >

            {/* Name */}
            <Box>
                <label className="block mb-1 text-sm font-semibold">Member Name</label>
                <Input
                    type="text"
                    required
                    autoComplete="off"
                    value={payload.name}
                    onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                />
            </Box>

            {/* Email */}
            <Box mt={4}>
                <label className="block mb-1 text-sm font-semibold">Email</label>
                <Input
                    type="email"
                    required
                    autoComplete="off"
                    value={payload.email}
                    onChange={(e) => setPayload({ ...payload, email: e.target.value })}
                />
            </Box>

            {/* Role */}
            <Box mt={4}>
                <label aria-required className="block mb-1 text-sm font-semibold">Role</label>
                <Select
                    textTransform='capitalize'
                    value={payload.role}
                    onChange={(event: any) => setPayload({ ...payload, role: event?.target?.value })}
                >
                    <option value={BRAND_ROLES.ADMIN}>{capitalize(BRAND_ROLES.ADMIN)}</option>
                    <option value={BRAND_ROLES.CREATIVE}>{capitalize(BRAND_ROLES.CREATIVE)}</option>
                    <option value={BRAND_ROLES.FINANCE}>{capitalize(BRAND_ROLES.FINANCE)}</option>
                </Select>
            </Box>

            {/* Password */}
            <Box
                mt={4}
                hidden={payload?.id === null}
            >
                <label className="block mb-1 text-sm font-semibold">Password</label>
                <Input
                    type="password"
                    required
                    autoComplete="off"
                    value={payload.password}
                    onChange={(e) => setPayload({ ...payload, password: e.target.value })}
                />
            </Box>

            {/* Confirm Password */}
            <Box
                mt={4}
                hidden={payload?.id === null}
            >
                <label className="block mb-1 text-sm font-semibold">Confirm Password</label>
                <Input
                    type="password"
                    required
                    autoComplete="off"
                    value={payload.confirmPassword}
                    onChange={(e) => setPayload({ ...payload, confirmPassword: e.target.value })}
                />
            </Box>
        </CustomDrawer>
    )
}