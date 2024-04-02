import { useAuthGuard } from "@/providers/AuthProvider";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Flex, IconButton, Input, InputGroup, InputLeftElement, Select, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import UsersTable from "@/components/users/UsersTable";
import UpdateUserDrawer from "@/components/users/UpdateUserDrawer";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import Confirmation from "@/components/Confirmation";
import sortData from "@/helpers/sorting";
import moment from "moment";

type UsersViewProps = {
    userType: 'admin' | 'creator' | 'shopper';
}
const UsersView = ({ userType = 'admin' }: UsersViewProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<any>([]);
    const [filteredUsers, setFilteredUsers] = useState<any>([]);
    const [search, setSearch] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('createdAt:desc');
    const [filterShoppersByCreatedAt, setFilterShoppersByCreatedAt] = useState<string>('');

    const [editingUser, setEditingUser] = useState<any>({});
    const [deletingUser, setDeletingUser] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getUsers();
    }, [sortBy, filterShoppersByCreatedAt]);

    useEffect(() => {
        if(search?.toString()?.trim() === '') return setFilteredUsers(users);

        setFilteredUsers(
            users.filter((user: any) => {
                return user?.name.toLowerCase().includes(search.toLowerCase()) ||
                    user?.lastName.toLowerCase().includes(search.toLowerCase()) ||
                    `${user?.name?.toLowerCase() ?? ''} ${user?.lastName?.toLowerCase() ?? ''}`.includes(search.toLowerCase()) ||
                    user?.username.toLowerCase().includes(search.toLowerCase()) ||
                    user?.email.toLowerCase().includes(search.toLowerCase());
            })
        );
    }, [search, users]);

    const getUsers = async () => {
        try {
            const response = await fetch({
                endpoint: `/users?type=${userType}`,
                method: 'GET',
            });

            const sortedData = sortData(response, sortBy);

            // Filter by created date
            if(filterShoppersByCreatedAt === '') setUsers(sortedData);
            else {
                let filteredData = [];
                const dateNow = moment(new Date()).format('YYYY-MM-DD');

                switch(filterShoppersByCreatedAt) {
                    case 'today':
                        filteredData = sortedData.filter((user: any) => moment(new Date(user.createdAt)).format('YYYY-MM-DD') === dateNow);
                        break;
                    case 'yesterday':
                        filteredData = sortedData.filter((user: any) => moment(new Date(user.createdAt)).format('YYYY-MM-DD') === moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD'));
                        break;
                    case 'this week':
                        filteredData = sortedData.filter((user: any) => moment(new Date(user?.createdAt)).isBetween(moment(new Date()).startOf('week'), moment(new Date()).endOf('week')));
                        break;
                    case 'this month':
                        filteredData = sortedData.filter((user: any) => moment(new Date(user?.createdAt)).isBetween(moment(new Date()).startOf('month'), moment(new Date()).endOf('month')));
                        break;
                    default:
                        filteredData = sortedData;
                }

                setUsers(filteredData);
            }
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

    return (
        <>

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    lg: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    lg: 'center',
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
                        lg: 'auto',
                    }}
                    gap={2}
                >
                    <h1 className="page-heading">{userType === 'admin'? 'Administrators' : userType === 'creator'? 'Creators' : 'Shoppers'}</h1>

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
                        lg: 'auto',
                    }}
                >

                    {/* Created At */}
                    <Select
                        display={userType === 'shopper' ? 'block' : 'none'}
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
                            <option value='username:asc'>A - Z</option>
                            <option value='username:desc'>Z - A</option>
                        </optgroup>
                        <optgroup label="Email">
                            <option value='email:asc'>A - Z</option>
                            <option value='email:desc'>Z - A</option>
                        </optgroup>
                        {
                            userType === 'shopper' && <optgroup label="Invitation Count">
                                <option value='invitations.length:asc'>Low - High</option>
                                <option value='invitations.length:desc'>High - Low</option>
                            </optgroup>
                        }
                        {
                            userType === 'creator' && <>
                                <optgroup label="Looks Count">
                                    <option value='looksCount:desc'>Low - High</option>
                                    <option value='looksCount:asc'>High - Low</option>
                                </optgroup>
                                <optgroup label="Earning Amount">
                                    <option value='currentEarnings:desc'>$0 - $9+</option>
                                    <option value='currentEarnings:asc'>+$9 - $0</option>
                                </optgroup>
                                <optgroup label="Pending Amount">
                                    <option value='currentPending:desc'>$0 - $9+</option>
                                    <option value='currentPending:asc'>+$9 - $0</option>
                                </optgroup>
                            </>
                        }
                        <optgroup label="Creation Date">
                            <option value='createdAt:desc'>Newest First</option>
                            <option value='createdAt:asc'>Oldest First</option>
                        </optgroup>
                    </Select>

                    {/* Search */}
                    <InputGroup
                        width={{
                            base: 'full',
                            lg: '300px',
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
                                lg: '300px',
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            pl={12}
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
                data={filteredUsers}
                onEdit={(user: any) => setEditingUser(user)}
                onDelete={(user) => setDeletingUser(user)}
            />

            {/* Update User */}
            <UpdateUserDrawer
                user={editingUser}
                onComplete={(user: any, isNew: boolean) => {
                    setEditingUser({});

                    // Reset users
                    if(isNew) setUsers([user, ...users]);
                    else {
                        const index = users.findIndex((u: any) => u.id === user.id);
                        const newUsers = [...users];
                        newUsers[index] = user;
                        setUsers(newUsers);
                    }
                }}
                onClose={() => setEditingUser({})}
            />

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingUser?.id}
                text={`Are you sure you want to delete ${deletingUser?.username}? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingUser({})}
            />
        </>
    )
}

export default UsersView;