import { useAuthGuard } from "@/providers/AuthProvider";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Box, Button, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, Select, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { IconLoader2, IconMail, IconPhoto, IconSearch } from "@tabler/icons-react";
import { encodeAmpersand } from "@/helpers/utils";
import { useNavigate } from "react-router-dom";
import { Content } from "@/layouts/app.layout";
import Pagination from "@/components/Pagination";
import moment from "moment";
import Confirmation from "@/components/Confirmation";
import Avatar from "@/components/Avatar";

const IncomingCreatorsView = () => {
    const routeTo = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [users, setUsers] = useState<any>([]);
    const [search, setSearch] = useState<string>('');

    const [pagination, setPagination] = useState({
        page: 1,
        offset: 0,
        limit: 50,
        total: 0,
    });

    useAuthGuard('auth');

    useEffect(() => {
        setIsLoading(true);

        getData();

        window?.addEventListener('refresh:data', getData);

        return () => window?.removeEventListener('refresh:data', getData);
    }, [pagination?.offset]);

    useEffect(() => {
        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [search]);

    const getData = async () => {
        try {
            const response = await fetch({
                endpoint: `/users/become-creator?&limit=${pagination.limit}&offset=${pagination.offset}&search=${encodeAmpersand(search)}`,
                method: 'GET',
            });
            setUsers(response?.users);
            setPagination({
                ...pagination,
                total: response?.count,
            })
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }

        setIsLoading(false);
    }

    const handleChangeCreatorsType = (event: any) => {
        const { value } = event.target;

        if (value === 'NORMAL') routeTo('/creators');
    }

    return (
        <Content activePage="Creators">

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
                    <h1 className="page-heading">Creators</h1>

                    <Box
                        display={{
                            base: 'none',
                            lg: 'contents'
                        }}
                        fontWeight='bold'
                        fontSize={{
                            base: '10px',
                            '2xl': '12px',
                        }}
                        whiteSpace='break-spaces'
                    >

                        {/* Switch between live and incoming requests */}
                        <Select
                            variant='outline'
                            width={{
                                base: 'full',
                                lg: 32,
                            }}
                            size='sm'
                            rounded='full'
                            bgColor='white'
                            borderWidth={2}
                            borderColor='gray.100'
                            fontWeight='medium'
                            defaultValue='CREATOR_REQUESTS'
                            onChange={handleChangeCreatorsType}
                        >
                            <option value='NORMAL'>Live</option>
                            <option value='CREATOR_REQUESTS'>Incoming</option>
                        </Select>
                    </Box>
                </Flex>

                {/* Search */}
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
                </Flex>
            </Flex>

            {/* Table */}
            <UsersTable
                isLoading={isLoading}
                data={users}
                pagination={pagination}
                onPaginate={(page: number) => {
                    setPagination({
                        ...pagination,
                        page: page,
                        offset: (page - 1) * pagination.limit,
                    })
                }}
            />
        </Content>
    )
}

type UsersTableProps = {
    data: any,
    pagination: any,
    onPaginate: (page: number) => void,
    isLoading: boolean,
}
const UsersTable = ({ data, pagination, onPaginate, isLoading }: UsersTableProps) => {
    return (
        <>
            <Box className='table-responsive'>
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead>
                        <Tr>
                            <Th>Photos</Th>
                            <Th>Shopper</Th>
                            <Th textAlign='center'>Email</Th>
                            <Th>Message</Th>
                            <Th textAlign='center'>Appeals</Th>
                            <Th>Location</Th>
                            <Th>Height</Th>
                            <Th>Submitted On</Th>
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
                                    ? <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>NO RESULT</Text>
                                        </Td>
                                    </Tr>
                                    : data.map((item: any) => <TableRow
                                        key={item?.id}
                                        item={item}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

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

type TableRowProps = {
    item: any,
}
const TableRow = ({ item }: TableRowProps) => {
    const [isImagesExpanded, setIsImagesExpanded] = useState<boolean>(false);
    const [images, setImages] = useState<any>([]);
    const [status, setStatus] = useState<null | 'approved' | 'rejected' | 'pending'>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const handleExpandImages = () => {
        if(!isImagesExpanded) {
            setImages(item?.photos);
            setIsImagesExpanded(true);
        } else {
            setImages([]);
            setIsImagesExpanded(false);
        }
    }

    const handleUpdateStatus = async () => {
        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/users/become-creator/status`,
                method: 'POST',
                data: {
                    requestId: item?.id,
                    status: status,
                }
            });

            notify('Status updated successfully');
            window?.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }

        setStatus(null);
        setIsProcessing(false);
    }

    const thumbnailImage = useMemo(() => {
        if(item?.thumbnailImage) return item?.thumbnailImage;

        // Sort the images with orderIndex
        if(item?.photos?.length) return item?.photos?.[0] || '/images/cover-placeholder.webp';

        // Return a placeholder image
        return '/images/cover-placeholder.webp';
    }, [item?.thumbnailImage, item?.photos]);

    return (
        <>
            <Tr>
                <Td>
                    {
                        <Box
                            width={20}
                            height={28}
                            position='relative'
                        >
                            <Image
                                src={thumbnailImage}
                                width='full'
                                height='full'
                                objectFit='cover'
                                alt={item?.name}
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={handleExpandImages}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />

                            {item?.photos?.length > 1 && <Box position='absolute' right={0} top={0} pointerEvents='none'><IconPhoto color="white" /></Box>}
                        </Box>
                    }
                </Td>
                <Td>
                    <Tooltip label={item?.user?.description || null} aria-label='Username' placement='bottom'>
                        <Flex alignItems='center'>
                            <Avatar user={item?.user} />
                        </Flex>
                    </Tooltip>
                </Td>
                <Td textAlign='center'>
                    {
                        item?.user?.email
                            ? <IconButton
                                aria-label='Email'
                                variant='ghost'
                                rounded='full'
                                size='sm'
                                icon={<IconMail size={22} />}
                                onClick={() => window.open(`mailto:${item?.user?.email}`)}
                            />
                            : '-'
                    }
                </Td>
                <Td maxWidth='300px'>{item?.message || '-'}</Td>
                <Td textAlign='center' textTransform='capitalize'>{item?.user?.gender || '-'}</Td>
                <Td textTransform='capitalize'>{item?.user?.location || '-'}</Td>
                <Td>{ (typeof item?.user?.heightFeet !== 'undefined' && item?.user?.heightFeet !== null && item?.user?.heightFeet !== '') ? item?.user?.heightFeet + '.' + item?.user?.heightInch + 'ft' : '-'}</Td>
                <Td>{moment(new Date(item?.createdAt)).format('MMM DD, YYYY')}</Td>
                <Td textAlign='right'>
                    <Button
                        size='sm'
                        colorScheme='green'
                        variant='solid'
                        onClick={() => setStatus('approved')}
                    >Approve</Button>

                    <Button
                        size='sm'
                        colorScheme='red'
                        variant='solid'
                        ml={2}
                        onClick={() => setStatus('rejected')}
                    >Reject</Button>
                </Td>
            </Tr>

            {/* Photos */}
            <Tr
                display={isImagesExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <Photos images={images} />
                </Td>
            </Tr>

            {/* Confirm status */}
            <Tr
                display={isImagesExpanded ? 'table-row' : 'none'}
                bgColor='gray.50'
            >
                <Td colSpan={20}>
                    <Confirmation
                        isOpen={status !== null && status !== 'pending'}
                        isProcessing={isProcessing}
                        title='Confirmation'
                        html={
                            <Text>
                                Are you sure you want to <b>{status === 'approved' ? 'approve' : 'reject'}</b> this request?
                            </Text>
                        }
                        cancelText='Nevermind'
                        confirmText='Yes, update'
                        processingConfirmText='Saving...'
                        isDangerous={status === 'rejected'}
                        onConfirm={handleUpdateStatus}
                        onCancel={() => setStatus(null)}
                    />
                </Td>
            </Tr>
        </>
    )
}

type PhotosProps = {
    images: any
}
const Photos = ({ images }: PhotosProps) => {
    const handleOnOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <Flex
            direction='row'
            gap={2}
            wrap='nowrap'
            alignItems='center'
            justifyContent='space-between'
            width='100%'
        >
            <Flex
                direction='row'
                gap={2}
                wrap='nowrap'
            >

                {/* Images */}
                {
                    images?.map((image: any, index: number) => {
                        return (
                            <Box
                                key={image ?? index}
                                height={28}
                                width={20}
                                cursor='pointer'
                                onClick={() => handleOnOpenImage(image)}
                            >
                                <Image
                                    src={image}
                                    alt={`Image ${index}`}
                                    height='full'
                                    width='full'
                                    objectFit='cover'
                                    rounded='md'
                                    pointerEvents='none'
                                    zIndex={5}
                                    loading='eager'
                                />
                            </Box>
                        )
                    })
                }
            </Flex>
        </Flex>
    )
}

export default IncomingCreatorsView;