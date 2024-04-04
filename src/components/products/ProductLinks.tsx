import { Button, Flex, IconButton, Input, Select, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import { IconArrowDown, IconArrowUp, IconCornerDownRight, IconDeviceFloppy, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

type LookProductsProps = {
    links: any;
    onSave: (links: any) => void;
}
const ProductLinks = ({ links, onSave }: LookProductsProps) => {
    const [editedLinks, setEditedLinks] = useState<any>(links)

    useEffect(() => {
        setEditedLinks(links)
    }, [links]);

    const handleLinkChange = (e: any, index: number) => {
        const newLinks = [...editedLinks];
        newLinks[index] = e.target.value;
        setEditedLinks(newLinks);
    }

    const handleAddNew = () => {
        setEditedLinks([...editedLinks, ''])
    }

    const handleRemove = (index: number) => {
        const newLinks = [...editedLinks];
        newLinks.splice(index, 1);
        setEditedLinks(newLinks);
    }

    const handleMoveUp = (index: number) => {
        const newLinks = [...editedLinks];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index - 1, 0, removed);
        setEditedLinks(newLinks);
    }

    const handleMoveDown = (index: number) => {
        const newLinks = [...editedLinks];
        const [removed] = newLinks.splice(index, 1);
        newLinks.splice(index + 1, 0, removed);
        setEditedLinks(newLinks);
    }

    return (
        <>
            <Table>
                <Tbody>
                    {
                        editedLinks?.map((link: any, index: number) => <Tr key={index}>
                            <Td width='30px' textAlign='left'>
                                <IconCornerDownRight size={20} />
                            </Td>
                            <Td>
                                <Input
                                    type='text'
                                    placeholder='Link'
                                    variant='solid'
                                    borderWidth={1}
                                    borderColor='gray.100'
                                    px={6}
                                    size='sm'
                                    rounded='full'
                                    value={link}
                                    onChange={(e) => handleLinkChange(e, index)}
                                />
                            </Td>
                            <Td>
                                <Select
                                    variant='solid'
                                    borderWidth={1}
                                    borderColor='gray.100'
                                    size='sm'
                                    rounded='full'
                                >
                                    <option value='GAAN'>GAAN</option>
                                    <option value='creator-affiliate'>⭐ Creator Affiliate</option>
                                    <option value='Basic'>Basic</option>
                                    <option value='None'>None</option>
                                </Select>
                            </Td>
                            <Td>
                                <Select
                                    variant='solid'
                                    borderWidth={1}
                                    borderColor='gray.100'
                                    size='sm'
                                    rounded='full'
                                >
                                    <option value='alpha'>👑 Alpha</option>
                                    <option value='backup'>Backup</option>
                                </Select>
                            </Td>
                            <Td maxWidth='200px'>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder='Price'
                                    variant='solid'
                                    borderWidth={1}
                                    borderColor='gray.100'
                                    px={6}
                                    size='sm'
                                    rounded='full'
                                />
                            </Td>
                            <Td maxWidth='200px'>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder='Discount Price'
                                    variant='solid'
                                    borderWidth={1}
                                    borderColor='gray.100'
                                    px={6}
                                    size='sm'
                                    rounded='full'
                                />
                            </Td>
                            <Td textAlign='right' whiteSpace='nowrap'>
                                <IconButton
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
                                />

                                <IconButton
                                    aria-label='Delete'
                                    variant='ghost'
                                    colorScheme='red'
                                    rounded='full'
                                    size='sm'
                                    ml={4}
                                    icon={<IconTrash size={22} />}
                                    onClick={() => handleRemove(index)}
                                />
                            </Td>
                        </Tr>)
                    }
                </Tbody>
            </Table>

            {/* Actions */}
            <Flex alignItems='center' justifyContent='space-between' mt={4}>
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
                    onClick={() => onSave(editedLinks)}
                >Save</Button>
            </Flex>
        </>
    )
}

export default ProductLinks;