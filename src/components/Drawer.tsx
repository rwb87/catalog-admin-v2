import {Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay} from '@chakra-ui/react';

type CustomDrawerProps = {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    cancelText?: string;
    submitText?: string;
    isProcessing?: boolean;
    processingText?: string;
    onSubmit?: () => void;
    onClose: () => void;
}

const CustomDrawer = (props: CustomDrawerProps) => {
    const {
        isOpen = false,
        title,
        children,
        cancelText = 'Cancel',
        submitText = 'Save',
        isProcessing = false,
        processingText = 'Saving...',
        onSubmit,
        onClose,
    } = props;

    return (
        <Drawer
            size='lg'
            isOpen={isOpen}
            placement='right'
            onClose={() => {if (!isProcessing) onClose()}}
            closeOnEsc={!isProcessing}
            // closeOnOverlayClick={!isProcessing}
            closeOnOverlayClick={false}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader>{title}</DrawerHeader>

                <DrawerBody
                    px={{
                        base: 3,
                        sm: 6,
                    }}
                >{children}</DrawerBody>

                <DrawerFooter>
                    <Button
                        variant='outline'
                        size='md'
                        mr={4}
                        isDisabled={isProcessing}
                        onClick={onClose}
                    >{cancelText}</Button>
                    <Button
                        size='md'
                        colorScheme='green'
                        isLoading={isProcessing}
                        loadingText={processingText}
                        onClick={onSubmit}
                    >{submitText}</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default CustomDrawer;