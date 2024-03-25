import { useAuthGuard } from "@/providers/AuthProvider";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Flex, IconButton, Input, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import UsersTable from "@/components/users/UsersTable";
import UpdateUserDrawer from "@/components/users/UpdateUserDrawer";
import { IconPlus } from "@tabler/icons-react";
import Confirmation from "@/components/Confirmation";

type UsersViewProps = {
    userType: 'admin' | 'creator' | 'shopper';
}
const UsersView = ({ userType = 'admin' }: UsersViewProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<any>([]);
    const [filteredUsers, setFilteredUsers] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [editingUser, setEditingUser] = useState<any>({});
    const [deletingUser, setDeletingUser] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useAuthGuard('auth');

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
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

            // Sort by createdAt
            response.sort((a: any, b: any) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            setUsers(response);
        } catch (error: any) {
            const { message } = error.response.data ?? { message: 'An error occurred' };
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
            const { message } = error.response.data ?? { message: 'An error occurred' };
            notify(message, 3000);
            setIsDeleting(false);
        }
    }

    return (
        <>

            {/* Search and Options */}
            <Flex
                justifyContent='space-between'
                alignItems='center'
                mb={4}
            >
                {/* Page Heading */}
                <h1 className="page-heading">{userType === 'admin'? 'Administrators' : userType === 'creator'? 'Creators' : 'Shoppers'}</h1>

                {/* Search and Actions */}
                <Flex gap={2} alignItems='center'>
                    <Input
                        type='search'
                        placeholder='Search'
                        size='sm'
                        variant='outline'
                        width='300px'
                        rounded='md'
                        bgColor='white'
                        borderColor='gray.100'

                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <Tooltip label={`Add new ${userType}`}>
                        <IconButton
                            aria-label="Add new user"
                            variant='solid'
                            size='sm'
                            rounded='full'
                            borderWidth={2}
                            borderColor='gray.100'
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