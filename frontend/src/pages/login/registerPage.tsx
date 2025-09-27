import FormRegister from "../../components/login/formRegister";
import { Layout } from "../../components";

export default function RegisterPage() {
  return (
    <Layout showNavbar={false}>
      <FormRegister />
    </Layout>
  );
}
