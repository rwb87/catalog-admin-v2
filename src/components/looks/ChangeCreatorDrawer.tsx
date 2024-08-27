import { ROLES } from "@/_config";
import CustomDrawer from "@/components/Drawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { encodeAmpersand } from "@/helpers/utils";
import { Button, Flex, Grid, Input, Text } from "@chakra-ui/react";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

const ChangeCreatorDrawer = () => {
    const [creators, setCreators] = useState<any[]>([]);
    const [selectedCreator, setSelectedCreator] = useState<any>({});
    const [look, setLook] = useState<any>({});
    const [productLink, setProductLink] = useState<any>({});
    const [type, setType] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleEvent = (event: any) => {
            const { look = undefined, link = undefined } = event?.detail as any;

            if(look === undefined && look?.user === undefined && link === undefined && link?.user === undefined) return;

            if(look) setLook(look);
            if(link) setProductLink(link);

            setType(look !== undefined ? 'look' : 'product');
            setSelectedCreator(look?.user || link?.user || {});
        }

        window.addEventListener('drawer:change-creator', handleEvent);

        return () => {
            window.removeEventListener('drawer:change-creator', handleEvent);
        }
    }, []);

    useEffect(() => {
        const debounce = setTimeout(() => getCreators(), 500);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    const handleSubmitChangeCreator = async () => {
        setIsLoading(true);

        const endpoint = type === 'look'
            ? `/looks/${look?.id}/change-creator`
            : `/items/links/${productLink?.id}/change-assignee`;

        try {
            const response = await fetch({
                method: 'PUT',
                endpoint: endpoint,
                data: {
                    user: selectedCreator
                }
            });

            if(type === 'look') {
                if(response) notify('Creator changed successfully');
                else notify('Could not change creator');
            }
            if(type === 'product') {
                if(response) notify('Assignee changed successfully');
                else notify('Could not change Assignee');
            }
        } catch (error) {
            if(type === 'look') notify('Could not change creator');
            if(type === 'product') notify('Could not change Assignee');
        }

        setIsLoading(false);
        setLook({});
        setProductLink({});
        setSelectedCreator({});
        setType('');
        window?.dispatchEvent(new CustomEvent('refresh:data'));
        window?.dispatchEvent(new CustomEvent('refresh:creator-changed'));
    }

    const getCreators = async () => {
        setIsSearching(true);

        try {
            const response = await fetch({
                endpoint: `/users?type=${ROLES.CREATOR}&search=${encodeAmpersand(searchTerm)}&order=name,asc`,
                method: 'GET',
            });
            setCreators(response?.users);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }

        setIsSearching(false);
    }

    return (
        <CustomDrawer
            isOpen={!!look?.id || !!productLink?.id}
            onClose={() => {
                setLook({});
                setProductLink({});
                setSelectedCreator({});
                setType('');
                setSearchTerm('');
            }}
            title={type === 'look' ? 'Change look creator' : 'Change link assignee'}
            isProcessing={isLoading}
            processingText="Saving..."
            onSubmit={handleSubmitChangeCreator}
        >
            <Input
                placeholder='Search creator...'
                mb={4}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            { isSearching && <IconLoader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /> }
            { !isSearching && !creators?.length && <Text textAlign='center' opacity={0.5} fontStyle='italic'>No creators found</Text> }

            {
                !isSearching && creators?.length
                    ? <Grid
                        templateColumns='repeat(1fr)'
                        gap={4}
                    >
                        {
                            creators.map((creator: any) => (
                                <Flex
                                    key={creator?.id}
                                    alignItems='center'
                                    justifyContent='space-between'
                                    gap={2}
                                    width='full'
                                    p={2}
                                    rounded='md'
                                    transition='background-color 0.2s'
                                    _hover={{
                                        bg: 'gray.50'
                                    }}
                                >
                                    <Flex alignItems='center' gap={2}>
                                        <Avatar
                                            user={creator}
                                            name={creator?.username}
                                            size="2rem"
                                        />
                                    </Flex>

                                    <Button
                                        size='sm'
                                        rounded='full'
                                        colorScheme='green'
                                        variant={selectedCreator?.id === creator?.id ? 'solid' : 'outline'}
                                        onClick={() => setSelectedCreator(creator)}
                                    >{selectedCreator?.id === creator?.id ? 'Selected' : 'Select'}</Button>
                                </Flex>
                            ))
                        }
                    </Grid>
                    : null
            }
        </CustomDrawer>
    )
}

export default ChangeCreatorDrawer;