import { AlertDialog, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button } from "@chakra-ui/react";
import { useRef } from "react";

type ConfirmationProps = {
    isOpen: boolean,
    isProcessing: boolean,
    title?: string,
    text?: string,
    html?: React.ReactNode,
    cancelText?: string,
    confirmText?: string,
    processingConfirmText?: string,
    isDangerous?: boolean,
    onConfirm: () => void,
    onCancel: () => void,
}
const Confirmation = ({ isOpen = false, isProcessing = false, title = 'Confirmation', text = '', html, cancelText = 'Nevermind', confirmText = 'Yes, delete', processingConfirmText = 'Deleting...', isDangerous = true, onConfirm = () => {}, onCancel = () => {} }: ConfirmationProps) => {
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

                <AlertDialogHeader>{title}</AlertDialogHeader>

                <AlertDialogCloseButton isDisabled={isProcessing}/>

                <AlertDialogBody>
                    {
                        html
                            ? html
                            : <div dangerouslySetInnerHTML={{ __html: text }} />
                    }
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
                        colorScheme={isDangerous ? 'red' : 'green'}
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