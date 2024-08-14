import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Box, Button, IconButton, Image, Select, Table, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconArrowMerge, IconEdit, IconHanger, IconLink, IconLoader2, IconTrash } from "@tabler/icons-react";
import { ChangeEvent, useEffect, useState } from "react";
import Confirmation from "@/components/Confirmation";
import Pagination from "@/components/Pagination";
import ProductLinks from "./ProductLinks";
import LooksTableRow from "@/components/looks/LooksTableRow";
import { PRODUCT_REVIEW_OPTIONS, ROLES } from "@/_config";
import UsersTable from "@/components/users/UsersTable";
import KeywordsPopover from "@/components/KeywordsPopover";
import formatDateTime from "@/helpers/formatDateTime";
import { changeSelectBoxColorForProductReviewStatus, handleProductReviewStatusUpdate } from "@/helpers/utils";

type ProductsTableProps = {
    data: any,
    isLoading: boolean,
    pagination?: any,
    onPaginate?: (page: number) => void,
    noUi?: boolean,
    isSelectable?: boolean,
    onSelect?: (product: any) => void,
}
const ProductsTable = ({ data, isLoading, pagination, onPaginate, noUi = false, isSelectable = false, onSelect }: ProductsTableProps) => {
    const [deletingData, setDeletingData] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/items/${deletingData?.id}`,
                method: 'DELETE',
            });

            if (response) notify('Product deleted successfully', 3000);
            else notify('An error occurred', 3000);

            window?.dispatchEvent(new CustomEvent('refresh:data'));
            setDeletingData({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsDeleting(false);
    }

    return (
        <>

            {/* Table */}
            <Box className={!noUi ? 'table-responsive' : ''}>
                <Table
                    variant='simple'
                    colorScheme="gray"
                >
                    <Thead display={noUi && isLoading ? 'none' : 'table-header-group'}>
                        <Tr>
                            <Th>Image</Th>
                            <Th>Brand</Th>
                            <Th>Name</Th>
                            <Th>Style</Th>
                            <Th>Platform</Th>
                            <Th textAlign='center'>Links</Th>
                            <Th textAlign='center'>Looks</Th>
                            <Th textAlign='center'>Creators</Th>
                            <Th textAlign='center'>Price</Th>
                            <Th textAlign='center'>Submission Date</Th>
                            <Th textAlign='center'>Review</Th>
                            <Th textAlign='center' color='green.500'>Clickouts</Th>
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
                                        onDelete={(id: string) => setDeletingData(id)}
                                        isSelectable={isSelectable}
                                        onSelect={onSelect}
                                    />)
                        }
                    </Tbody>
                </Table>
            </Box>

            {/* Delete Dialog */}
            <Confirmation
                isOpen={!!deletingData?.id}
                text={`Are you sure you want to delete <strong>${deletingData?.name}</strong>? You can't undo this action afterwards.`}
                isProcessing={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setDeletingData({})}
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

type TableRowProps = {
    item: any,
    isSelectable?: boolean,
    onSelect?: (product: any) => void,
    onDelete: (id: string) => void,
}
const TableRow = ({ item, isSelectable = false, onSelect, onDelete }: TableRowProps) => {
    const [links, setLinks] = useState<any[] | null>(null);
    const [looks, setLooks] = useState<any[] | null>(null);
    const [isCreatorsVisible, setIsCreatorsVisible] = useState<boolean>(false);

    const handleOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    const alphaLink = item?.links?.find((link: any) => link?.linkType === 'ALPHA');
    const productPrice = parseFloat(alphaLink?.price || item?.price || 0).toFixed(2);
    const productDiscountPrice = parseFloat(alphaLink?.discountPrice || item?.dealPrice || 0).toFixed(2);
    const productDiscountPercentage = parseFloat(productDiscountPrice) < parseFloat(productPrice)
        ? ((alphaLink?.discountPrice || item?.dealPrice) ? ((parseFloat(productDiscountPrice) - parseFloat(productPrice)) / parseFloat(productPrice)) * 100 : 0).toFixed(0)
        : '100';

    if(!item) return null;

    return (
        <>
            <Tr>
                <Td>
                    {
                        item?.originalImageLink
                            ? <Box
                                position='relative'
                                textAlign='center'
                                width={28}
                            >
                                <Image
                                    src={item?.squareImageLink}
                                    width={28}
                                    height='auto'
                                    objectFit='cover'
                                    alt={item?.name}
                                    rounded='md'
                                    cursor='pointer'
                                    loading="lazy"
                                    onClick={() => handleOpenImage(item?.originalImageLink)}
                                    onError={(e: any) => {
                                        e.target.src = '/images/cover-placeholder.webp';
                                        e.target.onerror = null;
                                    }}
                                />

                                {
                                    parseInt(productDiscountPercentage) !== 0
                                        ? <Tag
                                            position='absolute'
                                            top='0'
                                            right='0'
                                            bgColor='black'
                                            color='white'
                                            rounded='md'
                                            size='sm'
                                        >{productDiscountPercentage}%</Tag>
                                        : null
                                }
                            </Box>
                            : <>
                                <Text>{item?.name || '-'}</Text>
                                {
                                    parseInt(productDiscountPercentage) !== 0
                                        ? <Tag
                                            bgColor='black'
                                            color='white'
                                            rounded='md'
                                            size='sm'
                                        >{productDiscountPercentage}%</Tag>
                                        : null
                                }
                            </>
                    }
                </Td>
                <Td width={40}>
                    {
                        item?.brand?.pictureURL
                            ? <Image
                                src={item?.brand?.smallPictureURL}
                                width={28}
                                height='auto'
                                objectFit='cover'
                                alt={item?.brand?.name}
                                loading="lazy"
                                rounded='md'
                                cursor='pointer'
                                onClick={() => handleOpenImage(item?.brand?.pictureURL)}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            : item?.brand?.name || '-'
                    }
                </Td>
                <Td>{item?.name || '-'}</Td>
                <Td>{item?.style?.label || '-'}</Td>
                <Td>{item?.isShopify ? 'Shopify' : 'General'}</Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='View Links'
                        variant='solid'
                        rounded='full'
                        size='sm'
                        icon={<IconLink size={22} />}
                        onClick={() => {
                            setLooks(null);
                            setIsCreatorsVisible(false);

                            if(links === null) setLinks(item?.links || [item?.link] || []);
                            else setLinks(null);
                        }}
                    />
                </Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='View Looks'
                        variant='solid'
                        rounded='full'
                        size='sm'
                        icon={<IconHanger size={22} />}
                        onClick={() => {
                            setLinks(null);
                            setIsCreatorsVisible(false);

                            if(looks === null) setLooks(item?.looks || []);
                            else setLooks(null);
                        }}
                    />
                </Td>
                <Td textAlign='center'>
                    <IconButton
                        aria-label='View Creators'
                        variant='solid'
                        rounded='full'
                        size='sm'
                        icon={<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m22.704 9.9692h-1.7885c0.4254 1.4997 0.4681 3.0822 0.1241 4.6027-0.3439 1.5205-1.0635 2.9305-2.093 4.1011-0.2496-1.0966-0.7521-2.1198-1.4676-2.9876-0.7154-0.8679-1.6238-1.5564-2.6527-2.0107 0.6404-0.583 1.0895-1.3462 1.2882-2.1892s0.1377-1.7264-0.1749-2.5341c-0.3126-0.80771-0.8622-1.502-1.5767-1.9916-0.7145-0.48958-1.5603-0.75158-2.4264-0.75158s-1.712 0.262-2.4264 0.75158c-0.71445 0.48959-1.2641 1.1838-1.5767 1.9916-0.31261 0.80772-0.37357 1.6911-0.17487 2.5341 0.19871 0.843 0.64778 1.6062 1.2882 2.1892-1.0289 0.4543-1.9373 1.1429-2.6527 2.0107-0.71541 0.8679-1.218 1.891-1.4676 2.9876-1.3299-1.5167-2.1326-3.4235-2.2878-5.4348-0.15523-2.0112 0.34536-4.0186 1.4268-5.7214 1.0814-1.7029 2.6854-3.0095 4.5718-3.7242 1.8863-0.71471 3.9535-0.799 5.8918-0.24026v-1.7906c-0.8495-0.20272-1.7199-0.30482-2.5932-0.30418-2.1876 1.9e-4 -4.326 0.64903-6.1448 1.8645s-3.2364 2.9429-4.0736 4.964c-0.83712 2.0211-1.0562 4.245-0.62945 6.3905 0.42672 2.1456 1.48 4.1164 3.0268 5.6633 1.5469 1.5468 3.5178 2.6001 5.6633 3.0268 2.1456 0.4268 4.3695 0.2077 6.3905-0.6294 2.0211-0.8371 3.7486-2.2547 4.964-4.0736 1.2155-1.8188 1.8643-3.9572 1.8645-6.1448 5e-4 -0.8581-0.0981-1.7134-0.2938-2.5489l7e-4 -7e-4zm-13.332 0.5337c0-0.50716 0.1504-1.0029 0.43219-1.4246 0.28176-0.42169 0.68226-0.75034 1.1509-0.94439 0.4686-0.19406 0.9842-0.2448 1.4816-0.1458 0.4974 0.09899 0.9543 0.34327 1.3129 0.70194 0.3585 0.35867 0.6027 0.81562 0.7016 1.3131 0.0988 0.4974 0.0479 1.013-0.1462 1.4815-0.1942 0.4686-0.523 0.869-0.9447 1.1507-0.4218 0.2816-0.9176 0.4319-1.4248 0.4318-0.6797-1e-3 -1.3313-0.2714-1.8119-0.7521-0.48053-0.4807-0.75081-1.1324-0.75155-1.8121zm-2.8904 9.5839c0.03918-1.4206 0.63105-2.7699 1.6497-3.7608 1.0187-0.991 2.3837-1.5454 3.8049-1.5454 1.4211 0 2.7862 0.5544 3.8049 1.5454 1.0186 0.9909 1.6105 2.3402 1.6497 3.7608-1.5874 1.1471-3.4961 1.7646-5.4546 1.7646-1.9585 0-3.8672-0.6175-5.4546-1.7646zm10.854-14.172-1.8991-1.8154 2.6194-0.37332 1.1525-2.2883 1.1531 2.2897 2.6195 0.37331-1.8977 1.8113 0.4431 2.5337-2.318-1.1953-2.3187 1.1946 0.4459-2.5303z" fill="currentColor" stroke="currentColor" strokeWidth={.1}/></svg>}
                        onClick={() => {
                            setLinks(null);
                            setLooks(null);

                            setIsCreatorsVisible(!isCreatorsVisible)
                        }}
                    />
                </Td>
                <Td textAlign='center'>
                    <Text whiteSpace='nowrap'><strong>${productPrice}</strong></Text>
                    { parseFloat(productDiscountPrice) > 0 ? <Text whiteSpace='nowrap'>Deal Price: <strong>${productDiscountPrice}</strong></Text> : null }
                </Td>
                <Td textAlign='center'>{formatDateTime(item?.createdAt, false)}</Td>
                <Td textAlign='center'>
                    <Tooltip label={PRODUCT_REVIEW_OPTIONS?.find(option => option.value === item?.reviewStatus)?.label} placement="bottom">
                        <Select
                            variant='outline'
                            size='xs'
                            rounded='full'
                            width={24}
                            background={changeSelectBoxColorForProductReviewStatus(item?.reviewStatus, 'background')}
                            isTruncated={true}
                            color={changeSelectBoxColorForProductReviewStatus(item?.reviewStatus, 'text')}
                            style={{
                                color: changeSelectBoxColorForProductReviewStatus(item?.reviewStatus, 'text'),
                            }}
                            borderColor={changeSelectBoxColorForProductReviewStatus(item?.reviewStatus, 'border')}
                            defaultValue={item?.reviewStatus}
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>  handleProductReviewStatusUpdate(event, item?.id)}
                        >{PRODUCT_REVIEW_OPTIONS?.map((option: { label: string, value: string }, index: number) => <option key={index} value={option?.value}>{option?.label}</option>)}</Select>
                    </Tooltip>
                </Td>
                <Td textAlign='center' color='green.500'>{item?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    {
                        isSelectable
                            ? <>
                                <Button
                                    variant={item?.isSelected ? 'solid' : 'outline'}
                                    colorScheme='green'
                                    size='sm'
                                    rounded='full'
                                    onClick={() => onSelect?.(item)}
                                >{item?.isSelected ? 'Selected' : 'Select'}</Button>
                            </>
                            : <>
                                <KeywordsPopover type="products" id={item?.id} />

                                <Tooltip label="Merge Products">
                                    <IconButton
                                        aria-label="Merge Products"
                                        variant='ghost'
                                        rounded='full'
                                        size='sm'
                                        ml={4}
                                        icon={<IconArrowMerge size={22} />}
                                        onClick={() => window.dispatchEvent(new CustomEvent('drawer:merge-products', { detail: { product: item } }))}
                                    />
                                </Tooltip>

                                <Tooltip label="Edit">
                                    <IconButton
                                        aria-label="Edit"
                                        variant='ghost'
                                        rounded='full'
                                        size='sm'
                                        ml={4}
                                        icon={<IconEdit size={22} />}
                                        onClick={() => window.dispatchEvent(new CustomEvent('action:product-drawer', { detail: { product: item } }))}
                                    />
                                </Tooltip>

                                <Tooltip label="Delete">
                                    <IconButton
                                        aria-label='Delete'
                                        variant='ghost'
                                        colorScheme='red'
                                        rounded='full'
                                        size='sm'
                                        ml={4}
                                        icon={<IconTrash size={22} />}
                                        onClick={() => onDelete(item)}
                                    />
                                </Tooltip>
                            </>
                        }
                </Td>
            </Tr>

            {/* Product Links */}
            {
                links !== null
                    ? <Tr bgColor='gray.50'>
                        <Td colSpan={20}>
                            <ProductLinks
                                links={links || []}
                                productId={item?.id}
                                onSave={(links: any) => {
                                    setLinks(null);
                                    item.links = links;
                                }}
                                onCancel={() => setLinks(null)}
                            />
                        </Td>
                    </Tr>
                : null
            }

            {/* Product Creators */}
            {
                <ProductCreators
                    isOpen={isCreatorsVisible}
                    productId={item?.id}
                />
            }

            {/* Looks */}
            <Tr display={looks !== null ? 'table-row' : 'none'}>
                <Td colSpan={20} p={4} bgColor='gray.50'>
                    <Table>
                        <Thead>
                            <Tr>
                                <Th>Thumbnail</Th>
                                <Th>Creator</Th>
                                <Th textAlign='center'>Created At</Th>
                                <Th textAlign='center'>Platform</Th>
                                <Th textAlign='center'>Featured</Th>
                                <Th textAlign='center'>Priority</Th>
                                <Th textAlign='center'>Splash Index</Th>
                                <Th textAlign='center' color='blue.500'>Incoming Discovers</Th>
                                <Th textAlign='center'>Status</Th>
                                <Th textAlign='right' color='blue.500'>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {
                                looks?.length
                                    ? looks?.map((look: any, index: number) => <LooksTableRow
                                        key={index}
                                        item={look}
                                        isUserChangeAllowed={false}
                                        showStatus={true}
                                        isProductExpandAllowed={false}
                                    />)
                                    : <Tr>
                                        <Td colSpan={20} textAlign='center'>
                                            <Text fontStyle='italic' opacity={0.5}>Not featured in any look</Text>
                                        </Td>
                                    </Tr>
                            }
                        </Tbody>
                    </Table>
                </Td>
            </Tr>
        </>
    )
}

const ProductCreators = ({ isOpen, productId }: { isOpen: boolean, productId: number }) => {
    const [creators, setCreators] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if(!isOpen) {
            setCreators(null);
            setIsLoading(true);
        } else {
            getCreators();

            window?.addEventListener('refresh:data', getCreators);

            return () => window?.removeEventListener('refresh:data', getCreators);
        }
    }, [isOpen]);

    const getCreators = async () => {
        setIsLoading(true);

        try {
            const response = await fetch({
                endpoint: `/items/${productId}/creators`,
                method: 'GET',
            });

            setCreators(response);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsLoading(false);
    }

    return (
        <Tr display={isOpen ? 'table-row' : 'none'}>
            <Td colSpan={20} p={4} bgColor='gray.50'>
                <UsersTable
                    isLoading={isLoading}
                    userType={ROLES.CREATOR}
                    noUi={true}
                    data={creators || []}
                    // pagination
                    // onPaginate,
                    hasActions={true}
                />
            </Td>
        </Tr>
    )
}

export default ProductsTable;