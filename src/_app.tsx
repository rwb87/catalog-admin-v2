import { ChakraBaseProvider, createLocalStorageManager } from "@chakra-ui/react"
import theme from "@/_theme";
import './_app.scss'
import { BrowserRouter } from "react-router-dom";
import Routes from "@/_routes";
import { useEffect } from "react";
import { Config } from "./_config";

const Application = () => {
	const manager = createLocalStorageManager(`${Config.APP_NAME?.toLowerCase()?.replaceAll(' ', '_')}.theme`);

	// Notification handler
	useEffect(() => {
		const $notification = document.getElementById('notification');

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const notify = (event: any) => {
			const { message, duration = 5000 } = event.detail;

			if(!$notification) return console.error('Notification element not found');

			$notification.innerHTML = message;
			$notification.classList.add('active');

			setTimeout(() => {
				$notification.classList.remove('active');

				setTimeout(() => {
					$notification.innerHTML = '';
				}, 200);
			}, duration);
		}

		window.addEventListener('notification', notify);

		return () => {
			window.removeEventListener('notification', notify);
		}
	}, []);

	return (
		<BrowserRouter>
			<ChakraBaseProvider theme={theme} colorModeManager={manager}>
				<Routes />

				{/* Notification */}
				<span id='notification' className="notification"></span>
			</ChakraBaseProvider>
		</BrowserRouter>
	);
}

export default Application;