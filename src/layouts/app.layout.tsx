import { Box, Button, Flex, Heading, IconButton, Switch, Text, Tooltip } from "@chakra-ui/react";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { IconLogout } from "@tabler/icons-react";
import { useUi, useUser } from "@/_store";
import { Link, useLocation } from "react-router-dom";
import { RiMenu5Line } from "react-icons/ri";
import { BiDollar } from "react-icons/bi";
import Lightcase from "@/components/Lightcase";
import { ROLES } from "@/_config";

type AppLayoutProps = {
    children: ReactElement | ReactElement[],
}
const AppLayout = ({ children }: AppLayoutProps) => {
    const [activePage, setActivePage] = useState<string>('');

    const sidebarItems = useMemo(() => ([
        {
            icon: <svg fill="none" width={20} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path d="m17.187 0.70775c-0.4145-0.41519-0.977-0.6487-1.5638-0.64916h-7.3737c-0.58649 6.385e-4 -1.1487 0.23413-1.5631 0.64916l-5.1622 5.1622c-0.41503 0.41439-0.64852 0.97662-0.64916 1.5631v7.3737c6.39e-4 0.5865 0.23413 1.1487 0.64916 1.5631l5.1622 5.1622c0.41439 0.415 0.97661 0.6485 1.5631 0.6492h7.3737c0.5865-7e-4 1.1488-0.2342 1.5631-0.6492l5.1622-5.1622c0.415-0.4144 0.6485-0.9766 0.6492-1.5631v-7.3737c-7e-4 -0.58648-0.2342-1.1487-0.6492-1.5631l-5.1615-5.1622zm-1.5638 19.261h-7.3737l-1.7055-1.7034c0.55067-0.9409 1.338-1.7212 2.2837-2.2634 0.94569-0.5423 2.0168-0.8276 3.107-0.8276 1.0901 0 2.1612 0.2853 3.1069 0.8276 0.9457 0.5422 1.733 1.3225 2.2837 2.2634l-1.7021 1.7034zm-6.2676-9.5867c1.4e-4 -0.51037 0.15161-1.0093 0.43527-1.4336 0.28369-0.42431 0.68679-0.75498 1.1584-0.9502 0.4715-0.19523 0.9904-0.24623 1.491-0.14658 0.5005 0.09966 0.9603 0.3455 1.3212 0.70645 0.3608 0.36095 0.6066 0.8208 0.7061 1.3214 0.0995 0.50061 0.0483 1.0195-0.147 1.491-0.1954 0.4715-0.5261 0.8745-0.9505 1.1581-0.4244 0.2835-0.9233 0.4348-1.4337 0.4348-0.339 0-0.6746-0.0667-0.9878-0.1965-0.3131-0.1297-0.5977-0.3199-0.8373-0.5596-0.23967-0.2397-0.42976-0.5243-0.55941-0.8375-0.12965-0.3131-0.19634-0.6488-0.19625-0.9878zm11.43 4.4245-1.8438 1.8438c-0.8911-1.289-2.1184-2.3093-3.5486-2.9499 0.6553-0.6761 1.0969-1.5303 1.2698-2.4559 0.1728-0.9255 0.0692-1.8815-0.2979-2.7486-0.3671-0.86706-0.9815-1.6068-1.7664-2.1268-0.785-0.52005-1.7057-0.79738-2.6473-0.79738-0.9415 0-1.8623 0.27733-2.6472 0.79738-0.78493 0.52004-1.3993 1.2598-1.7664 2.1268-0.36713 0.86705-0.47073 1.8231-0.2979 2.7486 0.17284 0.9256 0.61447 1.7798 1.2698 2.4559-1.441 0.636-2.6791 1.6566-3.5783 2.9499l-1.8438-1.8438v-7.3737l5.1622-5.1622h7.3737l5.1622 5.1622v7.3737z" fill="currentColor"/></svg>,
            label: "Administrators",
            link: "/administrators",
            isDefault: true,
        },
        {
            icon: <svg width={20} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path d="m11.53 0.74816c-1.8124 0.014228-3.5934 0.4742-5.1863 1.3394-1.5929 0.86521-2.9488 2.1091-3.9482 3.6221-0.99942 1.513-1.6117 3.2488-1.783 5.0543-0.17126 1.8056 0.10379 3.6256 0.80091 5.2998 0.69713 1.6742 1.7949 3.1511 3.1968 4.3007 1.4018 1.1497 3.0646 1.9368 4.842 2.2919 1.7773 0.3552 3.6147 0.2676 5.3502-0.2551 1.7356-0.5227 3.316-1.4644 4.6023-2.7422 1.0487-1.0185 1.8802-2.2392 2.4441-3.5884s0.8484-2.7988 0.8365-4.2611c-0.0066-1.4593-0.3005-2.903-0.8647-4.2486-0.5641-1.3456-1.3877-2.5669-2.4235-3.594-1.0359-1.0272-2.2638-1.8401-3.6136-2.3923-1.3498-0.55228-2.7951-0.8331-4.2534-0.82642zm0 2.0682c2.3964-0.01134 4.6992 0.92928 6.4032 2.6154 1.7039 1.6861 2.6697 3.9799 2.6853 6.3779 0.0098 2.0324-0.6859 4.0053-1.9684 5.5814-1.9176-1.8333-4.4675-2.8563-7.1196-2.8563-2.652 0-5.2019 1.023-7.1195 2.8563-1.2825-1.5761-1.9782-3.549-1.9684-5.5814 0.01555-2.3978 0.98117-4.6914 2.6849-6.3775 1.7037-1.6861 4.0064-2.6268 6.4025-2.6157zm-5.6435 16.022c1.5195-1.4538 3.5407-2.2652 5.643-2.2652 2.1023 0 4.1235 0.8114 5.643 2.2652-1.6129 1.2563-3.5986 1.938-5.6425 1.9373-2.0493 0.0321-4.0454-0.6531-5.6435-1.9373z" fill="currentColor"/><path d="m11.601 13.482c0.7979-0.0064 1.576-0.249 2.2363-0.6973 0.6603-0.4482 1.1732-1.082 1.4741-1.8215s0.3763-1.5516 0.2167-2.3339c-0.1596-0.7823-0.547-1.4998-1.1134-2.0622-0.5665-0.56232-1.2866-0.94426-2.0696-1.0977-0.783-0.15343-1.5939-0.07147-2.3305 0.23554-0.7365 0.30701-1.3657 0.82534-1.8084 1.4896s-0.67885 1.4449-0.67888 2.2433c0.00697 1.076 0.43943 2.1055 1.2028 2.8633s1.7956 1.1823 2.8708 1.1807zm0-6.032c0.2632-0.00227 0.5243 0.04738 0.7683 0.14614 0.244 0.09875 0.4661 0.24466 0.6537 0.42939 0.1876 0.18472 0.337 0.40464 0.4396 0.64718 0.1027 0.24254 0.1565 0.50294 0.1585 0.76631-0.0106 0.52982-0.2278 1.0345-0.6053 1.4062-0.3775 0.3716-0.8852 0.5808-1.4148 0.5828-0.5272 0-1.0327-0.2095-1.4055-0.5825-0.37273-0.373-0.58214-0.87896-0.58214-1.4065s0.20941-1.0334 0.58214-1.4064c0.3728-0.37301 0.8783-0.58257 1.4055-0.58257z" fill="currentColor"/></svg>,
            label: "Shoppers",
            link: "/shoppers",
            isDefault: true,
        },
        {
            icon: <svg fill="none" width={20} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m22.704 9.9692h-1.7885c0.4254 1.4997 0.4681 3.0822 0.1241 4.6027-0.3439 1.5205-1.0635 2.9305-2.093 4.1011-0.2496-1.0966-0.7521-2.1198-1.4676-2.9876-0.7154-0.8679-1.6238-1.5564-2.6527-2.0107 0.6404-0.583 1.0895-1.3462 1.2882-2.1892s0.1377-1.7264-0.1749-2.5341c-0.3126-0.80771-0.8622-1.502-1.5767-1.9916-0.7145-0.48958-1.5603-0.75158-2.4264-0.75158s-1.712 0.262-2.4264 0.75158c-0.71445 0.48959-1.2641 1.1838-1.5767 1.9916-0.31261 0.80772-0.37357 1.6911-0.17487 2.5341 0.19871 0.843 0.64778 1.6062 1.2882 2.1892-1.0289 0.4543-1.9373 1.1429-2.6527 2.0107-0.71541 0.8679-1.218 1.891-1.4676 2.9876-1.3299-1.5167-2.1326-3.4235-2.2878-5.4348-0.15523-2.0112 0.34536-4.0186 1.4268-5.7214 1.0814-1.7029 2.6854-3.0095 4.5718-3.7242 1.8863-0.71471 3.9535-0.799 5.8918-0.24026v-1.7906c-0.8495-0.20272-1.7199-0.30482-2.5932-0.30418-2.1876 1.9e-4 -4.326 0.64903-6.1448 1.8645s-3.2364 2.9429-4.0736 4.964c-0.83712 2.0211-1.0562 4.245-0.62945 6.3905 0.42672 2.1456 1.48 4.1164 3.0268 5.6633 1.5469 1.5468 3.5178 2.6001 5.6633 3.0268 2.1456 0.4268 4.3695 0.2077 6.3905-0.6294 2.0211-0.8371 3.7486-2.2547 4.964-4.0736 1.2155-1.8188 1.8643-3.9572 1.8645-6.1448 5e-4 -0.8581-0.0981-1.7134-0.2938-2.5489l7e-4 -7e-4zm-13.332 0.5337c0-0.50716 0.1504-1.0029 0.43219-1.4246 0.28176-0.42169 0.68226-0.75034 1.1509-0.94439 0.4686-0.19406 0.9842-0.2448 1.4816-0.1458 0.4974 0.09899 0.9543 0.34327 1.3129 0.70194 0.3585 0.35867 0.6027 0.81562 0.7016 1.3131 0.0988 0.4974 0.0479 1.013-0.1462 1.4815-0.1942 0.4686-0.523 0.869-0.9447 1.1507-0.4218 0.2816-0.9176 0.4319-1.4248 0.4318-0.6797-1e-3 -1.3313-0.2714-1.8119-0.7521-0.48053-0.4807-0.75081-1.1324-0.75155-1.8121zm-2.8904 9.5839c0.03918-1.4206 0.63105-2.7699 1.6497-3.7608 1.0187-0.991 2.3837-1.5454 3.8049-1.5454 1.4211 0 2.7862 0.5544 3.8049 1.5454 1.0186 0.9909 1.6105 2.3402 1.6497 3.7608-1.5874 1.1471-3.4961 1.7646-5.4546 1.7646-1.9585 0-3.8672-0.6175-5.4546-1.7646zm10.854-14.172-1.8991-1.8154 2.6194-0.37332 1.1525-2.2883 1.1531 2.2897 2.6195 0.37331-1.8977 1.8113 0.4431 2.5337-2.318-1.1953-2.3187 1.1946 0.4459-2.5303z" fill="currentColor" stroke="currentColor" strokeWidth=".5"/></svg>,
            label: "Creators",
            link: "/creators",
            isDefault: true,
        },
        {
            icon: <svg fill="none" width={20} viewBox="0 0 24 23" xmlns="http://www.w3.org/2000/svg"><path d="m21.786 15.845-7.5265-4.2994c-0.3238-0.1857-0.5923-0.4542-0.7781-0.778s-0.282-0.6912-0.2789-1.0644c-0.0076-0.41092 0.087-0.81729 0.2754-1.1826 0.1883-0.36529 0.4645-0.67802 0.8037-0.91008 0.5932-0.37962 1.0771-0.90724 1.4042-1.5309 0.3272-0.62362 0.4861-1.3217 0.4613-2.0255-0.0249-0.70376-0.2327-1.3889-0.603-1.9879s-0.8902-1.0912-1.5087-1.428c-0.6184-0.33684-1.3139-0.50671-2.018-0.49288-0.704 0.013828-1.3923 0.21088-1.9971 0.57174-0.60468 0.36086-1.1049 0.87307-1.4514 1.4861s-0.52722 1.3058-0.52442 2.01h2.2122c0.0019-0.31977 0.0869-0.63356 0.2467-0.91054 0.1598-0.27699 0.3889-0.50764 0.6648-0.66933 0.2759-0.16168 0.5891-0.24883 0.9089-0.25289 0.3197-0.00406 0.635 0.07511 0.9149 0.22975 0.2799 0.15463 0.5148 0.3794 0.6816 0.65224s0.2597 0.58436 0.2697 0.90398c0.01 0.31963-0.0633 0.63635-0.2127 0.91908s-0.3697 0.52175-0.6394 0.69357c-0.6521 0.42804-1.186 1.0134-1.5523 1.7021s-0.5534 1.4585-0.5438 2.2385c5e-4 0.37953 0.0515 0.75733 0.1514 1.1234l-8.7426 5.0018c-0.65815 0.376-1.1735 0.9591-1.466 1.6584-0.29242 0.6993-0.34548 1.4757-0.15091 2.2083s0.62585 1.3804 1.2267 1.8425c0.60087 0.4621 1.3376 0.7126 2.0956 0.7125h15.97c0.7581 1e-4 1.4948-0.2504 2.0957-0.7125s1.0322-1.1099 1.2267-1.8425c0.1946-0.7326 0.1415-1.509-0.1509-2.2083s-0.8078-1.2824-1.4659-1.6584h0.0013zm-1.7055 4.2108h-15.97c-0.27025-5e-4 -0.53275-0.0903-0.74677-0.2553s-0.36758-0.396-0.43685-0.6572c-0.06926-0.2613-0.05036-0.5381 0.05378-0.7874 0.10414-0.2494 0.28769-0.4574 0.52216-0.5918l8.7481-4.999c0.2718 0.2735 0.5792 0.509 0.914 0.7003l7.523 4.2994c0.2345 0.1344 0.418 0.3424 0.5222 0.5918 0.1041 0.2493 0.123 0.5261 0.0537 0.7873-0.0692 0.2613-0.2228 0.4923-0.4368 0.6573s-0.4765 0.2541-0.7468 0.2546z" fill="currentColor"/></svg>,
            label: "Looks",
            link: "/looks",
            isDefault: true,
        },
        {
            icon: <svg width={20} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg"><path d="m15.559 9.2053c0.7724 0 1.3986-0.62615 1.3986-1.3986 0-0.7724-0.6262-1.3986-1.3986-1.3986s-1.3985 0.62616-1.3985 1.3986c0 0.77241 0.6261 1.3986 1.3985 1.3986z" fill="currentColor"/><path d="m10.159 22.044c0.5722 0.5718 1.3481 0.893 2.157 0.893s1.5847-0.3212 2.1569-0.893l7.6268-7.6281c0.2844-0.2831 0.5102-0.6195 0.6644-0.99s0.2338-0.7678 0.2343-1.169v-7.6282c0-0.50093-0.0987-0.99695-0.2904-1.4597s-0.4727-0.88328-0.827-1.2375c-0.3542-0.35417-0.7747-0.6351-1.2376-0.82674-0.4628-0.19163-0.9588-0.29022-1.4598-0.29013h-7.6288c-0.4008-3.32e-4 -0.7978 0.078317-1.1683 0.23146-0.3704 0.15314-0.70708 0.37777-0.9907 0.66105l-7.6281 7.6281c-0.57177 0.5722-0.89296 1.348-0.89296 2.1569 0 0.809 0.32119 1.5848 0.89296 2.157l8.3913 8.3948zm-6.7702-11.088 7.6282-7.6282c0.0704-0.07111 0.1541-0.12762 0.2464-0.16629 0.0923-0.03868 0.1914-0.05875 0.2914-0.05908h7.6288c0.4047 0 0.7928 0.16075 1.0789 0.44688 0.2862 0.28614 0.4469 0.67422 0.4469 1.0789v7.6282c-3e-4 0.1-0.0204 0.199-0.0591 0.2913-0.0386 0.0923-0.0952 0.1761-0.1663 0.2465l-7.6281 7.6288c-0.0707 0.0712-0.1547 0.1277-0.2473 0.1662-0.0927 0.0386-0.192 0.0584-0.2923 0.0584s-0.1996-0.0198-0.2922-0.0584c-0.0926-0.0385-0.1767-0.095-0.2474-0.1662l-8.3913-8.3913c-0.07039-0.0709-0.12611-0.155-0.16399-0.2474-0.03789-0.0925-0.05719-0.1914-0.0568-0.2913 3.8e-4 -0.0999 0.02045-0.1988 0.05904-0.2909 0.0386-0.0922 0.09428-0.1758 0.1652-0.2461z" fill="currentColor"/></svg>,
            label: "Brands",
            link: "/brands",
            isDefault: true,
        },
        {
            icon: <svg fill="none" width={20} viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path d="m4.638 10.828v10.416h14.881v-10.416h3.72v-8.4342l-1.6889-0.42378-3.0653-0.77015c-0.5918-0.14863-1.2168-0.27653-1.9717-0.40581l-1.6993-0.28967-0.7107 1.5659c-0.179 0.38647-0.4648 0.71368-0.8237 0.94299s-0.776 0.35115-1.2019 0.35115-0.8429-0.12184-1.2018-0.35115c-0.359-0.22931-0.6448-0.55652-0.8238-0.94299l-0.7079-1.5659-1.7 0.27653c-0.74387 0.12997-1.3827 0.25648-1.9717 0.40581l-3.0654 0.76668-1.6889 0.43692v8.4342l3.7201 0.0034zm-1.4878-6.6941 3.0654-0.76669c0.59524-0.14863 1.2015-0.26754 1.8044-0.37193 0.35592 0.77745 0.92764 1.4363 1.6472 1.8983s1.5566 0.70751 2.4116 0.70751 1.6921-0.24557 2.4116-0.70751c0.7196-0.46194 1.2913-1.1208 1.6472-1.8983 0.6063 0.10439 1.2091 0.21915 1.8044 0.37193l3.0646 0.76669v4.4639h-2.2316c-0.3946 0-0.773 0.15674-1.052 0.43575-0.279 0.279-0.4357 0.65741-0.4357 1.0519v8.9265h-10.417v-8.9278c0-0.39461-0.15674-0.77302-0.43575-1.052-0.27901-0.279-0.65742-0.43575-1.052-0.43575h-2.2323v-4.4625z" fill="currentColor"/></svg>,
            label: "Products",
            link: "/products",
            isDefault: true,
        },
        {
            icon: <BiDollar size={24} />,
            label: "Earnings",
            link: "/earnings",
            isDefault: true,
        },
        {
            icon: <svg width={20} viewBox="0 0 41 42" xmlns="http://www.w3.org/2000/svg"><path d="m33.006 24.627-11.569-6.609c-0.4976-0.2853-0.9104-0.6978-1.196-1.1953s-0.4336-1.0621-0.429-1.6357c-0.0116-0.6315 0.1339-1.2561 0.4235-1.8174 0.2896-0.5614 0.7141-1.042 1.2355-1.3986 0.9117-0.5835 1.6555-1.3945 2.1583-2.3531 0.5027-0.95856 0.747-2.0316 0.7088-3.1133-0.0383-1.0817-0.3577-2.1348-0.9269-3.0555-0.5692-0.92067-1.3685-1.6771-2.3191-2.1948-0.9506-0.51768-2.0197-0.77872-3.1019-0.7574s-2.1401 0.32429-3.0696 0.87902c-0.9294 0.55473-1.6983 1.3421-2.2308 2.2845-0.5325 0.94238-0.8102 2.0072-0.8058 3.0896h3.4c3e-3 -0.49139 0.1337-0.97356 0.3793-1.3992 0.2456-0.42559 0.5977-0.77998 1.0217-1.0284 0.424-0.24837 0.9054-0.38219 1.3967-0.3883 0.4914-0.00612 0.9759 0.11568 1.4059 0.35342 0.4301 0.23775 0.7909 0.58326 1.047 1.0026 0.2562 0.41935 0.3988 0.89812 0.414 1.3893s-0.0977 0.97782-0.3274 1.4122c-0.2298 0.43436-0.5686 0.80149-0.9832 1.0653-1.0027 0.65804-1.8235 1.5581-2.3866 2.6171-0.5631 1.0589-0.8504 2.2426-0.8354 3.4419 7e-4 0.5834 0.0787 1.1641 0.232 1.727l-13.427 7.684c-1.0116 0.578-1.8037 1.4742-2.2532 2.5492-0.44942 1.0749-0.5309 2.2682-0.23177 3.3942 0.29913 1.126 0.9621 2.1216 1.8857 2.8318 0.92363 0.7101 2.0561 1.095 3.2212 1.0948h24.541c1.1651 2e-4 2.2976-0.3847 3.2212-1.0948 0.9236-0.7102 1.5866-1.7058 1.8857-2.8318 0.2992-1.126 0.2177-2.3193-0.2317-3.3942-0.4494-1.075-1.2416-1.9712-2.2532-2.5492zm-2.622 6.472h-24.541c-0.41526-9e-4 -0.8186-0.1389-1.1474-0.3925s-0.56477-0.6086-0.67122-1.01c-0.10644-0.4014-0.07744-0.8267 0.08252-1.2099 0.15995-0.3833 0.44191-0.703 0.80213-0.9096l13.443-7.684c0.4163 0.4199 0.8872 0.7818 1.4 1.076l11.563 6.608c0.3602 0.2066 0.6422 0.5263 0.8022 0.9096 0.1599 0.3832 0.1889 0.8085 0.0825 1.2099-0.1065 0.4014-0.3424 0.7564-0.6713 1.01-0.3288 0.2536-0.7321 0.3916-1.1474 0.3925h3e-3z" fill="currentColor"/><path d="m22.201 39.5h-0.0175-6.0706v-6.0708c-0.0043-2.0585 0.8318-4.0759 2.2938-5.5308l8.4631-8.4631c1.2212-1.2289 2.9151-1.9336 4.6477-1.9336h0.0045 0.0065c2.6712 0 5.0585 1.5943 6.0819 4.0617 1.0237 2.4684 0.465 5.285-1.4234 7.1756l-8.4707 8.4706c-1.4472 1.4543-3.4587 2.2904-5.5153 2.2904z" fill="currentColor"/><path d="m31.518 19.502c-1.2128 0-2.3755 0.4838-3.2303 1.3445l-8.4698 8.4698c-1.094 1.0888-1.7077 2.5697-1.7045 4.1132v4.0708h4.0708c1.545 4e-3 3.0283-0.6092 4.1184-1.7046l8.4698-8.4698c1.3102-1.3117 1.7014-3.2834 0.9911-4.9959-0.7101-1.712-2.3812-2.828-4.2345-2.828h-0.011zm-9.3338 14.822h-0.8946v-0.8946c-0.0013-0.7025 0.2768-1.3766 0.7728-1.874l8.4698-8.4697c0.5543-0.521 1.4222-0.5075 1.9601 0.0303 0.5378 0.5379 0.5513 1.4058 0.0303 1.9601v0.0052l-8.4698 8.4698c-0.496 0.4948-1.168 0.7728-1.8686 0.7729zm9.3338-18.822h0.0094c1.7045 0 3.353 0.4999 4.769 1.4456 1.4162 0.9457 2.5095 2.277 3.1619 3.8499 0.6526 1.5735 0.8223 3.2883 0.4909 4.9591-0.3315 1.6708-1.1429 3.191-2.3467 4.3961l-8.4695 8.4695c-0.913 0.9162-1.9815 1.6323-3.1759 2.1288-1.1964 0.4972-2.46 0.7493-3.7556 0.7493h-0.0187-8.0694v-8.0685c-0.0019-1.2971 0.2489-2.5624 0.7455-3.7608 0.4965-1.1981 1.214-2.2696 2.1325-3.185l8.4652-8.4652c1.5937-1.601 3.8023-2.5188 6.0614-2.5188z" fill="#fff"/></svg>,
            label: "Looks Management",
            link: "/looks/management",
            isDefault: false,
        },
        {
            icon: <svg width={20} viewBox="0 0 38 37" xmlns="http://www.w3.org/2000/svg"><path d="m5.381 15.433v15.067h21.525v-15.067h5.381v-12.2l-2.443-0.613-4.434-1.114c-0.856-0.215-1.76-0.4-2.852-0.587l-2.458-0.419-1.028 2.265c-0.2589 0.55903-0.6724 1.0323-1.1915 1.364-0.5192 0.3317-1.1224 0.50795-1.7385 0.50795s-1.2193-0.17625-1.7385-0.50795c-0.5191-0.33169-0.9326-0.80499-1.1915-1.364l-1.024-2.265-2.459 0.4c-1.076 0.188-2 0.371-2.852 0.587l-4.434 1.109-2.443 0.632v12.2l5.381 5e-3zm-2.152-9.683 4.434-1.109c0.861-0.215 1.738-0.387 2.61-0.538 0.5148 1.1246 1.3418 2.0776 2.3826 2.7458s2.2516 1.0234 3.4884 1.0234 2.4476-0.35521 3.4884-1.0234 1.8678-1.6212 2.3826-2.7458c0.877 0.151 1.749 0.317 2.61 0.538l4.433 1.109v6.457h-3.228c-0.5707 0-1.1181 0.2267-1.5217 0.6303s-0.6303 0.951-0.6303 1.5217v12.912h-15.068v-12.914c0-0.5707-0.22673-1.1181-0.63031-1.5217-0.40357-0.4036-0.95094-0.6303-1.5217-0.6303h-3.229v-6.455z" fill="currentColor"/><path d="m19.619 35h-0.0175-6.0706v-6.0708c-0.0043-2.0585 0.8317-4.0759 2.2937-5.5308l8.4631-8.4631c1.2213-1.2289 2.9152-1.9336 4.6478-1.9336h0.0045 0.0064c2.6713 0 5.0586 1.5943 6.082 4.0617 1.0237 2.4684 0.465 5.285-1.4235 7.1756l-8.4706 8.4706c-1.4473 1.4543-3.4588 2.2904-5.5153 2.2904z" fill="currentColor"/><path d="m28.936 15.002c-1.2128 0-2.3755 0.4838-3.2303 1.3445l-8.4698 8.4698c-1.0941 1.0888-1.7077 2.5697-1.7045 4.1132v4.0708h4.0708c1.5449 4e-3 3.0283-0.6092 4.1184-1.7046l8.4698-8.4698c1.3102-1.3117 1.7013-3.2834 0.9911-4.9959-0.7101-1.712-2.3813-2.828-4.2346-2.828h-0.0109zm-9.3338 14.822h-0.8947v-0.8946c-0.0012-0.7025 0.2768-1.3766 0.7729-1.874l8.4698-8.4697c0.5543-0.521 1.4221-0.5075 1.96 0.0303 0.5379 0.5379 0.5514 1.4058 0.0304 1.9601v0.0052l-8.4698 8.4698c-0.496 0.4948-1.168 0.7728-1.8686 0.7729zm9.3338-18.822h0.0094c1.7044 0 3.3529 0.4999 4.769 1.4456s2.5095 2.277 3.1619 3.8499c0.6525 1.5735 0.8223 3.2883 0.4908 4.9591-0.3314 1.6708-1.1429 3.191-2.3466 4.3961l-8.4695 8.4695c-0.913 0.9162-1.9815 1.6323-3.176 2.1288-1.1964 0.4972-2.4599 0.7493-3.7555 0.7493h-0.0188-8.0693v-8.0685c-2e-3 -1.2971 0.2489-2.5624 0.7455-3.7608 0.4965-1.1981 1.2139-2.2696 2.1325-3.185l8.4652-8.4652c1.5937-1.601 3.8023-2.5188 6.0614-2.5188z" fill="#fff"/></svg>,
            label: "Products Management",
            link: "/products/management",
            isDefault: false,
        },
    ]), []);

    useEffect(() => {
        const getActivePage = (event: any) => {
            if(!event?.detail?.activePage) return null;

            setActivePage(event?.detail?.activePage);
        }

        return window?.addEventListener('set:active-page', getActivePage);
    }, []);

    return (
        <Box
            minHeight="100dvh"
            width="full"
            display="flex"
            flexDirection="row"
        >

            {/* Sidebar */}
            <Box
                display={{
                    base: 'none',
                    md: 'contents',
                }}
            >
                <Sidebar
                    sidebarItems={sidebarItems}
                    activePage={activePage}
                />
            </Box>

            {/* Topbar for Mobile */}
            <Box
                display={{
                    base: 'contents',
                    md: 'none',
                }}
            >
                <TopBar
                    activePage={activePage}
                    sidebarItems={sidebarItems}
                />
            </Box>

            {/* Body */}
            <Box flex={1} height='100dvh'>{children}</Box>

            {/* Lightcase */}
            <Lightcase />
        </Box>
    )
}

