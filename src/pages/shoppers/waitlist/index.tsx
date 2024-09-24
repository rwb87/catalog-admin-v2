import { useAuthGuard } from "@/providers/AuthProvider";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Box, Flex, IconButton, Select, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons-react";
import { encodeAmpersand } from "@/helpers/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Content } from "@/layouts/app.layout";
import UsersTable from "@/components/users/UsersTable";
import { ROLES } from "@/_config";
import Confirmation from "@/components/Confirmation";
import SearchBox from "@/components/SearchBox";

const WaitlistView = () => {
    const routeTo = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<any>([]);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    // Search params
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [pagination?.offset]);

    useEffect(() => {
        setIsLoading(true);

        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/users?type=${ROLES.SHOPPER}&isLive=0&limit=${pagination.limit}&offset=${pagination.offset}&search=${encodeAmpersand(search)}`,
                method: 'GET',
            });
            setUsers(response?.users);
            setPagination({
                ...pagination,
                total: response?.count,
            })
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }

        setIsLoading(false);
    }

    const handleChangeShoppersType = (event: any) => {
        const { value } = event.target;

        if (value === 'LIVE') routeTo('/shoppers');
    }

    const handleUpdateSearchParams = (key: string, value: string) => {
        setSearchParams({
            ...Object.fromEntries(searchParams),
            [key]: value,
        });
    }

    return (
        <Content activePage="Shoppers">

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    xl: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    xl: 'center',
                }}
                mb={{
                    base: 4,
                    md: 8,
                    xl: 16,
                }}
                gap={2}
                width='full'
            >
                {/* Page Heading */}
                <Flex
                    justifyContent={{
                        base: 'space-between',
                        lg: 'flex-start',
                    }}
                    alignItems='center'
                    width={{
                        base: 'full',
                        xl: 'auto',
                    }}
                    gap={2}
                >
                    <h1 className="page-heading">Waitlist</h1>

                    <Box
                        display={{
                            base: 'none',
                            lg: 'contents'
                        }}
                        fontWeight='bold'
                        fontSize={{
                            base: '10px',
                            '2xl': '12px',
                        }}
                        whiteSpace='break-spaces'
                    >

                        {/* Switch between live and incoming requests */}
                        <Select
                            variant='outline'
                            width={{
                                base: 'full',
                                lg: 32,
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            fontWeight='medium'
                            defaultValue='WAITLIST'
                            onChange={handleChangeShoppersType}
                        >
                            <option value='LIVE'>Live</option>
                            <option value='WAITLIST'>Waitlist</option>
                        </Select>
                    </Box>
                </Flex>

                {/* Search */}
                <Flex
                    direction={{
                        base: 'column',
                        md: 'row',
                    }}
                    gap={2}
                    alignItems='center'
                    justifyContent={{
                        base: 'flex-end',
                        md: 'space-between',
                    }}
                    width={{
                        base: 'full',
                        xl: 'auto',
                    }}
                >

                    {/* Search */}
                    <SearchBox
                        value={search}
                        onChange={(value: string) => handleUpdateSearchParams('search', value)}
                    />
                </Flex>
            </Flex>

            {/* Table */}
            <UsersTable
                isLoading={isLoading}
                userType={'WAITLIST'}
                data={users}
                pagination={pagination}
                onPaginate={(page: number) => {
                    setPagination({
                        ...pagination,
                        page: page,
                        offset: (page - 1) * pagination.limit,
                    })
                }}
                hasActions='delete'
                extraActions={<MakeUserLiveButton data={users} />}
            />
        </Content>
    )
}

const MakeUserLiveButton = ({ data }: { data: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const handleOpenConfirmation = (event: any) => {
        const $parentElement = event.currentTarget.closest('.extra-actions');
        const userId = $parentElement?.getAttribute('data-user-id');

        if (!userId) return notify('User not found', 'error');

        const user = data.find((user: any) => user?.id === parseInt(userId));

        setUser(user);
        setIsOpen(true);
    }

    const handleConfirm = async () => {
        if(!user?.id) return notify('User not found', 'error');

        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/users/${user?.id}`,
                method: 'PUT',
                data: {
                    isLive: true,
                }
            });

            notify('User made live successfully', 'success');
            window.dispatchEvent(new Event('refresh:data'));
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 'error');
        }

        setIsProcessing(false);
        setIsOpen(false);
    }

    return (
        <>
            <Tooltip label='Approve request' placement='bottom'>
                <IconButton
                    aria-label='Approve request'
                    size='sm'
                    rounded='full'
                    colorScheme='green'
                    onClick={handleOpenConfirmation}
                ><IconCheck size={16} /></IconButton>
            </Tooltip>

            <Confirmation
                isOpen={isOpen}
                text={`Approving <strong>${user?.name || 'NO NAME'} (${user?.email || 'NO EMAIL'})</strong> will make them a live user and they will have the full control as an user. Are you sure you want to continue?`}
                isProcessing={isProcessing}
                isDangerous={false}
                confirmText="Yes, make Live"
                onConfirm={handleConfirm}
                onCancel={() => {
                    setUser({});
                    setIsOpen(false);
                }}
            />
        </>
    )
}

export default WaitlistView;