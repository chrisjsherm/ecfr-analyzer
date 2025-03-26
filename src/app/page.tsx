import { getAgencies } from "../server/actions/agencies";
import ParameterSelection from "./_components/ParameterSelection";

export default async function Home() {
  const { agencies } = await getAgencies();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-[1200px] px-5">
        <ParameterSelection agencies={agencies} />
      </div>
    </div>
  );
}
