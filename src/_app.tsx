import { Box, ChakraBaseProvider } from "@chakra-ui/react"
import theme from "@/_theme";
import './_app.scss'
import { BrowserRouter } from "react-router-dom";
import Routes from "@/_routes";
import { useEffect, useState } from "react";

const Application = () => {
	const [notification, setNotification] = useState({
		message: '',
		open: false,
	});

	// Notification handler
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const notify = (event: any) => {
			const { message, duration = 5000 } = event.detail;

			setNotification({
				message: message,
				open: true
			});

			setTimeout(() => {
				setNotification(prev => {
					return {
						...prev,
						open: false
					}
				});
			}, duration);
		}

		window.addEventListener('notification', notify);

		return () => {
			window.removeEventListener('notification', notify);
		}
	}, []);

	return (
		<BrowserRouter>
			<ChakraBaseProvider theme={theme}>
				<Routes />

				{/* Notification */}
				<Box
					position='fixed'
					top={notification.open ? 2 : -200}
					left='50%'
					transform='translateX(-50%)'
					transition='top 0.15s ease-in-out'
					px={4}
					py={1}
					backgroundColor='primary.500'
					color='white'
					rounded='10px'
					maxWidth='30rem'
					minWidth='10rem'
					textAlign='center'
					zIndex={10000}
				>{notification?.message}</Box>
			</ChakraBaseProvider>
		</BrowserRouter>
	);
}

export default Application;