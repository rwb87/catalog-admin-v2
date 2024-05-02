import { IconButton, Image, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { IconCornerDownRight, IconEdit, IconLink, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import ProductLinks from "@/components/products/ProductLinks";
import UpdateProductDrawer from "@/components/products/UpdateProductDrawer";
import Confirmation from "@/components/Confirmation";
import notify from "@/helpers/notify";
import fetch from "@/helpers/fetch";

type BrandProductsProps = {
    brand: any;
    products: any;
    onSave: (products: any) => void;
}
const BrandProducts = ({ brand, products, onSave }: BrandProductsProps) => {
    const [editedProducts, setEditedProducts] = useState<any>([]);
    const [editingData, setEditingData] = useState<any>({});
    const [deletingProduct, setDeletingProduct] = useState<any>({});
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const newProducts = JSON.parse(JSON.stringify(products));
        setEditedProducts(newProducts);
    }, [products]);

    const handleRemove = (product: any) => {
        setDeletingProduct(product);
    }

    const handleRemoveConfirm = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch({
                endpoint: `/items/${deletingProduct?.id}`,
                method: 'PUT',
                data: {
                    brandId: null,
                }
            });

            if(response) {
                const newProducts = editedProducts.filter((p: any) => p?.id !== deletingProduct?.id);
                setEditedProducts(newProducts);
                onSave?.(newProducts);
            } else {
                notify('Failed to remove product from brand');
            }
        } catch (error) {
            notify('Failed to remove product from brand');
        }

        setIsDeleting(false);
    }

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
                        <Th>Brand</Th>
                        <Th>Name</Th>
                        <Th>Style</Th>
                        <Th textAlign='center'>Links</Th>
                        <Th textAlign='center'>Price</Th>
                        <Th textAlign='center'>Clickouts</Th>
                        <Th textAlign='right'>Actions</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {
                        editedProducts?.map((product: any) => <Product
                            key={product?.id}
                            product={product}
                            brand={brand}
                            handleOnOpenImage={handleOnOpenImage}
                            onEdit={(data: any) => setEditingData(data)}
                            onRemove={handleRemove}
                        />
                    )}
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
            <Confirmation
                isOpen={!!deletingProduct?.id}
                text={`Are you sure you want to remove <strong>${deletingProduct?.name}</strong> from this the brand <strong>${brand?.name}</strong>?`}
                isProcessing={isDeleting}
                confirmText="Yes, Remove from brand"
                onConfirm={() => handleRemoveConfirm()}
                onCancel={() => setDeletingProduct({})}
            />

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
    onRemove?: (product: any) => void;
}
const Product = ({ product, brand, handleOnOpenImage, onEdit }: ProductProps) => {
    const [links, setLinks] = useState<any[] | null>(null);

    return (
        <>
            <Tr key={product?.id}>
                <Td width='30px' textAlign='left'>
                    <IconCornerDownRight size={20} />
                </Td>
                <Td>

                    {
                        product?.pictureURL
                            ? <Image
                                src={product?.pictureURL}
                                alt={product?.name}
                                width={20}
                                height={28}
                                objectFit='contain'
                                rounded='md'
                                cursor='pointer'
                                loading="lazy"
                                onClick={() => handleOnOpenImage(product?.pictureURL)}
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />
                            : '-'
                    }
                </Td>
                <Td width={40}>{brand?.name || '-'}</Td>
                <Td>{product?.name || '-'}</Td>
                <Td>{product?.style || '-'}</Td>
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
                <Td textAlign='center' color='green.500'>{product?.clickouts || 0}</Td>
                <Td textAlign='right' whiteSpace='nowrap'>
                    <IconButton
                        aria-label="Edit"
                        variant='ghost'
                        rounded='full'
                        size='sm'
                        icon={<IconEdit size={22} />}
                        onClick={() => onEdit?.(product)}
                    />

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

                    {/* <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        ml={4}
                        icon={<IconTrash size={22} />}
                        onClick={() => onRemove(product)}
                    /> */}
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

export default BrandProducts;