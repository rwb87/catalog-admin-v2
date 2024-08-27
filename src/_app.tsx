import { ChakraBaseProvider, createLocalStorageManager } from "@chakra-ui/react"
import theme from "@/_theme";
import './_app.scss'
import { BrowserRouter } from "react-router-dom";
import Routes from "@/_routes";
import { useEffect } from "react";
import { Config } from "./_config";

const Application = () => {
	const manager = createLocalStorageManager(`${Config.APP_NAME?.toLowerCase()?.replaceAll(' ', '_')}.theme`);

	return (
		<BrowserRouter>
			<ChakraBaseProvider theme={theme} colorModeManager={manager}>
				<Routes />
			</ChakraBaseProvider>
		</BrowserRouter>
	);
}

export default Application;