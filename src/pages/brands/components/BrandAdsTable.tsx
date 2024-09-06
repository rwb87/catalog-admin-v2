import fetch from "@/helpers/fetch";
import formatDateTime from "@/helpers/formatDateTime";
import notify from "@/helpers/notify";
import { Box, Flex, Table, Tbody, Td, Text, Th, Thead, Tr , IconButton, Tooltip } from "@chakra-ui/react";
import { IconLoader2, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type TableProps = {
    brandId: string;
}
export default function BrandAdsTable({ brandId }: TableProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch({ endpoint: `/campaigns/advertisements/${brandId}` });
                setData(response?.ads);
            } catch (error: any) {
                console.error(error);
                notify(error.message, 'error');
            }

            setIsLoading(false);
        }

        getData();

        window.addEventListener('reload:brand-ads', getData);

        return () => {
            window.removeEventListener('reload:brand-ads', getData);
        }
    }, [brandId]);

    const handleOpenImage = (imageUrl: string) => {
        window.dispatchEvent(new CustomEvent('lightcase', { detail: { image: imageUrl } }))
    }

    const renderStatus = (status: string) => {
        switch (status) {
            case 'active': return <Text fontWeight='semibold' color='green.500'>Active</Text>;
            case 'inactive': return <Text fontWeight='semibold' color='red.500'>Inactive</Text>;
            default: return <Text fontWeight='semibold' color='green.500'>Active</Text>;
        }
    }

    return (
        <Box>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Picture</Th>
                        <Th>Title</Th>
                        <Th textAlign='center'>Call to Action</Th>
                        <Th textAlign='center'>Status</Th>
                        <Th textAlign='center'>Added By</Th>
                        <Th textAlign='center'>Added At</Th>
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
                                ? <Tr><Td colSpan={20} textAlign='center'>No advertisement</Td></Tr>
                                : data?.map((item: any) => (
                                    <Tr key={item?.id}>
                                        <Td>
                                            <img
                                                src={item?.thumbnailUrl}
                                                alt={item?.title}
                                                width={70}
                                                style={{
                                                    borderRadius: '0.375rem',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleOpenImage(item?.imageUrl)}
                                            />
                                        </Td>
                                        <Td>
                                            <Tooltip label={item?.description} placement="bottom">
                                                <Text>{item?.title}</Text>
                                            </Tooltip>
                                        </Td>
                                        <Td textAlign='center'>{item?.callToAction}</Td>
                                        <Td textAlign='center'>{renderStatus(item?.status)}</Td>
                                        <Td textAlign='center'>{item?.user?.name || '-'}</Td>
                                        <Td textAlign='center'>{formatDateTime(item?.createdAt)}</Td>
                                        <Td>
                                            <Flex justifyContent='flex-end' alignItems='center' gap={2}>
                                                <IconButton
                                                    aria-label='Delete'
                                                    variant='ghost'
                                                    colorScheme='red'
                                                    rounded='full'
                                                    size='sm'
                                                    icon={<IconTrash size={22} />}
                                                    onClick={() => window?.dispatchEvent(new CustomEvent('confirmation:brand:advertisements:delete', { detail: { ...item, brandId: brandId } }))}
                                                />
                                            </Flex>
                                        </Td>
                                    </Tr>
                                ))
                    }
                </Tbody>
            </Table>
        </Box>
    )
}