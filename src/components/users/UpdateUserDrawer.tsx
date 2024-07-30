import { Box, Checkbox, FormControl, FormLabel, Grid, IconButton, Image, Input, Select, Text, Textarea } from "@chakra-ui/react";
import { IconCamera } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import CustomDrawer from "@/components/Drawer";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import moment from "moment";
import { ROLES } from "@/_config";
import Avatar from "@/components/Avatar";

type UpdateUserDrawerProps = {
    user: any;
    onSave: (user: any, isNew: boolean) => void;
    onClose: () => void;
}
const UpdateUserDrawer = ({ user, onSave, onClose }: UpdateUserDrawerProps) => {
    const [editingUser, setEditingUser] = useState<any>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const coverPhotoRef = useRef<any>(null);
    const profilePhotoRef = useRef<any>(null);
    const creatorBannerRef = useRef<any>(null);

    useEffect(() => {
        setEditingUser(JSON.parse(JSON.stringify(user)));
    }, [user]);

    const handleUpdateUser = async () => {
        if(isProcessing) return;

        if(editingUser?.name?.trim() === '') return notify('First Name is required', 3000);
        if(editingUser?.email?.trim() === '') return notify('Email is required', 3000);
        if(editingUser?.username?.trim() === '') return notify('Username is required', 3000);
        if(editingUser?.type?.trim() === '') return notify('Role is required', 3000);
        if(editingUser?.isNew && editingUser?.password?.trim() === '') return notify('Password is required', 3000);
        if(editingUser?.birthDate) {
            if(!moment(editingUser?.birthDate).isValid()) return notify('Invalid Date of Birth', 3000);

            const futureDateMessages = [
                'WOAAHHHH!!!! You are a time traveler? 😮',
                'You are not born yet? 😮',
                'You are from the future? 😮',
                'You are a time traveler? 😮',
                'How the earth looks like in the future? 🤔',
            ];

            if(moment(editingUser?.birthDate).isAfter(moment())) return notify(futureDateMessages[Math.floor(Math.random() * futureDateMessages.length)], 3000);
        }

        setIsProcessing(true);

        const payload = new FormData();

        // Common Fields
        payload.append('name', editingUser?.name);
        if(user?.email !== editingUser?.email) payload.append('email', editingUser?.email?.toLowerCase());
        if(user?.username !== editingUser?.username) payload.append('username', editingUser?.username);
        payload.append('type', editingUser?.type);
        payload.append('gender', editingUser?.gender);
        payload.append('creatorGender', editingUser?.creatorGender || '');
        if(editingUser?.birthDate) payload.append('birthDate', moment(editingUser?.birthDate).format('YYYY-MM-DD'));
        payload.append('description', editingUser?.description || '');

        // Is early adaptor for creator
        if(editingUser?.type === ROLES.CREATOR) payload.append('isEarlyAdaptor', editingUser?.isEarlyAdaptor);

        // Photos
        if (coverPhotoRef.current.files[0]) payload.append('cover', coverPhotoRef.current.files[0]);
        if (profilePhotoRef.current.files[0]) payload.append('picture', profilePhotoRef.current.files[0]);
        if (editingUser?.isNew && editingUser?.password?.trim() === '') return notify('Password is required', 3000);

        if (editingUser?.password) payload.append('password', editingUser?.password);

        // Update user
        try {
            const response = await fetch({
                endpoint: editingUser?.isNew ? '/users' : `/users/${editingUser.id}`,
                method: editingUser?.isNew ? 'POST' : 'PUT',
                data: payload,
                hasFiles: true,
            });

            if(response) notify(`User ${editingUser?.isNew ? 'created' : 'updated'} successfully`, 3000);
            onSave(response, editingUser?.isNew);
            setEditingUser({});
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message;
            notify(message, 3000);
        }

        setIsProcessing(false);
    }

    const isCategoryAdmin = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DATA_MANAGER].includes(user?.type);

    return (
        <CustomDrawer
            isOpen={!!editingUser?.id}
            title={user?.isNew ? `Create User` : 'Update User'}
            isProcessing={isProcessing}
            onSubmit={handleUpdateUser}
            onClose={() => {
                setEditingUser({})
                onClose();
            }}
        >
            <form action="" style={{ display: 'contents' }}>

                {/* Photos */}
                <Box position='relative'>

                    {/* Cover Photo */}
                    <Image
                        src={editingUser?.coverURL || '/images/cover-placeholder.webp'}
                        alt={editingUser?.name}
                        width='full'
                        loading="lazy"
                        aspectRatio={21 / 9}
                        rounded='lg'
                        objectFit='cover'
                        onError={(e: any) => {
                            e.target.src = '/images/cover-placeholder.webp';
                            e.target.onerror = null;
                        }}
                    />

                    {/* Edit Cover Button */}
                    <IconButton
                        position='absolute'
                        top='2'
                        right='2'
                        rounded='full'
                        colorScheme='gray'
                        aria-label='Edit cover photo'
                        icon={<IconCamera size={22} />}
                        onClick={() => coverPhotoRef.current.click()}
                    />

                    {/* Profile Picture */}
                    <Box
                        position='absolute'
                        bottom='-16'
                        left='50%'
                        transform='translateX(-50%)'
                    >
                        <Avatar
                            user={editingUser}
                            name={editingUser?.name}
                            showName={false}
                            size='8rem'
                            style={{
                                border: '4px solid white'
                            }}
                        />

                        {/* Edit Profile Picture */}
                        <IconButton
                            position='absolute'
                            bottom='0'
                            right='0'
                            rounded='full'
                            colorScheme='gray'
                            aria-label='Edit profile photo'
                            icon={<IconCamera size={22} />}
                            onClick={() => profilePhotoRef.current.click()}
                        />
                    </Box>
                </Box>

                {/* Name */}
                <Grid
                    mt={20}
                    templateColumns='1fr'
                    gap={4}
                >
                    <FormControl id="name">
                        <FormLabel>Full Name <Text as='span' color='red.500'>*</Text></FormLabel>
                        <Input
                            type="text"
                            autoComplete="name"
                            value={editingUser?.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                        />
                    </FormControl>
                </Grid>

                {/* Email and Username */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: 'repeat(2, 1fr)',
                    }}
                    gap={4}
                >
                    <FormControl id="email">
                        <FormLabel>Email <Text as='span' color='red.500'>*</Text></FormLabel>
                        <Input
                            type="email"
                            autoComplete="email"
                            value={editingUser?.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        />
                    </FormControl>

                    <FormControl id="username">
                        <FormLabel>Username <Text as='span' color='red.500'>*</Text></FormLabel>
                        <Input
                            type="text"
                            autoComplete="username"
                            value={editingUser?.username}
                            onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                        />
                    </FormControl>
                </Grid>

                {/* Role and Gender */}
                <Grid
                    mt={4}
                    templateColumns={{
                        base: '1fr',
                        md: `repeat(${user?.type === ROLES.CREATOR ? 3 : isCategoryAdmin ? 1 : 2}, 1fr)`,
                    }}
                    gap={4}
                >

                    {/* Role */}
                    <FormControl id="role">
                        <FormLabel>Role <Text as='span' color='red.500'>*</Text></FormLabel>
                        <Select
                            placeholder='Select role...'
                            value={editingUser?.type}
                            onChange={(e) => setEditingUser({ ...editingUser, type: e.target.value })}
                        >
                            {
                                user?.type === ROLES.ADMIN || user?.type === ROLES.SUPER_ADMIN || user?.type === ROLES.DATA_MANAGER
                                    ? <>
                                        <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                                        <option value={ROLES.ADMIN}>Admin</option>
                                        <option value={ROLES.DATA_MANAGER}>Data Manager</option>
                                    </>
                                    : <>
                                        <option value={ROLES.SHOPPER}>Shopper</option>
                                        <option value={ROLES.CREATOR}>Creator</option>
                                    </>
                            }
                        </Select>
                    </FormControl>

                    {/* Shopping */}
                    <FormControl id="shopping" display={isCategoryAdmin ? 'none' : 'block'}>
                        <FormLabel>Shopping <Text as='span' color='red.500'>*</Text></FormLabel>
                        <Select
                            placeholder='Select shopping preference...'
                            value={editingUser?.gender}
                            onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}
                        >
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="all">All</option>
                        </Select>
                    </FormControl>

                    {/* Gender for Creator */}
                    <FormControl id="gender" display={user?.type === ROLES.CREATOR ? 'block' : 'none'}>
                        <FormLabel>Gender</FormLabel>
                        <Select
                            placeholder='Select gender...'
                            value={editingUser?.creatorGender || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, creatorGender: e.target.value })}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            {/* <option value="all">All</option> */}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Date or Birth */}
                <FormControl mt={4} id="dob" display={isCategoryAdmin ? 'none' : 'block'}>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                        type="date"
                        autoComplete="dob"
                        value={editingUser?.birthDate !== null && editingUser?.birthDate?.trim() !== '' ? moment(editingUser?.birthDate).format('YYYY-MM-DD') : ''}
                        onChange={(e) => setEditingUser({ ...editingUser, birthDate: e.target.value })}
                    />
                </FormControl>

                {/* Password */}
                <FormControl mt={4} id="password">
                    <FormLabel>Password {!editingUser?.isNew ? '(Leave blank to keep current password)' : <Text as='span' color='red.500'>*</Text>}</FormLabel>
                    <Input
                        type="password"
                        autoComplete="new-password"
                        value={editingUser?.password}
                        onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    />
                </FormControl>

                {/* Is Early Adaptor */}
                <FormControl
                    mt={4}
                    display={editingUser?.type === ROLES.CREATOR ? 'block' : 'none'}
                >
                    <Checkbox
                        size='lg'
                        isChecked={editingUser?.isEarlyAdaptor}
                        onChange={(e) => setEditingUser({ ...editingUser, isEarlyAdaptor: e.target.checked })}
                    >Early Adaptor</Checkbox>
                </FormControl>

                {/* Creator Description */}
                {
                    editingUser?.type === ROLES.CREATOR && <FormControl mt={4} id="description">
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            autoComplete="off"
                            value={editingUser?.description || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, description: e.target.value })}
                        />
                    </FormControl>
                }

                {/* Creator Banner */}
                {
                    editingUser?.type === ROLES.CREATOR && <FormControl mt={4} id="creatorBanner" display='none'>
                        <FormLabel>Creator Banner</FormLabel>

                        <Box position='relative'>
                            <Image
                                src={editingUser?.creatorBannerURL}
                                alt={editingUser?.name}
                                width='full'
                                loading="lazy"
                                aspectRatio={21 / 9}
                                rounded='lg'
                                objectFit='contain'
                                bgColor='gray.100'
                                onError={(e: any) => {
                                    e.target.src = '/images/cover-placeholder.webp';
                                    e.target.onerror = null;
                                }}
                            />

                            {/* Edit Cover Button */}
                            <IconButton
                                position='absolute'
                                top='2'
                                right='2'
                                rounded='full'
                                colorScheme='gray'
                                aria-label='Edit cover photo'
                                icon={<IconCamera size={22} />}
                                onClick={() => creatorBannerRef.current.click()}
                            />
                        </Box>
                    </FormControl>
                }

                {/* Cover photo input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={coverPhotoRef}
                    hidden
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingUser({ ...editingUser, coverURL: URL.createObjectURL(photo) });
                    }}
                />

                {/* Profile photo input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={profilePhotoRef}
                    hidden
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingUser({
                            ...editingUser,
                            pictureURL: URL.createObjectURL(photo),
                            smallPictureURL: URL.createObjectURL(photo),
                        });
                    }}
                />

                {/* Creator Banner input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={creatorBannerRef}
                    hidden
                    disabled={editingUser?.type !== ROLES.CREATOR}
                    onChange={(e: any) => {
                        const photo = e.target.files[0];

                        if(!photo) return;

                        setEditingUser({ ...editingUser, creatorBannerURL: URL.createObjectURL(photo) });
                    }}
                />
            </form>
        </CustomDrawer>
    )
}

export default UpdateUserDrawer;