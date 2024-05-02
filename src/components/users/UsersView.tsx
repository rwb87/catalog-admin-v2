import { useAuthGuard } from "@/providers/AuthProvider";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Box, Flex, IconButton, Input, InputGroup, InputLeftElement, Select, Text, Tooltip } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import UsersTable from "@/components/users/UsersTable";
import UpdateUserDrawer from "@/components/users/UpdateUserDrawer";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import Confirmation from "@/components/Confirmation";
import { useUser } from "@/_store";
import { ROLES } from "@/_config";
import { encodeAmpersand } from "@/helpers/utils";

type UsersViewProps = {
    userType: ROLES;
}
const UsersView = ({ userType = ROLES.ADMIN }: UsersViewProps) => {
    const { role: userRole } = useUser() as any;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt,desc');
    const [filterShoppersByCreatedAt, setFilterShoppersByCreatedAt] = useState<string>('');
    const [adminUserType, setAdminUserType] = useState<string>(ROLES.SUPER_ADMIN);

    const [editingUser, setEditingUser] = useState<any>({});
    const [deletingUser, setDeletingUser] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getUsers();
    }, [sortBy, pagination?.offset, filterShoppersByCreatedAt, adminUserType]);

    useEffect(() => {
        const debounce = setTimeout(() => getUsers(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getUsers = async () => {
        const fetchUserType = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DATA_MANAGER].includes(userType) ? adminUserType : userType;

        try {
            const response = await fetch({
                endpoint: `/users?type=${fetchUserType}&filterShoppersByCreatedAt=${filterShoppersByCreatedAt}&limit=${pagination.limit}&offset=${pagination.offset}&search=${encodeAmpersand(search)}&order=${sortBy}`,
                method: 'GET',
            });
            setUsers(response?.users);
            setPagination({
                ...pagination,
                total: response?.count,
            })
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/users/${deletingUser?.id}`,
                method: 'DELETE',
            });

            if (response) notify('User deleted successfully', 3000);
            else notify('An error occurred', 3000);

            setUsers(users.filter((user: any) => user.id !== deletingUser.id));
            setDeletingUser({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
            setIsDeleting(false);
        }
    }

    const totalIncomingClickouts = useMemo(() => {
        return users?.reduce((total: number, user: any) => {
            return total + (parseInt(user?.incomingClickouts) || 0);
        }, 0);
    }, [users]);
    const totalOutgoingClickouts = useMemo(() => {
        return users?.reduce((total: number, user: any) => {
            return total + (parseInt(user?.outgoingClickouts) || 0);
        }, 0);
    }, [users]);
    const totalIncomingDiscovers = useMemo(() => {
        return users?.reduce((total: number, user: any) => {
            return total + (parseInt(user?.incomingDiscovers) || 0);
        }, 0);
    }, [users]);
    const totalOutgoingDiscovers = useMemo(() => {
        return users?.reduce((total: number, user: any) => {
            return total + (parseInt(user?.outgoingDiscovers) || 0);
        }, 0);
    }, [users]);

    const pageHeading = useMemo(() => {
        if (userType === ROLES.SUPER_ADMIN) return 'Super Administrators';
        if (userType === ROLES.ADMIN) return 'Administrators';
        if (userType === ROLES.CREATOR) return 'Creators';
        if (userType === ROLES.SHOPPER) return 'Shoppers';
        if (userType === ROLES.DATA_MANAGER) return 'Data Managers';

        return 'Shoppers';
    }, [userType]);

    return (
        <>

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
                    <h1 className="page-heading">{pageHeading}</h1>

                    <Box
                        display={{
                            base: 'none',
                            lg: userType !== ROLES.ADMIN ? 'contents' : 'none'
                        }}
                        fontWeight='bold'
                        fontSize={{
                            base: '10px',
                            '2xl': '12px',
                        }}
                        whiteSpace='break-spaces'
                    >
                        {
                            userType === ROLES.CREATOR && <>
                                <Text ml={2} color='blue.500'>Incoming <br />Discovers: {totalIncomingDiscovers || 0}</Text>
                                <Text ml={2} color='green.500'>Incoming <br />Clickouts: {totalIncomingClickouts || 0}</Text>
                            </>
                        }
                        <Text ml={2} color='blue.500'>Outgoing <br />Discovers: {totalOutgoingDiscovers || 0}</Text>
                        <Text ml={2} color='green.500'>Outgoing <br />Clickouts: {totalOutgoingClickouts || 0}</Text>
                    </Box>

                    {/* Create button for mobile */}
                    <IconButton
                        aria-label="Add new user"
                        variant='solid'
                        rounded='full'
                        borderWidth={2}
                        borderColor='gray.100'
                        display={{
                            base: 'inline-flex',
                            lg: 'none',
                        }}
                        size='sm'
                        icon={<IconPlus size={20} />}
                        onClick={() => setEditingUser({
                            id: Math.random().toString(36).substring(7),
                            name: '',
                            lastName: '',
                            username: '',
                            email: '',
                            password: '',
                            type: userType,
                            coverURL: '',
                            pictureURL: '',
                            creatorBannerURL: '',
                            birthDate: null,
                            isNew: true,
                        })}
                    />
                </Flex>

                {/* Search and Actions */}
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

                    {/* Filter Admin types */}
                    {
                        (userType === ROLES.SUPER_ADMIN || userType === ROLES.ADMIN || userType === ROLES.DATA_MANAGER) && <Box
                            display={{
                                base: 'none',
                                lg: 'block',
                            }}
                            fontWeight='bold'
                            fontSize={{
                                base: '10px',
                                '2xl': '12px',
                            }}
                            whiteSpace='break-spaces'
                        >
                            <Select
                                variant='outline'
                                width='200px'
                                size='sm'
                                rounded='full'
                                bgColor='white'
                                borderWidth={2}
                                borderColor='gray.100'
                                fontWeight='medium'
                                value={adminUserType}
                                onChange={(event: any) => setAdminUserType(event.target.value)}
                            >
                                <option value={ROLES.SUPER_ADMIN}>Super Admins</option>
                                <option value={ROLES.ADMIN}>Admins</option>
                                <option value={ROLES.DATA_MANAGER}>Data Managers</option>
                            </Select>
                        </Box>
                    }

                    {/* Created At */}
                    <Select
                        display={userType === ROLES.CREATOR ? 'block' : 'none'}
                        variant='outline'
                        width={{
                            base: 'full',
                            lg: '200px',
                        }}
                        size='sm'
                        rounded='full'
                        bgColor='white'
                        borderWidth={2}
                        borderColor='gray.100'
                        fontWeight='medium'
                        value={filterShoppersByCreatedAt}
                        onChange={(event: any) => setFilterShoppersByCreatedAt(event.target.value)}
                    >
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this week">This Week</option>
                        <option value="this month">This Month</option>
                        <option value=''>All Time</option>
                    </Select>

                    {/* Sorting */}
                    <Select
                        variant='outline'
                        width={{
                            base: 'full',
                            lg: '200px',
                        }}
                        size='sm'
                        rounded='full'
                        bgColor='white'
                        borderWidth={2}
                        borderColor='gray.100'
                        fontWeight='medium'
                        value={sortBy}
                        onChange={(event: any) => setSortBy(event.target.value)}
                    >
                        <optgroup label="Username">
                            <option value='username,asc'>A - Z</option>
                            <option value='username,desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="Email">
                            <option value='email,asc'>A - Z</option>
                            <option value='email,desc'>Z - A</option>
                        </optgroup>
                        {/* {
                            userType === ROLES.SHOPPER && <optgroup label="Invitation Count">
                                <option value='invitations.length,asc'>Low - High</option>
                                <option value='invitations.length,desc'>High - Low</option>
                            </optgroup>
                        }
                        {
                            userType === ROLES.CREATOR && <>
                                <optgroup label="Looks Count">
                                    <option value='looksCount,asc'>Low - High</option>
                                    <option value='looksCount,desc'>High - Low</option>
                                </optgroup>
                                <optgroup label="Earning Amount">
                                    <option value='currentEarnings,asc'>$0 - $9+</option>
                                    <option value='currentEarnings,desc'>+$9 - $0</option>
                                </optgroup>
                                <optgroup label="Pending Amount">
                                    <option value='currentPending,asc'>$0 - $9+</option>
                                    <option value='currentPending,desc'>+$9 - $0</option>
                                </optgroup>
                            </>
                        } */}
                        <optgroup label="Creation Date">
                            <option value='createdAt,desc'>Newest First</option>
                            <option value='createdAt,asc'>Oldest First</option>
                        </optgroup>
                    </Select>

                    {/* Search */}
                    <InputGroup
                        width={{
                            base: 'full',
                            lg: '250px',
                        }}
                    >
                        <InputLeftElement
                            pointerEvents='none'
                            color='gray.300'
                            borderWidth={2}
                            borderColor='gray.100'
                            rounded='full'
                            width='2rem'
                            height='2rem'
                        >
                            <IconSearch size={12} strokeWidth={2} />
                        </InputLeftElement>

                        <Input
                            type='search'
                            placeholder='Search'
                            variant='outline'
                            width={{
                                base: 'full',
                                lg: '250px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            pl={10}
                            fontWeight='medium'
                            _focusVisible={{
                                borderColor: 'gray.200 !important',
                                boxShadow: 'none !important',
                            }}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </InputGroup>

                    {/* Create button for Desktop */}
                    <Tooltip
                        label={`Add new ${userType}`}
                        placement="left"
                    >
                        <IconButton
                            aria-label="Add new user"
                            variant='solid'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
                            display={{
                                base: 'none',
                                lg: 'inline-flex',
                            }}
                            size='sm'
                            icon={<IconPlus size={20} />}
                            onClick={() => setEditingUser({
                                id: Math.random().toString(36).substring(7),
                                name: '',
                                lastName: '',
                                username: '',
                                email: '',
                                password: '',
                                type: userType,
                                coverURL: '',
                                pictureURL: '',
                                creatorBannerURL: '',
                                birthDate: null,
                                isNew: true,
                            })}
                        />
                    </Tooltip>
                </Flex>
            </Flex>

            {/* Table */}
            <UsersTable
                isLoading={isLoading}
                userType={userType}
                data={users}
                pagination={pagination}
                onPaginate={(pageNumber: number) => setPagination({
                    ...pagination,
                    page: pageNumber,
                    offset: (pageNumber - 1) * pagination.limit,
                })}
                hasActions={(userType === ROLES.ADMIN && userRole === ROLES.SUPER_ADMIN) || userType !== ROLES.ADMIN}
                onEdit={(user: any) => setEditingUser(user)}
                onDelete={(user) => setDeletingUser(user)}
                onClickLooksCount={(user: any) => console.log('Changing Look Creator', user)}
            />

            {/* Update User */}
            <UpdateUserDrawer
                user={editingUser}
                onComplete={() => {
                    setEditingUser({});
                    getUsers();
                }}
                onClose={() => setEditingUser({})}
            />

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingUser?.id}
                text={`Are you sure you want to delete <strong>${deletingUser?.username}?</strong> You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingUser({})}
            />
        </>
    )
}

export default UsersView;