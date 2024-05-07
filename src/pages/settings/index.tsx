import { ROLES } from "@/_config";
import { useUser } from "@/_store";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { Content } from "@/layouts/app.layout"
import { useAuthGuard } from "@/providers/AuthProvider";
import { Box, Button, Divider, Flex, Grid, GridItem, Heading, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SETTINGS = {
    LOOK_IMAGE_SIZE: 'look_image_size',
    ITEM_IMAGE_SIZE: 'item_image_size',
    BRAND_IMAGE_SIZE: 'brand_image_size',
    USER_IMAGE_SIZE: 'user_image_size',
}

const SettingsView = () => {
    const { role } = useUser() as any;
    useAuthGuard('auth');
    const navigate = useNavigate();

    const [settings, setSettings] = useState<any>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if(role === ROLES.DATA_MANAGER) return navigate('/looks');

        getSettings();
    }, [role]);

    const getSettings = async () => {
        try {
            const response = await fetch({ endpoint: '/settings' });
            setSettings(response);
        } catch (error) {
            console.error(error);
        }
    }

    const handleChange = (type: string, key: string, value: any) => {
        let newSetting = settings?.find((setting: any) => setting?.type === type && setting?.key === key);

        newSetting = {
            ...newSetting,
            key: key,
            value: value,
            type: type,
        }

        setSettings([
            ...settings,
            newSetting,
        ]);

        console.log([
            ...settings,
            newSetting,
        ])
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        setIsSaving(true);

        try {
            await fetch({
                endpoint: '/settings',
                method: 'POST',
                data: settings,
            });

            notify('Settings saved successfully');
        } catch (error) {
            console.error(error);
            notify('An error occurred while saving settings');
        }

        setIsSaving(false);
    }

    return (
        <Content activePage="Settings">

            {/* Search and Options */}
            <Flex
                direction={{
                    base: 'column',
                    lg: 'row',
                }}
                justifyContent='space-between'
                alignItems={{
                    base: 'flex-start',
                    lg: 'center',
                }}
                mb={{
                    base: 4,
                    md: 8,
                    xl: 16,
                }}
                gap={2}
                width='full'
            >

                <h1 className="page-heading">Application Settings</h1>
            </Flex>

            {/* Body */}
            <Box
                backgroundColor='#fff'
                border='1px solid'
                borderColor='gray.100'
                rounded='lg'
            >
                <form
                    method='POST'
                    onSubmit={handleSubmit}
                    style={{
                        display: 'contents'
                    }}
                >
                    <SettingsRow
                        label="Brand Image Size (in px)"
                        description="This will change the brand image size for the mobile application"
                        placeholder='Enter size in px. e.g. "300"'
                        regex="^\d+$"
                        name={SETTINGS.BRAND_IMAGE_SIZE}
                        value={settings?.find((setting: any) => setting.key === SETTINGS.BRAND_IMAGE_SIZE && setting.type === 'MOBILE')?.value}
                        type='MOBILE'
                        onChange={handleChange}
                    />

                    <Divider />

                    <SettingsRow
                        label="Product Image Size (in px)"
                        description="This will change the product image size for the mobile application"
                        placeholder='Enter size in px. e.g. "300px"'
                        name={SETTINGS.ITEM_IMAGE_SIZE}
                        regex="^\d+$"
                        value={settings?.find((setting: any) => setting.key === SETTINGS.ITEM_IMAGE_SIZE && setting.type === 'MOBILE')?.value}
                        type='MOBILE'
                        onChange={handleChange}
                    />

                    <Divider />

                    <SettingsRow
                        label="Look Image Size (in px)"
                        description="This will change the look image size for the mobile application"
                        placeholder='Enter size in px. e.g. "300px"'
                        name={SETTINGS.LOOK_IMAGE_SIZE}
                        regex="^\d+$"
                        value={settings?.find((setting: any) => setting.key === SETTINGS.LOOK_IMAGE_SIZE && setting.type === 'MOBILE')?.value}
                        type='MOBILE'
                        onChange={handleChange}
                    />

                    <Box
                        m={4}
                        textAlign='right'
                    >
                        <Button
                            variant='solid'
                            colorScheme='green'
                            size='sm'
                            width={60}
                            type='submit'
                            isLoading={isSaving}
                            isDisabled={isSaving}
                            loadingText='Saving...'
                        >Save Changes</Button>
                    </Box>
                </form>
            </Box>
        </Content>
    )
}

type SettingsRowProps = {
    label: string;
    description: string;
    placeholder?: string;
    name: string;
    regex?: string;
    value: string;
    type: string;
    onChange: (type: string, key: string, value: any) => void;
}
const SettingsRow = (props: SettingsRowProps) => {
    const { label, description, placeholder, name, value, regex, type, onChange } = props;

    return (
        <Grid
            templateColumns={{
                base: '1fr',
                lg: 'repeat(3, 1fr)',
            }}
            rowGap={{
                base: 4,
                lg: 0,
            }}
            columnGap={{
                base: 0,
                lg: 4,
            }}
            p={4}
            placeItems='center start'
        >
            <GridItem colSpan={2} width='full'>
                <Heading as='h2' size='sm' mb={2}>{label}</Heading>
                <Heading as='h3' size='xs' fontWeight='normal'>{description}</Heading>
            </GridItem>

            <GridItem colSpan={1} width='full'>
                <Input
                    type='text'
                    placeholder={placeholder}
                    name={name}
                    width='full'
                    size='sm'
                    rounded='md'
                    pattern={regex}
                    autoComplete='off'
                    defaultValue={value}
                    onBlur={(event: any) => onChange?.(type, name, event.target.value)}
                />
            </GridItem>
        </Grid>
    )
}

export default SettingsView;