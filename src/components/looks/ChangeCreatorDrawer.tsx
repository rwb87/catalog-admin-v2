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
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const handleEvent = (event: any) => {
            const { detail } = event;

            if(!detail || !detail?.look || !detail?.look?.user) return;

            setLook(detail?.look);
            setSelectedCreator(detail?.look?.user);
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

        try {
            const response = await fetch({
                method: 'PUT',
                endpoint: `/looks/${look?.id}/change-creator`,
                data: {
                    user: selectedCreator
                }
            });

            if(response) notify('Creator changed successfully');
            else notify('Could not change creator');
        } catch (error) {
            notify('Could not change creator');
        }

        setIsLoading(false);
        setLook({});
        setSelectedCreator({});
        window?.dispatchEvent(new CustomEvent('refresh:data'));
    }

    const getCreators = async () => {
        // if(searchTerm?.trim() === '') return;

        setIsSearching(true);

        try {
            const response = await fetch({
                endpoint: `/users?type=${ROLES.CREATOR}&search=${encodeAmpersand(searchTerm)}&order=name,asc`,
                method: 'GET',
            });
            setCreators(response?.users);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsSearching(false);
    }

    return (
        <CustomDrawer
            isOpen={!!look?.id}
            onClose={() => {
                setLook({});
                setSelectedCreator({});
                setSearchTerm('');
            }}
            title="Change Look Creator"
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