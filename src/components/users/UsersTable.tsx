import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Flex, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { IconEdit, IconLoader2, IconMail, IconTrash } from "@tabler/icons-react";
import Pagination from "@/components/Pagination";
import moment from "moment";
import { ROLES } from "@/_config";
import { useEffect, useState } from "react";
import LooksTableRow from "../looks/LooksTableRow";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";

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
    pagination: any;
    onPaginate: (page: number) => void;
    hasActions?: boolean;
    onEdit?: (user: any) => void;
    onDelete?: (user: any) => void;
}
const UsersTable = (props: UsersTableProps) => {
    const {
        isLoading = false,
        userType = ROLES.ADMIN,
        data = [],
        pagination,
        onPaginate,
        hasActions = true,
        onEdit,
        onDelete,
    } = props;

    const [editingData, setEditingData] = useState<any>({});
    const [brand, setBrand] = useState<any>({});

    useEffect(() => {
        const openProductToModify = (event: any) => {
            const { product = null, brand = null } = event.detail;

            if(!product || !brand) return;

            setEditingData(product);
            setBrand(brand);
        }

        window?.addEventListener('action:edit-product', openProductToModify);

        return () => window?.removeEventListener('action:edit-product', openProductToModify);
    }, []);

    return (
        <>
            <Box className="table-responsive">
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead>
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
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

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
    const [isLoading, setIsLoading] = useState(false);
    const [looks, setLooks] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 20,
        total: 0,
    });

    const onClickLooksCount = () => {
        setIsLooksExpanded(!isLooksExpanded);
    }

    useEffect(() => {
        setLooks([]);

        if(isLooksExpanded) {
            setIsLoading(true);
            getLooks();

            window?.addEventListener('refresh:looks', getLooks);

            return () => window?.removeEventListener('refresh:looks', getLooks);
        }
    }, [isLooksExpanded, pagination.page]);

    const getLooks = async () => {
        if(!isLooksExpanded) return [];

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
        <>
            <Tr>
                <Td>
                    <Flex alignItems='center'>
                        <Avatar
                            size='sm'
                            mr={2}
                            name={user?.username}
                            src={user?.pictureURL}
                        />
                        {user?.username || '-'}
                    </Flex>
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
                                icon={<Text>{user?.looksCount || 0}</Text>}
                                px={2}
                                onClick={() => onClickLooksCount?.(user)}
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

            <Tr display={isLooksExpanded ? 'table-row' : 'none'}>
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
        </>
    )
}

export default UsersTable;