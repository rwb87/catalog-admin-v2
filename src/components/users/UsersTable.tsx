import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Flex, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { IconEdit, IconLoader2, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Pagination from "../Pagination";

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
        limit: 15,
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
                            <Th>Username</Th>
                            <Th>Email</Th>
                            <Th>Gender</Th>
                            {
                                userType === 'creator' && <>
                                    <Th textAlign='center'>Looks</Th>
                                    <Th>Venmo</Th>
                                    <Th textAlign='center'>Earnings</Th>
                                    <Th textAlign='center'>Pending</Th>
                                </>
                            }
                            {
                                userType === 'shopper' && <>
                                    <Th textAlign='center'>Invited</Th>
                                </>
                            }
                            <Th>Created At</Th>
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
                                                    {
                                                        userType === 'admin' && <Avatar
                                                            size='sm'
                                                            mr={2}
                                                            name={user?.username}
                                                            src={user?.pictureURL}
                                                        />
                                                    }
                                                    {user?.username || '-'}
                                                </Flex>
                                            </Td>
                                            <Td>{user?.email || '-'}</Td>
                                            <Td textTransform='capitalize'>{user?.gender || '-'}</Td>
                                            {
                                                userType === 'creator' && <>
                                                    <Td textAlign='center'>{user?.looksCount || 0}</Td>
                                                    <Td>{user?.venmoHandle || '-'}</Td>
                                                    <Td textAlign='center'>${parseFloat(user?.currentEarnings).toFixed(2) || 0}</Td>
                                                    <Td textAlign='center'>${parseFloat(user?.currentPending).toFixed(2) || 0}</Td>
                                                </>
                                            }
                                            {
                                                userType === 'shopper' && <>
                                                    <Td textAlign='center'>{user?.invitations?.length || 0}</Td>
                                                </>
                                            }
                                            <Td>{formatDateTime(user?.createdAt, false)}</Td>
                                            <Td textAlign='center'>
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
                                                    (userType !== 'admin' && typeof onDelete === 'function') && <IconButton
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