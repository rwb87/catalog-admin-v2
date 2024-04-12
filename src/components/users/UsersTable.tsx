import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Flex, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { IconEdit, IconLoader2, IconMail, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";

type UsersTableProps = {
    isLoading?: boolean;
    userType: 'admin' | 'creator' | 'shopper';
    data?: any;
    hasActions?: boolean;
    onEdit?: (user: any) => void;
    onDelete?: (user: any) => void;
}
const UsersTable = (props: UsersTableProps) => {
    const {
        isLoading = false,
        userType = 'admin',
        data = [],
        hasActions = true,
        onEdit,
        onDelete,
    } = props;

    const pagination = {
        total: data?.length ?? 0,
        limit: 50,
    }
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        setPage(1);
    }, [data.length]);

    const reconstructedData = pagination.total > pagination.limit ? data.slice((page - 1) * pagination.limit, page * pagination.limit) : data;

    return (
        <>
            <Box className="table-responsive">
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead>
                        <Tr>
                            <Th textTransform='capitalize'>{userType}</Th>
                            { userType !== 'admin' && <Th>SSO</Th> }
                            <Th>Email</Th>
                            <Th>Created At</Th>
                            <Th>Gender</Th>
                            {
                                userType !== 'admin' && <>
                                    <Th>Location</Th>
                                    <Th textAlign='center'>Height</Th>
                                </>
                            }
                            {
                                userType === 'creator' && <>
                                    <Th textAlign='center'>Looks</Th>
                                    <Th textAlign='center' color='blue.500'>Incoming <br /> Discovers</Th>
                                    <Th textAlign='center' color='green.500'>Incoming <br /> Clickouts</Th>
                                </>
                            }
                            {
                                userType !== 'admin' && <>
                                    <Th textAlign='center' color='blue.500'>Outgoing <br /> Discovers</Th>
                                    <Th textAlign='center' color='green.500'>Outgoing <br /> Clickouts</Th>
                                </>
                            }
                            {
                                userType === 'creator' && <>
                                    <Th textAlign='center'>Earnings</Th>
                                </>
                            }
                            {
                                userType === 'shopper' && <>
                                    <Th textAlign='center'>Invited</Th>
                                </>
                            }
                            { hasActions && <Th textAlign='center'>Actions</Th> }
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
                                : !reconstructedData?.length
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : reconstructedData.map((user: any) => (
                                        <Tr key={user?.id}>
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
                                                userType !== 'admin' && <Td>
                                                    <IconButton
                                                        aria-label='SSO'
                                                        variant='ghost'
                                                        rounded='full'
                                                        size='sm'
                                                        icon={<img src="/icons/icon-cloud-meter.svg" alt="SSO" style={{ width: '22px' }} />}
                                                        onClick={() => window.open(`mailto:${user?.ssoEmail}`)}
                                                    />
                                                </Td>
                                            }
                                            <Td>
                                                {
                                                    user?.email
                                                        ? userType !== 'admin'
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
                                            <Td textTransform='capitalize'>{user?.gender || '-'}</Td>
                                            {
                                                userType !== 'admin' && <>
                                                    <Td textTransform='capitalize'>{user?.location || '-'}</Td>
                                                    <Td textAlign='center'>{user?.heightFeet + '.' + user?.heightInch + 'ft' || '-'}</Td>
                                                </>
                                            }
                                            {
                                                userType === 'creator' && <>
                                                    <Td textAlign='center'>{user?.looksCount || 0}</Td>
                                                    <Td textAlign='center' color='blue.500'>{user?.incomingDiscovers || 0}</Td>
                                                    <Td textAlign='center' color='green.500'>{user?.incomingClickouts || 0}</Td>
                                                </>
                                            }
                                            {
                                                userType !== 'admin' && <>
                                                    <Td textAlign='center' color='blue.500'>{user?.outgoingDiscovers || 0}</Td>
                                                    <Td textAlign='center' color='green.500'>{user?.outgoingClickouts || 0}</Td>
                                                </>
                                            }
                                            {
                                                userType === 'creator' && <>
                                                    <Td textAlign='center'>
                                                        <Text
                                                            borderWidth={2}
                                                            borderColor='green.500'
                                                            rounded='full'
                                                            py={1}
                                                            px={2}
                                                            shadow='md'
                                                            bgColor='white'
                                                        >${parseFloat(user?.currentEarnings).toFixed(2) || 0}</Text>
                                                    </Td>
                                                </>
                                            }
                                            {
                                                userType === 'shopper' && <>
                                                    <Td textAlign='center'>{user?.invitations?.length || 0}</Td>
                                                </>
                                            }
                                            {
                                                hasActions && <Td textAlign='center' whiteSpace='nowrap'>
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
                                    ))
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Pagination */}
            <Pagination
                total={pagination?.total || 0}
                limit={pagination?.limit || 0}
                page={page || 1}
                setPage={setPage}
            />
        </>
    )
}

export default UsersTable;