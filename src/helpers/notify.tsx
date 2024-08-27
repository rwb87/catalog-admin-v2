const notify = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default',
    duration: number = 5000
) => {
    if(!message) return;

    const deactivate = ($element: HTMLElement, duration: number) => {
        setTimeout(() => {
            $element.classList.add('active');

            setTimeout(() => {
                $element.classList.remove('active');

                setTimeout(() => {
                    $element.remove();
                }, 200);
            }, duration);
        }, 10);
    }

    // Remove existing notification
    const $hasOldChild = document.getElementById('notification');
    if($hasOldChild) deactivate($hasOldChild, 100);

    setTimeout(() => {
        const $notification = document.createElement('div');

        $notification.id = 'notification';
        $notification.innerText = message;
        $notification.classList.add(type);

        document.body.appendChild($notification);

        deactivate($notification, duration);
    }, $hasOldChild ? 200 : 0);
}

export default notify;