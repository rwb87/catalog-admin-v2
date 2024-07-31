import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, IconButton, Image, Select, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr } from "@chakra-ui/react";
import { IconArrowMerge, IconCornerDownRight, IconEdit, IconLink, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import ProductLinks from "@/components/products/ProductLinks";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import notify from "@/helpers/notify";
import fetch from "@/helpers/fetch";
import KeywordsPopover from "@/components/KeywordsPopover";
import formatDateTime from "@/helpers/formatDateTime";
import { changeSelectBoxColorForProductReviewStatus } from "@/helpers/utils";

type BrandProductsProps = {
    brand: any;
    products: any;
    onSave: (products: any) => void;
}
const BrandProducts = ({ brand, products, onSave }: BrandProductsProps) => {
    const [editedProducts, setEditedProducts] = useState<any>([]);
    const [editingData, setEditingData] = useState<any>({});

    useEffect(() => {
        const newProducts = JSON.parse(JSON.stringify(products));
        setEditedProducts(newProducts);
    }, [products]);

    const handleOnOpenImage = (link: string) => {
        window?.dispatchEvent(new CustomEvent('lightcase', { detail: { image: link } }));
    }

    return (
        <>
            <Table>
                <Thead>
                    <Tr>
                        <Th>#</Th>
                        <Th>Image</Th>
                        <Th>Name</Th>
                        <Th>Style</Th>
                        <Th>Platform</Th>
                        <Th textAlign='center'>Links</Th>
                        <Th textAlign='center'>Price</Th>
                        <Th textAlign='center'>Submission Date</Th>
                        <Th textAlign='center'>Reviewed</Th>
                        <Th textAlign='center'>Clickouts</Th>
                        <Th textAlign='right'>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        !editedProducts?.length
                            ? <Tr>
                                <Td colSpan={20} textAlign='center'>
                                    <Text fontStyle='italic' opacity={0.5}>NO PRODUCT AVAILABLE</Text>
                                </Td>
                            </Tr>
                            : editedProducts?.map((product: any) => <Product
                                key={product?.id}
                                product={product}
                                brand={brand}
                                handleOnOpenImage={handleOnOpenImage}
                                onEdit={(data: any) => setEditingData(data)}
                            />)
                        }
                </Tbody>
            </Table>

            {/* Update Product */}
            <UpdateProductDrawer
                data={{
                    ...editingData,
                    brand: brand,
                    brandId: brand?.id,
                }}
                onClose={() => setEditingData({})}
                onSave={(product: any) => {
                    const newProducts = [...editedProducts];
                    const index = newProducts.findIndex((p: any) => p?.id === product?.id);
                    newProducts[index] = product;
                    setEditedProducts(newProducts);
                    onSave?.(newProducts);
                    setEditingData({})
                }}
            />

            {/* Remove Product Prompt */}
            <ProductDeleteConfirmation />

            {/* Actions */}
            {/* <Flex alignItems='center' justifyContent='space-between' mt={4}>
                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconPlus size={20} />}
                    onClick={handleAddNew}
                >Add</Button>

                <Button
                    variant='solid'
                    colorScheme='green'
                    size='sm'
                    leftIcon={<IconDeviceFloppy size={20} />}
                >Save</Button>
            </Flex> */}
        </>
    )
}