const Content = ({ children, activePage }: { children: ReactElement | ReactElement[], activePage: string }) => {
    const { isSidebarCollapsed } = useUi() as any;

    useEffect(() => {
        window?.dispatchEvent(new CustomEvent('set:active-page', { detail: { activePage } }));
    }, [activePage]);

    return (
        <Box
            id='body-container'
            flex={1}
            overflowY='auto'
            overflowX='hidden'
            px={{
                base: 3,
                md: 4,
                xl: 16,
            }}
            pt={{
                base: 16,
                md: 8,
                xl: 16,
            }}
            pb={{
                base: 4,
                md: 8,
            }}
            maxHeight='100vh'
            maxWidth={{
                base: '100vw',
                md: `calc(100vw - ${(isSidebarCollapsed ? '4rem' : '16rem')})`
            }}
        >{children}</Box>
    )
}

type SidebarProps = {
    sidebarItems: {
        icon: ReactElement | string;
        label: string;
        link: string;
        isDefault?: boolean;
    }[];
    activePage: string;
}
const Sidebar = ({ sidebarItems, activePage }: SidebarProps) => {
    const { isSidebarCollapsed: isCollapsed, toggleSidebar } = useUi() as any;
    const { role, clearToken } = useUser() as any;
    const [sidebarDefaultView, setSidebarDefaultView] = useState(true);
    const location = useLocation();

    useEffect(( ) => {
        const activeSidebarItem = sidebarItems.find((item) => item.label === activePage);

        if(activeSidebarItem?.isDefault === false) setSidebarDefaultView(false);
    }, [sidebarItems, activePage]);

    const SidebarItem = ({ icon, label, link, isActive = false, onClick }: { icon: ReactElement | string, label: string, link: string, isActive?: boolean, onClick?: () => void }) => {
        const modifiedLabel = role === ROLES.DATA_MANAGER
            ? label?.replaceAll('Management', '')?.trim()
            : label;

        return (
            <Link
                to={link}
                onClick={(event: any) => {
                    if(typeof onClick === 'function') {
                        event.preventDefault();
                        event.stopPropagation();
                        onClick?.();
                    }
                }}
            >
                <Tooltip
                    label={modifiedLabel}
                    placement="right"
                    isDisabled={!isCollapsed}
                >
                    <Button
                        variant='none'
                        width='full'
                        rounded='none'
                        gap={4}
                        justifyContent={isCollapsed ? 'center' : 'flex-start'}
                        textAlign='left'
                        fontWeight='medium'
                        colorScheme='gray'
                        opacity={isActive ? 1 : 0.3}
                        borderLeftWidth={4}
                        borderLeftColor={isActive ? 'black' : 'transparent'}
                        _hover={{
                            borderLeftColor: 'black',
                            color : 'black',
                            opacity: 1,
                        }}
                    >
                        {
                            typeof icon === 'string'
                                ? <img src={icon} alt={label} width={20} loading="eager" />
                                : icon
                        }
                        {
                            !isCollapsed
                                ? <Text
                                    fontSize={{
                                        base: 'md',
                                        '3xl': 'lg',
                                    }}
                                    isTruncated={true}
                                    lineHeight={1.5}
                                >{modifiedLabel}</Text>
                                : null
                        }
                    </Button>
                </Tooltip>
            </Link>
        )
    }

    const isSidebarVisible = sidebarItems.some((item) => [item?.link, `${item?.link}/`].includes(location.pathname));

    return (
        <Flex
            display={isSidebarVisible ? 'flex' : 'none'}
            direction='column'
            gap={4}
            justifyContent='space-between'
            width={{
                base: isCollapsed ? 16 : '16rem',
                '3xl': isCollapsed ? 16 : '18rem',
            }}
            bgColor='white'
            borderRightWidth={1}
            borderRightColor="gray.100"
            py={4}
        >

            <Box>
                <Box pl={isCollapsed ? 0 : 4} textAlign={isCollapsed ? 'center' : 'left'}>

                    {/* Collapse Button */}
                    <Tooltip label={`${isCollapsed ? 'Expand' : 'Collapse'} Sidebar`} placement="right">
                        <IconButton
                            aria-label="Toggle Sidebar"
                            variant="solid"
                            size="sm"
                            rounded='full'
                            mb={6}
                            icon={<RiMenu5Line size={20} strokeWidth={1} />}
                            onClick={() => toggleSidebar(isCollapsed)}
                        />
                    </Tooltip>
                </Box>

                {/* Logo */}
                {
                    isCollapsed
                        ? <Heading
                            fontSize="4xl"
                            fontWeight="bold"
                            textAlign='center'
                        >C</Heading>
                        : <Box textAlign='center'>
                            <img
                                src="/logo.webp"
                                alt="Logo"
                                width={100}
                                loading="eager"
                                style={{
                                    marginInline: 'auto',
                                    pointerEvents: 'none',
                                }}
                            />
                        </Box>
                }

                {/* Switch */}
                {
                    role !== ROLES.DATA_MANAGER
                        ? isCollapsed
                            ? <Box my={6} textAlign='center'>
                                <Switch
                                    id='default-view'
                                    colorScheme="green"
                                    isChecked={!sidebarDefaultView}
                                    onChange={() => setSidebarDefaultView(!sidebarDefaultView)}
                                />
                            </Box>
                            : <Flex my={6} px={4} alignItems='center' width='full'>
                                <IconButton
                                    aria-label="Toggle Sidebar View"
                                    roundedLeft='full'
                                    variant='outline'
                                    width='full'
                                    opacity={sidebarDefaultView ? 1 : 0.4}
                                    backgroundColor={sidebarDefaultView ? 'transparent' : 'gray.100'}
                                    icon={<img src="/icons/icon-shoppers.svg" alt="Shoppers" width={20} />}
                                    onClick={() => setSidebarDefaultView(true)}
                                >
                                </IconButton>
                                <IconButton
                                    aria-label="Toggle Sidebar View"
                                    roundedRight='full'
                                    variant='outline'
                                    width='full'
                                    opacity={sidebarDefaultView ? 0.4 : 1}
                                    backgroundColor={sidebarDefaultView ? 'gray.100' : 'transparent'}
                                    icon={<img src="/icons/icon-data.svg" alt="Data" width={20} />}
                                    onClick={() => setSidebarDefaultView(false)}
                                ></IconButton>
                            </Flex>
                        : null
                }

                {/* Items */}
                <Flex
                    direction="column"
                    pl={0.5}
                    pr={1}
                    mt={4}
                    gap={3}
                >
                    {
                        sidebarItems.map((item, index) => item?.isDefault === sidebarDefaultView && (
                            <SidebarItem
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                link={item.link}
                                isActive={activePage === item.label}
                            />
                        ))
                    }
                </Flex>
            </Box>

            {/* Logout */}
            <Flex
                pl={0.5}
                pr={1}
            >
                <SidebarItem
                    icon={<IconLogout size={22} />}
                    label="Logout"
                    link="/login"
                    onClick={() => {
                        clearToken();
                        window.location.href = '/login';
                    }}
                />
            </Flex>
        </Flex>
    )
}

