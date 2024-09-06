import { BRAND_ROLES } from "@/_config";
import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import { Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr , IconButton, Button } from "@chakra-ui/react";
import { IconEdit, IconLoader2, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type TableProps = {
    brandId: string;
}
export default function BrandMembersTable({ brandId }: TableProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch({ endpoint: `/campaigns/users/list/${brandId}` });
                setData(response?.users);
            } catch (error: any) {
                console.error(error);
                notify(error.message, 'error');
            }

            setIsLoading(false);
        }

        getData();

        window.addEventListener('reload:brand-members', getData);

        return () => {
            window.removeEventListener('reload:brand-members', getData);
        }
    }, [brandId]);

    const renderRole = (role: string) => {
        switch (role) {
            case BRAND_ROLES.ADMIN: return <Text fontWeight='semibold' color='green.500'>Admin</Text>;
            case BRAND_ROLES.CREATIVE: return <Text fontWeight='semibold' color='blue.500'>Creative</Text>;
            case BRAND_ROLES.FINANCE: return <Text fontWeight='semibold' color='red.500'>Finance</Text>;
            default: return <Text fontWeight='semibold' color='blue.500'>Creative</Text>;
        }
    }

    const renderStatus = (status: string) => {
        switch (status) {
            case 'pending': return <Text fontWeight='semibold' color='yellow.500'>Pending</Text>;
            case 'accepted': return <Text fontWeight='semibold' color='green.500'>Active</Text>;
            case 'rejected': return <Text fontWeight='semibold' color='red.500'>Inactive</Text>;
            default: return <Text fontWeight='semibold' color='yellow.500'>Pending</Text>;
        }
    }

    return (
        <Box>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Joined At</Th>
                        <Th>Authority</Th>
                        <Th>Status</Th>
                        <Th textAlign='right'>Actions</Th>
                    </Tr>
                </Thead>
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
                                ? <Tr><Td colSpan={20} textAlign='center'>No member</Td></Tr>
                                : data?.map((item: any) => (
                                    <Tr key={item?.id}>
                                        <Td>{item?.name}</Td>
                                        <Td>{item?.email}</Td>
                                        <Td>{renderRole(item?.role)}</Td>
                                        <Td>{formatDateTime(item?.createdAt)}</Td>
                                        <Td>{item?.invitedBy === 'super_admin' ? 'Super Admin' : 'Brand Admin'}</Td>
                                        <Td>{renderStatus(item?.invitationStatus)}</Td>
                                        <Td>
                                            <Flex justifyContent='flex-end' alignItems='center' gap={2}>
                                                <IconButton
                                                    aria-label='Edit'
                                                    variant='ghost'
                                                    rounded='full'
                                                    size='sm'
                                                    icon={<IconEdit size={22} />}
                                                    onClick={() => window?.dispatchEvent(new CustomEvent('drawer:brand:members:edit', { detail: { ...item, brandId: brandId } }))}
                                                />
                                                <IconButton
                                                    aria-label='Delete'
                                                    variant='ghost'
                                                    colorScheme='red'
                                                    rounded='full'
                                                    size='sm'
                                                    icon={<IconTrash size={22} />}
                                                    onClick={() => window?.dispatchEvent(new CustomEvent('confirmation:brand:members:delete', { detail: { ...item, brandId: brandId } }))}
                                                />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))
                    }
                </Tbody>
            </Table>

            <Button
                mt={4}
                colorScheme='green'
                size='sm'
                onClick={() => window?.dispatchEvent(new CustomEvent('drawer:brand:members:invite', { detail: { brandId } }))}
            >
                <IconPlus size={22} />
                Add Member
            </Button>
        </Box>
    )
}