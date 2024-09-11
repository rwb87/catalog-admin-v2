import { useEffect, useState } from "react";
import SettingsLayout from "./layout"
import { Box, Button, Flex, Heading, Input, Text } from "@chakra-ui/react";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";

const ACTIVE_SWITCH_COLOR = '#0B8494';
const INACTIVE_SWITCH_COLOR = '#C7253E';

const SettingsViewAdFrequency = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [payload, setPayload] = useState({
        full_screen_number_of_looks: null,
        full_screen_show_same_day: false,
        grad_number_of_looks: null,
        grad_show_same_day: false,
    })

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);

            const data = JSON.parse(JSON.stringify(payload));
            try {
                const response = await fetch({ endpoint: '/settings/ad-frequencies' });

                response?.map((setting: any) => {
                    if(setting?.key === 'full_screen_number_of_looks') data.full_screen_number_of_looks = parseInt(setting?.value);
                    if(setting?.key === 'full_screen_show_same_day') data.full_screen_show_same_day = parseInt(setting?.value);
                    if(setting?.key === 'grad_number_of_looks') data.grad_number_of_looks = parseInt(setting?.value);
                    if(setting?.key === 'grad_show_same_day') data.grad_show_same_day = parseInt(setting?.value);
                });

                setPayload(data);
                setIsLoading(false);
            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to fetch data. Please try again later.';

                notify(message, 'error');
            }
        }

        getData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);

        try {
            await fetch({
                endpoint: '/settings',
                method: 'POST',
                data: [
                    {
                        key: 'full_screen_number_of_looks',
                        value: payload.full_screen_number_of_looks,
                        type: 'ALL',
                    },
                    {
                        key: 'full_screen_show_same_day',
                        value: payload.full_screen_show_same_day,
                        type: 'ALL',
                    },
                    {
                        key: 'grad_number_of_looks',
                        value: payload.grad_number_of_looks,
                        type: 'ALL',
                    },
                    {
                        key: 'grad_show_same_day',
                        value: payload.grad_show_same_day,
                        type: 'ALL',
                    },
                ]
            });

            notify('Changes saved successfully.', 'success');
        } catch (error) {
            const message = error?.response?.data?.message || 'Something went wrong. Please try again later.';
            notify(message, 'error');
        }

        setIsSaving(false);
    }

    return (
        <SettingsLayout isLoading={isLoading}>
            <Box
                p={4}
                maxWidth={{
                    base: '100%',
                    lg: '660px',
                }}
            >
                <Heading as='h2' size='sm' mb={2}>Advertisement Frequency</Heading>
                <Heading as='h3' size='xs' fontWeight='normal'>Set the frequency of advertisements shown to users.</Heading>

                <Box mt={6}>
                    <Heading as='h5' size='xs'>Full Screen Advertisements</Heading>

                    <Flex gap={4} mt={4} alignItems='center'>
                        <Input
                            type="number"
                            placeholder="#"
                            name="number"
                            width={20}
                            height={10}
                            autoComplete="off"
                            textAlign='center'
                            value={payload.full_screen_number_of_looks || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayload({ ...payload, full_screen_number_of_looks: parseInt(e.target.value) })}
                        />

                        <Text flex={1}>Number of look before a full screen advertisement is shown.</Text>
                    </Flex>

                    <Flex gap={4} mt={4} alignItems='center'>
                        <Box
                            width={20}
                            textAlign='center'
                        >
                            <Box
                                width={20}
                                height={10}
                                borderWidth={1}
                                borderColor={payload.full_screen_show_same_day ? ACTIVE_SWITCH_COLOR : INACTIVE_SWITCH_COLOR}
                                display='inline-grid'
                                placeItems='center'
                                borderRadius='md'
                                background={payload.full_screen_show_same_day ? ACTIVE_SWITCH_COLOR : INACTIVE_SWITCH_COLOR}
                                color='white'
                                fontWeight='semibold'
                                cursor='pointer'
                                onClick={() => setPayload({ ...payload, full_screen_show_same_day: !payload.full_screen_show_same_day })}
                            >{payload.full_screen_show_same_day ? 'ON' : 'OFF'}</Box>
                        </Box>

                        <Text flex={1}>Do not show the same full screen advertisement twice in the same day.</Text>
                    </Flex>
                </Box>

                <Box mt={10}>
                    <Heading as='h5' size='xs'>Grad Advertisements</Heading>

                    <Flex gap={4} mt={4} alignItems='center'>
                        <Input
                            type="number"
                            placeholder="#"
                            name="number"
                            width={20}
                            height={10}
                            autoComplete="off"
                            textAlign='center'
                            value={payload.grad_number_of_looks || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayload({ ...payload, grad_number_of_looks: parseInt(e.target.value) })}
                        />

                        <Text flex={1}>Number of look before a grad advertisement is shown.</Text>
                    </Flex>

                    <Flex gap={4} mt={4} alignItems='center'>
                        <Box
                            width={20}
                            textAlign='center'
                        >
                            <Box
                                width={20}
                                height={10}
                                borderWidth={1}
                                borderColor={payload.grad_show_same_day ? ACTIVE_SWITCH_COLOR : INACTIVE_SWITCH_COLOR}
                                display='inline-grid'
                                placeItems='center'
                                borderRadius='md'
                                background={payload.grad_show_same_day ? ACTIVE_SWITCH_COLOR : INACTIVE_SWITCH_COLOR}
                                color='white'
                                fontWeight='semibold'
                                cursor='pointer'
                                onClick={() => setPayload({ ...payload, grad_show_same_day: !payload.grad_show_same_day })}
                            >{payload.grad_show_same_day ? 'ON' : 'OFF'}</Box>
                        </Box>

                        <Text flex={1}>Do not show the same grad advertisement twice in the same day.</Text>
                    </Flex>
                </Box>

                <Flex
                    mt={4}
                    justifyContent='space-between'
                    gap={4}
                    alignItems='center'
                    width='full'
                >
                    <Button
                        variant='solid'
                        colorScheme='green'
                        size='sm'
                        width='full'
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

export default SettingsViewAdFrequency;