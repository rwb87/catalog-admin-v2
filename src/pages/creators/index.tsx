import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";

const CreatorsView = () => {
    return (
        <Content activePage="Creators">
            <UsersView userType="creator" />
        </Content>
    )
}

export default CreatorsView;