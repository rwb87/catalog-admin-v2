import { Content } from "@/layouts/app.layout"
import UsersView from "@/components/users/UsersView";
import { ROLES } from "@/_config";

const CreatorsView = () => {
    return (
        <Content activePage="Creators">
            <UsersView userType={ROLES.CREATOR} />
        </Content>
    )
}

export default CreatorsView;