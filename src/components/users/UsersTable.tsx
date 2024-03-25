import formatDateTime from "@/helpers/formatDateTime";
import { Avatar, Box, Flex, IconButton, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { IconChevronLeft, IconChevronRight, IconEdit, IconLoader2, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

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

    const limit = 15;
    const totalPages = Math.ceil(data.length / limit);
    const [page, setPage] = useState<number>(1);

    const reconstructedData = data?.length > limit ? data.slice((page - 1) * limit, page * limit) : data;

    useEffect(() => {
        setPage(1);
    }, [totalPages]);

    return (
        <>
            <Box className="table-responsive">
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead>
                        <Tr>
                            {/* {
                                (userType === 'admin' || userType === 'shopper') && <>
                                    <Th>Name</Th>
                                </>
                            } */}
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
            <Flex
                justifyContent='center'
                alignItems='center'
                mt={4}
                mb={4}
            >
                {
                    data.length > limit && (
                        <Box>
                            <IconButton
                                aria-label='Previous'
                                variant='ghost'
                                colorScheme='gray'
                                rounded='full'
                                size='sm'
                                icon={<IconChevronLeft size={22} />}
                                onClick={() => setPage(page - 1)}
                                isDisabled={page === 1}
                            />

                            {Array.from({ length: Math.ceil(data.length / limit) }, (_, index) => (
                                <IconButton
                                    key={index}
                                    aria-label={`Page ${index + 1}`}
                                    variant='ghost'
                                    colorScheme='gray'
                                    rounded='full'
                                    size='sm'
                                    ml={2}
                                    isActive={page === index + 1}
                                    icon={<Text fontWeight='bold'>{index + 1}</Text>}
                                    onClick={() => setPage(index + 1)}
                                />
                            ))}

                            <IconButton
                                aria-label='Next'
                                variant='ghost'
                                colorScheme='gray'
                                rounded='full'
                                size='sm'
                                icon={<IconChevronRight size={22} />}
                                onClick={() => setPage(page + 1)}
                                isDisabled={page === Math.ceil(data.length / limit)}
                            />
                        </Box>
                    )
                }
            </Flex>
        </>
    )
}

export default UsersTable;