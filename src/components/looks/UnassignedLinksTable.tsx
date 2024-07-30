import { Box, Flex, Grid, IconButton, Input, Tooltip } from "@chakra-ui/react"
import { IconArrowMerge, IconCornerDownRight, IconPlus, IconTrash } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import Confirmation from "@/components/Confirmation"
import fetch from "@/helpers/fetch"
import notify from "@/helpers/notify"
import CustomDrawer from "@/components/Drawer"
import ProductsTable from "@/components/products/ProductsTable"
import { encodeAmpersand } from "@/helpers/utils"

type UnassignedLinksTableProps = {
    look: any,
    links: string[],
}
export default function UnassignedLinksTable({ look, links }: UnassignedLinksTableProps) {
    const [unassignedLinks, setUnassignedLinks] = useState<string[]>(links)
    const [deletingIndex, setDeletingIndex] = useState<number>(-1)
    const [creatingProduct, setCreatingProduct] = useState({
        link: '',
        index: -1,
    })
    const [mergingProduct, setMergingProduct] = useState({
        isOpen: false,
        index: -1,
        link: '',
        product: null,
    })
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    useEffect(() => {
        setUnassignedLinks(JSON.parse(JSON.stringify(links || [])));
    }, [links]);

    const handleCreateNewProduct = async () => {
        if(creatingProduct?.index < 0) return;

        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/looks/${look.id}/product-using-link`,
                method: 'POST',
                data: {
                    link: creatingProduct?.link,
                    linkIndex: creatingProduct?.index,
                }
            })

            const newLinks = unassignedLinks.filter((link: string, index: number) => index !== creatingProduct?.index)
            setUnassignedLinks(newLinks);

            notify('New product created successfully');
            window?.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error) {
            console.error(error);
            notify('Something went wrong while creating the product');
        }

        setCreatingProduct({ link: '', index: -1 });
        setIsProcessing(false);
    }

    const handleMergeLinks = async () => {
        if(mergingProduct?.index < 0) return;

        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/looks/${look.id}/products/${mergingProduct?.product?.id}/attach-product-link-to-look`,
                method: 'POST',
                data: {
                    link: mergingProduct?.link,
                    linkIndex: mergingProduct?.index,
                }
            })

            const newLinks = unassignedLinks.filter((link: string, index: number) => index !== mergingProduct?.index)
            setUnassignedLinks(newLinks);

            notify('Product merged successfully');
            window?.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error) {
            console.error(error);
            notify('Something went wrong while merging the product');
        }

        setMergingProduct({ link: '', index: -1, product: null, isOpen: false });
        setIsProcessing(false);
    }

    const handleDeleteLink = async () => {
        if(deletingIndex < 0) return;

        setIsProcessing(true);

        const newLinks = unassignedLinks.filter((link: string, index: number) => index !== deletingIndex)

        try {
            await fetch({
                endpoint: `/looks/${look.id}`,
                method: 'PUT',
                data: {
                    unassignedLinks: JSON.stringify(newLinks)
                }
            })

            notify('Link deleted successfully');
            setUnassignedLinks(newLinks);
            window?.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error) {
            console.error(error);
            notify('Something went wrong while deleting the link');
        }

        setDeletingIndex(-1);
        setIsProcessing(false);
    }

    return (
        <>
            <Grid gap={4}>
                {
                    unassignedLinks?.length
                        ? unassignedLinks?.map((link: any, index: number) => <Row
                            key={index}
                            index={index}
                            link={link}
                            onCreate={(link: string, index: number) => setCreatingProduct({ link: link, index: index })}
                            onMerge={(link: string, index: number) => setMergingProduct({ ...mergingProduct, index: index, link: link, isOpen: true, })}
                            onDelete={(index: number) => setDeletingIndex(index)}
                        />)
                        : null
                }
            </Grid>

            {/* Create new empty product Confirmation */}
            <Confirmation
                isOpen={creatingProduct?.index > -1}
                isProcessing={isProcessing}
                title='Create empty product'
                text={`Do you want to create a new empty product with the link <b>${creatingProduct.link}</b> and attach it to this look?`}
                confirmText="Yes, create"
                processingConfirmText="Creating..."
                isDangerous={false}
                onConfirm={handleCreateNewProduct}
                onCancel={() => setCreatingProduct({ link: '', index: -1 })}
            />

            {/* Merge product drawer */}
            <SearchAndMergeProductDrawer
                isOpen={mergingProduct?.isOpen}
                onSelect={(product: any) => setMergingProduct({ ...mergingProduct, product: product, isOpen: false, })}
                onClose={() => setMergingProduct({ link: '', index: -1, product: null, isOpen: false })}
            />

            {/* Merge product confirmation */}
            <Confirmation
                isOpen={mergingProduct?.index > -1 && mergingProduct?.product}
                isProcessing={isProcessing}
                title='Merge product links'
                text={`Do you want to merge the product <b>${mergingProduct?.product?.name}</b> with the link <b>${mergingProduct?.link}</b> and attach it to this look?`}
                confirmText="Yes, merge"
                processingConfirmText="Merging..."
                isDangerous={false}
                onConfirm={handleMergeLinks}
                onCancel={() => setMergingProduct({ link: '', index: -1, product: null, isOpen: false })}
            />

            {/* Delete Link Confirmation */}
            <Confirmation
                isOpen={deletingIndex > -1}
                isProcessing={isProcessing}
                title='Delete link'
                text={`Are you sure you want to delete <b>${unassignedLinks[deletingIndex]}</b> ?`}
                onConfirm={handleDeleteLink}
                onCancel={() => setDeletingIndex(-1)}
            />
        </>
    )
}

