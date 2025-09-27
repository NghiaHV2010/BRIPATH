import { Layout } from "../../components";
import { QuizResultsPage } from "../../components/test";

export default function QuizResultsPageWrapper() {
  return (
    <Layout showNavbar={false}>
      <QuizResultsPage />
    </Layout>
  );
}