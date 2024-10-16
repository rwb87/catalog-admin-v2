import { ROLES } from "@/_config";
import Avatar from "@/components/Avatar";
import Confirmation from "@/components/Confirmation";
import CustomDrawer from "@/components/Drawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { encodeAmpersand } from "@/helpers/utils";
import { Button, Flex, Grid, Input, InputGroup, InputLeftAddon, Text } from "@chakra-ui/react";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BiDollar } from "react-icons/bi";

export default function CreatePayoutDrawer() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [users, setUsers] = useState<any>([]);
    const [selectedCreator, setSelectedCreator] = useState<any>(null);
    const [amount, setAmount] = useState<number | null>(null);

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        setIsSearching(true);

        const debounce = setTimeout(() => { getUsers() }, 500);
        return () => clearTimeout(debounce);
    }, [searchTerm]);

    useEffect(() => {
        window.addEventListener('drawer:create-payout', () => setIsOpen(true));

        return () => window.removeEventListener('drawer:create-payout', () => setIsOpen(true));
    }, []);

    const getUsers = async () => {
        try {
            const response = await fetch({
                endpoint: `/users`,
                method: 'GET',
                params: {
                    type: ROLES.CREATOR,
                    isLive: 1,
                    search: encodeAmpersand(searchTerm),
                    order: 'name,asc'
                }
            });

            const filteredUsers = response?.users.filter((user: any) => user?.isPayoutActive);
            setUsers(filteredUsers);
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message);
        }

        setIsSearching(false);
    }

    const onSelectCreator = (creator: any) => {
        setSelectedCreator(creator);
        setIsOpen(false);
    }

    const handleCreatePayout = async () => {
        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/earnings/payout`,
                method: 'POST',
                data: {
                    userId: selectedCreator?.id,
                    amount: amount
                }
            });

            notify('Payout created successfully', 'success');
            window.dispatchEvent(new CustomEvent('refresh:data'));
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message || 'An error occurred');
        }

        setIsProcessing(false);
        setSelectedCreator(null);
        setAmount(null);
    }

    return (
        <>
            <CustomDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title='Create Payout'
            >
                <Input
                    placeholder='Search creator...'
                    mb={4}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                { isSearching && <IconLoader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /> }
                { !isSearching && !users?.length && <Text textAlign='center' opacity={0.5} fontStyle='italic'>No creators found</Text> }

                {
                    !isSearching && users?.length
                        ? <Grid
                            templateColumns='repeat(1fr)'
                            gap={4}
                        >
                            {
                                users.map((creator: any) => (
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
                                            variant='outline'
                                            onClick={() => onSelectCreator(creator)}
                                        >Select</Button>
                                    </Flex>
                                ))
                            }
                        </Grid>
                        : null
                }
            </CustomDrawer>

            <Confirmation
                isOpen={selectedCreator?.id !== undefined}
                isProcessing={isProcessing}
                title="Create Payout"
                html={
                    <>
                        <label>Enter the amount to be paid to <strong>{selectedCreator?.username}</strong>.</label>
                        <InputGroup mt={2}>
                            <InputLeftAddon><BiDollar /></InputLeftAddon>
                            <Input
                                placeholder='Amount'
                                type='number'
                                min={0}
                                step={0.01}
                                required
                                value={amount || ''}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                            />
                        </InputGroup>
                    </>
                }
                cancelText="Cancel"
                confirmText="Create Payout"
                processingConfirmText="Creating..."
                isDangerous={false}
                onCancel={() => setSelectedCreator(null)}
                onConfirm={handleCreatePayout}
            />
        </>
    )
}