import FormLogin from "../../components/login/formLogin";
import { Layout } from "../../components";

export default function LoginPage() {
	return (
		<Layout showNavbar={false}>
			<FormLogin />
		</Layout>
	);
}
