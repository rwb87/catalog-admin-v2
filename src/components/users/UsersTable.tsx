import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Flex, IconButton, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react"
import { IconEdit, IconLoader2, IconMail, IconTrash } from "@tabler/icons-react";
import Pagination from "@/components/Pagination";
import moment from "moment";
import { ROLES } from "@/_config";
import { useEffect, useState } from "react";
import LooksTableRow from "../looks/LooksTableRow";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import UpdateUserDrawer from "./UpdateUserDrawer";
import Confirmation from "@/components/Confirmation";
import ProductsTable from "@/components/products/ProductsTable";

const SSO_PROVIDERS = {
    apple: {
        name: 'Apple',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/833px-Apple_logo_black.svg.png',
    },
    google: {
        name: 'Google',
        icon: 'https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png',
    },
    facebook: {
        name: 'Facebook',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png',
    },
    twitter: {
        name: 'Twitter',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png',
    },
}

type UsersTableProps = {
    isLoading?: boolean;
    userType: ROLES;
    data?: any;
    pagination?: any;
    onPaginate?: (page: number) => void;
    hasActions?: boolean;
    onEdit?: (user: any) => void;
    onDelete?: (user: any) => void;
    noUi?: boolean;
}
const UsersTable = (props: UsersTableProps) => {
    const {
        isLoading = false,
        userType = ROLES.ADMIN,
        data = [],
        pagination,
        onPaginate,
        hasActions = true,
        noUi = false,
    } = props;

    const [editingData, setEditingData] = useState<any>({});
    const [brand, setBrand] = useState<any>({});

    const [editingUser, setEditingUser] = useState<any>({});
    const [deletingUser, setDeletingUser] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    useEffect(() => {
        const openProductToModify = (event: any) => {
            const { product = null, brand = null } = event.detail;

            if(!product || !brand) return;

            setEditingData(product);
            setBrand(brand);
        }

        const openUserToModify = (event: any) => {
            const { type = null } = event.detail;

            if(!type) return;

            setEditingUser({
                id: Math.random().toString(36).substring(7),
                name: '',
                lastName: '',
                username: '',
                email: '',
                password: '',
                type: type,
                coverURL: '',
                pictureURL: '',
                creatorBannerURL: '',
                birthDate: null,
                isNew: true,
            });
        }

        window?.addEventListener('action:edit-product', openProductToModify);
        window?.addEventListener('action:new-user', openUserToModify);

        return () => {
            window?.removeEventListener('action:edit-product', openProductToModify);
            window?.removeEventListener('action:new-user', openUserToModify);
        }
    }, []);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/users/${deletingUser?.id}`,
                method: 'DELETE',
            });

            if (response) notify('User deleted successfully', 3000);
            else notify('An error occurred', 3000);

            window?.dispatchEvent(new CustomEvent('refresh:data'));
            setDeletingUser({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsDeleting(false);
    }

    return (
        <>
            <Box className={!noUi ? 'table-responsive' : ''}>
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead display={noUi && isLoading ? 'none' : 'table-header-group'}>
                        <Tr>
                            <Th textTransform='capitalize'>{userType?.replace('_', ' ')}</Th>
                            { userType !== ROLES.ADMIN && <Th>SSO</Th> }
                            <Th>Email</Th>
                            <Th>Created At</Th>
                            {
                                (userType === ROLES.SUPER_ADMIN || userType === ROLES.ADMIN) && <>
                                    <Th>Role</Th>
                                </>
                            }
                            {
                                (userType !== ROLES.SUPER_ADMIN && userType !== ROLES.ADMIN) && <>
                                    <Th>Shopping</Th>
                                    <Th>Location</Th>
                                    <Th textAlign='center'>Height</Th>
                                </>
                            }
                            {
                                (userType === ROLES.CREATOR || userType === ROLES.SHOPPER || userType === ROLES.DATA_MANAGER) && <>
                                    <Th>Age</Th>
                                </>
                            }
                            {
                                userType === ROLES.CREATOR && <>
                                    <Th textAlign='center'>Looks</Th>
                                    <Th textAlign='center'>Products</Th>
                                    <Th textAlign='center' color='blue.500'>Incoming <br /> Discovers</Th>
                                    <Th textAlign='center' color='green.500'>Incoming <br /> Clickouts</Th>
                                </>
                            }
                            {
                                userType !== ROLES.ADMIN && <>
                                    <Th textAlign='center' color='blue.500'>Outgoing <br /> Discovers</Th>
                                    <Th textAlign='center' color='green.500'>Outgoing <br /> Clickouts</Th>
                                </>
                            }
                            {
                                userType === ROLES.CREATOR && <>
                                    <Th textAlign='center'>Earnings</Th>
                                </>
                            }
                            {
                                userType === ROLES.SHOPPER && <>
                                    <Th textAlign='center'>Invited</Th>
                                </>
                            }
                            { hasActions && <Th textAlign='right'>Actions</Th> }
                        </Tr>
                    </Thead>

                    {/* Table Body */}
                    <Tbody>
                        {
                            isLoading
                                ? <Tr>
                                    <Td colSpan={20} textAlign='center'>
                                        <Box display='inline-block' mx='auto'>
                                            <IconLoader2
                                                size={48}
                                                className="animate-spin"
                                            />
                                        </Box>
                                    </Td>
                                </Tr>
                                : !data?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : data.map((user: any) => <TableRow
                                        key={user?.id}
                                        userType={userType}
                                        user={user}
                                        hasActions={hasActions}
                                        onEdit={(user: any) => setEditingUser(user)}
                                        onDelete={(user) => setDeletingUser(user)}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Update User */}
            <UpdateUserDrawer
                user={editingUser}
                onSave={() => {
                    setEditingUser({});
                    window?.dispatchEvent(new CustomEvent('refresh:data'));
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

            {/* Update Product */}
            <UpdateProductDrawer
                data={{
                    ...editingData,
                    brand: brand,
                    brandId: brand?.id,
                }}
                onClose={() => setEditingData({})}
                onSave={() => {
                    window?.dispatchEvent(new CustomEvent('refresh:looks'));
                    setEditingData({});
                    setBrand({});
                }}
            />

            {/* Pagination */}
            <Pagination
                total={pagination?.total || 0}
                limit={pagination?.limit || 0}
                page={pagination?.page || 1}
                setPage={onPaginate}
            />
        </>
    )
}

type UsersTableRowProps = {
    userType: ROLES;
    user: any;
    hasActions?: boolean;
    onEdit?: (user: any) => void;
    onDelete?: (user: any) => void;
}
const TableRow = (props: UsersTableRowProps) => {
    const {
        userType = ROLES.ADMIN,
        user,
        hasActions = true,
        onEdit,
        onDelete,
    } = props;

    const [isLooksExpanded, setIsLooksExpanded] = useState(false);
    const [isProductsExpanded, setIsProductsExpanded] = useState(false);

    return (
        <>
            <Tr>
                <Td>
                    <Tooltip label={user?.description || null} aria-label='Username' placement='bottom'>
                        <Flex alignItems='center'>
                            <Avatar
                                size='sm'
                                mr={2}
                                name={user?.username}
                                src={user?.pictureURL}
                            />
                            {user?.username || '-'}
                        </Flex>
                    </Tooltip>
                </Td>
                {
                    userType !== ROLES.ADMIN && <Td>
                        {
                            user?.provider
                                ? <img src={SSO_PROVIDERS?.[user?.provider]?.icon} alt="SSO" style={{ width: '22px' }} />
                                : '-'
                        }
                    </Td>
                }
                <Td>
                    {
                        user?.email
                            ? userType !== ROLES.ADMIN
                                ? <IconButton
                                    aria-label='Email'
                                    variant='ghost'
                                    rounded='full'
                                    size='sm'
                                    icon={<IconMail size={22} />}
                                    onClick={() => window.open(`mailto:${user?.email}`)}
                                />
                                : user?.email
                            : '-'
                    }
                </Td>
                <Td minWidth='160px' maxWidth='160px'>{formatDateTime(user?.createdAt, true)}</Td>
                {
                    (userType === ROLES.SUPER_ADMIN || userType === ROLES.ADMIN) && <>
                        <Td textTransform='capitalize'>{user?.type?.replace('_', ' ') || '-'}</Td>
                    </>
                }
                {
                    (userType !== ROLES.SUPER_ADMIN && userType !== ROLES.ADMIN) && <>
                        <Td textTransform='capitalize'>{user?.gender || '-'}</Td>
                        <Td textTransform='capitalize'>{user?.location || '-'}</Td>
                        <Td textAlign='center'>{ (typeof user?.heightFeet !== 'undefined' && user?.heightFeet !== null && user?.heightFeet !== '') ? user?.heightFeet + '.' + user?.heightInch + 'ft' : '-'}</Td>
                    </>
                }
                {
                    (userType === ROLES.CREATOR || userType === ROLES.SHOPPER || userType === ROLES.DATA_MANAGER) && <>
                        <Td>{user?.birthDate ? moment().diff(user?.birthDate, 'years') + ' years' : '-'}</Td>
                    </>
                }
                {
                    userType === ROLES.CREATOR && <>
                        <Td textAlign='center'>
                            <IconButton
                                aria-label='Looks'
                                variant='solid'
                                rounded='full'
                                size='sm'
                                icon={<Text>{user?.looksCount || user?.looks?.length || 0}</Text>}
                                px={2}
                                onClick={() => {
                                    setIsProductsExpanded(false);
                                    setIsLooksExpanded(!isLooksExpanded)
                                }}
                            />
                        </Td>
                        <Td textAlign='center'>
                            <IconButton
                                aria-label='Products'
                                variant='solid'
                                rounded='full'
                                size='sm'
                                icon={<svg viewBox="0 0 24 22" width={14} xmlns="http://www.w3.org/2000/svg"><path d="m4.638 10.828v10.416h14.881v-10.416h3.72v-8.4342l-1.6889-0.42378-3.0653-0.77015c-0.5918-0.14863-1.2168-0.27653-1.9717-0.40581l-1.6993-0.28967-0.7107 1.5659c-0.179 0.38647-0.4648 0.71368-0.8237 0.94299s-0.776 0.35115-1.2019 0.35115-0.8429-0.12184-1.2018-0.35115c-0.359-0.22931-0.6448-0.55652-0.8238-0.94299l-0.7079-1.5659-1.7 0.27653c-0.74387 0.12997-1.3827 0.25648-1.9717 0.40581l-3.0654 0.76668-1.6889 0.43692v8.4342l3.7201 0.0034zm-1.4878-6.6941 3.0654-0.76669c0.59524-0.14863 1.2015-0.26754 1.8044-0.37193 0.35592 0.77745 0.92764 1.4363 1.6472 1.8983s1.5566 0.70751 2.4116 0.70751 1.6921-0.24557 2.4116-0.70751c0.7196-0.46194 1.2913-1.1208 1.6472-1.8983 0.6063 0.10439 1.2091 0.21915 1.8044 0.37193l3.0646 0.76669v4.4639h-2.2316c-0.3946 0-0.773 0.15674-1.052 0.43575-0.279 0.279-0.4357 0.65741-0.4357 1.0519v8.9265h-10.417v-8.9278c0-0.39461-0.15674-0.77302-0.43575-1.052-0.27901-0.279-0.65742-0.43575-1.052-0.43575h-2.2323v-4.4625z" fill="currentColor"/></svg>}
                                p={1}
                                onClick={() => {
                                    setIsLooksExpanded(false);
                                    setIsProductsExpanded(!isProductsExpanded)
                                }}
                            />
                        </Td>
                        <Td textAlign='center' color='blue.500'>{user?.incomingDiscovers || 0}</Td>
                        <Td textAlign='center' color='green.500'>{user?.incomingClickouts || 0}</Td>
                    </>
                }
                {
                    userType !== ROLES.ADMIN && <>
                        <Td textAlign='center' color='blue.500'>{user?.outgoingDiscovers || 0}</Td>
                        <Td textAlign='center' color='green.500'>{user?.outgoingClickouts || 0}</Td>
                    </>
                }
                {
                    userType === ROLES.CREATOR && <>
                        <Td textAlign='center'>
                            <Text
                                borderWidth={2}
                                borderColor='green.500'
                                rounded='full'
                                py={1}
                                px={2}
                                shadow='md'
                                bgColor='white'
                            >${parseFloat(user?.currentEarnings || 0).toFixed(2) || 0}</Text>
                        </Td>
                    </>
                }
                {
                    userType === ROLES.SHOPPER && <>
                        <Td textAlign='center'>{user?.invitations?.length || 0}</Td>
                    </>
                }
                {
                    hasActions && <Td textAlign='right' whiteSpace='nowrap'>
                        {
                            typeof onEdit === 'function' && <IconButton
                                aria-label='Edit'
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                icon={<IconEdit size={22} />}
                                onClick={() => onEdit?.(user)}
                            />
                        }
                        {
                            typeof onDelete === 'function' && <IconButton
                                aria-label='Delete'
                                variant='ghost'
                                colorScheme='red'
                                rounded='full'
                                size='sm'
                                ml={4}
                                icon={<IconTrash size={22} />}
                                onClick={() => onDelete?.(user)}
                            />
                        }
                    </Td>
                }
            </Tr>

            {/* Looks */}
            <UserLooks
                isOpen={isLooksExpanded}
                user={user}
            />

            {/* Products */}
            <UserProducts
                isOpen={isProductsExpanded}
                user={user}
            />
        </>
    )
}

const UserLooks = ({ isOpen, user }: { isOpen: boolean, user: any }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [looks, setLooks] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 20,
        total: 0,
    });

    useEffect(() => {
        if(!isOpen) {
            setLooks([]);
            setIsLoading(true);
        } else {
            setIsLoading(true);
            getLooks();

            window?.addEventListener('refresh:looks', getLooks);

            return () => window?.removeEventListener('refresh:looks', getLooks);
        }
    }, [isOpen, pagination.page]);

    const getLooks = async () => {
        const filter = {
            userId: user?.id,
        }

        try {
            const response = await fetch({
                endpoint: `/looks?filter=${JSON.stringify(filter)}&offset=${pagination?.offset}&limit=${pagination.limit}`,
                method: 'GET',
            });

            setLooks(response?.looks);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
            setLooks([]);
        }

        setIsLoading(false);
    }

    return (
        <Tr display={isOpen ? 'table-row' : 'none'}>
            {
                isLoading
                    ? <Td colSpan={20} textAlign='center'>
                        <Box display='inline-block' mx='auto'>
                            <IconLoader2
                                size={48}
                                className="animate-spin"
                            />
                        </Box>
                    </Td>
                    : <Td colSpan={20} p={4} bgColor='gray.50'>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Thumbnail</Th>
                                    <Th>Creator</Th>
                                    <Th textAlign='center'>Created At</Th>
                                    <Th textAlign='center'>Platform</Th>
                                    <Th textAlign='center'>Featured</Th>
                                    <Th textAlign='center'>Priority</Th>
                                    <Th textAlign='center' color='blue.500'>Incoming Discovers</Th>
                                    <Th textAlign='center'>Status</Th>
                                    <Th textAlign='right'>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {
                                    !looks?.length
                                        ? <Tr>
                                            <Td colSpan={20} textAlign='center'>
                                                <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                            </Td>
                                        </Tr>
                                        : <>
                                            {
                                                looks?.map((look: any) => <LooksTableRow
                                                    key={look?.id}
                                                    item={{
                                                        ...look,
                                                        user: user,
                                                    }}
                                                    isUserChangeAllowed={false}
                                                    showStatus={true}
                                                />)
                                            }

                                            <Tr>
                                                <Td colSpan={20}>
                                                    <Pagination
                                                        total={pagination?.total || 0}
                                                        limit={pagination?.limit || 0}
                                                        page={pagination?.page || 1}
                                                        setPage={(page: number) => {
                                                            setPagination({
                                                                ...pagination,
                                                                page: page,
                                                                offset: (page - 1) * pagination.limit
                                                            })
                                                        }}
                                                    />
                                                </Td>
                                            </Tr>
                                        </>
                                }
                            </Tbody>
                        </Table>
                    </Td>
            }
        </Tr>
    )
}

const UserProducts = ({ isOpen, user }: { isOpen: boolean, user: any }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 20,
        total: 0,
    });

    useEffect(() => {
        if(!isOpen) {
            setProducts([]);
            setIsLoading(true);
        } else {
            setIsLoading(true);
            getProducts();

            window?.addEventListener('refresh:looks', getProducts);

            return () => window?.removeEventListener('refresh:looks', getProducts);
        }
    }, [isOpen, pagination.page]);

    const getProducts = async () => {
        try {
            const response = await fetch({
                endpoint: `/users/${user?.id}/items?offset=${pagination?.offset}&limit=${pagination.limit}`,
                method: 'GET',
            });

            setProducts(response?.items);
            setPagination({
                ...pagination,
                total: response?.count || 0,
            });
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
            setProducts([]);
        }

        setIsLoading(false);
    }

    return (
        <Tr display={isOpen ? 'table-row' : 'none'}>
            <Td colSpan={20} p={4} bgColor='gray.50'>
                <ProductsTable
                    data={products || []}
                    isLoading={isLoading}
                    pagination={pagination}
                    onPaginate={(page: number) => {
                        setPagination({
                            ...pagination,
                            page: page,
                            offset: (page - 1) * pagination.limit
                        })
                    }}
                    noUi={true}
                />
            </Td>
        </Tr>
    )
}

export default UsersTable;