const TopBar = ({ sidebarItems, activePage }: SidebarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const { clearToken } = useUser() as any;

    useEffect(() => {
        setIsOpen(false);

        document?.addEventListener('click', (event: any) => {
            if(event?.target?.closest('button')?.getAttribute('aria-label') !== 'Toggle Sidebar') {
                setIsOpen(false);
            }
        });

        return () => {
            document?.removeEventListener('click', () => {});
        }
    }, [location]);

    return (
        <Flex
            direction='column'
            position='fixed'
            zIndex={100}
            bgColor='white'
            borderBottomWidth={1}
            borderColor='gray.100'
            width='full'
            shadow={isOpen ? 'md' : 'none'}
        >
            <Flex
                justifyContent='space-between'
                alignItems='center'
                py={2}
                px={3}
            >
                <Heading fontSize='2xl'>S</Heading>

                <IconButton
                    aria-label="Toggle Sidebar"
                    variant="solid"
                    size="sm"
                    rounded='full'
                    icon={<RiMenu5Line size={20} strokeWidth={1} />}
                    onClick={() => setIsOpen(!isOpen)}
                />
            </Flex>

            {/* Items */}
            <Flex
                display={isOpen ? 'flex' : 'none'}
                direction="column"
                pl={0.5}
                pr={1}
                gap={1}
            >
                {
                    sidebarItems.map((item, index) => (
                        <Link to={item.link} key={index}>
                            <Button
                                variant='none'
                                width='full'
                                rounded='none'
                                gap={4}
                                justifyContent='flex-start'
                                textAlign='left'
                                fontWeight='medium'
                                py={1}
                                colorScheme='gray'
                                opacity={activePage === item.label ? 1 : 0.3}
                                borderLeftWidth={4}
                                borderLeftColor={activePage === item.label ? 'black' : 'transparent'}
                            >
                                {
                                    typeof item.icon === 'string'
                                        ? <img src={item.icon} alt={item.label} width={20} loading="eager" />
                                        : item.icon
                                }
                                <Text fontSize='lg'>{item.label}</Text>
                            </Button>
                        </Link>
                    ))
                }

                {/* Logout Button */}
                <Button
                    variant='none'
                    width='full'
                    rounded='none'
                    gap={4}
                    justifyContent='flex-start'
                    textAlign='left'
                    fontWeight='medium'
                    py={1}
                    colorScheme='gray'
                    opacity={0.3}
                    borderLeftWidth={4}
                    borderColor='transparent'
                    onClick={() => {
                        clearToken();
                        window.location.href = '/login';
                    }}
                >
                    <IconLogout size={22} />
                    <Text fontSize='lg'>Logout</Text>
                </Button>
            </Flex>
        </Flex>
    )
}

export default AppLayout;
export { Content };