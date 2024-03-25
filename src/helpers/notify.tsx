const notify = (message: string, duration: number = 5000) => {
    if(!message) return;

    window?.dispatchEvent(new CustomEvent('notification', {detail: { message, duration }}));
}

export default notify;