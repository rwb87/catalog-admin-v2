import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from "@chakra-ui/react";
import { useRef } from "react";

type ConfirmationProps = {
    isOpen: boolean,
    isProcessing: boolean,
    text: string,
    cancelText?: string,
    confirmText?: string,
    processingConfirmText?: string,
    onConfirm: () => void,
    onCancel: () => void,
}
const Confirmation = ({ isOpen = false, isProcessing = false, text = '', cancelText = 'Nevermind', confirmText = 'Yes, delete', processingConfirmText = 'Deleting...', onConfirm = () => {}, onCancel = () => {} }: ConfirmationProps) => {
    const cancelRef = useRef<any>(null);

    return (
        <AlertDialog
            leastDestructiveRef={cancelRef}
            onClose={onCancel}
            isOpen={isOpen}
            isCentered
            closeOnOverlayClick={!isProcessing}
            closeOnEsc={!isProcessing}
        >
            <AlertDialogOverlay />

            <AlertDialogContent>

                <AlertDialogHeader>Confirmation</AlertDialogHeader>

                <AlertDialogCloseButton isDisabled={isProcessing}/>

                <AlertDialogBody>
                    <div dangerouslySetInnerHTML={{ __html: text }} />
                </AlertDialogBody>

                <AlertDialogFooter>
                    <Button
                        ref={cancelRef}
                        variant='ghost'
                        size='sm'
                        isDisabled={isProcessing}
                        onClick={onCancel}
                    >{cancelText}</Button>
                    <Button
                        colorScheme='red'
                        size='sm'
                        ml={4}
                        isLoading={isProcessing}
                        loadingText={processingConfirmText}
                        onClick={onConfirm}
                    >{confirmText}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default Confirmation;