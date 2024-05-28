import { Box, Button, Flex, Grid, Heading, IconButton, Input } from "@chakra-ui/react";
import SettingsLayout from "./layout";
import fetch from "@/helpers/fetch";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import notify from "@/helpers/notify";

const SettingsViewAffiliateLinks = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        setIsLoading(true);
        getData();
    }, []);

    const getData = async () => {
        try {
            const response = await fetch({ endpoint: '/settings/affiliate-links' });

            setData(response);
            if(!response?.length) handleAddNewRow();

        } catch (error) {
            console.error(error);
            notify('Something went wrong. Please try again later.');
        }

        setIsLoading(false);
    }

    const handleChange = (index: number, key: string, value: any) => {
        const newData = JSON.parse(JSON.stringify(data || []));

        newData[index] = {
            ...newData[index],
            [key]: value,
        }

        setData(newData);
    }

    const handleRemove = (index: number) => {
        const newData = JSON.parse(JSON.stringify(data || []));
        newData.splice(index, 1);

        setData(newData);
    }

    const handleAddNewRow = () => {
        const newData = JSON.parse(JSON.stringify(data || []));
        newData.push({
            id: null,
            link: '',
        });

        setData(newData);
    }

    const handleSave = async () => {
        setIsSaving(true);

        try {
            await fetch({
                endpoint: '/settings/affiliate-links',
                method: 'POST',
                data: data
            });

            notify('Links saved successfully');
        } catch (error) {
            notify('An error occurred while saving links');
        }

        setIsSaving(false);
    }

    return (
        <SettingsLayout isLoading={isLoading}>
            <Box p={4}>
                <Heading as='h2' size='sm' mb={2}>Creator Affiliate Links</Heading>
                <Heading as='h3' size='xs' fontWeight='normal'>If submitted product links contains any of these following links, they will trigger Creator Affiliate.</Heading>

                {/* Rows */}
                <Grid
                    templateColumns='1fr'
                    gap={4}
                    mt={4}
                >
                    {
                        data.map((row: any, index: number) => <Row
                            key={index}
                            value={row?.url}
                            description={row?.description}
                            onChangeUrl={(value: string) => handleChange(index, 'url', value)}
                            onChangeDescription={(value: string) => handleChange(index, 'description', value)}
                            onRemove={() => handleRemove(index)}
                        />)
                    }
                </Grid>

                {/* Actions */}
                <Flex
                    mt={4}
                    justifyContent='space-between'
                    gap={4}
                    alignItems='center'
                >
                    <Button
                        variant='solid'
                        colorScheme='gray'
                        size='sm'
                        width={60}
                        type='button'
                        isDisabled={isSaving}
                        onClick={handleAddNewRow}
                    >Add new link</Button>

                    <Button
                        variant='solid'
                        colorScheme='green'
                        size='sm'
                        width={60}
                        type='submit'
                        isLoading={isSaving}
                        isDisabled={isSaving}
                        loadingText='Saving...'
                        onClick={handleSave}
                    >Save Changes</Button>
                </Flex>
            </Box>
        </SettingsLayout>
    )
}

type RowProps = {
    value: string;
    description: string | null;
    onChangeUrl: (value: string) => void;
    onChangeDescription: (value: string) => void;
    onRemove: () => void;
}
const Row = ({ value, description, onChangeUrl, onChangeDescription, onRemove }: RowProps) => {
    return (
        <Flex gap={4}>
            <Input
                type="url"
                placeholder="https://www.amazon.com/dp/B073Y5Y37X"
                name="link"
                width="full"
                autoComplete="off"
                value={value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeUrl(e.target.value)}
            />

            <Input
                type="text"
                placeholder="Description about the link (Optional)"
                name="link"
                width="full"
                autoComplete="off"
                value={description || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeDescription(e.target.value)}
            />

            <IconButton
                aria-label="Delete"
                variant="ghost"
                colorScheme="red"
                rounded="full"
                icon={<IconTrash size={20} />}
                onClick={() => onRemove?.()}
            />
        </Flex>
    )
}

export default SettingsViewAffiliateLinks;