type RowProps = {
    index: number,
    link: string,
    onCreate: (link: string, index: number) => void,
    onMerge: (link: string, index: number) => void,
    onDelete: (index: number) => void,
}
const Row = ({ index, link, onCreate, onMerge, onDelete }: RowProps) => {
    const [updatedLink, setUpdatedLink] = useState<string | null>(link);

    useEffect(() => {
        setUpdatedLink(link);
    }, [link]);

    return (
        <Flex
            direction='row'
            gap={4}
            justifyContent='space-between'
            alignItems='center'
        >
            <IconCornerDownRight size={20} />

            <Input
                type='text'
                placeholder='Link'
                variant='solid'
                borderWidth={1}
                borderColor='gray.100'
                px={6}
                size='sm'
                rounded='full'
                autoComplete="off"
                required={true}
                name='link'
                value={updatedLink ?? ''}
                onChange={(e) => setUpdatedLink(e.target.value)}
            />

            {/* Actions */}
            <Flex
                direction='row'
                gap={4}
                alignItems='center'
            >
                {/* Create New Product */}
                <Tooltip label="Create new product">
                    <IconButton
                        aria-label='Create new product'
                        variant='ghost'
                        colorScheme='green'
                        rounded='full'
                        size='sm'
                        icon={<IconPlus size={22} />}
                        onClick={() => onCreate(updatedLink, index)}
                    />
                </Tooltip>

                {/* Merge to an existing product */}
                <Tooltip label="Merge to an existing product">
                    <IconButton
                        aria-label='Merge to an existing product'
                        variant='ghost'
                        colorScheme='blue'
                        rounded='full'
                        size='sm'
                        icon={<IconArrowMerge size={22} />}
                        onClick={() => onMerge(updatedLink, index)}
                    />
                </Tooltip>

                {/* Delete */}
                <Tooltip label="Delete">
                    <IconButton
                        aria-label='Delete'
                        variant='ghost'
                        colorScheme='red'
                        rounded='full'
                        size='sm'
                        icon={<IconTrash size={22} />}
                        onClick={() => onDelete(index)}
                    />
                </Tooltip>
            </Flex>
        </Flex>
    )
}

type SearchAndMergeProductDrawerProps = {
    isOpen: boolean,
    onSelect: (product: any) => void,
    onClose: (item?: any, openCreateDrawer?: boolean) => void,
}
const SearchAndMergeProductDrawer = ({ isOpen = false, onSelect, onClose }: SearchAndMergeProductDrawerProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState([]);

    useEffect(() => {
        if(!isOpen) return;

        setSearchTerm('');
        setData([]);
    }, [isOpen]);

    useEffect(() => {
        if(!isOpen) return;

        setIsLoading(true);

        const debounce = setTimeout(() => getData(), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, isOpen]);

    const getData = async () => {
        if(!isOpen) return;

        setIsLoading(true);

        try {
            const response = await fetch({
                endpoint: `/items?offset=0&limit=50&search=${encodeAmpersand(searchTerm)}`,
                method: 'GET',
            });

            setData(response?.items);
        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    }

    const handleSelect = (item: any) => {
        const newData = data.filter(d => d.id !== item.id);

        setData([
            newData,
            {
                ...item,
                isSelected: true,
            }
        ]);

        onSelect(item);
    }

    return (
        <CustomDrawer
            isOpen={isOpen}
            title='Search product'
            placement="bottom"
            onClose={() => onClose?.()}
        >
            <Flex
                direction='row'
                alignItems='center'
                gap={4}
            >
                <Input
                    type="text"
                    placeholder='Search products by product or brand name...'
                    onChange={(e: any) => setSearchTerm(e?.target?.value)}
                />
            </Flex>

            <Box mt={4}>
                <ProductsTable
                    isLoading={isLoading}
                    data={data}
                    isSelectable={true}
                    onSelect={handleSelect}
                />
            </Box>
        </CustomDrawer>
    )
}