type ProductProps = {
    product: any;
    brand: any;
    handleOnOpenImage: (link: string) => void;
    onEdit?: (product: any) => void;
}
const Product = ({ product, handleOnOpenImage, onEdit }: ProductProps) => {
    const [links, setLinks] = useState<any[] | null>(null);

    useEffect(() => {
        const closeLinks = () => {
            setLinks(null);
        }

        window.addEventListener('refresh:creator-changed', closeLinks);

        return () => {
            window.removeEventListener('refresh:creator-changed', closeLinks);
        }
    }, []);

    const handleRemove = () => {
        window.dispatchEvent(new CustomEvent('confirmation:remove-product-from-brand', { detail: { product: product } }));
    }

    return (
        <>
            <Tr key={product?.id}>
                <Td width='30px' textAlign='left'>
                    <IconCornerDownRight size={20} />
                </Td>
                <Td>

                    {
                        product?.originalImageLink
                            ? <Image
                                src={product?.squareImageLink}
                                alt={product?.name}
                                width={20}
                                height={28}
                                objectFit='contain'
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={() => handleOnOpenImage(product?.originalImageLink)}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            : '-'
                    }
                </Td>
                <Td>{product?.name || '-'}</Td>
                <Td>{product?.style?.label || '-'}</Td>
                <Td>{product?.isShopify ? 'Shopify' : 'General'}</Td>
                <Td textAlign='center'>
                    {
                        <IconButton
                            aria-label='View Links'
                            variant='ghost'
                            rounded='full'
                            size='sm'
                            icon={<IconLink size={22} />}
                            onClick={() => {
                                if(links === null) setLinks(product?.links || [product?.link] || []);
                                else setLinks(null);
                            }}
                        />
                    }
                </Td>
                <Td textAlign='center'>
                    <Text><strong>${parseFloat(product?.price || 0)?.toFixed(2)}</strong></Text>
                    { product?.dealPrice ? <Text>Deal Price: <strong>${parseFloat(product?.dealPrice)?.toFixed(2)}</strong></Text> : null }
                </Td>
                <Td textAlign='center'>{formatDateTime(product?.createdAt, false)}</Td>
                <Td textAlign='center'>
                    <Select
                        variant='solid'
                        size='xs'
                        rounded='full'
                        width={24}
                        background={changeSelectBoxColorForProductReviewStatus(product?.reviewStatus)}
                        isTruncated={true}
                        color='white'
                        style={{
                            color: 'white',
                        }}
                        defaultValue={product?.reviewStatus}
                        onChange={(event: any) => {
                            const { value } = event.target;

                            event.target.style.backgroundColor = changeSelectBoxColorForProductReviewStatus(value);
                            window.dispatchEvent(new CustomEvent('action:change-product-review-status', { detail: { productId: product?.id, reviewStatus: value } }))
                        }}
                    >   
                        <option value=""></option>
                        <option value="correct">Correct</option>
                        <option value="incorrect and updated">Incorrect and Updated</option>
                        <option value="need further review">Need further review</option>
                    </Select>
                </Td>
                <Td textAlign='center' color='green.500'>{product?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    <KeywordsPopover type="products" id={product?.id} />

                    <Tooltip label="Merge Products">
                        <IconButton
                            aria-label="Merge Products"
                            variant='ghost'
                            rounded='full'
                            size='sm'
                            ml={4}
                            icon={<IconArrowMerge size={22} />}
                            onClick={() => window.dispatchEvent(new CustomEvent('drawer:merge-products', { detail: { product: product } }))}
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
                            onClick={() => onEdit?.(product)}
                        />
                    </Tooltip>

                    {/* <IconButton
                        aria-label='Move Up'
                        variant='ghost'
                        colorScheme='blue'
                        rounded='full'
                        size='sm'
                        icon={<IconArrowUp size={22} />}
                        onClick={() => handleMoveUp(index)}
                    />

                    <IconButton
                        aria-label='Move Down'
                        variant='ghost'
                        colorScheme='blue'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconArrowDown size={22} />}
                        onClick={() => handleMoveDown(index)}
                    /> */}

                    <Tooltip label="Delete">
                        <IconButton
                            aria-label='Delete'
                            variant='ghost'
                            colorScheme='red'
                            rounded='full'
                            size='sm'
                            ml={4}
                            icon={<IconTrash size={22} />}
                            onClick={handleRemove}
                        />
                    </Tooltip>
                </Td>
            </Tr>

            {/* Product Links */}
            {
                links !== null
                    ? <Tr bgColor='gray.100'>
                        <Td colSpan={20}>
                            <ProductLinks
                                links={links}
                                productId={product?.id}
                                onCancel={() => setLinks(null)}
                                onSave={(links: any) => {
                                    product.links = links;
                                    setLinks(null);
                                }}
                            />
                        </Td>
                    </Tr>
                    : null
            }
        </>
    )
}

const ProductDeleteConfirmation = () => {
    const cancelRef = useRef<any>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingType, setProcessingType] = useState<'delete' | 'remove' | null>(null);
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        const handleRemoveProduct = (event: any) => {
            const product = event?.detail?.product;

            if(product?.id === undefined) return;

            setProduct(product);
            setIsOpen(true);
        }

        window.addEventListener('confirmation:remove-product-from-brand', handleRemoveProduct);

        return () => {
            window.removeEventListener('confirmation:remove-product-from-brand', handleRemoveProduct);
        }
    }, [product]);

    const handleCancel = () => {
        setIsOpen(false);
        setProduct(null);
    }

    const handleRemoveFromBrand = async () => {
        setIsProcessing(true);
        setProcessingType('remove');

        try {
            await fetch({
                endpoint: `/items/${product?.id}`,
                method: 'PUT',
                data: {
                    brandId: null,
                }
            });

            notify('Product removed from the brand successfully');
            window.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error) {
            console.log(error);
            notify('Could not remove the product from the brand');
        }

        setIsOpen(false);
        setProduct(null);
        setIsProcessing(false);
        setProcessingType(null);
    }

    const handleDeletePermanently = async() => {
        setIsProcessing(true);
        setProcessingType('delete');

        try {
            await fetch({
                endpoint: `/items/${product?.id}`,
                method: 'DELETE',
            });

            notify('Product deleted successfully');
            window.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error) {
            console.log(error);
            notify('Could not delete the product');
        }

        setIsOpen(false);
        setProduct(null);
        setIsProcessing(false);
        setProcessingType(null);
    }

    return (
        <AlertDialog
            leastDestructiveRef={cancelRef}
            onClose={handleCancel}
            isOpen={isOpen}
            isCentered
            closeOnOverlayClick={!isProcessing}
            closeOnEsc={!isProcessing}
            size='2xl'
        >
            <AlertDialogOverlay />

            <AlertDialogContent>

                <AlertDialogHeader>Remove product</AlertDialogHeader>

                <AlertDialogCloseButton isDisabled={isProcessing}/>

                <AlertDialogBody>Do you want to remove <b>{product?.name || '-'}</b> from the brand <b>{product?.brand?.name || '-'}</b> or completely delete it?</AlertDialogBody>

                <AlertDialogFooter justifyContent='space-between'>
                    <Button
                        ref={cancelRef}
                        variant='ghost'
                        size='sm'
                        isDisabled={isProcessing}
                        onClick={handleCancel}
                    >Nevermind</Button>

                    <Box>
                        <Button
                            colorScheme='purple'
                            size='sm'
                            ml={4}
                            isDisabled={isProcessing}
                            isLoading={processingType === 'remove' && isProcessing}
                            loadingText='Removing...'
                            onClick={handleRemoveFromBrand}
                        >Remove from brand</Button>

                        <Button
                            colorScheme='red'
                            size='sm'
                            ml={4}
                            isDisabled={isProcessing}
                            isLoading={processingType === 'delete' && isProcessing}
                            loadingText='Deleting...'
                            onClick={handleDeletePermanently}
                        >Permanently delete</Button>
                    </Box>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default BrandProducts;