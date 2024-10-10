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
        grid_number_of_looks: null,
        grid_show_same_day: false,
        number_of_campaigns_per_brand_at_a_time: null,
    })

    useEffect(() => {
        const getData = async () => {
            setIsLoading(true);

            try {
                const response = await fetch({ endpoint: '/settings/ad-frequencies' });

                setPayload(response);
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
                    },
                    {
                        key: 'full_screen_show_same_day',
                        value: payload.full_screen_show_same_day,
                    },
                    {
                        key: 'grid_number_of_looks',
                        value: payload.grid_number_of_looks,
                    },
                    {
                        key: 'grid_show_same_day',
                        value: payload.grid_show_same_day,
                    },
                    {
                        key: 'number_of_campaigns_per_brand_at_a_time',
                        value: payload.number_of_campaigns_per_brand_at_a_time,
                    }
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

                {/* Number of campaigns users will see from  brands at a time */}
                <Box mt={6}>
                    <Heading as='h5' size='xs'>General</Heading>

                    <Flex
                        gap={4}
                        mt={4}
                        alignItems={{
                            base: 'flex-start',
                            lg: 'center',
                        }}
                    >
                        <Input
                            type="number"
                            placeholder="#"
                            name="number"
                            width={20}
                            height={10}
                            autoComplete="off"
                            textAlign='center'
                            value={payload.number_of_campaigns_per_brand_at_a_time || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayload({ ...payload, number_of_campaigns_per_brand_at_a_time: parseInt(e.target.value) })}
                        />

                        <Box flex={1}>Number of campaigns users will see from  brands at a time.<br /><Text fontStyle='italic' fontWeight='semibold'>(EMPTY = No restriction)</Text></Box>
                    </Flex>
                </Box>

                {/* Full Screen Advertisements */}
                <Box mt={6}>
                    <Heading as='h5' size='xs'>Full Screen Advertisements</Heading>

                    <Flex
                        gap={4}
                        mt={4}
                        alignItems={{
                            base: 'flex-start',
                            lg: 'center',
                        }}
                    >
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

                    <Flex
                        gap={4}
                        mt={4}
                        alignItems={{
                            base: 'flex-start',
                            lg: 'center',
                        }}
                    >
                        <Box
                            width={20}
                            textAlign='center'
                        >
                            <Box
                                width={20}
                                height={10}
                                borderWidth={1}
                                borderColor={payload.full_screen_show_same_day ? INACTIVE_SWITCH_COLOR : ACTIVE_SWITCH_COLOR }
                                display='inline-grid'
                                placeItems='center'
                                borderRadius='md'
                                background={payload.full_screen_show_same_day ? INACTIVE_SWITCH_COLOR : ACTIVE_SWITCH_COLOR}
                                color='white'
                                fontWeight='semibold'
                                cursor='pointer'
                                onClick={() => setPayload({ ...payload, full_screen_show_same_day: !payload.full_screen_show_same_day })}
                            >{payload.full_screen_show_same_day ? 'OFF' : 'ON'}</Box>
                        </Box>

                        <Text flex={1}>Do not show the same full screen advertisement twice in the same day.</Text>
                    </Flex>
                </Box>

                {/* Grid Advertisements */}
                <Box mt={10}>
                    <Heading as='h5' size='xs'>Grid Advertisements</Heading>

                    <Flex
                        gap={4}
                        mt={4}
                        alignItems={{
                            base: 'flex-start',
                            lg: 'center',
                        }}
                    >
                        <Input
                            type="number"
                            placeholder="#"
                            name="number"
                            width={20}
                            height={10}
                            autoComplete="off"
                            textAlign='center'
                            value={payload.grid_number_of_looks || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayload({ ...payload, grid_number_of_looks: parseInt(e.target.value) })}
                        />

                        <Text flex={1}>Number of look before a grid advertisement is shown.</Text>
                    </Flex>

                    <Flex
                        gap={4}
                        mt={4}
                        alignItems={{
                            base: 'flex-start',
                            lg: 'center',
                        }}
                    >
                        <Box
                            width={20}
                            textAlign='center'
                        >
                            <Box
                                width={20}
                                height={10}
                                borderWidth={1}
                                borderColor={payload.grid_show_same_day ? INACTIVE_SWITCH_COLOR : ACTIVE_SWITCH_COLOR}
                                display='inline-grid'
                                placeItems='center'
                                borderRadius='md'
                                background={payload.grid_show_same_day ? INACTIVE_SWITCH_COLOR : ACTIVE_SWITCH_COLOR}
                                color='white'
                                fontWeight='semibold'
                                cursor='pointer'
                                onClick={() => setPayload({ ...payload, grid_show_same_day: !payload.grid_show_same_day })}
                            >{payload.grid_show_same_day ? 'OFF' : 'ON'}</Box>
                        </Box>

                        <Text flex={1}>Do not show the same grid advertisement twice in the same day.</Text>
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