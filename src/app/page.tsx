import { getAgencies } from "../server/actions/agencies";
import Dashboard from "./_components/Dashboard";

export default async function Home() {
  const agencies = await getAgencies();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full">
        <Dashboard agencies={agencies} />
      </div>
    </div>
  );
}
