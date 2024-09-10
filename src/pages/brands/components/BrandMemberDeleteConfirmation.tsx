import Confirmation from "@/components/Confirmation";
import fetch from "@/helpers/fetch";
import notify from "@/helpers/notify";
import { useEffect, useState } from "react";

export default function BrandMemberDeleteConfirmation() {
    const [data, setData] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const openPopup = (event: CustomEvent) => {
            const user = event?.detail;

            setData(user);
            setOpen(true);
            setIsProcessing(false);
        }

        window.addEventListener('confirmation:brand:members:delete', openPopup);

        return () => {
            window.removeEventListener('confirmation:brand:members:delete', openPopup);
        }
    }, []);

    const handleDelete = async () => {
        setIsProcessing(true);

        try {
            await fetch({
                endpoint: `/campaigns/users/${data?.id}`,
                method: 'DELETE'
            });

            setOpen(false);

            notify('Member deleted successfully!', 'success');
            window.dispatchEvent(new CustomEvent('reload:brand-members'));
        } catch (error) {
            const message = error?.response?.data?.message || error.message || 'Something went wrong!';
            notify(message, 'error');
        }

        setIsProcessing(false);
        setOpen(false);
    }

    return <Confirmation
        isOpen={open}
        isProcessing={isProcessing}
        title='Confirmation'
        text={`Are you sure you want to delete <b>${data?.name}</b> from the members list? You won't be able to undo this action and the member will be permanently removed from the system.`}
        size='lg'
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
    />
}